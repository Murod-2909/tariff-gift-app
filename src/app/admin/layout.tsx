import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavbar from './admin-navbar'

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Note: login sahifasi bu layout'dan tashqarida — faqat kirgan adminlar uchun
    if (!user) redirect('/admin/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) redirect('/admin/login')

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar email={user.email ?? ''} />
            <main>{children}</main>
        </div>
    )
}