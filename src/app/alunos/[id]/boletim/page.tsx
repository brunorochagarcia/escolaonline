import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarAlunoParaBoletim } from '@/lib/api/alunos'
import { calcularMedia, calcularSituacao } from '@/lib/utils'
import { SituacaoBadge } from '@/components/shared/SituacaoBadge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BoletimPage({ params }: PageProps) {
  const { id } = await params
  const aluno = await buscarAlunoParaBoletim(id)

  if (!aluno) notFound()

  const { matriculas } = aluno

  // Calcula situação por matrícula para o resumo
  const situacoes = matriculas.map((m) => calcularSituacao(m.notas))
  const aprovados = situacoes.filter((s) => s === 'Aprovado').length
  const reprovados = situacoes.filter((s) => s === 'Reprovado').length
  const emAndamento = situacoes.filter((s) => s === 'Em Andamento').length

  // Média geral: média das médias de cada curso (só cursos com ao menos uma nota)
  const mediasComNota = matriculas
    .map((m) => calcularMedia(m.notas))
    .filter((m): m is number => m !== null)
  const mediaGeral =
    mediasComNota.length > 0
      ? mediasComNota.reduce((acc, m) => acc + m, 0) / mediasComNota.length
      : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Navegação */}
      <div className="mb-6">
        <Link
          href={`/alunos/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para o aluno
        </Link>
      </div>

      {/* Cabeçalho do boletim */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-bold">Boletim Escolar</h1>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm sm:grid-cols-3">
          <InfoRow label="Aluno" value={aluno.nome} />
          <InfoRow label="E-mail" value={aluno.email} />
          <InfoRow
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

      {/* Boletim por curso */}
      {matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="space-y-6">
          {matriculas.map((matricula) => {
            const media = calcularMedia(matricula.notas)
            const situacao = calcularSituacao(matricula.notas)

            return (
              <div
                key={matricula.id}
                className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                {/* Cabeçalho do curso */}
                <div className="flex items-center justify-between bg-zinc-50 px-5 py-3 dark:bg-zinc-800/60">
                  <div>
                    <p className="font-semibold">{matricula.curso.nome}</p>
                    <p className="text-xs text-zinc-500">
                      Matrícula em {new Date(matricula.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Média</p>
                      <p className="text-sm font-bold">
                        {media !== null ? media.toFixed(1) : '—'}
                      </p>
                    </div>
                    <SituacaoBadge situacao={situacao} />
                  </div>
                </div>

                {/* Tabela de notas */}
                {matricula.notas.length === 0 ? (
                  <p className="bg-white px-5 py-4 text-sm text-zinc-400 dark:bg-zinc-900">
                    Nenhuma nota lançada.
                  </p>
                ) : (
                  <table className="w-full bg-white text-sm dark:bg-zinc-900">
                    <thead className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                      <tr>
                        <th className="px-5 py-2">Avaliação</th>
                        <th className="px-5 py-2">Data</th>
                        <th className="px-5 py-2 text-right">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {matricula.notas.map((nota) => (
                        <tr key={nota.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                          <td className="px-5 py-2.5">{nota.descricao}</td>
                          <td className="px-5 py-2.5 text-zinc-500">
                            {new Date(nota.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-5 py-2.5 text-right font-medium tabular-nums">
                            {nota.valor.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <tr>
                        <td colSpan={2} className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Média do curso
                        </td>
                        <td className="px-5 py-2 text-right font-bold tabular-nums">
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
      <p className="font-medium">{value}</p>
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
    destaque === 'green'
      ? 'text-green-600 dark:text-green-400'
      : destaque === 'red'
        ? 'text-red-600 dark:text-red-400'
        : 'text-zinc-900 dark:text-zinc-100'

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valorClass}`}>{valor}</p>
    </div>
  )
}
