'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { applyForGift } from '@/app/actions/gifts'

type Tariff = {
    id: string
    name: string
    price: number
    period_months: number
}

export default function TariffCard({
                                       tariff,
                                       isLoggedIn,
                                       hasPendingApplication,
                                   }: {
    tariff: Tariff
    isLoggedIn: boolean
    hasPendingApplication: boolean
}) {
    const [applied, setApplied] = useState(hasPendingApplication)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleApply = async () => {
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        setError('')
        setLoading(true)
        const result = await applyForGift(tariff.id)
        setLoading(false)

        if (!result.success) {
            setError(result.error || 'Something went wrong')
            return
        }

        setApplied(true)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-xl font-bold mb-2">{tariff.name}</h2>
            <p className="text-3xl font-bold mb-1">${tariff.price}</p>
            <p className="text-sm text-gray-500 mb-4">
                {tariff.period_months} {tariff.period_months === 1 ? 'month' : 'months'}
            </p>

            {error && (
                <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <div className="space-y-2">
                <button className="w-full bg-black text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 transition">
                    Buy Tariff
                </button>

                {applied ? (
                    <button
                        disabled
                        className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg py-2.5 font-medium cursor-not-allowed"
                    >
                        Applied
                    </button>
                ) : (
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        {loading ? 'Applying...' : 'Apply for Gift'}
                    </button>
                )}
            </div>
        </div>
    )
}