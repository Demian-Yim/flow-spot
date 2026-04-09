'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { useSound } from '@/hooks/useSound'

interface IntroRelayProps {
  /** Seconds per person (default 30) */
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
  participants?: string[]
}

const DEMO_NAMES = ['김철수', '이영희', '박민수', '최지은', '정현우', '한소연']
const PROMPTS = [
  '좋아하는 음식은?',
  '최근 감동받은 것은?',
  '주말에 주로 뭐해요?',
  '요즘 빠져있는 것은?',
  '오늘 기분을 한 단어로?',
]

interface FloatEmoji {
  id: number
  emoji: string
  x: number
}

const IntroRelay: React.FC<IntroRelayProps> = ({
  duration = 30,
  onComplete,
  isPresenter = false,
  participants,
}) => {
  const names = participants && participants.length > 0 ? participants : DEMO_NAMES
  const [idx, setIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const [floats, setFloats] = useState<FloatEmoji[]>([])
  const [queued, setQueued] = useState(false)
  const { playSound } = useSound()

  const current = names[idx]

  // rotate prompt every ~6s
  useEffect(() => {
    const t = setInterval(() => setPromptIdx((p) => (p + 1) % PROMPTS.length), 6000)
    return () => clearInterval(t)
  }, [])

  const handlePhaseEnd = useCallback(() => {
    if (idx < names.length - 1) {
      playSound('notification')
      setIdx((i) => i + 1)
      setQueued(false)
    } else {
      playSound('success')
      setIsComplete(true)
      onComplete?.({ count: names.length })
    }
  }, [idx, names.length, playSound, onComplete])

  const emitFloat = (emoji: string) => {
    const id = Date.now() + Math.random()
    const x = Math.random() * 80 + 10
    setFloats((f) => [...f, { id, emoji, x }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 2000)
  }

  if (isPresenter) {
    return (
      <SpotLayoutV2
        title="자기소개 릴레이"
        subtitle={`${idx + 1} / ${names.length}`}
        isPresenter
        duration={duration}
        timerKey={`intro-${idx}`}
        onTimerComplete={handlePhaseEnd}
        isComplete={isComplete}
        completionTitle="소개 완료!"
        completionMessage="서로를 알게 되었습니다"
        theme="warm"
        presenterContent={
          <div className="relative flex flex-col items-center gap-10 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-3xl text-amber-300/80 mb-4 tracking-widest uppercase">
                  NOW SPEAKING
                </p>
                <p className="text-[11rem] font-black leading-none bg-gradient-to-br from-amber-300 to-orange-500 bg-clip-text text-transparent">
                  {current}
                </p>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={promptIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-4xl text-white/80"
              >
                “{PROMPTS[promptIdx]}”
              </motion.p>
            </AnimatePresence>
            {/* floating reactions */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {floats.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ y: 200, opacity: 0, scale: 0.5 }}
                  animate={{ y: -200, opacity: 1, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute bottom-0 text-6xl"
                  style={{ left: `${f.x}%` }}
                >
                  {f.emoji}
                </motion.div>
              ))}
            </div>
          </div>
        }
      />
    )
  }

  return (
    <SpotLayoutV2
      title="자기소개 릴레이"
      subtitle={`${current} 차례`}
      duration={duration}
      timerKey={`intro-${idx}`}
      onTimerComplete={handlePhaseEnd}
      isComplete={isComplete}
      completionTitle="소개 완료!"
      completionMessage="수고하셨습니다"
      theme="warm"
    >
      <div className="flex flex-col gap-5 pt-2">
        <motion.button
          onClick={() => {
            playSound('start')
            setQueued(true)
          }}
          whileTap={{ scale: 0.96 }}
          disabled={queued}
          className={`w-full py-7 rounded-3xl text-2xl font-black shadow-xl transition-all ${
            queued
              ? 'bg-amber-100 text-amber-600'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
          }`}
        >
          {queued ? '✋ 대기 중...' : '🙋 내 차례 표시'}
        </motion.button>
        <p className="text-center text-sm text-slate-500">다른 사람 차례엔 반응을 남겨주세요</p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSound('click')
              emitFloat('❤️')
            }}
            className="py-8 rounded-2xl bg-pink-50 border-2 border-pink-200 text-5xl"
          >
            ❤️
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSound('click')
              emitFloat('👏')
            }}
            className="py-8 rounded-2xl bg-amber-50 border-2 border-amber-200 text-5xl"
          >
            👏
          </motion.button>
        </div>
      </div>
    </SpotLayoutV2>
  )
}

export default IntroRelay
