import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { buscarAlunoIdPorEmail, buscarSituacaoDosAlunos, buscarSituacaoPorCurso } from '@/lib/api/alunos'
import { buscarResumoFinanceiro } from '@/lib/api/matriculas'
import { cn } from '@/lib/utils'

function mediaCorClass(v: number) {
  if (v >= 7) return 'text-primary'
  if (v >= 5) return 'text-amber-600'
  return 'text-accent'
}

function inadimplenciaCorClass(pct: number) {
  if (pct <= 15) return 'text-primary'
  if (pct <= 30) return 'text-amber-600'
  return 'text-accent'
}

export default async function DashboardPage() {
  const session = await auth()
  if (session?.user?.role === 'ALUNO' && session.user.email) {
    const aluno = await buscarAlunoIdPorEmail(session.user.email)
    if (aluno) redirect(`/alunos/${aluno.id}`)
  }

  const seteAtras = new Date()
  seteAtras.setDate(seteAtras.getDate() - 7)

  const [
    situacao,
    situacaoPorCurso,
    financeiro,
    totalAlunos,
    totalCursos,
    cursosAtivos,
    totalMatriculas,
    notasRecentes,
    agMedia,
  ] = await Promise.all([
    buscarSituacaoDosAlunos(),
    buscarSituacaoPorCurso(),
    buscarResumoFinanceiro(),
    prisma.aluno.count(),
    prisma.curso.count(),
    prisma.curso.count({ where: { status: 'ATIVO' } }),
    prisma.matricula.count(),
    prisma.nota.count({ where: { data: { gte: seteAtras } } }),
    prisma.nota.aggregate({ _avg: { valor: true } }),
  ])

  const mediaGeral = agMedia._avg.valor ? Number(agMedia._avg.valor) : null
  const mediaPorAluno = totalAlunos > 0 ? (totalMatriculas / totalAlunos).toFixed(1) : '—'
  const cursosInativos = totalCursos - cursosAtivos
  const inadimplenciaPct = financeiro.total > 0
    ? Math.round(((financeiro.pendente + financeiro.atrasado) / financeiro.total) * 100)
    : 0

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/alunos"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            + Novo aluno
          </Link>
          <Link
            href="/matriculas"
            className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
          >
            Lançar nota
          </Link>
        </div>
      </div>

      {/* Row 1: situação + pagamentos */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Hero: situação dos alunos */}
        <div className="rounded-2xl border border-secondary bg-white p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Situação dos alunos
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <SituacaoBucket label="Aprovados"    count={situacao.aprovados}   bg="bg-primary-soft" cor="text-primary"    />
                <SituacaoBucket label="Em andamento" count={situacao.emAndamento} bg="bg-amber-100"    cor="text-amber-700" />
                <SituacaoBucket label="Reprovados"   count={situacao.reprovados}  bg="bg-accent-soft"  cor="text-accent"    />
              </div>
            </div>
            {mediaGeral !== null && (
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Média geral</p>
                <p className={cn('mt-1 text-4xl font-bold tabular-nums', mediaCorClass(mediaGeral))}>
                  {mediaGeral.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagamentos */}
        <div className="rounded-2xl border border-secondary bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Pagamentos</p>
          <div className="mt-3">
            <p className={cn('text-4xl font-bold tabular-nums', inadimplenciaCorClass(inadimplenciaPct))}>
              {inadimplenciaPct}%
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">inadimplentes</p>
          </div>
          <div className="mt-4 space-y-1.5 border-t border-secondary pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Pagas</span>
              <span className="font-medium text-primary tabular-nums">{financeiro.pago}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Pendentes</span>
              <span className="font-medium text-amber-600 tabular-nums">{financeiro.pendente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Atrasadas</span>
              <span className="font-medium text-accent tabular-nums">{financeiro.atrasado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta: alunos em risco */}
      {situacao.reprovados > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-accent-soft bg-accent-soft px-4 py-3 text-sm text-accent">
          <span aria-hidden>⚠</span>
          <span>
            <strong>{situacao.reprovados} aluno{situacao.reprovados !== 1 ? 's' : ''}</strong>{' '}
            com média abaixo de 5.{' '}
            <Link href="/ranking" className="underline hover:no-underline">Ver no ranking →</Link>
          </span>
        </div>
      )}

      {/* Situação por curso */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-secondary bg-white">
        <div className="grid grid-cols-[1fr_repeat(4,5rem)] border-b border-secondary px-5 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Curso</p>
          <p className="text-center text-xs font-medium text-primary">Aprovados</p>
          <p className="text-center text-xs font-medium text-amber-600">Em andamento</p>
          <p className="text-center text-xs font-medium text-accent">Reprovados</p>
          <p className="text-right text-xs font-medium text-zinc-400">Alunos</p>
        </div>
        <div className="divide-y divide-secondary">
          {situacaoPorCurso.map(curso => (
            <div key={curso.id} className="grid grid-cols-[1fr_repeat(4,5rem)] items-center px-5 py-3">
              <span className="truncate text-sm text-zinc-700">{curso.nome}</span>
              <span className="text-center text-sm font-bold tabular-nums text-primary">{curso.aprovados}</span>
              <span className="text-center text-sm font-bold tabular-nums text-amber-600">{curso.emAndamento}</span>
              <span className="text-center text-sm font-bold tabular-nums text-accent">{curso.reprovados}</span>
              <span className="text-right text-xs tabular-nums text-zinc-400">{curso.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas secundárias */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Alunos"           valor={totalAlunos}         href="/alunos" />
        <MetricCard
          label="Cursos ativos"
          valor={`${cursosAtivos} / ${totalCursos}`}
          sublabel={cursosInativos === 0 ? 'todos ativos' : `${cursosInativos} inativo${cursosInativos !== 1 ? 's' : ''}`}
          href="/cursos"
        />
        <MetricCard label="Matrículas"       valor={totalMatriculas}     sublabel={`${mediaPorAluno} por aluno`} href="/matriculas" />
        <MetricCard label="Notas esta semana" valor={notasRecentes} />
      </div>

      <div className="mt-6 flex justify-end">
        <Link href="/ranking" className="text-sm font-medium text-primary hover:underline">
          Ver ranking completo →
        </Link>
      </div>
    </main>
  )
}

function SituacaoBucket({ label, count, bg, cor }: { label: string; count: number; bg: string; cor: string }) {
  return (
    <div className={cn('rounded-xl px-5 py-3', bg)}>
      <p className={cn('text-2xl font-bold tabular-nums', cor)}>{count}</p>
      <p className={cn('mt-0.5 text-xs font-medium', cor)}>{label}</p>
    </div>
  )
}

function MetricCard({ label, valor, sublabel, href }: { label: string; valor: number | string; sublabel?: string; href?: string }) {
  const content = (
    <div className="rounded-2xl border border-secondary bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{valor}</p>
      {sublabel && <p className="mt-1 text-xs text-zinc-500">{sublabel}</p>}
    </div>
  )
  if (href) return <Link href={href} className="transition-opacity hover:opacity-80">{content}</Link>
  return content
}