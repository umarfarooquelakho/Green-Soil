// Common shared types used across the application

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface FilterConfig {
  search?: string
  status?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: string | undefined
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  permission?: string
}

export interface DashboardStat {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: string
  order: SortOrder
}

// Form submission state
export type SubmitState = 'idle' | 'loading' | 'success' | 'error'
