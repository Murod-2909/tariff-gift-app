'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { activateGift } from '@/app/actions/gifts'

export default function ActivatePage() {
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await activateGift(code.trim())

        if (!result.success) {
            setError(result.error ?? 'Activation failed')
            setLoading(false)
            return
        }

        router.push('/success')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-sm w-full">
                <h1 className="text-xl font-bold mb-2 text-center">Activate Your Gift</h1>
                <p className="text-gray-500 text-sm mb-6 text-center">
                    Enter the activation code sent to your email
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Activation code"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center tracking-widest font-mono"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Activating...' : 'Activate'}
                    </button>
                </form>
            </div>
        </div>
    )
}