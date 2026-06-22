'use client'

import { useState } from 'react'
import {
    saveTelegramBotToken,
    setTelegramApprover,
    setTelegramWebhook,
} from '@/app/actions/telegram-settings'

export default function TelegramSettingsForm({
                                                 currentBotToken,
                                                 currentChatId,
                                                 currentApprover,
                                             }: {
    currentBotToken: string
    currentChatId: string
    currentApprover: string
}) {
    const [botToken, setBotToken] = useState(currentBotToken)
    const [chatId, setChatId] = useState(currentChatId)
    const [approverUsername, setApproverUsername] = useState(currentApprover)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState<string | null>(null)

    const handleSaveToken = async () => {
        setLoading('token')
        setError('')
        setMessage('')
        const result = await saveTelegramBotToken(botToken)
        if (!result.success) setError(result.error ?? 'Failed')
        else setMessage('Bot token saved')
        setLoading(null)
    }

    const handleSetWebhook = async () => {
        setLoading('webhook')
        setError('')
        setMessage('')
        const result = await setTelegramWebhook()
        if (!result.success) setError(result.error ?? 'Failed')
        else setMessage('Webhook configured')
        setLoading(null)
    }

    const handleSetApprover = async () => {
        setLoading('approver')
        setError('')
        setMessage('')
        const result = await setTelegramApprover(chatId, approverUsername)
        if (!result.success) setError(result.error ?? 'Failed')
        else setMessage('Approver saved')
        setLoading(null)
    }

    return (
        <div className="space-y-6">
            {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{message}</div>}
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <div>
                <label className="block text-sm font-medium mb-1">Bot Token</label>
                <div className="flex gap-2">
                    <input
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="123456789:ABCdef..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                    />
                    <button
                        onClick={handleSaveToken}
                        disabled={loading !== null}
                        className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Get this from @BotFather on Telegram</p>
            </div>

            <div>
                <button
                    onClick={handleSetWebhook}
                    disabled={loading !== null}
                    className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading === 'webhook' ? 'Configuring...' : 'Set Webhook (after saving token)'}
                </button>
            </div>

            <hr />

            <div>
                <p className="text-sm font-medium mb-2">Set Approver</p>
                <p className="text-xs text-gray-500 mb-3">
                    1. Press Start on your bot in Telegram.<br />
                    2. Find your chat_id (e.g. via @userinfobot).<br />
                    3. Enter it below to mark yourself as approver.
                </p>
                <div className="space-y-2">
                    <input
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                        placeholder="Telegram chat_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        value={approverUsername}
                        onChange={(e) => setApproverUsername(e.target.value)}
                        placeholder="Telegram username (optional, for display)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleSetApprover}
                        disabled={loading !== null}
                        className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading === 'approver' ? 'Saving...' : 'Save Approver'}
                    </button>
                </div>
            </div>
        </div>
    )
}