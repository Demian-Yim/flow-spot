'use client'

import React, { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { useSound } from '@/hooks/useSound'

interface RuleRitualProps {
  /** Seconds per rule */
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
}

interface Rule {
  key: string
  emoji: string
  label: string
  motion: 'flip' | 'raise' | 'listen' | 'calm' | 'clock'
}

const RULES: Rule[] = [
  { key: 'phone', emoji: '📱', label: '휴대폰 뒤집기', motion: 'flip' },
  { key: 'hand', emoji: '🙋', label: '발언 시 손 들기', motion: 'raise' },
  { key: 'listen', emoji: '👂', label: '끝까지 듣기', motion: 'listen' },
  { key: 'nice', emoji: '😊', label: '비난 금지', motion: 'calm' },
  { key: 'time', emoji: '🎯', label: '시간 엄수', motion: 'clock' },
]

const motionVariants = {
  flip: { rotateX: [0, 180, 180, 180], transition: { duration: 3, repeat: Infinity } },
  raise: { y: [0, -40, 0], transition: { duration: 1.5, repeat: Infinity } },
  listen: { rotate: [-8, 8, -8], transition: { duration: 2, repeat: Infinity } },
  calm: { scale: [1, 1.1, 1], transition: { duration: 2.5, repeat: Infinity } },
  clock: { rotate: [0, 360], transition: { duration: 4, repeat: Infinity, ease: 'linear' as const } },
}

const RuleRitual: React.FC<RuleRitualProps> = ({
  duration = 10,
  onComplete,
  isPresenter = false,
}) => {
  const [idx, setIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [agreeCounts, setAgreeCounts] = useState<Record<string, number>>({})
  const { playSound } = useSound()

  const rule = RULES[idx]

  const handlePhaseEnd = useCallback(() => {
    if (idx < RULES.length - 1) {
      playSound('notification')
      setIdx((i) => i + 1)
    } else {
      playSound('success')
      setIsComplete(true)
      onComplete?.({ agreed: agreeCounts })
    }
  }, [idx, playSound, onComplete, agreeCounts])

  const agree = () => {
    playSound('click')
    setAgreeCounts((c) => ({ ...c, [rule.key]: (c[rule.key] ?? 0) + 1 }))
  }

  if (isPresenter) {
    return (
      <SpotLayoutV2
        title="우리의 약속"
        subtitle={`RULE ${idx + 1} / ${RULES.length}`}
        isPresenter
        duration={duration}
        timerKey={`rule-${rule.key}`}
        onTimerComplete={handlePhaseEnd}
        isComplete={isComplete}
        completionTitle="우리의 약속 완성!"
        completionMessage="함께 지켜가요"
        theme="calm"
        presenterContent={
          <div className="flex flex-col items-center gap-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={rule.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="flex flex-col items-center gap-6"
              >
                <motion.div
                  className="text-[14rem] leading-none"
                  animate={motionVariants[rule.motion]}
                >
                  {rule.emoji}
                </motion.div>
                <p className="text-7xl font-black text-cyan-200">{rule.label}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-3 text-3xl text-white/80">
              <span>👍</span>
              <span className="font-black tabular-nums">{agreeCounts[rule.key] ?? 0}</span>
              <span className="text-lg uppercase tracking-widest text-white/50">동의</span>
            </div>
            <div className="flex gap-2">
              {RULES.map((r, i) => (
                <div
                  key={r.key}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? 'bg-cyan-300 w-16' : i < idx ? 'bg-white/60 w-8' : 'bg-white/20 w-8'
                  }`}
                />
              ))}
            </div>
          </div>
        }
      />
    )
  }

  return (
    <SpotLayoutV2
      title="우리의 약속"
      subtitle={rule.label}
      duration={duration}
      timerKey={`rule-${rule.key}`}
      onTimerComplete={handlePhaseEnd}
      isComplete={isComplete}
      completionTitle="완성!"
      completionMessage="약속을 지켜요"
      theme="calm"
    >
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-9xl">{rule.emoji}</div>
        <p className="text-2xl font-bold text-slate-900 text-center">{rule.label}</p>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={agree}
          className="w-full py-8 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-3xl font-black shadow-xl"
        >
          👍 동의! ({agreeCounts[rule.key] ?? 0})
        </motion.button>
      </div>
    </SpotLayoutV2>
  )
}

export default RuleRitual
