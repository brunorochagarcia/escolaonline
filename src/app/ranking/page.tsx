import Link from 'next/link'
import { listarAlunosParaRanking } from '@/lib/api/alunos'
import { calcularMediaGeral, cn } from '@/lib/utils'

export default async function RankingPage() {
  const alunos = await listarAlunosParaRanking()

  // RN-04: excluir alunos sem nenhuma nota lançada
  const ranking = alunos
    .map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      fotoUrl: aluno.fotoUrl,
      totalNotas: aluno.matriculas.reduce((acc, m) => acc + m.notas.length, 0),
      totalCursos: aluno.matriculas.length,
      media: calcularMediaGeral(aluno.matriculas),
    }))
    .filter((a) => a.media !== null)
    .sort((a, b) => (b.media as number) - (a.media as number))

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/alunos"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Voltar para alunos
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Ranking de alunos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Média geral ponderada por quantidade de notas. Alunos sem notas não são exibidos.
        </p>
      </div>

      {ranking.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum aluno com notas lançadas.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Cursos</th>
                <th className="px-4 py-3">Notas</th>
                <th className="px-4 py-3 text-right">Média geral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {ranking.map((aluno, index) => (
                <tr
                  key={aluno.id}
                  className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-7 shrink-0 text-sm tabular-nums', medalClass(index))}>
                        {index + 1}º
                      </span>
                      <Link href={`/alunos/${aluno.id}/boletim`} className="hover:underline">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function medalClass(index: number) {
  if (index === 0) return 'font-bold text-yellow-500'
  if (index === 1) return 'font-bold text-zinc-400'
  if (index === 2) return 'font-bold text-amber-600'
  return 'font-medium text-zinc-700 dark:text-zinc-300'
}
