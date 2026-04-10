import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Status } from '@prisma/client'
import { buscarCursoPorId } from '@/lib/api/cursos'
import { calcularMedia, calcularSituacao, cn } from '@/lib/utils'
import { SituacaoBadge } from '@/components/shared/SituacaoBadge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CursoDetalhesPage({ params }: PageProps) {
  const { id } = await params
  const curso = await buscarCursoPorId(id)

  if (!curso) notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/cursos" className="text-sm text-zinc-500 hover:text-primary transition-colors">
            ← Voltar para cursos
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-primary">{curso.nome}</h1>
          <p className="mt-1 text-sm text-zinc-500">{curso.descricao}</p>
        </div>
        <Link
          href={`/cursos/${curso.id}/editar`}
          className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Informações do curso */}
      <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-secondary bg-white p-5 sm:grid-cols-4">
        <InfoItem label="Instrutor" value={curso.instrutor} />
        <InfoItem label="Carga horária" value={`${curso.cargaHoraria}h`} />
        <InfoItem label="Matrículas" value={String(curso.matriculas.length)} />
        <InfoItem
          label="Status"
          value={
            <span className={statusBadgeClass(curso.status)}>
              {curso.status === Status.ATIVO ? 'Ativo' : 'Inativo'}
            </span>
          }
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-primary">Alunos matriculados</h2>

      {curso.matriculas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum aluno matriculado neste curso.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-secondary">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Data de matrícula</th>
                <th className="px-4 py-3">Notas lançadas</th>
                <th className="px-4 py-3">Média</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {curso.matriculas.map((matricula) => {
                const media = calcularMedia(matricula.notas.map((n) => Number(n.valor)))
                const situacao = calcularSituacao(media)

                return (
                  <tr key={matricula.id} className="bg-white hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/alunos/${matricula.alunoId}`} className="text-zinc-900 hover:underline">
                        {matricula.aluno.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(matricula.dataInicio).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{matricula.notas.length}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {media !== null ? media.toFixed(1) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <SituacaoBadge situacao={situacao} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/alunos/${matricula.alunoId}/boletim`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Boletim →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function statusBadgeClass(status: Status) {
  return cn(
    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
    status === Status.ATIVO
      ? 'bg-primary-soft text-primary'
      : 'bg-secondary text-primary',
  )
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-800">{value}</span>
    </div>
  )
}
