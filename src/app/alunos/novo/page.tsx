import Link from 'next/link'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { criarAluno } from '@/actions/alunos'

export default function NovoAlunoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/alunos"
          className="text-sm text-zinc-500 hover:text-primary transition-colors"
        >
          ← Voltar para alunos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">Novo aluno</h1>
      </div>

      <div className="rounded-2xl border border-secondary bg-white p-6 shadow-sm">
        <AlunoForm onSubmit={criarAluno} submitLabel="Criar aluno" redirectTo="/alunos" />
      </div>
    </main>
  )
}