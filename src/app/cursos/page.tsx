import Link from 'next/link'
import { Status } from '@prisma/client'
import { listarCursos } from '@/lib/api/cursos'
import { FiltroStatus } from '@/components/cursos/FiltroStatus'
import { Suspense } from 'react'

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
        <h1 className="text-2xl font-bold">Cursos</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <FiltroStatus />
          </Suspense>
          <Link
            href="/cursos/novo"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Novo curso
          </Link>
        </div>
      </div>

      {cursos.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum curso encontrado.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Instrutor</th>
                <th className="px-4 py-3">Carga horária</th>
                <th className="px-4 py-3">Matrículas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {cursos.map((curso) => (
                <tr key={curso.id} className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3 font-medium">{curso.nome}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{curso.instrutor}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{curso.cargaHoraria}h</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{curso._count.matriculas}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        curso.status === Status.ATIVO
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {curso.status === Status.ATIVO ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/cursos/${curso.id}`}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
