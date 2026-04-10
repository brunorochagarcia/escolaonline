import { listarAlunos } from '@/lib/api/alunos'
import { AlunosClient } from '@/components/alunos/AlunosClient'
import { NovoAlunoButton } from '@/components/alunos/NovoAlunoButton'

export default async function AlunosPage() {
  const alunos = await listarAlunos()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Alunos</h1>
        <NovoAlunoButton />
      </div>

      <AlunosClient alunos={alunos} />
    </main>
  )
}
