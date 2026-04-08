import Link from 'next/link'
import { Status } from '@prisma/client'
import { listarAlunosParaSelect } from '@/lib/api/alunos'
import { listarCursosParaFiltro } from '@/lib/api/cursos'
import { MatriculaForm } from '@/components/matriculas/MatriculaForm'

export default async function NovaMatriculaPage() {
  const [alunos, cursos] = await Promise.all([
    listarAlunosParaSelect(),
    listarCursosParaFiltro(Status.ATIVO),
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/matriculas"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para matrículas
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Nova matrícula</h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <MatriculaForm alunos={alunos} cursos={cursos} />
      </div>
    </main>
  )
}