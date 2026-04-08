'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { STRETCH_FIGURES, StretchKey } from '@/components/spots/stretch-figures'
import { useSound } from '@/hooks/useSound'

interface MirrorStretchProps {
  /** Seconds per stretch set (default 30) */
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
}

interface StretchSet {
  key: StretchKey
  title: string
  subtitle: string
}

const SETS: StretchSet[] = [
  { key: 'neck', title: '목 스트레칭', subtitle: 'NECK' },
  { key: 'shoulder', title: '어깨 스트레칭', subtitle: 'SHOULDER' },
  { key: 'waist', title: '허리 스트레칭', subtitle: 'WAIST' },
  { key: 'wrist', title: '손목 스트레칭', subtitle: 'WRIST' },
  { key: 'eye', title: '눈 스트레칭', subtitle: 'EYE' },
  { key: 'fullbody', title: '전신 스트레칭', subtitle: 'FULL BODY' },
]

const MirrorStretch: React.FC<MirrorStretchProps> = ({
  duration = 30,
  onComplete,
  isPresenter = false,
}) => {
  const [idx, setIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [following, setFollowing] = useState(true)
  const { playSound } = useSound()

  const current = SETS[idx]
  const Figure = STRETCH_FIGURES[current.key]

  const advance = useCallback(() => {
    if (idx < SETS.length - 1) {
      playSound('notification')
      setIdx((i) => i + 1)
    } else {
      playSound('success')
      setIsComplete(true)
      onComplete?.({ completed: SETS.length })
    }
  }, [idx, onComplete, playSound])

  if (isPresenter) {
    return (
      <SpotLayoutV2
        title={current.title}
        subtitle={current.subtitle}
        isPresenter
        duration={duration}
        timerKey={current.key}
        onTimerComplete={advance}
        isComplete={isComplete}
        completionTitle="스트레칭 완료!"
        completionMessage="몸이 한결 가벼워졌습니다"
        theme="energy"
        presenterContent={
          <div className="flex flex-col items-center gap-10">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="drop-shadow-2xl"
            >
              <Figure size={420} />
            </motion.div>
            <div className="flex gap-3">
              {SETS.map((s, i) => (
                <div
                  key={s.key}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < idx ? 'bg-orange-400' : i === idx ? 'bg-orange-400 scale-150' : 'bg-white/20'
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
      title={current.title}
      subtitle={`${idx + 1} / ${SETS.length}`}
      duration={duration}
      timerKey={current.key}
      onTimerComplete={advance}
      isComplete={isComplete}
      completionTitle="완료!"
      completionMessage={`${SETS.length}가지 스트레칭 수고하셨습니다`}
      theme="energy"
    >
      <div className="flex flex-col items-center gap-8 pt-4">
        <div className="bg-slate-900 rounded-3xl p-6">
          <Figure size={220} />
        </div>
        <motion.button
          onClick={() => {
            playSound('click')
            setFollowing((f) => !f)
          }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-6 rounded-3xl text-2xl font-black shadow-lg transition-colors ${
            following
              ? 'bg-orange-500 text-white'
              : 'bg-white border-2 border-slate-200 text-slate-500'
          }`}
        >
          {following ? '따라하는 중 ✓' : '따라하기 시작'}
        </motion.button>
      </div>
    </SpotLayoutV2>
  )
}

export default MirrorStretch
