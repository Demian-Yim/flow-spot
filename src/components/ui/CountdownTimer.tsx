'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '@/hooks/useSound'

interface CountdownTimerProps {
  duration: number
  onComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'warning' | 'critical'
  showLabel?: boolean
  label?: string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  onComplete,
  size = 'md',
  variant = 'default',
  showLabel = true,
  label = '남은 시간',
}) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isComplete, setIsComplete] = useState(false)
  const { playSound } = useSound()

  const sizeStyles = {
    sm: 'text-2xl w-20 h-20',
    md: 'text-4xl w-32 h-32',
    lg: 'text-6xl w-48 h-48',
  }

  const getTextColor = () => {
    const ratio = timeLeft / duration
    if (variant === 'critical' || (variant === 'warning' && ratio <= 0.1)) {
      return 'text-red-500'
    }
    if (variant === 'warning' && ratio <= 0.3) {
      return 'text-amber-500'
    }
    return 'text-primary-500'
  }

  const getStrokeColor = () => {
    const ratio = timeLeft / duration
    if (variant === 'critical' || (variant === 'warning' && ratio <= 0.1)) {
      return '#EF4444'
    }
    if (variant === 'warning' && ratio <= 0.3) {
      return '#F59E0B'
    }
    return '#FF8C6B'
  }

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsComplete(true)
      playSound('end')
      onComplete?.()
      return
    }

    if (timeLeft <= 5 && timeLeft % 1 === 0) {
      playSound('notification')
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete, playSound])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (timeLeft / duration) * circumference

  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return `${m}:${String(s).padStart(2, '0')}`
    }
    return String(Math.ceil(seconds))
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {showLabel && (
        <p className="text-sm font-semibold text-slate-500 mb-2">{label}</p>
      )}

      <motion.div
        className={`relative flex items-center justify-center ${sizeStyles[size]} rounded-full`}
        animate={{ scale: isComplete ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.5, repeat: isComplete ? 2 : 0 }}
      >
        <svg className="absolute transform -rotate-90" width="100%" height="100%">
          <circle
            cx="50%"
            cy="50%"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45"
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>

        <div className={`text-center font-bold ${getTextColor()}`}>
          <motion.div
            animate={{
              scale: timeLeft <= 5 && !isComplete ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: timeLeft <= 5 && !isComplete ? Infinity : 0,
            }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">초</p>
        </div>
      </motion.div>

      {isComplete && (
        <motion.p
          className="mt-4 text-base font-bold text-accent-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          시간 종료!
        </motion.p>
      )}
    </div>
  )
}

export default CountdownTimer
