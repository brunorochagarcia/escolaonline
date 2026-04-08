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

export function situacaoStyle(situacao: Situacao): string {
  switch (situacao) {
    case 'Aprovado':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'Reprovado':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'Em Andamento':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
}
