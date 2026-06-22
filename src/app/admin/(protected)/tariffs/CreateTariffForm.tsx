'use client'

import { useState } from 'react'
import { createTariff } from '@/app/actions/tariffs'

export default function TariffForm() {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [periodMonths, setPeriodMonths] = useState('1')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await createTariff({
            name,
            price: parseFloat(price),
            periodMonths: parseInt(periodMonths),
        })

        if (!result.success) {
            setError(result.error ?? 'Something went wrong')
        } else {
            setName('')
            setPrice('')
            setPeriodMonths('1')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Period (months)</label>
                    <select
                        value={periodMonths}
                        onChange={(e) => setPeriodMonths(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
                {loading ? 'Creating...' : 'Create Tariff'}
            </button>
        </form>
    )
}