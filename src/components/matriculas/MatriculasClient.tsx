'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

const PAGE_SIZE = 20

type Matricula = {
  id: string
  alunoId: string
  cursoId: string
  dataInicio: Date
  aluno: { nome: string }
  curso: { nome: string }
}

type SortColumn = 'aluno' | 'curso' | 'dataInicio'
type SortDir = 'asc' | 'desc'

function SortIcon({ column, sortColumn, sortDir }: { column: SortColumn; sortColumn: SortColumn; sortDir: SortDir }) {
  if (column !== sortColumn) return <ArrowUpDown size={12} className="opacity-30" />
  return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}

interface MatriculasClientProps {
  matriculas: Matricula[]
}

export function MatriculasClient({ matriculas }: MatriculasClientProps) {
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<SortColumn>('aluno')
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
    return [...matriculas].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'aluno')      cmp = a.aluno.nome.localeCompare(b.aluno.nome, 'pt-BR')
      if (sortColumn === 'curso')      cmp = a.curso.nome.localeCompare(b.curso.nome, 'pt-BR')
      if (sortColumn === 'dataInicio') cmp = new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [matriculas, sortColumn, sortDir])

  const totalPages = Math.ceil(ordenado.length / PAGE_SIZE)
  const paginado = ordenado.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const thClass = 'px-4 py-3 select-none cursor-pointer hover:bg-primary-soft transition-colors'

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-secondary">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
            <tr>
              <th className={thClass} onClick={() => handleSort('aluno')}>
                <div className="flex items-center gap-1.5">
                  Aluno <SortIcon column="aluno" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('curso')}>
                <div className="flex items-center gap-1.5">
                  Curso <SortIcon column="curso" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
              <th className={thClass} onClick={() => handleSort('dataInicio')}>
                <div className="flex items-center gap-1.5">
                  Data de início <SortIcon column="dataInicio" sortColumn={sortColumn} sortDir={sortDir} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {paginado.map((matricula) => (
              <tr key={matricula.id} className="bg-white hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/alunos/${matricula.alunoId}`} className="text-zinc-900 hover:underline">
                    {matricula.aluno.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  <Link href={`/cursos/${matricula.cursoId}`} className="hover:underline">
                    {matricula.curso.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(matricula.dataInicio).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            {ordenado.length} matrícula{ordenado.length !== 1 ? 's' : ''} — página {page} de {totalPages}
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
