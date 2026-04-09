import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarCursoParaEdicao } from '@/lib/api/cursos'
import { CursoForm } from '@/components/cursos/CursoForm'
import { editarCursoAction } from '@/actions/cursos'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarCursoPage({ params }: PageProps) {
  const { id } = await params
  const curso = await buscarCursoParaEdicao(id)

  if (!curso) notFound()

  const action = editarCursoAction.bind(null, id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/cursos/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para o curso
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Editar curso</h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
        />
      </div>
    </main>
  )
}
