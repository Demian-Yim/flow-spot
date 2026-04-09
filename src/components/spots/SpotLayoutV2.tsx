'use client'

import React, { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TimerRing from '@/components/ui/TimerRing'
import ConfettiEffect from '@/components/ui/ConfettiEffect'

export type SpotTheme = 'energy' | 'calm' | 'warm'

interface SpotLayoutV2Props {
  title: string
  subtitle?: string
  /** Projector vs participant phone */
  isPresenter?: boolean
  /** Activity timer in seconds (single current phase) */
  duration: number
  onTimerComplete: () => void
  /** Optional key that, when changed, resets the TimerRing. */
  timerKey?: string | number
  isComplete: boolean
  completionTitle?: string
  completionMessage?: string
  theme?: SpotTheme
  /** Projector-mode center content (animated demo, big visuals) */
  presenterContent?: ReactNode
  /** Participant phone content (minimal) */
  children?: ReactNode
}

const themeAccent: Record<SpotTheme, { accent: string; gradient: string }> = {
  energy: {
    accent: 'text-orange-400',
    gradient:
      'radial-gradient(ellipse at top, rgba(249,115,22,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(239,68,68,0.15), transparent 55%)',
  },
  calm: {
    accent: 'text-cyan-300',
    gradient:
      'radial-gradient(ellipse at top, rgba(6,182,212,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(59,130,246,0.15), transparent 55%)',
  },
  warm: {
    accent: 'text-amber-300',
    gradient:
      'radial-gradient(ellipse at top, rgba(251,191,36,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(244,114,182,0.15), transparent 55%)',
  },
}

const SpotLayoutV2: React.FC<SpotLayoutV2Props> = ({
  title,
  subtitle,
  isPresenter = false,
  duration,
  onTimerComplete,
  timerKey,
  isComplete,
  completionTitle = '완료!',
  completionMessage = '수고하셨습니다',
  theme = 'energy',
  presenterContent,
  children,
}) => {
  const t = themeAccent[theme]

  // ─── Projector mode (cinematic) ───
  if (isPresenter) {
    return (
      <div className="relative w-full min-h-screen bg-black overflow-hidden text-white">
        <ConfettiEffect isActive={isComplete} duration={3000} intensity="intense" />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: t.gradient }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="done"
              className="relative z-10 flex flex-col items-center justify-center min-h-screen px-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.p
                className={`text-[10rem] font-black tracking-tight ${t.accent}`}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {completionTitle}
              </motion.p>
              <p className="text-4xl text-white/80 mt-6">{completionMessage}</p>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              className="relative z-10 flex flex-col min-h-screen px-12 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Top bar: title + subtitle */}
              <div className="flex items-start justify-between gap-8">
                <div>
                  <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-4 text-2xl uppercase tracking-[0.3em] text-white/50">
                      {subtitle}
                    </p>
                  )}
                </div>
                <TimerRing
                  key={timerKey}
                  seconds={duration}
                  onComplete={onTimerComplete}
                  size={280}
                  accentClass={t.accent}
                />
              </div>
              {/* Center content */}
              <div className="flex-1 flex items-center justify-center py-12">
                {presenterContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ─── Participant phone mode ───
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ConfettiEffect isActive={isComplete} duration={2000} intensity="medium" />
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="done"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 break-keep">{completionTitle}</p>
            <p className="text-base sm:text-lg text-slate-500 mt-3 break-keep">{completionMessage}</p>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between px-5 pt-6">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 truncate">{title}</h2>
                {subtitle && (
                  <p className="text-xs uppercase tracking-widest text-slate-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="text-slate-900">
                <TimerRing
                  key={timerKey}
                  seconds={duration}
                  onComplete={onTimerComplete}
                  size={96}
                  accentClass="text-orange-500"
                />
              </div>
            </div>
            <div className="flex-1 p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpotLayoutV2
