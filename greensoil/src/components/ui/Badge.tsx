import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'orange'
  | 'outline'

type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-dark-100 text-dark-700',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  outline: 'border border-dark-300 text-dark-700 bg-transparent',
}

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-dark-500',
  primary: 'bg-primary-600',
  success: 'bg-emerald-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
  outline: 'bg-dark-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

// Order status specific badge
import type { OrderStatus } from '@/types/database.types'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    PROCESSING: { variant: 'purple', label: 'Processing' },
    SHIPPED: { variant: 'primary', label: 'Shipped' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    RETURNED: { variant: 'orange', label: 'Returned' },
  }

  const { variant, label } = config[status] ?? { variant: 'default', label: status }
  return <Badge variant={variant} dot>{label}</Badge>
}

// Payment status badge
import type { PaymentStatus } from '@/types/database.types'

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PAID: { variant: 'success', label: 'Paid' },
    FAILED: { variant: 'danger', label: 'Failed' },
    REFUNDED: { variant: 'orange', label: 'Refunded' },
  }
  const { variant, label } = config[status] ?? { variant: 'default', label: status }
  return <Badge variant={variant}>{label}</Badge>
}
