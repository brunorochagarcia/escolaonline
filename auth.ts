import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, nome: true, email: true, senha: true, role: true },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.senha)
        if (!valid) return null

        return { id: user.id, name: user.nome, email: user.email, role: user.role }
      },
    }),
  ],
})