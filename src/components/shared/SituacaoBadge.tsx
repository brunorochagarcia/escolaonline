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
      Aprovado:       'bg-primary-soft text-primary',
      Reprovado:      'bg-accent-soft text-accent',
      'Em Andamento': 'bg-secondary text-primary',
    }[situacao],
  )
}
