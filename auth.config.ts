import type { NextAuthConfig } from 'next-auth'

// Configuração edge-safe: sem Node.js modules (bcrypt, prisma).
// Usada pelo middleware e estendida pelo auth.ts completo.
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === '/login'

      if (isLoginPage) {
        // Usuário autenticado tentando acessar o login → redireciona para alunos
        if (isLoggedIn) return Response.redirect(new URL('/alunos', nextUrl))
        return true
      }

      return isLoggedIn
    },
  },
  providers: [],
} satisfies NextAuthConfig
