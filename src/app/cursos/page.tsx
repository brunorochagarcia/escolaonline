import { Suspense } from 'react'
import { Status } from '@prisma/client'
import { listarCursos } from '@/lib/api/cursos'
import { FiltroStatus } from '@/components/cursos/FiltroStatus'
import { NovoCursoButton } from '@/components/cursos/NovoCursoButton'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function CursosPage({ searchParams }: PageProps) {
  const { status } = await searchParams

  const statusFiltro =
    status === Status.ATIVO || status === Status.INATIVO ? status : undefined

  const cursos = await listarCursos(statusFiltro)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Cursos</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <FiltroStatus />
          </Suspense>
          <NovoCursoButton />
        </div>
      </div>

      {cursos.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum curso encontrado.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-secondary">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Instrutor</th>
                <th className="px-4 py-3">Carga horária</th>
                <th className="px-4 py-3">Matrículas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {cursos.map((curso) => (
                <tr key={curso.id} className="bg-white hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900">{curso.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{curso.instrutor}</td>
                  <td className="px-4 py-3 text-zinc-500">{curso.cargaHoraria}h</td>
                  <td className="px-4 py-3 text-zinc-500">{curso._count.matriculas}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadgeClass(curso.status)}>
                      {curso.status === Status.ATIVO ? 'Ativo' : 'Inativo'}
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
      )}
    </main>
  )
}

function statusBadgeClass(status: Status) {
  return cn(
    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
    status === Status.ATIVO
      ? 'bg-primary-soft text-primary'
      : 'bg-secondary text-primary',
  )
}
