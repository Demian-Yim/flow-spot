'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { useSound } from '@/hooks/useSound'

interface CafeBreakProps {
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
  participants?: string[]
}

interface MenuItem {
  key: string
  name: string
  emoji: string
}

const MENU: MenuItem[] = [
  { key: 'americano', name: '아메리카노', emoji: '☕' },
  { key: 'latte', name: '라떼', emoji: '🥛' },
  { key: 'coldbrew', name: '콜드브루', emoji: '🧊' },
  { key: 'greentea', name: '녹차', emoji: '🍵' },
  { key: 'blacktea', name: '홍차', emoji: '🫖' },
  { key: 'hotchoco', name: '핫초코', emoji: '🍫' },
  { key: 'icetea', name: '아이스티', emoji: '🥤' },
  { key: 'milk', name: '우유', emoji: '🥛' },
]

const DEMO_NAMES = ['김철수', '이영희', '박민수', '최지은', '정현우', '한소연']

const CafeBreak: React.FC<CafeBreakProps> = ({
  duration = 60,
  onComplete,
  isPresenter = false,
  participants,
}) => {
  const names = participants && participants.length > 0 ? participants : DEMO_NAMES
  const [tally, setTally] = useState<Record<string, number>>({})
  const [mySelection, setMySelection] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [spotlight, setSpotlight] = useState<string | null>(null)
  const { playSound, playCelebrateSound } = useSound()

  useEffect(() => {
    const t = setInterval(() => setCarouselIdx((i) => (i + 1) % MENU.length), 2500)
    return () => clearInterval(t)
  }, [])

  const handleEnd = useCallback(() => {
    const picked = names[Math.floor(Math.random() * names.length)]
    setSpotlight(picked)
    playCelebrateSound()
    setTimeout(() => {
      setIsComplete(true)
      onComplete?.({ tally, buyer: picked })
    }, 2500)
  }, [names, playCelebrateSound, tally, onComplete])

  const select = (key: string) => {
    if (mySelection) return
    playSound('success')
    setMySelection(key)
    setTally((t) => ({ ...t, [key]: (t[key] ?? 0) + 1 }))
  }

  const topTally = [...MENU]
    .map((m) => ({ ...m, count: tally[m.key] ?? 0 }))
    .sort((a, b) => b.count - a.count)

  if (isPresenter) {
    return (
      <SpotLayoutV2
        title="☕ 카페 타임"
        subtitle="CAFE BREAK"
        isPresenter
        duration={duration}
        onTimerComplete={handleEnd}
        isComplete={isComplete}
        completionTitle={spotlight ? `구매 담당: ${spotlight}` : '카페 타임 끝!'}
        completionMessage="잠시 쉬었다 가요"
        theme="warm"
        presenterContent={
          <div className="flex flex-col items-center gap-10 w-full">
            {/* Hero carousel */}
            <div className="h-64 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIdx}
                  initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-[12rem] leading-none">{MENU[carouselIdx].emoji}</p>
                  <p className="text-4xl mt-2 text-amber-200">{MENU[carouselIdx].name}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Spotlight */}
            {spotlight && (
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <p className="text-3xl text-amber-300/80 uppercase tracking-widest">구매 담당</p>
                <p className="text-8xl font-black bg-gradient-to-br from-amber-300 to-pink-400 bg-clip-text text-transparent">
                  {spotlight}
                </p>
              </motion.div>
            )}
            {/* Live tally */}
            <div className="grid grid-cols-4 gap-4 w-full max-w-4xl">
              {topTally.slice(0, 8).map((m) => (
                <div
                  key={m.key}
                  className="bg-white/5 border border-white/10 rounded-2xl px-3 py-4 text-center"
                >
                  <p className="text-4xl">{m.emoji}</p>
                  <p className="text-sm text-white/70 mt-1">{m.name}</p>
                  <p className="text-3xl font-black tabular-nums text-amber-300">{m.count}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />
    )
  }

  return (
    <SpotLayoutV2
      title="카페 타임"
      subtitle={mySelection ? '선택 완료' : '메뉴 선택'}
      duration={duration}
      onTimerComplete={handleEnd}
      isComplete={isComplete}
      completionTitle={spotlight ? `구매: ${spotlight}` : '완료!'}
      completionMessage="수고하셨습니다"
      theme="warm"
    >
      {mySelection ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-9xl">{MENU.find((m) => m.key === mySelection)?.emoji}</p>
          <p className="text-3xl font-black text-slate-900">
            {MENU.find((m) => m.key === mySelection)?.name}
          </p>
          <div className="px-6 py-2 rounded-full bg-amber-100 text-amber-700 text-lg font-bold">
            ✓ 선택 완료
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {MENU.map((m) => (
            <motion.button
              key={m.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => select(m.key)}
              className="aspect-square rounded-2xl bg-white border-2 border-slate-200 flex flex-col items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-5xl">{m.emoji}</span>
              <span className="text-sm font-bold text-slate-700">{m.name}</span>
            </motion.button>
          ))}
        </div>
      )}
    </SpotLayoutV2>
  )
}

export default CafeBreak
