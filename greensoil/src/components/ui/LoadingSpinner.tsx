import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-4',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-current border-t-transparent animate-spin',
        sizeMap[size],
        className
      )}
    />
  )
}

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <LoadingSpinner size="xl" className="text-primary-600" />
      <p className="text-dark-500 text-sm">{message}</p>
    </div>
  )
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GS</span>
          </div>
          <span className="font-bold text-dark-900 text-lg">GREEN SOIL</span>
        </div>
        <LoadingSpinner size="lg" className="text-primary-600" />
      </div>
    </div>
  )
}
