import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarAlunoParaEdicao } from '@/lib/api/alunos'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { editarAluno } from '@/actions/alunos'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAlunoPage({ params }: PageProps) {
  const { id } = await params
  const aluno = await buscarAlunoParaEdicao(id)

  if (!aluno) notFound()

  const action = editarAluno.bind(null, id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/alunos/${id}`}
          className="text-sm text-zinc-500 hover:text-primary transition-colors"
        >
          ← Voltar para o aluno
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">Editar aluno</h1>
      </div>

      <div className="rounded-2xl border border-secondary bg-white p-6 shadow-sm">
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
          redirectTo="/alunos"
        />
      </div>
    </main>
  )
}