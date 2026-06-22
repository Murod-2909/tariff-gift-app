'use client'

import { useState } from 'react'
import { toggleTariffActive } from '@/app/actions/tariffs'

type Tariff = {
    id: string
    name: string
    price: number
    period_months: number
    is_active: boolean
}

export default function TariffRow({ tariff }: { tariff: Tariff }) {
    const [isActive, setIsActive] = useState(tariff.is_active)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        const result = await toggleTariffActive(tariff.id, !isActive)
        if (result.success) {
            setIsActive(!isActive)
        }
        setLoading(false)
    }

    return (
        <tr className="border-t">
            <td className="p-3">{tariff.name}</td>
            <td className="p-3">${tariff.price}</td>
            <td className="p-3">{tariff.period_months} mo</td>
            <td className="p-3">
        <span
            className={`text-xs px-2 py-1 rounded-full ${
                isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
            </td>
            <td className="p-3">
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className="text-sm underline text-gray-600 hover:text-black disabled:opacity-50"
                >
                    {isActive ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        </tr>
    )
}