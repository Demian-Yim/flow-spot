'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: string
  left: number
  delay: number
  duration: number
  angle: number
  color: string
}

interface ConfettiEffectProps {
  isActive: boolean
  duration?: number
  colors?: string[]
  intensity?: 'light' | 'medium' | 'intense'
}

const intensityMap = {
  light: 15,
  medium: 30,
  intense: 50,
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  isActive,
  duration = 2000,
  colors = ['#FF8C6B', '#7EC8E3', '#A8D5BA', '#C3A6D8', '#FFD966'],
  intensity = 'medium',
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [targetY, setTargetY] = useState(800)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTargetY(window.innerHeight + 20)
      const handleResize = () => setTargetY(window.innerHeight + 20)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!isActive) {
      setPieces([])
      return
    }

    const confettiPieces: ConfettiPiece[] = Array.from(
      { length: intensityMap[intensity] },
      (_, i) => ({
        id: `confetti-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1.5,
        angle: Math.random() * 360,
        color: colors[i % colors.length],
      })
    )

    setPieces(confettiPieces)

    const timer = setTimeout(() => setPieces([]), duration)
    return () => clearTimeout(timer)
  }, [isActive, duration, intensity, colors])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
          }}
          initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
          animate={{
            opacity: 0,
            y: targetY,
            x: Math.sin((piece.angle * Math.PI) / 180) * 100,
            rotate: 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

export default ConfettiEffect
