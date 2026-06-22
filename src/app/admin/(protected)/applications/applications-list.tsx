'use client'

import { useState } from 'react'
import { approveApplication, rejectApplication } from '@/app/actions/gift-applications'

type Application = {
    id: string
    status: string
    created_at: string
    decided_at: string | null
    decided_by: string | null
    tariffs: { name: string; price: number } | null
    profiles: { email: string } | null
}

export default function ApplicationsList({ applications }: { applications: any[] }) {
    const [pending, setPending] = useState<string | null>(null)

    const handleApprove = async (id: string) => {
        setPending(id)
        await approveApplication(id)
        setPending(null)
    }

    const handleReject = async (id: string) => {
        setPending(id)
        await rejectApplication(id)
        setPending(null)
    }

    if (applications.length === 0) {
        return <p className="text-gray-400 text-sm">No applications yet.</p>
    }

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            activated: 'bg-blue-100 text-blue-700',
        }
        return map[status] ?? 'bg-gray-100 text-gray-600'
    }

    return (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4">
                    <div>
                        <p className="font-medium">{app.profiles?.email}</p>
                        <p className="text-sm text-gray-500">
                            {app.tariffs?.name} · ${app.tariffs?.price} ·{' '}
                            {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        {app.decided_by && (
                            <p className="text-xs text-gray-400">via {app.decided_by}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(app.status)}`}>
              {app.status}
            </span>

                        {app.status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(app.id)}
                                    disabled={pending === app.id}
                                    className="text-sm bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(app.id)}
                                    disabled={pending === app.id}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}