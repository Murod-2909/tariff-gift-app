import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminSupabase = createAdminClient()

    // Note: dashboard uchun umumiy statistika
    const [{ count: tariffCount }, { count: pendingCount }, { count: totalCount }] =
        await Promise.all([
            adminSupabase.from('tariffs').select('*', { count: 'exact', head: true }),
            adminSupabase
                .from('gift_applications')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending'),
            adminSupabase
                .from('gift_applications')
                .select('*', { count: 'exact', head: true }),
        ])

    const stats = [
        { label: 'Active Tariffs', value: tariffCount ?? 0, href: '/admin/tariffs' },
        { label: 'Pending Applications', value: pendingCount ?? 0, href: '/admin/applications' },
        { label: 'Total Applications', value: totalCount ?? 0, href: '/admin/applications' },
    ]

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome, {user?.email}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                    >
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Link
                    href="/admin/tariffs"
                    className="bg-black text-white rounded-xl p-5 hover:bg-gray-800 transition"
                >
                    <p className="font-semibold">Manage Tariffs →</p>
                    <p className="text-sm text-gray-400 mt-1">Create and toggle tariff plans</p>
                </Link>
                <Link
                    href="/admin/telegram"
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition"
                >
                    <p className="font-semibold">Telegram Settings →</p>
                    <p className="text-sm text-gray-500 mt-1">Configure bot and approver</p>
                </Link>
            </div>
        </div>
    )
}