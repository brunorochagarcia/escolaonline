'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '../../auth'

export type LoginState = { error: string } | null

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/alunos',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-mail ou senha inválidos.' }
    }
    throw error // re-throw: Next.js precisa tratar o NEXT_REDIRECT
  }
  return null
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}