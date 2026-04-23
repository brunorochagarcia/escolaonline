import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarAlunoParaBoletim, buscarAlunoParaEdicao } from '@/lib/api/alunos'
import { auth } from '@/lib/auth'
import { calcularMedia, calcularMediaGeral, calcularSituacao } from '@/lib/utils'
import { SituacaoBadge } from '@/components/shared/SituacaoBadge'
import { LancarNotaButton } from '@/components/notas/LancarNotaButton'
import { EditarAlunoButton } from '@/components/alunos/EditarAlunoButton'
import dynamic from 'next/dynamic'

const GraficoEvolucaoNotas = dynamic(
  () => import('@/components/alunos/GraficoEvolucaoNotas').then((m) => m.GraficoEvolucaoNotas),
  { ssr: false },
)

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AlunoDetalhesPage({ params }: PageProps) {
  const { id } = await params
  const [aluno, alunoEdicao, session] = await Promise.all([
    buscarAlunoParaBoletim(id),
    buscarAlunoParaEdicao(id),
    auth(),
  ])

  if (!aluno) notFound()

  const role = session?.user?.role

  if (role === 'ALUNO' && session?.user?.email !== aluno.email) notFound()
  const userId = session?.user?.id
  const podeEditar = role === 'ADMIN' || role === 'PROFESSOR'
  const podeEditarProprio = role === 'ALUNO' && session?.user?.email === aluno.email

  const { matriculas } = aluno

  const situacoes = matriculas.map((m) =>
    calcularSituacao(calcularMedia(m.notas.map((n) => Number(n.valor)))),
  )
  const aprovados = situacoes.filter((s) => s === 'Aprovado').length
  const reprovados = situacoes.filter((s) => s === 'Reprovado').length
  const mediaGeral = calcularMediaGeral(
    matriculas.map((m) => ({ notas: m.notas.map((n) => ({ valor: Number(n.valor) })) })),
  )

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          {!podeEditarProprio && (
            <Link href="/alunos" className="text-sm text-zinc-500 hover:text-primary transition-colors">
              ← Voltar para alunos
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold text-primary">{aluno.nome}</h1>
          <p className="mt-1 text-sm text-zinc-500">{aluno.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {(podeEditar || podeEditarProprio) && alunoEdicao && (
            <EditarAlunoButton
              alunoId={aluno.id}
              defaultValues={{
                nome: alunoEdicao.nome,
                email: alunoEdicao.email,
                dataNascimento: alunoEdicao.dataNascimento.toISOString().split('T')[0],
                fotoUrl: alunoEdicao.fotoUrl ?? '',
                fotoPublicId: alunoEdicao.fotoPublicId ?? '',
              }}
            />
          )}
          <a
            href={`/api/boletim/${aluno.id}`}
            className="rounded-lg border border-secondary px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-secondary transition-colors"
          >
            PDF
          </a>
          <a
            href={`/api/boletim/${aluno.id}?format=csv`}
            className="rounded-lg border border-secondary px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-secondary transition-colors"
          >
            CSV
          </a>
        </div>
      </div>

      {/* Info do aluno */}
      <div className="mb-6 rounded-2xl border border-secondary bg-white p-5">
        <div className="grid grid-cols-2 gap-y-1 text-sm sm:grid-cols-3">
          <InfoItem label="Aluno" value={aluno.nome} />
          <InfoItem label="E-mail" value={aluno.email} />
          <InfoItem
            label="Data de nascimento"
            value={aluno.dataNascimento.toLocaleDateString('pt-BR')}
          />
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ResumoCard label="Cursos" valor={String(matriculas.length)} />
        <ResumoCard label="Aprovados" valor={String(aprovados)} destaque="green" />
        <ResumoCard label="Reprovados" valor={String(reprovados)} destaque="red" />
        <ResumoCard
          label="Média geral"
          valor={mediaGeral !== null ? mediaGeral.toFixed(1) : '—'}
        />
      </div>

      {/* Gráfico de evolução */}
      <GraficoEvolucaoNotas
        matriculas={matriculas.map((m) => ({
          id: m.id,
          curso: { nome: m.curso.nome },
          notas: m.notas.map((n) => ({
            id: n.id,
            valor: Number(n.valor),
            data: n.data.toISOString(),
          })),
        }))}
      />

      {/* Matrículas e notas */}
      <h2 className="mb-3 text-lg font-semibold text-primary">Cursos matriculados</h2>

      {matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="space-y-6">
          {matriculas.map((matricula) => {
            const media = calcularMedia(matricula.notas.map((n) => Number(n.valor)))
            const situacao = calcularSituacao(media)
            const progresso = media !== null ? Math.round((media / 10) * 100) : null

            return (
              <div key={matricula.id} className="overflow-hidden rounded-2xl border border-secondary">
                {/* Cabeçalho da matrícula */}
                <div className="flex items-center justify-between bg-secondary px-5 py-3">
                  <div>
                    <p className="font-semibold text-primary">{matricula.curso.nome}</p>
                    <p className="text-xs text-zinc-600">
                      Matrícula em {new Date(matricula.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-zinc-600">Média</p>
                      <p className="text-sm font-bold text-primary">
                        {media !== null ? media.toFixed(1) : '—'}
                      </p>
                    </div>
                    <SituacaoBadge situacao={situacao} />
                    {(role === 'ADMIN' ||
                      (role === 'PROFESSOR' &&
                        !!matricula.curso.instrutorId &&
                        matricula.curso.instrutorId === userId)) && (
                      <LancarNotaButton matriculaId={matricula.id} alunoId={aluno.id} />
                    )}
                  </div>
                </div>

                {/* Barra de progresso — visível apenas no próprio perfil */}
                {podeEditarProprio && (
                  <div className="bg-white px-5 py-3 border-b border-secondary">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-500">Progresso</span>
                      <span className="text-xs font-medium text-primary">
                        {progresso !== null ? `${progresso}%` : 'Sem notas'}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={progressoBarClass(situacao)}
                        style={{ width: `${progresso ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tabela de notas */}
                {matricula.notas.length === 0 ? (
                  <p className="bg-white px-5 py-4 text-sm text-zinc-400">Nenhuma nota lançada.</p>
                ) : (
                  <table className="w-full bg-white text-sm">
                    <thead className="border-b border-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
                      <tr>
                        <th className="px-5 py-2">Avaliação</th>
                        <th className="px-5 py-2">Data</th>
                        <th className="px-5 py-2 text-right">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                      {matricula.notas.map((nota) => (
                        <tr key={nota.id} className="hover:bg-surface transition-colors">
                          <td className="px-5 py-2.5 text-zinc-900">{nota.descricao}</td>
                          <td className="px-5 py-2.5 text-zinc-500">
                            {new Date(nota.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-5 py-2.5 text-right font-medium tabular-nums text-primary">
                            {nota.valor.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-secondary bg-secondary">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary"
                        >
                          Média do curso
                        </td>
                        <td className="px-5 py-2 text-right font-bold tabular-nums text-primary">
                          {media !== null ? media.toFixed(1) : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

function progressoBarClass(situacao: string) {
  if (situacao === 'Aprovado')      return 'h-full rounded-full bg-primary transition-all'
  if (situacao === 'Reprovado')     return 'h-full rounded-full bg-accent transition-all'
  return 'h-full rounded-full bg-primary-soft transition-all'
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-zinc-400">{label}</span>
      <p className="font-medium text-zinc-900">{value}</p>
    </div>
  )
}

function ResumoCard({
  label,
  valor,
  destaque,
}: {
  label: string
  valor: string
  destaque?: 'green' | 'red'
}) {
  const valorClass =
    destaque === 'green' ? 'text-primary' :
    destaque === 'red'   ? 'text-accent'  :
                           'text-primary'

  return (
    <div className="rounded-2xl border border-secondary bg-white p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valorClass}`}>{valor}</p>
    </div>
  )
}
