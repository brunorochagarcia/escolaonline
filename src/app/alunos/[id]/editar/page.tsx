import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarAlunoParaEdicao } from '@/lib/api/alunos'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { editarAlunoAction } from '@/actions/alunos'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAlunoPage({ params }: PageProps) {
  const { id } = await params
  const aluno = await buscarAlunoParaEdicao(id)

  if (!aluno) notFound()

  const action = editarAlunoAction.bind(null, id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/alunos/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para o aluno
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Editar aluno</h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <AlunoForm
          defaultValues={{
            nome: aluno.nome,
            email: aluno.email,
            dataNascimento: aluno.dataNascimento.toISOString().split('T')[0],
            fotoUrl: aluno.fotoUrl ?? '',
            fotoPublicId: aluno.fotoPublicId ?? '',
          }}
          onSubmit={action}
          submitLabel="Salvar alterações"
        />
      </div>
    </main>
  )
}