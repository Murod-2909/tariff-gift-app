'use client'

import { toggleTariffActive } from '@/app/actions/tariffs'
import { useState } from 'react'

type Tariff = {
    id: string
    name: string
    price: number
    period_months: number
    is_active: boolean
}

export default function TariffList({ tariffs }: { tariffs: Tariff[] }) {
    const [pending, setPending] = useState<string | null>(null)

    const handleToggle = async (id: string, current: boolean) => {
        setPending(id)
        await toggleTariffActive(id, !current)
        setPending(null)
    }

    if (tariffs.length === 0) {
        return <p className="text-gray-400 text-sm">No tariffs yet.</p>
    }

    return (
        <div className="space-y-2">
            {tariffs.map((t) => (
                <div
                    key={t.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
                >
                    <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-gray-500">
                            ${t.price} · {t.period_months} month{t.period_months > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {t.is_active ? 'Active' : 'Inactive'}
            </span>
                        <button
                            onClick={() => handleToggle(t.id, t.is_active)}
                            disabled={pending === t.id}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {t.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}