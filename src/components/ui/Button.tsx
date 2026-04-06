'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      loading = false,
      icon,
      fullWidth = false,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

    const variants: Record<string, string> = {
      primary:
        'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-sm hover:shadow-md hover:from-primary-400 hover:to-primary-500 focus-visible:ring-primary-500/50',
      secondary:
        'bg-gradient-to-b from-secondary-500 to-secondary-600 text-white shadow-sm hover:shadow-md hover:from-secondary-400 hover:to-secondary-500 focus-visible:ring-secondary-500/50',
      accent:
        'bg-gradient-to-b from-accent-500 to-accent-600 text-white shadow-sm hover:shadow-md hover:from-accent-400 hover:to-accent-500 focus-visible:ring-accent-500/50',
      outline:
        'border-[1.5px] border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400/50',
      ghost:
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/50',
      danger:
        'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm hover:shadow-md hover:from-red-400 hover:to-red-500 focus-visible:ring-red-500/50',
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
      md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
      lg: 'px-5 py-3 text-base gap-2 rounded-xl',
      xl: 'px-6 py-3.5 text-lg gap-2.5 rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>처리 중...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
