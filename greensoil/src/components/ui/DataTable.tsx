import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'
import { Pagination } from './Pagination'
import type { TableColumn } from '@/types/common.types'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  // Pagination
  page?: number
  totalPages?: number
  total?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  // Sort
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription,
  keyExtractor,
  onRowClick,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  sortField,
  sortOrder,
  onSort,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('', className)}>
      <div className="overflow-x-auto rounded-xl border border-dark-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-50 border-b border-dark-100">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide whitespace-nowrap',
                    col.sortable && 'cursor-pointer hover:text-dark-900 select-none',
                    col.width && `w-[${col.width}]`
                  )}
                  onClick={col.sortable && onSort ? () => onSort(String(col.key)) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortField === String(col.key) && (
                      sortOrder === 'asc'
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex justify-center">
                    <LoadingSpinner size="lg" className="text-primary-600" />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'border-b border-dark-50 last:border-0',
                    'hover:bg-dark-50/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-dark-700"
                    >
                      {col.render
                        ? col.render(
                            (row as Record<string, unknown>)[String(col.key)],
                            row
                          )
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && page && totalPages && onPageChange && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            total={total}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  )
}
