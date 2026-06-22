import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateTariffForm from './CreateTariffForm'
import TariffRow from './TariffRow'

export default async function AdminTariffsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/admin/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) redirect('/admin/login')

    const { data: tariffs } = await supabase
        .from('tariffs')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Manage Tariffs</h1>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Create New Tariff</h2>
                    <CreateTariffForm />
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-sm text-gray-600">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Period</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tariffs?.map((tariff) => (
                            <TariffRow key={tariff.id} tariff={tariff} />
                        ))}
                        {(!tariffs || tariffs.length === 0) && (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-gray-400">
                                    No tariffs yet
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}