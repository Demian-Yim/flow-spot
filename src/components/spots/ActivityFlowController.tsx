'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ActivityFlowControllerProps {
  /** Whether the child activity has signaled completion */
  isComplete: boolean
  /** Fired after the pre-roll countdown finishes. The session page uses this
   *  to actually advance to the next spot. */
  onAutoAdvance?: () => void
  /** Seconds for the "다음 활동" pre-roll overlay (default 10) */
  preRollSeconds?: number
  /** Pure UI wrapper — child activity renders here */
  children: ReactNode
  /** Optional label for the next activity shown in pre-roll */
  nextActivityLabel?: string
}

/**
 * Wraps a SpotLayout child. When `isComplete` flips true, a big fullscreen
 * pre-roll overlay counts down and then calls `onAutoAdvance`. Pure UI — the
 * actual advance logic stays in the session page.
 */
const ActivityFlowController: React.FC<ActivityFlowControllerProps> = ({
  isComplete,
  onAutoAdvance,
  preRollSeconds = 10,
  children,
  nextActivityLabel,
}) => {
  const [preRoll, setPreRoll] = useState<number | null>(null)

  useEffect(() => {
    if (!isComplete) {
      setPreRoll(null)
      return
    }
    setPreRoll(preRollSeconds)
    const id = window.setInterval(() => {
      setPreRoll((r) => {
        if (r === null) return r
        if (r <= 1) {
          window.clearInterval(id)
          onAutoAdvance?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isComplete, preRollSeconds, onAutoAdvance])

  return (
    <div className="relative w-full h-full">
      {children}
      <AnimatePresence>
        {preRoll !== null && preRoll > 0 && (
          <motion.div
            key="preroll"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-white/60 text-2xl font-semibold uppercase tracking-widest mb-6">
              다음 활동
            </p>
            {nextActivityLabel && (
              <p className="text-white text-5xl font-bold mb-12">{nextActivityLabel}</p>
            )}
            <motion.p
              key={preRoll}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              className="text-white text-[12rem] font-black leading-none tabular-nums"
            >
              {preRoll}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ActivityFlowController
