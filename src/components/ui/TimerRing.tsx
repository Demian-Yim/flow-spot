'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TimerRingProps {
  /** Countdown duration in seconds */
  seconds: number
  /** Fired exactly once when the countdown reaches zero */
  onComplete?: () => void
  /** Pixel size of the ring (default 240) */
  size?: number
  /** Optional label shown above the digits */
  label?: string
  /** Tailwind text color class for the stroke + digits */
  accentClass?: string
  /** Pause the timer */
  paused?: boolean
}

/**
 * Animated circular countdown built with SVG stroke-dasharray.
 * Lightweight (no external libs beyond framer-motion).
 */
const TimerRing: React.FC<TimerRingProps> = ({
  seconds,
  onComplete,
  size = 240,
  label,
  accentClass = 'text-orange-400',
  paused = false,
}) => {
  const [remaining, setRemaining] = useState(seconds)
  const firedRef = useRef(false)
  const startedAtRef = useRef<number | null>(null)

  // Reset on seconds change
  useEffect(() => {
    setRemaining(seconds)
    firedRef.current = false
    startedAtRef.current = Date.now()
  }, [seconds])

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id)
          if (!firedRef.current) {
            firedRef.current = true
            onComplete?.()
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused, onComplete])

  const stroke = Math.max(4, Math.round(size / 32))
  const radius = size / 2 - stroke * 2
  const circumference = 2 * Math.PI * radius
  const progress = seconds > 0 ? remaining / seconds : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={accentClass}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span
            className="font-semibold uppercase tracking-widest text-white/60"
            style={{ fontSize: Math.max(10, size / 24) }}
          >
            {label}
          </span>
        )}
        <span
          className={`font-black tabular-nums ${accentClass}`}
          style={{ fontSize: Math.max(28, size / 3.2), lineHeight: 1 }}
        >
          {remaining}
        </span>
      </div>
    </div>
  )
}

export default TimerRing
