'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

type Aluno = {
  id: string
  nome: string
  email: string
  dataNascimento: Date
  fotoUrl: string | null
  _count: { matriculas: number }
}

type SortColumn = 'nome' | 'email' | 'dataNascimento' | 'matriculas'
type SortDir = 'asc' | 'desc'

interface AlunosClientProps {
  alunos: Aluno[]
}

function SortIcon({ column, sortColumn, sortDir }: { column: SortColumn; sortColumn: SortColumn; sortDir: SortDir }) {
  if (column !== sortColumn) return <ArrowUpDown size={12} className="opacity-30" />
  return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}

export function AlunosClient({ alunos }: AlunosClientProps) {
  const [termo, setTermo] = useState('')
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<SortColumn>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Reseta para página 1 quando busca ou ordenação muda
  useEffect(() => { setPage(1) }, [termo, sortColumn, sortDir])

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDir('asc')
    }
  }

  const resultado = useMemo(() => {
    const t = termo.trim().toLowerCase()
    const filtrado = t
      ? alunos.filter(
          (a) => a.nome.toLowerCase().includes(t) || a.email.toLowerCase().includes(t),
        )
      : alunos

    return [...filtrado].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'nome')          cmp = a.nome.localeCompare(b.nome, 'pt-BR')
      if (sortColumn === 'email')         cmp = a.email.localeCompare(b.email, 'pt-BR')
      if (sortColumn === 'dataNascimento') cmp = new Date(a.dataNascimento).getTime() - new Date(b.dataNascimento).getTime()
      if (sortColumn === 'matriculas')    cmp = a._count.matriculas - b._count.matriculas
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [termo, alunos, sortColumn, sortDir])

  const totalPages = Math.ceil(resultado.length / PAGE_SIZE)
  const paginado = resultado.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const thClass = 'px-4 py-3 select-none cursor-pointer hover:bg-primary-soft transition-colors'

  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="w-full rounded-xl border border-secondary bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:max-w-xs"
        />
      </div>

      {resultado.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {termo ? `Nenhum aluno encontrado para "${termo}".` : 'Nenhum aluno cadastrado.'}
        </p>
      ) : (
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
                  <th className={thClass} onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-1.5">
                      E-mail <SortIcon column="email" sortColumn={sortColumn} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('dataNascimento')}>
                    <div className="flex items-center gap-1.5">
                      Nascimento <SortIcon column="dataNascimento" sortColumn={sortColumn} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('matriculas')}>
                    <div className="flex items-center gap-1.5">
                      Matrículas <SortIcon column="matriculas" sortColumn={sortColumn} sortDir={sortDir} />
                    </div>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {paginado.map((aluno) => (
                  <tr key={aluno.id} className="bg-white hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-900">{aluno.nome}</td>
                    <td className="px-4 py-3 text-zinc-500">{aluno.email}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{aluno._count.matriculas}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/alunos/${aluno.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Detalhes →
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
                {resultado.length} aluno{resultado.length !== 1 ? 's' : ''} — página {page} de {totalPages}
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
      )}
    </div>
  )
}
