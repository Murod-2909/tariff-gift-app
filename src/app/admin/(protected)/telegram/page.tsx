
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import TelegramSettingsForm from './telegram-settings-form'

export default async function AdminTelegramPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
    if (!profile?.is_admin) redirect('/admin/login')

    // Note: token kabi maxfiy ma'lumotlarni service_role orqali o'qiymiz
    const adminSupabase = createAdminClient()
    const { data: settings } = await adminSupabase
        .from('admin_settings')
        .select('*')
        .eq('id', 1)
        .single()

    const { data: recentLogs } = await adminSupabase
        .from('telegram_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Telegram Bot Settings</h1>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <TelegramSettingsForm
                        currentBotToken={settings?.telegram_bot_token ?? ''}
                        currentChatId={settings?.telegram_admin_chat_id ?? ''}
                        currentApprover={settings?.telegram_approver_username ?? ''}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-semibold mb-4">Notification History</h2>
                    {!recentLogs || recentLogs.length === 0 ? (
                        <p className="text-gray-400 text-sm">No notifications yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex justify-between items-center text-sm border-b border-gray-100 py-2"
                                >
                                    <span>{log.message_type}</span>
                                    <span
                                        className={
                                            log.status === 'sent' ? 'text-green-600' : 'text-red-600'
                                        }
                                    >
                    {log.status}
                  </span>
                                    <span className="text-gray-400 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}