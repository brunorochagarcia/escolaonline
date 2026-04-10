'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UserCircle, BookOpen, ClipboardList, Trophy, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/actions/auth'

const roleLabel: Record<string, string> = {
  ADMIN:     'Coordenador',
  PROFESSOR: 'Professor',
  ALUNO:     'Aluno',
}

type User = { name: string; role: string | null; alunoId?: string } | null

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const isAluno = user?.role === 'ALUNO'

  const navItems = [
    ...(!isAluno ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    isAluno && user?.alunoId
      ? { href: `/alunos/${user.alunoId}`, label: 'Perfil',     icon: UserCircle }
      : { href: '/alunos',                 label: 'Alunos',     icon: Users },
    { href: '/cursos',                     label: 'Cursos',     icon: BookOpen },
    { href: '/matriculas',                 label: 'Matrículas', icon: ClipboardList },
    { href: '/ranking',                    label: 'Ranking',    icon: Trophy },
  ]

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-primary">
      <div className="flex h-16 items-center px-5">
        <span className="text-base font-bold tracking-tight text-white">Escola Online</span>
      </div>

      {/* Saudação */}
      {user && (
        <div className="px-5 pb-3">
          <p className="text-xs text-white/50">
            Olá, {user.role ? roleLabel[user.role] ?? user.role : ''}
          </p>
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          // "Perfil" fica ativo apenas na rota exata do aluno
          const active = isAluno && label === 'Perfil'
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
