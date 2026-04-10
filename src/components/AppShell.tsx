'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
type User = { name: string; role: string | null; alunoId?: string } | null

export function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/login')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
