import Link from 'next/link'
import { listarAlunos } from '@/lib/api/alunos'
import { AlunosClient } from '@/components/alunos/AlunosClient'

export default async function AlunosPage() {
  const alunos = await listarAlunos()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Link
          href="/alunos/novo"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Novo aluno
        </Link>
      </div>

      <AlunosClient alunos={alunos} />
    </main>
  )
}
