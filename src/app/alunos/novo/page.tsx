import Link from 'next/link'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { criarAlunoAction } from '@/actions/alunos'

export default function NovoAlunoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/alunos"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para alunos
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Novo aluno</h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <AlunoForm onSubmit={criarAlunoAction} submitLabel="Criar aluno" />
      </div>
    </main>
  )
}