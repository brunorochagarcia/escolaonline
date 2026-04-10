import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarAlunoPorId } from '@/lib/api/alunos'
import { calcularMedia, calcularSituacao } from '@/lib/utils'
import { SituacaoBadge } from '@/components/shared/SituacaoBadge'
import { LancarNotaButton } from '@/components/notas/LancarNotaButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AlunoDetalhesPage({ params }: PageProps) {
  const { id } = await params
  const aluno = await buscarAlunoPorId(id)

  if (!aluno) notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/alunos"
            className="text-sm text-zinc-500 hover:text-primary transition-colors"
          >
            ← Voltar para alunos
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-primary">{aluno.nome}</h1>
          <p className="mt-1 text-sm text-zinc-500">{aluno.email}</p>
        </div>
        <Link
          href={`/alunos/${aluno.id}/editar`}
          className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Matrículas e notas */}
      <h2 className="mb-3 text-lg font-semibold text-primary">Cursos matriculados</h2>

      {aluno.matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>
      ) : (
        <div className="space-y-4">
          {aluno.matriculas.map((matricula) => {
            const media = calcularMedia(matricula.notas.map((n) => Number(n.valor)))
            const situacao = calcularSituacao(media)

            return (
              <div key={matricula.id} className="rounded-2xl border border-secondary bg-white">
                {/* Cabeçalho da matrícula */}
                <div className="flex items-center justify-between border-b border-secondary px-5 py-4">
                  <div>
                    <p className="font-medium text-zinc-900">{matricula.curso.nome}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Início: {new Date(matricula.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Média</p>
                      <p className="text-sm font-semibold text-primary">
                        {media !== null ? media.toFixed(1) : '—'}
                      </p>
                    </div>
                    <SituacaoBadge situacao={situacao} />
                    <LancarNotaButton matriculaId={matricula.id} alunoId={aluno.id} />
                  </div>
                </div>

                {/* Lista de notas */}
                {matricula.notas.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-zinc-400">Nenhuma nota lançada.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
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
                          <td className="px-5 py-2.5 text-right font-medium text-primary">
                            {nota.valor.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
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
