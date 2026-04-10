import Link from 'next/link'
import { listarAlunosParaRanking } from '@/lib/api/alunos'
import { calcularMediaGeral, cn } from '@/lib/utils'
import { Paginacao } from '@/components/ui/Paginacao'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function RankingPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))

  const alunos = await listarAlunosParaRanking()

  const ranking = alunos
    .map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      fotoUrl: aluno.fotoUrl,
      totalNotas: aluno.matriculas.reduce((acc, m) => acc + m.notas.length, 0),
      totalCursos: aluno.matriculas.length,
      media: calcularMediaGeral(
        aluno.matriculas.map((m) => ({ notas: m.notas.map((n) => ({ valor: Number(n.valor) })) })),
      ),
    }))
    .filter((a) => a.media !== null)
    .sort((a, b) => (b.media as number) - (a.media as number))

  const totalPages = Math.ceil(ranking.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages, 1))
  const paginado = ranking.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  // O índice global preserva a posição real no ranking (ex: página 2 começa em 21º)
  const offset = (safePage - 1) * PAGE_SIZE

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/alunos" className="text-sm text-zinc-500 hover:text-primary transition-colors">
          ← Voltar para alunos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">Ranking de alunos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Média geral ponderada por quantidade de notas. Alunos sem notas não são exibidos.
        </p>
      </div>

      {ranking.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum aluno com notas lançadas.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-secondary">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
                <tr>
                  <th className="px-4 py-3">Aluno</th>
                  <th className="px-4 py-3">Cursos</th>
                  <th className="px-4 py-3">Notas</th>
                  <th className="px-4 py-3 text-right">Média geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {paginado.map((aluno, i) => {
                  const index = offset + i
                  return (
                    <tr key={aluno.id} className="bg-white hover:bg-surface transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-7 shrink-0 text-sm tabular-nums', medalClass(index))}>
                            {index + 1}º
                          </span>
                          <Link href={`/alunos/${aluno.id}`} className="text-zinc-900 hover:underline">
                            {aluno.nome}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{aluno.totalCursos}</td>
                      <td className="px-4 py-3 text-zinc-500">{aluno.totalNotas}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={medalClass(index)}>
                          {(aluno.media as number).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Paginacao
            page={safePage}
            totalPages={totalPages}
            buildHref={(p) => `?page=${p}`}
          />
        </>
      )}
    </main>
  )
}

function medalClass(index: number) {
  if (index === 0) return 'font-bold text-yellow-500'
  if (index === 1) return 'font-bold text-zinc-400'
  if (index === 2) return 'font-bold text-amber-600'
  return 'font-medium text-zinc-700'
}
