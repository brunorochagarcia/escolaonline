'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">Escola Online</h1>
          <p className="mt-1 text-sm text-zinc-500">Painel administrativo</p>
        </div>

        <div className="rounded-2xl border border-secondary bg-white p-8 shadow-sm">
          <form action={action} className="space-y-4">
            {state?.error && (
              <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-xl border border-secondary bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-xl border border-secondary bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}