import { listarAlunosParaRanking } from '@/lib/api/alunos'
import { calcularMediaGeral } from '@/lib/utils'

export async function GET() {
  const alunos = await listarAlunosParaRanking()

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
    .map((a, index) => ({ posicao: index + 1, ...a }))

  return Response.json(ranking)
}
