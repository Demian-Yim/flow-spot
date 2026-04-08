'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { useSound } from '@/hooks/useSound'

interface GreetingCircleProps {
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
}

interface Phase {
  key: string
  title: string
  subtitle: string
  motion: 'bow' | 'wave' | 'spin'
}

const PHASES: Phase[] = [
  { key: 'pair', title: '짝과 인사', subtitle: 'GREET YOUR PARTNER', motion: 'bow' },
  { key: 'group', title: '4명 그룹 인사', subtitle: 'GROUP OF FOUR', motion: 'wave' },
  { key: 'all', title: '전체 인사 릴레이', subtitle: 'ALL TOGETHER', motion: 'spin' },
]

const motionVariants = {
  bow: { rotate: [0, 30, 0, 30, 0] },
  wave: { rotate: [-15, 15, -15, 15, 0], y: [0, -10, 0, -10, 0] },
  spin: { rotate: [0, 360] },
}

const GreetingCircle: React.FC<GreetingCircleProps> = ({
  duration = 60,
  onComplete,
  isPresenter = false,
}) => {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [greetCount, setGreetCount] = useState(0)
  const [hearts, setHearts] = useState(0)
  const { playSound } = useSound()

  const phase = PHASES[phaseIdx]

  const handlePhaseEnd = useCallback(() => {
    if (phaseIdx < PHASES.length - 1) {
      playSound('notification')
      setPhaseIdx((i) => i + 1)
    } else {
      playSound('success')
      setIsComplete(true)
      onComplete?.({ greetCount, hearts })
    }
  }, [phaseIdx, playSound, onComplete, greetCount, hearts])

  // ─── Projector ───
  if (isPresenter) {
    return (
      <SpotLayoutV2
        title={phase.title}
        subtitle={phase.subtitle}
        isPresenter
        duration={duration}
        timerKey={phase.key}
        onTimerComplete={handlePhaseEnd}
        isComplete={isComplete}
        completionTitle="인사 완료!"
        completionMessage="서로 반갑게 만났습니다"
        theme="warm"
        presenterContent={
          <div className="flex flex-col items-center gap-8">
            <motion.div
              key={phase.key}
              className="w-[340px] h-[340px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[12rem] shadow-2xl"
              animate={motionVariants[phase.motion]}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              😊
            </motion.div>
            <div className="flex gap-3">
              {PHASES.map((p, i) => (
                <div
                  key={p.key}
                  className={`h-2 rounded-full transition-all ${
                    i === phaseIdx ? 'bg-amber-300 w-16' : i < phaseIdx ? 'bg-white/60 w-8' : 'bg-white/20 w-8'
                  }`}
                />
              ))}
            </div>
          </div>
        }
      />
    )
  }

  // ─── Participant phone ───
  return (
    <SpotLayoutV2
      title={phase.title}
      subtitle={phase.subtitle}
      duration={duration}
      timerKey={phase.key}
      onTimerComplete={handlePhaseEnd}
      isComplete={isComplete}
      completionTitle="인사 완료!"
      completionMessage={`총 ${greetCount}회 인사, ❤️ ${hearts}`}
      theme="warm"
    >
      <div className="flex flex-col items-center gap-6 pt-4">
        <motion.button
          onClick={() => {
            playSound('click')
            setGreetCount((c) => c + 1)
          }}
          whileTap={{ scale: 0.94 }}
          className="w-full py-8 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-3xl font-black shadow-xl active:shadow-md"
        >
          인사했어요! ({greetCount})
        </motion.button>
        <motion.button
          onClick={() => {
            playSound('success')
            setHearts((h) => h + 1)
          }}
          whileTap={{ scale: 0.94 }}
          className="w-full py-5 rounded-2xl bg-pink-50 border-2 border-pink-200 text-pink-600 text-xl font-bold"
        >
          ❤️ 방금 만난 사람 좋았어요 ({hearts})
        </motion.button>
      </div>
    </SpotLayoutV2>
  )
}

export default GreetingCircle
