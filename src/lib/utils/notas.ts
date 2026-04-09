// RN-01: média aritmética simples das notas lançadas
export function calcularMedia(notas: { valor: number }[]): number | null {
  if (notas.length === 0) return null
  return notas.reduce((acc, n) => acc + n.valor, 0) / notas.length
}

// RN-02: Aprovado >= 7.0 | Reprovado < 5.0 | Em Andamento: 5.0–6.9 ou sem notas
export type Situacao = 'Aprovado' | 'Reprovado' | 'Em Andamento'

export function calcularSituacao(notas: { valor: number }[]): Situacao {
  const media = calcularMedia(notas)
  if (media === null) return 'Em Andamento'
  if (media >= 7.0) return 'Aprovado'
  if (media < 5.0) return 'Reprovado'
  return 'Em Andamento'
}
