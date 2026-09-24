import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BreadcrumbItem } from '@/types/common.types'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap text-sm">
        <li>
          <Link
            to="/"
            className="text-dark-400 hover:text-primary-600 transition-colors flex items-center"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-dark-300" aria-hidden />
            {item.href && idx < items.length - 1 ? (
              <Link
                to={item.href}
                className="text-dark-500 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-dark-800 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
