import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/AppShell'
import { auth } from '@/lib/auth'
import { buscarAlunoIdPorEmail } from '@/lib/api/alunos'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Escola Online',
  description: 'Painel administrativo escolar',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // try/catch: token antigo (pré-callbacks) lança JWTSessionError — tratamos como sem sessão
  let user: { name: string; role: string | null; alunoId?: string } | null = null
  try {
    const session = await auth()
    if (session?.user) {
      user = { name: session.user.name ?? '', role: session.user.role ?? null }
      if (session.user.role === 'ALUNO' && session.user.email) {
        const aluno = await buscarAlunoIdPorEmail(session.user.email)
        if (aluno) user.alunoId = aluno.id
      }
    }
  } catch {
    // sessão inválida ou expirada — o middleware vai redirecionar para /login
  }

  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} bg-surface text-zinc-900 antialiased`}>
        <AppShell user={user}>{children}</AppShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
