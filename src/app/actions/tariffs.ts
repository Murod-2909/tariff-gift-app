'use server'

// IMPORTANT: Faqat admin foydalanadigan tarif boshqaruv action'lari
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
    return { supabase, user }
}

export async function createTariff(formData: {
    name: string
    price: number
    periodMonths: number
}) {
    try {
        const { supabase, user } = await requireAdmin()

        // Note: period_months 1-12 oralig'ida bo'lishi DB constraint orqali ham tekshiriladi
        if (formData.periodMonths < 1 || formData.periodMonths > 12) {
            return { success: false, error: 'Period must be between 1 and 12 months' }
        }

        const { error } = await supabase.from('tariffs').insert({
            name: formData.name,
            price: formData.price,
            period_months: formData.periodMonths,
            is_active: true,
            created_by: user.id,
        })

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/tariffs')
        revalidatePath('/')
        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}

export async function toggleTariffActive(tariffId: string, isActive: boolean) {
    try {
        const { supabase } = await requireAdmin()

        const { error } = await supabase
            .from('tariffs')
            .update({ is_active: isActive })
            .eq('id', tariffId)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/tariffs')
        revalidatePath('/')
        return { success: true }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' }
    }
}