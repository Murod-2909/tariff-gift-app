import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import TariffCard from '@/app/components/TariffCard'
import Link from "next/link";

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: tariffs } = await supabase
        .from('tariffs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    let pendingTariffIds: string[] = []
    if (user) {
        const { data: pendingApps } = await supabase
            .from('gift_applications')
            .select('tariff_id')
            .eq('user_id', user.id)
            .eq('status', 'pending')

        pendingTariffIds = pendingApps?.map((a) => a.tariff_id) || []
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <span className="font-bold text-lg">Tariff Gift App</span>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{user.email}</span>
                        <form action={signOut}>
                            <button
                                type="submit"
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link href="/login" className="text-sm font-medium underline">
                        Sign in
                    </Link>
                )}
            </nav>
            <div className="max-w-5xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6">Available Tariffs</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tariffs?.map((tariff) => (
                        <TariffCard
                            key={tariff.id}
                            tariff={tariff}
                            isLoggedIn={!!user}
                            hasPendingApplication={pendingTariffIds.includes(tariff.id)}
                        />
                    ))}

                    {(!tariffs || tariffs.length === 0) && (
                        <p className="text-gray-400 col-span-3 text-center py-12">
                            No tariffs available right now
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}