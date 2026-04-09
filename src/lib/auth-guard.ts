import { auth } from '@/lib/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')
  return session
}
