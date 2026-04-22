import { auth } from '@/lib/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')
  return session
}

export async function requireRole(...roles: string[]) {
  const session = await requireAuth()
  if (!roles.includes(session.user.role ?? '')) throw new Error('Não autorizado')
  return session
}
