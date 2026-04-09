// RN-01: média aritmética simples das notas lançadas
export function calcularMedia(valores: number[]): number | null {
  if (valores.length === 0) return null
  return valores.reduce((acc, v) => acc + v, 0) / valores.length
}

// Média geral ponderada: soma de todas as notas / total de notas (cursos com mais notas pesam mais)
export function calcularMediaGeral(matriculas: { notas: { valor: number }[] }[]): number | null {
  let soma = 0
  let total = 0
  for (const m of matriculas) {
    for (const n of m.notas) {
      soma += n.valor
      total++
    }
  }
  return total === 0 ? null : soma / total
}

// RN-02: Aprovado >= 7.0 | Reprovado < 5.0 | Em Andamento: 5.0–6.9 ou null (sem notas)
export type Situacao = 'Aprovado' | 'Reprovado' | 'Em Andamento'

export function calcularSituacao(media: number | null): Situacao {
  if (media === null) return 'Em Andamento'
  if (media >= 7.0) return 'Aprovado'
  if (media < 5.0) return 'Reprovado'
  return 'Em Andamento'
}
