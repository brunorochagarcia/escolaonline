import Link from 'next/link'
import { Suspense } from 'react'
import { listarMatriculas } from '@/lib/api/matriculas'
import { listarCursos } from '@/lib/api/cursos'
import { FiltroCurso } from '@/components/matriculas/FiltroCurso'

interface PageProps {
  searchParams: Promise<{ cursoId?: string }>
}

export default async function MatriculasPage({ searchParams }: PageProps) {
  const { cursoId } = await searchParams

  const [matriculas, cursos] = await Promise.all([
    listarMatriculas(undefined, cursoId),
    listarCursos(),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Matrículas</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <FiltroCurso cursos={cursos} />
          </Suspense>
          <Link
            href="/matriculas/nova"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Nova matrícula
          </Link>
        </div>
      </div>

      {matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Data de início</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {matriculas.map((matricula) => (
                <tr
                  key={matricula.id}
                  className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/alunos/${matricula.alunoId}`}
                      className="hover:underline"
                    >
                      {matricula.aluno.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    <Link
                      href={`/cursos/${matricula.cursoId}`}
                      className="hover:underline"
                    >
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
      )}
    </main>
  )
}
