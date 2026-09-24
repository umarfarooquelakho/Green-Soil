import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total?: number
  pageSize?: number
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    pages.push(1)
    if (page > 3) pages.push('ellipsis')
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  const pages = getPages()
  const start = total && pageSize ? (page - 1) * pageSize + 1 : null
  const end = total && pageSize ? Math.min(page * pageSize, total) : null

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      {total && start && end && (
        <p className="text-sm text-dark-500">
          Showing <span className="font-medium text-dark-700">{start}–{end}</span> of{' '}
          <span className="font-medium text-dark-700">{total}</span> results
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-dark-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-700 hover:bg-dark-100'
              )}
            >
              {p}
            </button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
