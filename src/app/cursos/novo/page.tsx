import Link from 'next/link'
import { CursoForm } from '@/components/cursos/CursoForm'
import { criarCurso } from '@/actions/cursos'

export default function NovoCursoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/cursos"
          className="text-sm text-zinc-500 hover:text-primary transition-colors"
        >
          ← Voltar para cursos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">Novo curso</h1>
      </div>

      <div className="rounded-2xl border border-secondary bg-white p-6 shadow-sm">
        <CursoForm onSubmit={criarCurso} submitLabel="Criar curso" redirectTo="/cursos" />
      </div>
    </main>
  )
}
