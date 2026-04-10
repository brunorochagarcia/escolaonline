import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { buscarAlunoIdPorEmail } from '@/lib/api/alunos'

export default async function DashboardPage() {
  const session = await auth()
  if (session?.user?.role === 'ALUNO' && session.user.email) {
    const aluno = await buscarAlunoIdPorEmail(session.user.email)
    if (aluno) redirect(`/alunos/${aluno.id}`)
  }
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
      <h1 className="mb-8 text-2xl font-bold text-primary">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Alunos" valor={totalAlunos} href="/alunos" />
        <MetricCard
          label="Cursos ativos"
          valor={cursosAtivos}
          sublabel={`${totalCursos} no total`}
          href="/cursos"
        />
        <MetricCard label="Matrículas" valor={totalMatriculas} href="/matriculas" />
        <MetricCard label="Notas lançadas" valor={totalNotas} />
      </div>

      {mediaGeral !== null && (
        <div className="mt-6 rounded-2xl border border-secondary bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Média geral da escola
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">{mediaGeral.toFixed(1)}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Calculada sobre {totalNotas} nota{totalNotas !== 1 ? 's' : ''} lançada{totalNotas !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/ranking"
          className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
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
    <div className="rounded-2xl border border-secondary bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary">{valor}</p>
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
