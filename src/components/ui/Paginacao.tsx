import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginacaoProps {
  page: number
  totalPages: number
  buildHref: (page: number) => string
}

export function Paginacao({ page, totalPages, buildHref }: PaginacaoProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
      <span>
        Página {page} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-primary hover:bg-secondary transition-colors"
          >
            <ChevronLeft size={14} /> Anterior
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-zinc-300 cursor-not-allowed">
            <ChevronLeft size={14} /> Anterior
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-primary hover:bg-secondary transition-colors"
          >
            Próxima <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-zinc-300 cursor-not-allowed">
            Próxima <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  )
}
