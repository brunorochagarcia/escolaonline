import { cn, type Situacao } from '@/lib/utils'

interface SituacaoBadgeProps {
  situacao: Situacao
  className?: string
}

export function SituacaoBadge({ situacao, className }: SituacaoBadgeProps) {
  return (
    <span className={cn(badgeClass(situacao), className)}>
      {situacao}
    </span>
  )
}

function badgeClass(situacao: Situacao) {
  return cn(
    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
    {
      Aprovado:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Reprovado:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Em Andamento': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    }[situacao],
  )
}
