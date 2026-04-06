'use client'

import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/ui/Card'
import CountdownTimer from '@/components/ui/CountdownTimer'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

interface SpotLayoutProps {
  /** Spot title displayed in header */
  title: string
  /** English subtitle */
  subtitle?: string
  /** Current step / total steps indicator */
  progress?: { current: number; total: number }
  /** Timer duration in seconds */
  duration: number
  /** Called when timer expires */
  onTimerComplete: () => void
  /** Whether the spot activity is complete */
  isComplete: boolean
  /** Completion screen config */
  completionEmoji?: string
  completionTitle?: string
  completionMessage?: string
  completionDetail?: string
  /** Theme color for accent elements */
  theme?: 'primary' | 'secondary' | 'accent' | 'purple'
  /** Gradient classes for background */
  gradient?: string
  /** Presenter mode — large screen projector layout */
  isPresenter?: boolean
  /** Presenter mode content */
  presenterContent?: ReactNode
  /** Main content */
  children: ReactNode
}

const themeColors: Record<string, { bg: string; text: string; light: string }> = {
  primary: { bg: 'bg-primary-500', text: 'text-primary-600', light: 'bg-primary-50' },
  secondary: { bg: 'bg-secondary-500', text: 'text-secondary-600', light: 'bg-secondary-50' },
  accent: { bg: 'bg-accent-500', text: 'text-accent-600', light: 'bg-accent-50' },
  purple: { bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50' },
}

const defaultGradients: Record<string, string> = {
  primary: 'from-primary-50 via-white to-secondary-50',
  secondary: 'from-secondary-50 via-white to-primary-50',
  accent: 'from-accent-50 via-white to-secondary-50',
  purple: 'from-violet-50 via-white to-accent-50',
}

const presenterGradients: Record<string, string> = {
  primary: 'from-surface-dark via-slate-900 to-surface-dark',
  secondary: 'from-surface-dark via-slate-900 to-surface-dark',
  accent: 'from-surface-dark via-slate-900 to-surface-dark',
  purple: 'from-surface-dark via-slate-900 to-surface-dark',
}

const SpotLayout: React.FC<SpotLayoutProps> = ({
  title,
  subtitle,
  progress,
  duration,
  onTimerComplete,
  isComplete,
  completionEmoji = '🎉',
  completionTitle = '완료!',
  completionMessage = '활동을 완료했습니다!',
  completionDetail,
  theme = 'primary',
  gradient,
  isPresenter = false,
  presenterContent,
  children,
}) => {
  const colors = themeColors[theme]

  // ─── Presenter Mode ───
  if (isPresenter && presenterContent) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${presenterGradients[theme]} p-8 lg:p-12`}>
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl lg:text-5xl font-bold text-white tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                className="text-lg lg:text-xl text-slate-400 mt-2 font-medium tracking-wide uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Presenter Content */}
          <div className="flex-1 min-h-0">
            {presenterContent}
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 flex items-center justify-between text-slate-400">
            {progress && (
              <div className="flex items-center gap-2">
                {Array.from({ length: progress.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= progress.current - 1
                        ? `${colors.bg} w-8`
                        : 'bg-slate-700 w-4'
                    }`}
                  />
                ))}
              </div>
            )}
            <p className="text-sm font-medium">FLOW SPOT</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Participant Mode ───
  const bgGradient = gradient || defaultGradients[theme]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 sm:p-6 lg:p-8`}>
      <ConfettiEffect isActive={isComplete} duration={2500} intensity="intense" />

      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="complete"
            className="flex items-center justify-center min-h-[80vh]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card variant="elevated" className="text-center max-w-sm w-full shadow-xl">
              <motion.div
                className="text-6xl mb-5"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                {completionEmoji}
              </motion.div>
              <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>
                {completionTitle}
              </h2>
              <p className="text-slate-500 mb-5 text-sm leading-relaxed">
                {completionMessage}
              </p>
              {completionDetail && (
                <div className={`${colors.light} rounded-xl p-3.5`}>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {completionDetail}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {subtitle}
                  </p>
                )}
              </div>
              {progress && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {progress.current}
                  </span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-xs text-slate-400">{progress.total}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {progress && (
              <div className="h-1 bg-slate-200 rounded-full mb-5 overflow-hidden">
                <motion.div
                  className={`h-full ${colors.bg} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}

            {/* Content */}
            {children}

            {/* Timer */}
            <div className="flex justify-center mt-6">
              <CountdownTimer
                duration={duration}
                onComplete={onTimerComplete}
                size="sm"
                variant="warning"
                label="남은 시간"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpotLayout
