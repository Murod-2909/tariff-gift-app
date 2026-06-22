'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyForGift(tariffId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'You must be signed in' }
    }

    const { data: tariff, error: tariffError } = await supabase
        .from('tariffs')
        .select('id, name, price, period_months')
        .eq('id', tariffId)
        .eq('is_active', true)
        .single()

    if (tariffError || !tariff) {
        return { success: false, error: 'Tariff not found or inactive' }
    }


    const { data: application, error } = await supabase
        .from('gift_applications')
        .insert({
            user_id: user.id,
            tariff_id: tariffId,
            status: 'pending',
        })
        .select('id, tariff_id')
        .single()

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'You already have a pending application' }
        }
        return { success: false, error: error.message }
    }

    // Note: Telegram botga bildirishnoma yuborish (xato bo'lsa ham so'rov saqlanib qoladi)
    try {
        const { notifyTelegramAdmin } = await import('@/lib/telegram')
        await notifyTelegramAdmin({
            id: application.id,
            userEmail: user.email!,
            tariffName: tariff.name,
            tariffPrice: tariff.price,
            periodMonths: tariff.period_months,
        })
    } catch (notifyError) {
        console.error('Telegram notification failed:', notifyError)
    }

    revalidatePath('/')
    return { success: true }
}
export async function activateGift(code: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'You must be signed in' }
    }

    // IMPORTANT: user allaqachon gift faollashtirgan bo'lsa, qayta faollashtira olmaydi
    const { data: existingActivation } = await supabase
        .from('gift_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'activated')
        .maybeSingle()

    if (existingActivation) {
        return { success: false, error: 'You have already activated a gift' }
    }

    // Note: kodni topamiz — faqat approved va hali ishlatilmagan bo'lishi kerak
    const { data: application, error: findError } = await supabase
        .from('gift_applications')
        .select('id, user_id, tariff_id, status, activation_code_used, tariffs(period_months)')
        .eq('activation_code', code)
        .eq('status', 'approved')
        .single()

    if (findError || !application) {
        return { success: false, error: 'Invalid activation code' }
    }

    if (application.user_id !== user.id) {
        return { success: false, error: 'This code does not belong to your account' }
    }

    if (application.activation_code_used) {
        return { success: false, error: 'This code has already been used' }
    }

    const tariffInfo = application.tariffs as unknown as { period_months: number }
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + tariffInfo.period_months)

    // Note: bir nechta jadvalni yangilash — ideal holda transaction kerak,
    // lekin Supabase JS clientda RPC orqali ham qilish mumkin (keyinroq optimallashtirsa bo'ladi)
    const { error: updateError } = await supabase
        .from('gift_applications')
        .update({ status: 'activated', activation_code_used: true })
        .eq('id', application.id)

    if (updateError) {
        return { success: false, error: 'Activation failed, try again' }
    }

    const { error: insertError } = await supabase.from('user_tariffs').insert({
        user_id: user.id,
        tariff_id: application.tariff_id,
        source: 'gift',
        is_active: true,
        expires_at: expiresAt.toISOString(),
    })

    if (insertError) {
        return { success: false, error: 'Activation failed, try again' }
    }

    return { success: true }
}