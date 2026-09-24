import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center mb-4 text-dark-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-dark-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-dark-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-red-600 text-2xl">!</span>
      </div>
      <h3 className="text-base font-semibold text-dark-900 mb-1">{title}</h3>
      <p className="text-sm text-dark-500 max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
