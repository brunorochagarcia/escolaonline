'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

type Curso = {
  id: string
  nome: string
  instrutor: string
  cargaHoraria: number
  status: 'ATIVO' | 'INATIVO'
  _count: { matriculas: number }
}

type SortColumn = 'nome' | 'instrutor' | 'cargaHoraria' | 'matriculas' | 'status'
type SortDir = 'asc' | 'desc'

function SortIcon({ column, sortColumn, sortDir }: { column: SortColumn; sortColumn: SortColumn; sortDir: SortDir }) {
  if (column !== sortColumn) return <ArrowUpDown size={12} className="opacity-30" />
  return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}

function statusBadgeClass(status: string) {
  return cn(
    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
    status === 'ATIVO' ? 'bg-primary-soft text-primary' : 'bg-secondary text-primary',
  )
}

interface CursosClientProps {
  cursos: Curso[]
}

export function CursosClient({ cursos }: CursosClientProps) {
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<SortColumn>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  useEffect(() => { setPage(1) }, [sortColumn, sortDir])

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDir('asc')
    }
  }

  const ordenado = useMemo(() => {
    return [...cursos].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'nome')         cmp = a.nome.localeCompare(b.nome, 'pt-BR')
      if (sortColumn === 'instrutor')    cmp = a.instrutor.localeCompare(b.instrutor, 'pt-BR')
      if (sortColumn === 'cargaHoraria') cmp = a.cargaHoraria - b.cargaHoraria
      if (sortColumn === 'matriculas')   cmp = a._count.matriculas - b._count.matriculas
      if (sortColumn === 'status')       cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [cursos, sortColumn, sortDir])

  const totalPages = Math.ceil(ordenado.length / PAGE_SIZE)
  const paginado = ordenado.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const thClass = 'px-4 py-3 select-none cursor-pointer hover:bg-primary-soft transition-colors'

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-secondary">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
            <tr>
              <th className={thClass} onClick={() => handleSort('nome')}>
                <div className="flex items-center gap-1.5">
                  Nome <SortIcon column="nome" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('instrutor')}>
                <div className="flex items-center gap-1.5">
                  Instrutor <SortIcon column="instrutor" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('cargaHoraria')}>
                <div className="flex items-center gap-1.5">
                  Carga horária <SortIcon column="cargaHoraria" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('matriculas')}>
                <div className="flex items-center gap-1.5">
                  Matrículas <SortIcon column="matriculas" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1.5">
                  Status <SortIcon column="status" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {paginado.map((curso) => (
              <tr key={curso.id} className="bg-white hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900">{curso.nome}</td>
                <td className="px-4 py-3 text-zinc-500">{curso.instrutor}</td>
                <td className="px-4 py-3 text-zinc-500">{curso.cargaHoraria}h</td>
                <td className="px-4 py-3 text-zinc-500">{curso._count.matriculas}</td>
                <td className="px-4 py-3">
                  <span className={statusBadgeClass(curso.status)}>
                    {curso.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/cursos/${curso.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            {ordenado.length} curso{ordenado.length !== 1 ? 's' : ''} — página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-primary hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-primary hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
            >
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
