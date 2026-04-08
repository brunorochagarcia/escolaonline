'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Status } from '@prisma/client'

export function FiltroStatus() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const statusAtual = searchParams.get('status') ?? ''

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('status', e.target.value)
    } else {
      params.delete('status')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={statusAtual}
      onChange={handleChange}
      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <option value="">Todos</option>
      <option value={Status.ATIVO}>Ativo</option>
      <option value={Status.INATIVO}>Inativo</option>
    </select>
  )
}
