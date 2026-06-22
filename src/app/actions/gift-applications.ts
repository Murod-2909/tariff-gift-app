'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendActivationEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

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

export async function approveApplication(applicationId: string) {
    try {
        await requireAdmin()
        const adminSupabase = createAdminClient()

        const { data: application } = await adminSupabase
            .from('gift_applications')
            .select('id, status, tariff_id, tariffs(name), profiles(email)')
            .eq('id', applicationId)
            .single()

        if (!application) return { success: false, error: 'Application not found' }
        if (application.status !== 'pending') {
            return { success: false, error: 'Already processed' }
        }

        const activationCode = randomUUID().split('-')[0].toUpperCase()

        const { error } = await adminSupabase
            .from('gift_applications')
            .update({
                status: 'approved',
                activation_code: activationCode,
                decided_at: new Date().toISOString(),
                decided_by: 'admin_panel',
            })
            .eq('id', applicationId)

        if (error) return { success: false, error: error.message }

        const tariffInfo = application.tariffs as unknown as { name: string }
        const profileInfo = application.profiles as unknown as { email: string }

        try {
            await sendActivationEmail({
                to: profileInfo.email,
                tariffName: tariffInfo.name,
                activationCode,
            })
            await adminSupabase.from('email_audit_log').insert({
                gift_application_id: applicationId,
                recipient_email: profileInfo.email,
                status: 'sent',
            })
        } catch (emailError) {
            await adminSupabase.from('email_audit_log').insert({
                gift_application_id: applicationId,
                recipient_email: profileInfo.email,
                status: 'failed',
                error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
            })
        }

        revalidatePath('/admin/applications')
        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}

export async function rejectApplication(applicationId: string) {
    try {
        await requireAdmin()
        const adminSupabase = createAdminClient()

        const { data: application } = await adminSupabase
            .from('gift_applications')
            .select('status')
            .eq('id', applicationId)
            .single()

        if (!application) return { success: false, error: 'Application not found' }
        if (application.status !== 'pending') {
            return { success: false, error: 'Already processed' }
        }

        const { error } = await adminSupabase
            .from('gift_applications')
            .update({
                status: 'rejected',
                decided_at: new Date().toISOString(),
                decided_by: 'admin_panel',
            })
            .eq('id', applicationId)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/applications')
        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}