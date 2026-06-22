
import { createAdminClient } from '@/lib/supabase/admin'
import { answerCallbackQuery, editMessageText } from '@/lib/telegram'
import { sendActivationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
    const adminSupabase = createAdminClient()
    const body = await request.json()

    const callbackQuery = body.callback_query
    if (!callbackQuery) {
        return NextResponse.json({ ok: true })
    }

    const { data: settings } = await adminSupabase
        .from('admin_settings')
        .select('telegram_bot_token')
        .eq('id', 1)
        .single()

    const token = settings?.telegram_bot_token
    if (!token) {
        return NextResponse.json({ ok: true })
    }

    const callbackData: string = callbackQuery.data // "approve:uuid" yoki "reject:uuid"
    const [action, applicationId] = callbackData.split(':')
    const chatId = callbackQuery.message.chat.id
    const messageId = callbackQuery.message.message_id

    const { data: application } = await adminSupabase
        .from('gift_applications')
        .select('id, user_id, status, tariff_id, tariffs(name, period_months), profiles(email)')
        .eq('id', applicationId)
        .single()

    if (!application) {
        await answerCallbackQuery(token, callbackQuery.id, 'Application not found')
        return NextResponse.json({ ok: true })
    }

    if (application.status !== 'pending') {
        await answerCallbackQuery(token, callbackQuery.id, 'Already processed')
        return NextResponse.json({ ok: true })
    }

    const tariffInfo = application.tariffs as unknown as { name: string; period_months: number }
    const profileInfo = application.profiles as unknown as { email: string }

    if (action === 'approve') {
        const activationCode = randomUUID().split('-')[0].toUpperCase()

        const { error: updateError } = await adminSupabase
            .from('gift_applications')
            .update({
                status: 'approved',
                activation_code: activationCode,
                decided_at: new Date().toISOString(),
                decided_by: 'telegram',
            })
            .eq('id', applicationId)

        if (updateError) {
            await answerCallbackQuery(token, callbackQuery.id, 'Failed to approve')
            return NextResponse.json({ ok: true })
        }

        await answerCallbackQuery(token, callbackQuery.id, 'Approved ✅')
        await editMessageText(
            token,
            chatId,
            messageId,
            `✅ *Approved*\n\nUser: ${profileInfo.email}\nTariff: ${tariffInfo.name}\nCode sent to user's email.`
        )

        await adminSupabase.from('telegram_audit_log').insert({
            gift_application_id: applicationId,
            message_type: 'approve_action',
            status: 'sent',
        })

        try {
            await sendActivationEmail({
                to: profileInfo.email,
                tariffName: tariffInfo.name,
                activationCode,
            })
            await adminSupabase.from('email_audit_log').insert({
                gift_application_id: applicationId,
                recipient_email: profileInfo.email,
                status: 'sent',
            })
        } catch (emailError) {
            await adminSupabase.from('email_audit_log').insert({
                gift_application_id: applicationId,
                recipient_email: profileInfo.email,
                status: 'failed',
                error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
            })
        }
    } else if (action === 'reject') {
        await adminSupabase
            .from('gift_applications')
            .update({
                status: 'rejected',
                decided_at: new Date().toISOString(),
                decided_by: 'telegram',
            })
            .eq('id', applicationId)

        await answerCallbackQuery(token, callbackQuery.id, 'Rejected ❌')
        await editMessageText(
            token,
            chatId,
            messageId,
            `❌ *Rejected*\n\nUser: ${profileInfo.email}\nTariff: ${tariffInfo.name}`
        )

        await adminSupabase.from('telegram_audit_log').insert({
            gift_application_id: applicationId,
            message_type: 'reject_action',
            status: 'sent',
        })
    }

    return NextResponse.json({ ok: true })
}