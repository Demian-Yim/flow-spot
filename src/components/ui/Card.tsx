'use client'

import React, { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'interactive'
  noPadding?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', noPadding = false, className = '', ...props }, ref) => {
    const base = 'rounded-card bg-white transition-all duration-200'
    const padding = noPadding ? '' : 'p-5 sm:p-6'

    const variants: Record<string, string> = {
      default: 'shadow-sm border border-slate-200/60',
      elevated: 'shadow-md hover:shadow-lg border border-slate-100',
      outlined: 'border-2 border-slate-200 shadow-none',
      glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg',
      interactive: 'shadow-md hover:shadow-lg border border-slate-100 hover:-translate-y-0.5 cursor-pointer',
    }

    return (
      <div ref={ref} className={`${base} ${padding} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = ({ children, title, subtitle, className = '', ...props }: {
  children?: ReactNode; title?: string; subtitle?: string; className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-4 ${className}`} {...props}>
    {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
    {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    {children}
  </div>
)

export const CardBody = ({ children, className = '', ...props }: {
  children: ReactNode; className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div className={`my-4 ${className}`} {...props}>{children}</div>
)

export const CardFooter = ({ children, className = '', ...props }: {
  children: ReactNode; className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`} {...props}>{children}</div>
)

export default Card
