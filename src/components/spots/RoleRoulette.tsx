'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { useSound } from '@/hooks/useSound'

interface RoleRouletteProps {
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
  participants?: string[]
}

const DEMO_NAMES = ['김철수', '이영희', '박민수', '최지은', '정현우', '한소연']

interface Role {
  key: string
  label: string
  emoji: string
}

const ROLES: Role[] = [
  { key: 'leader', label: '리더', emoji: '👑' },
  { key: 'scribe', label: '기록자', emoji: '📝' },
  { key: 'presenter', label: '발표자', emoji: '🎤' },
  { key: 'timer', label: '시간관리자', emoji: '⏰' },
]

const SPIN_MS = 2000
const REVEAL_MS = 2500
const PER_ROLE = (SPIN_MS + REVEAL_MS) / 1000

const RoleRoulette: React.FC<RoleRouletteProps> = ({
  duration,
  onComplete,
  isPresenter = false,
  participants,
}) => {
  const names = participants && participants.length > 0 ? participants : DEMO_NAMES
  const [roleIdx, setRoleIdx] = useState(0)
  const [phase, setPhase] = useState<'spin' | 'reveal'>('spin')
  const [spinName, setSpinName] = useState(names[0])
  const [landed, setLanded] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const role = ROLES[roleIdx]
  const totalDuration = duration ?? Math.ceil(PER_ROLE * ROLES.length)

  // reel animation
  useEffect(() => {
    if (isComplete || phase !== 'spin') return
    const interval = setInterval(() => {
      setSpinName(names[Math.floor(Math.random() * names.length)])
    }, 80)
    const spinTimer = setTimeout(() => {
      clearInterval(interval)
      // pick a name not yet landed if possible
      const available = names.filter((n) => !landed.includes(n))
      const pick = (available.length > 0 ? available : names)[
        Math.floor(Math.random() * (available.length > 0 ? available.length : names.length))
      ]
      setSpinName(pick)
      setLanded((l) => [...l, pick])
      setPhase('reveal')
      playCelebrateSound()
    }, SPIN_MS)
    return () => {
      clearInterval(interval)
      clearTimeout(spinTimer)
    }
  }, [phase, roleIdx, names, landed, playCelebrateSound, isComplete])

  // reveal -> next role
  useEffect(() => {
    if (phase !== 'reveal' || isComplete) return
    const t = setTimeout(() => {
      if (roleIdx < ROLES.length - 1) {
        setRoleIdx((i) => i + 1)
        setPhase('spin')
        playSound('notification')
      } else {
        setIsComplete(true)
        onComplete?.({ assignments: landed })
      }
    }, REVEAL_MS)
    return () => clearTimeout(t)
  }, [phase, roleIdx, landed, onComplete, playSound, isComplete])

  const handleTimerEnd = useCallback(() => {
    setIsComplete(true)
    onComplete?.({ assignments: landed })
  }, [landed, onComplete])

  if (isPresenter) {
    return (
      <SpotLayoutV2
        title="역할 룰렛"
        subtitle={`${roleIdx + 1} / ${ROLES.length}`}
        isPresenter
        duration={totalDuration}
        onTimerComplete={handleTimerEnd}
        isComplete={isComplete}
        completionTitle="역할 확정!"
        completionMessage="각자 역할을 확인하세요"
        theme="energy"
        presenterContent={
          <div className="flex flex-col items-center gap-10">
            <div className="text-center">
              <p className="text-3xl uppercase tracking-[0.3em] text-orange-300/80 mb-3">
                NOW PICKING
              </p>
              <p className="text-8xl font-black">
                <span className="mr-4">{role.emoji}</span>
                {role.label}
              </p>
            </div>
            <div className="h-[16rem] w-[36rem] rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border-4 border-orange-400/30 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {phase === 'spin' ? (
                  <motion.p
                    key={`spin-${spinName}`}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.08 }}
                    className="text-8xl font-black text-white/70"
                  >
                    {spinName}
                  </motion.p>
                ) : (
                  <motion.p
                    key={`land-${spinName}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.5, 1.3, 1], opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-[9rem] font-black bg-gradient-to-br from-amber-300 to-orange-500 bg-clip-text text-transparent"
                  >
                    {spinName}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-6">
              {ROLES.map((r, i) => (
                <div
                  key={r.key}
                  className={`flex flex-col items-center gap-1 ${
                    i < landed.length ? 'opacity-100' : i === roleIdx ? 'opacity-80' : 'opacity-30'
                  }`}
                >
                  <span className="text-4xl">{r.emoji}</span>
                  <span className="text-sm uppercase">{r.label}</span>
                  <span className="text-xs text-white/60">{landed[i] ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        }
      />
    )
  }

  // Participant phone: show their assigned role card if their name landed
  const myAssigned = ROLES.map((r, i) => ({ role: r, name: landed[i] })).filter((x) => !!x.name)
  const latest = myAssigned[myAssigned.length - 1]

  return (
    <SpotLayoutV2
      title="역할 룰렛"
      subtitle={role.label}
      duration={totalDuration}
      onTimerComplete={handleTimerEnd}
      isComplete={isComplete}
      completionTitle="역할 확정!"
      completionMessage="역할을 기억하세요"
      theme="energy"
    >
      <div className="flex flex-col items-center justify-center h-full gap-6">
        {latest ? (
          <motion.div
            key={latest.name}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 text-white p-8 shadow-2xl text-center"
          >
            <p className="text-9xl mb-3">{latest.role.emoji}</p>
            <p className="text-2xl uppercase tracking-widest opacity-90">{latest.role.label}</p>
            <p className="text-5xl font-black mt-2">{latest.name}</p>
            <button
              onClick={() => playSound('success')}
              className="mt-6 px-8 py-3 rounded-full bg-white/20 backdrop-blur text-xl font-bold"
            >
              확인
            </button>
          </motion.div>
        ) : (
          <p className="text-xl text-slate-500">룰렛이 돌고 있어요...</p>
        )}
      </div>
    </SpotLayoutV2>
  )
}

export default RoleRoulette
