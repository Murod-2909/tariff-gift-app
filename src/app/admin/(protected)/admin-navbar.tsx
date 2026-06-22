'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/tariffs', label: 'Tariffs' },
    { href: '/admin/applications', label: 'Applications' },
    { href: '/admin/telegram', label: 'Telegram' },
]

export default function AdminNavbar({ email }: { email: string }) {
    const pathname = usePathname()

    return (
        <nav className="bg-white border-b shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <span className="font-bold text-lg">Admin Panel</span>
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                    pathname === item.href
                                        ? 'bg-black text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{email}</span>
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    )
}