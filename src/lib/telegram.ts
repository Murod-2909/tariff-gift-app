import { createAdminClient } from '@/lib/supabase/admin'

type GiftApplicationInfo = {
    id: string
    userEmail: string
    tariffName: string
    tariffPrice: number
    periodMonths: number
}


export async function notifyTelegramAdmin(app: GiftApplicationInfo): Promise<void> {
    const adminSupabase = createAdminClient()

    const { data: settings } = await adminSupabase
        .from('admin_settings')
        .select('telegram_bot_token, telegram_admin_chat_id')
        .eq('id', 1)
        .single()

    const token = settings?.telegram_bot_token
    const chatId = settings?.telegram_admin_chat_id

    if (!token || !chatId) {
        await adminSupabase.from('telegram_audit_log').insert({
            gift_application_id: app.id,
            message_type: 'apply_notification',
            status: 'failed',
            error_message: 'Telegram bot not configured or approver not set',
        })
        return
    }

    const text =
        `🎁 *New Gift Application*\n\n` +
        `User: ${app.userEmail}\n` +
        `Tariff: ${app.tariffName} ($${app.tariffPrice})\n` +
        `Period: ${app.periodMonths} month(s)\n\n` +
        `Application ID: \`${app.id}\``

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Approve', callback_data: `approve:${app.id}` },
                            { text: '❌ Reject', callback_data: `reject:${app.id}` },
                        ],
                    ],
                },
            }),
        })

        const data = await res.json()

        if (data.ok) {
            await adminSupabase.from('telegram_audit_log').insert({
                gift_application_id: app.id,
                message_type: 'apply_notification',
                status: 'sent',
                telegram_message_id: data.result.message_id?.toString(),
            })
        } else {
            await adminSupabase.from('telegram_audit_log').insert({
                gift_application_id: app.id,
                message_type: 'apply_notification',
                status: 'failed',
                error_message: data.description || 'Unknown Telegram API error',
            })
        }
    } catch (err) {
        await adminSupabase.from('telegram_audit_log').insert({
            gift_application_id: app.id,
            message_type: 'apply_notification',
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Network error',
        })
    }
}

export async function answerCallbackQuery(
    botToken: string,
    callbackQueryId: string,
    text: string
): Promise<void> {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    })
}

export async function editMessageText(
    botToken: string,
    chatId: string,
    messageId: number,
    text: string
): Promise<void> {
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: 'Markdown',
        }),
    })
}