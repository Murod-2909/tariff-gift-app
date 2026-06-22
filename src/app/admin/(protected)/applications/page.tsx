import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ApplicationsList from './applications-list'

export default async function AdminApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
    if (!profile?.is_admin) redirect('/admin/login')

    const adminSupabase = createAdminClient()
    const { data: applications } = await adminSupabase
        .from('gift_applications')
        .select('id, status, created_at, decided_at, decided_by, tariffs(name, price), profiles(email)')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Gift Applications</h1>
                <ApplicationsList applications={applications ?? []} />
            </div>
        </div>
    )
}