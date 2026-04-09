import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  // Protege todas as rotas exceto assets estáticos e o endpoint do NextAuth
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
