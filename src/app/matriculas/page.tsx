import { Suspense } from 'react'
import { Status } from '@prisma/client'
import { listarMatriculas } from '@/lib/api/matriculas'
import { listarCursosParaFiltro } from '@/lib/api/cursos'
import { listarAlunosParaSelect } from '@/lib/api/alunos'
import { FiltroCurso } from '@/components/matriculas/FiltroCurso'
import { NovaMatriculaButton } from '@/components/matriculas/NovaMatriculaButton'
import { MatriculasClient } from '@/components/matriculas/MatriculasClient'

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
        <MatriculasClient matriculas={matriculas} />
      )}
    </main>
  )
}
