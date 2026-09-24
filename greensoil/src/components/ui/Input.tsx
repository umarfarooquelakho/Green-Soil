import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  required?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, hint, leftIcon, rightIcon, required, id, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-dark-900',
              'placeholder:text-dark-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-dark-50 disabled:text-dark-400 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-dark-300 hover:border-dark-400',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-dark-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-dark-900',
            'placeholder:text-dark-400 resize-y min-h-[100px]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-dark-50 disabled:text-dark-400 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-dark-300 hover:border-dark-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-dark-500">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-dark-900',
            'transition-colors duration-150 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-dark-50 disabled:text-dark-400 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-dark-300 hover:border-dark-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-dark-500">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
