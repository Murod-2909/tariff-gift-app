'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) throw new Error('Not authorized')
    return user
}

// IMPORTANT: bot tokenni saqlash — service_role orqali, chunki bu maxfiy ma'lumot
export async function saveTelegramBotToken(botToken: string) {
    try {
        await requireAdmin()
        const adminSupabase = createAdminClient()

        const { error } = await adminSupabase
            .from('admin_settings')
            .update({ telegram_bot_token: botToken, updated_at: new Date().toISOString() })
            .eq('id', 1)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/telegram')
        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}

// Note: Admin "Start" bosgandan keyingi chat_id'ni qo'lda kiritib, approver sifatida belgilaydi
export async function setTelegramApprover(chatId: string, username: string) {
    try {
        await requireAdmin()
        const adminSupabase = createAdminClient()

        const { error } = await adminSupabase
            .from('admin_settings')
            .update({
                telegram_admin_chat_id: chatId,
                telegram_approver_username: username,
                updated_at: new Date().toISOString(),
            })
            .eq('id', 1)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/telegram')
        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}

export async function setTelegramWebhook() {
    try {
        await requireAdmin()
        const adminSupabase = createAdminClient()

        const { data: settings } = await adminSupabase
            .from('admin_settings')
            .select('telegram_bot_token')
            .eq('id', 1)
            .single()

        if (!settings?.telegram_bot_token) {
            return { success: false, error: 'Save bot token first' }
        }

        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`

        const res = await fetch(
            `https://api.telegram.org/bot${settings.telegram_bot_token}/setWebhook`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webhookUrl }),
            }
        )
        const data = await res.json()

        if (!data.ok) {
            return { success: false, error: data.description ?? 'Failed to set webhook' }
        }

        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}