import { redirect } from 'next/navigation'
import { listarAlunos } from '@/lib/api/alunos'
import { auth } from '@/lib/auth'
import { AlunosClient } from '@/components/alunos/AlunosClient'
import { NovoAlunoButton } from '@/components/alunos/NovoAlunoButton'

export default async function AlunosPage() {
  const [alunos, session] = await Promise.all([listarAlunos(), auth()])
  const role = session?.user?.role

  // ALUNO só vê o próprio perfil — redireciona direto para ele
  if (role === 'ALUNO') {
    const meuPerfil = alunos.find((a) => a.email === session?.user?.email)
    if (meuPerfil) redirect(`/alunos/${meuPerfil.id}`)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Alunos</h1>
        {role !== 'ALUNO' && <NovoAlunoButton />}
      </div>

      <AlunosClient alunos={alunos} />
    </main>
  )
}
