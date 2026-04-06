'use client'

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  showDot?: boolean
  className?: string
}

const variants: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  error: 'bg-red-50 text-red-700 border-red-200/60',
  info: 'bg-blue-50 text-blue-700 border-blue-200/60',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200/60',
}

const dotColors: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
}

export default function Badge({ children, variant = 'neutral', showDot = false, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse-soft`} />}
      {children}
    </span>
  )
}
