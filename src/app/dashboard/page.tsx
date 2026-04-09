import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const [totalAlunos, totalCursos, cursosAtivos, totalMatriculas, agregacaoNotas] =
    await Promise.all([
      prisma.aluno.count(),
      prisma.curso.count(),
      prisma.curso.count({ where: { status: 'ATIVO' } }),
      prisma.matricula.count(),
      prisma.nota.aggregate({ _avg: { valor: true }, _count: { valor: true } }),
    ])

  const mediaGeral = agregacaoNotas._avg.valor
  const totalNotas = agregacaoNotas._count.valor

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Alunos"
          valor={totalAlunos}
          href="/alunos"
        />
        <MetricCard
          label="Cursos ativos"
          valor={cursosAtivos}
          sublabel={`${totalCursos} no total`}
          href="/cursos"
        />
        <MetricCard
          label="Matrículas"
          valor={totalMatriculas}
          href="/matriculas"
        />
        <MetricCard
          label="Notas lançadas"
          valor={totalNotas}
        />
      </div>

      {mediaGeral !== null && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Média geral da escola
          </p>
          <p className="mt-1 text-3xl font-bold">{mediaGeral.toFixed(1)}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Calculada sobre {totalNotas} nota{totalNotas !== 1 ? 's' : ''} lançada{totalNotas !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          href="/ranking"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Ver ranking →
        </Link>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  valor,
  sublabel,
  href,
}: {
  label: string
  valor: number
  sublabel?: string
  href?: string
}) {
  const content = (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{valor}</p>
      {sublabel && <p className="mt-1 text-xs text-zinc-500">{sublabel}</p>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}