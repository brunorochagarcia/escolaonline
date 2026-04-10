import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarCursoParaEdicao } from '@/lib/api/cursos'
import { CursoForm } from '@/components/cursos/CursoForm'
import { editarCurso } from '@/actions/cursos'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarCursoPage({ params }: PageProps) {
  const { id } = await params
  const curso = await buscarCursoParaEdicao(id)

  if (!curso) notFound()

  const action = editarCurso.bind(null, id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/cursos/${id}`}
          className="text-sm text-zinc-500 hover:text-primary transition-colors"
        >
          ← Voltar para o curso
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">Editar curso</h1>
      </div>

      <div className="rounded-2xl border border-secondary bg-white p-6 shadow-sm">
        <CursoForm
          defaultValues={{
            nome: curso.nome,
            descricao: curso.descricao,
            cargaHoraria: curso.cargaHoraria,
            instrutor: curso.instrutor,
            status: curso.status,
          }}
          onSubmit={action}
          submitLabel="Salvar alterações"
          redirectTo="/cursos"
        />
      </div>
    </main>
  )
}
