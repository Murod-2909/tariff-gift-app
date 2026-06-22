import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SuccessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // IMPORTANT: Success page faqat faol tarif yoki faol gift bo'lsa ko'rinadi
    const { data: activeTariffs } = await supabase
        .from('user_tariffs')
        .select('id, source, expires_at, tariffs(name, period_months)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())

    if (!activeTariffs || activeTariffs.length === 0) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold mb-2">Youre all set!</h1>
                <p className="text-gray-500 mb-6">
                    Your tariff is now active. Heres what you have access to:
                </p>

                <div className="space-y-3 text-left">
                    {activeTariffs.map((t: any) => (
                        <div key={t.id} className="border border-gray-200 rounded-lg p-4">
                            <p className="font-medium">{t.tariffs?.name}</p>
                            <p className="text-sm text-gray-500">
                                {t.source === 'gift' ? '🎁 Gift activation' : '💳 Purchased'} ·
                                {' '}Expires {new Date(t.expires_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>

                <Link
                    href="/"
                    className="inline-block mt-6 text-sm font-medium underline text-gray-600"
                >
                    Back to home
                </Link>
            </div>
        </div>
    )
}