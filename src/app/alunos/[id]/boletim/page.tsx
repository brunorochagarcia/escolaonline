import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarAlunoParaBoletim } from '@/lib/api/alunos'
import { calcularMedia, calcularMediaGeral, calcularSituacao } from '@/lib/utils'
import { SituacaoBadge } from '@/components/shared/SituacaoBadge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BoletimPage({ params }: PageProps) {
  const { id } = await params
  const aluno = await buscarAlunoParaBoletim(id)

  if (!aluno) notFound()

  const { matriculas } = aluno

  const situacoes = matriculas.map((m) =>
    calcularSituacao(calcularMedia(m.notas.map((n) => Number(n.valor)))),
  )
  const aprovados = situacoes.filter((s) => s === 'Aprovado').length
  const reprovados = situacoes.filter((s) => s === 'Reprovado').length

  // RN-01: média flat ponderada por quantidade de notas — consistente com o ranking
  const mediaGeral = calcularMediaGeral(
    matriculas.map((m) => ({ notas: m.notas.map((n) => ({ valor: Number(n.valor) })) })),
  )

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/alunos/${id}`} className="text-sm text-zinc-500 hover:text-primary transition-colors">
          ← Voltar para o aluno
        </Link>
      </div>

      {/* Cabeçalho do boletim */}
      <div className="mb-8 rounded-2xl border border-secondary bg-white p-6">
        <h1 className="text-xl font-bold text-primary">Boletim Escolar</h1>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm sm:grid-cols-3">
          <InfoRow label="Aluno" value={aluno.nome} />
          <InfoRow label="E-mail" value={aluno.email} />
          <InfoRow label="Data de nascimento" value={aluno.dataNascimento.toLocaleDateString('pt-BR')} />
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ResumoCard label="Cursos" valor={String(matriculas.length)} />
        <ResumoCard label="Aprovados" valor={String(aprovados)} destaque="green" />
        <ResumoCard label="Reprovados" valor={String(reprovados)} destaque="red" />
        <ResumoCard label="Média geral" valor={mediaGeral !== null ? mediaGeral.toFixed(1) : '—'} />
      </div>

      {/* Boletim por curso */}
      {matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="space-y-6">
          {matriculas.map((matricula) => {
            const media = calcularMedia(matricula.notas.map((n) => Number(n.valor)))
            const situacao = calcularSituacao(media)

            return (
              <div key={matricula.id} className="overflow-hidden rounded-2xl border border-secondary">
                {/* Cabeçalho do curso */}
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
                  </div>
                </div>

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
                        <td colSpan={2} className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-zinc-400">{label}</span>
      <p className="font-medium text-zinc-900">{value}</p>
    </div>
  )
}

function ResumoCard({ label, valor, destaque }: { label: string; valor: string; destaque?: 'green' | 'red' }) {
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
