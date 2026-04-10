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
      className="rounded-xl border border-secondary bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
    >
      <option value="">Todos</option>
      <option value={Status.ATIVO}>Ativo</option>
      <option value={Status.INATIVO}>Inativo</option>
    </select>
  )
}
