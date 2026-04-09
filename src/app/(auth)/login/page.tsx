'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Escola Online</h1>
          <p className="mt-1 text-sm text-zinc-500">Painel administrativo</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form action={action} className="space-y-4">
            {state?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isPending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
