import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-dark-100 shadow-sm',
        paddingStyles[padding],
        hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  iconBg?: string
  className?: string
}

export function DashboardCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = 'bg-primary-100',
  className,
}: DashboardCardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <Card className={cn('', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-500">{title}</p>
          <p className="text-2xl font-bold text-dark-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={cn(
              'text-xs mt-1 font-medium',
              isPositive && 'text-emerald-600',
              isNegative && 'text-red-600',
            )}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              {changeLabel && <span className="text-dark-400 font-normal ml-1">{changeLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
