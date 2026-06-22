'use server'


import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: boolean; error?: string }

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false as const, error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) return { ok: false as const, error: 'Not authorized' }
    return { ok: true as const }
}

export async function getBotInfo(): Promise<{ success: boolean; username?: string; error?: string }> {
    const auth = await requireAdmin()
    if (!auth.ok) return { success: false, error: auth.error }

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return { success: false, error: 'Bot token not configured in environment' }

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getMe`)
        const data = await res.json()
        if (!data.ok) return { success: false, error: 'Invalid bot token' }
        return { success: true, username: data.result.username }
    } catch {
        return { success: false, error: 'Failed to connect to Telegram' }
    }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<ActionResult> {
    const auth = await requireAdmin()
    if (!auth.ok) return { success: false, error: auth.error }

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return { success: false, error: 'Bot token not configured' }

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl }),
        })
        const data = await res.json()
        if (!data.ok) return { success: false, error: data.description || 'Failed to set webhook' }
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to connect to Telegram' }
    }
}


export async function markApproverFromLatestStart(): Promise<ActionResult> {
    const auth = await requireAdmin()
    if (!auth.ok) return { success: false, error: auth.error }

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return { success: false, error: 'Bot token not configured' }

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=10`)
        const data = await res.json()

        if (!data.ok || !data.result.length) {
            return { success: false, error: 'No messages found. Press Start on the bot first.' }
        }

        const startUpdate = [...data.result].reverse().find(
            (u: any) => u.message?.text === '/start'
        )

        if (!startUpdate) {
            return { success: false, error: 'No /start command found. Press Start on the bot first.' }
        }

        const chatId = startUpdate.message.chat.id.toString()
        const username = startUpdate.message.from.username || startUpdate.message.from.first_name

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
    } catch {
        return { success: false, error: 'Failed to connect to Telegram' }
    }
}