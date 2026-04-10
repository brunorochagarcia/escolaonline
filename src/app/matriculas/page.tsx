import { Suspense } from 'react'
import { Status } from '@prisma/client'
import { listarMatriculas } from '@/lib/api/matriculas'
import { listarCursosParaFiltro } from '@/lib/api/cursos'
import { listarAlunosParaSelect } from '@/lib/api/alunos'
import { FiltroCurso } from '@/components/matriculas/FiltroCurso'
import { NovaMatriculaButton } from '@/components/matriculas/NovaMatriculaButton'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ cursoId?: string }>
}

export default async function MatriculasPage({ searchParams }: PageProps) {
  const { cursoId } = await searchParams

  const [matriculas, cursos, alunos, cursosAtivos] = await Promise.all([
    listarMatriculas(undefined, cursoId),
    listarCursosParaFiltro(),
    listarAlunosParaSelect(),
    listarCursosParaFiltro(Status.ATIVO),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Matrículas</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <FiltroCurso cursos={cursos} />
          </Suspense>
          <NovaMatriculaButton alunos={alunos} cursos={cursosAtivos} />
        </div>
      </div>

      {matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-secondary">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Data de início</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {matriculas.map((matricula) => (
                <tr
                  key={matricula.id}
                  className="bg-white hover:bg-surface transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/alunos/${matricula.alunoId}`}
                      className="text-zinc-900 hover:underline"
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
