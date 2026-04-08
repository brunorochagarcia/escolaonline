import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NotaForm } from '@/components/notas/NotaForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NovaNotaPage({ params }: PageProps) {
  const { id: matriculaId } = await params

  const matricula = await prisma.matricula.findUnique({
    where: { id: matriculaId },
    include: { aluno: true, curso: true },
  })

  if (!matricula) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/alunos/${matricula.alunoId}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para o aluno
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Lançar nota</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {matricula.aluno.nome} — {matricula.curso.nome}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <NotaForm matriculaId={matriculaId} alunoId={matricula.alunoId} />
      </div>
    </main>
  )
}
