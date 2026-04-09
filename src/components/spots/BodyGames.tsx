'use client'

import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SpotLayoutV2 from '@/components/spots/SpotLayoutV2'
import { useSound } from '@/hooks/useSound'

interface BodyGamesProps {
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
}

type GameKey = 'clap' | 'ox' | 'rps'

interface Game {
  key: GameKey
  title: string
  subtitle: string
}

const GAMES: Game[] = [
  { key: 'clap', title: '박수 비트', subtitle: 'CLAP BEAT' },
  { key: 'ox', title: 'OX 체조', subtitle: 'OX POSE' },
  { key: 'rps', title: '가위바위보 토너먼트', subtitle: 'RPS TOURNAMENT' },
]

const SECONDS_PER_GAME = 120

// ─── GameFrame sub-component ───
const GameFrame: React.FC<{
  game: Game
  step: number
  totalSteps: number
  children: ReactNode
  isPresenter: boolean
}> = ({ game, step, totalSteps, children, isPresenter }) => {
  if (isPresenter) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="flex gap-3">
          {GAMES.map((g, i) => (
            <div
              key={g.key}
              className={`h-2 rounded-full transition-all ${
                g.key === game.key ? 'bg-orange-400 w-20' : 'bg-white/20 w-8'
              }`}
            />
          ))}
        </div>
        <p className="text-2xl uppercase tracking-[0.3em] text-orange-300/70">
          STEP {step} / {totalSteps}
        </p>
        {children}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        {game.subtitle} · {step}/{totalSteps}
      </p>
      {children}
    </div>
  )
}

// ─── Clap Beat ───
const BPM_STEPS = [80, 100, 120]

const ClapBeat: React.FC<{ isPresenter: boolean; game: Game }> = ({ isPresenter, game }) => {
  const [stepIdx, setStepIdx] = useState(0)
  const bpm = BPM_STEPS[stepIdx]
  const periodMs = 60000 / bpm
  const { playSound } = useSound()
  const [taps, setTaps] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => (i + 1) % BPM_STEPS.length)
    }, 15000)
    return () => clearInterval(t)
  }, [])

  if (isPresenter) {
    return (
      <GameFrame game={game} step={stepIdx + 1} totalSteps={BPM_STEPS.length} isPresenter>
        <motion.div
          className="w-[22rem] h-[22rem] rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_120px_rgba(249,115,22,0.6)]"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: periodMs / 1000, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="text-7xl font-black">{bpm} BPM</p>
      </GameFrame>
    )
  }
  return (
    <GameFrame game={game} step={stepIdx + 1} totalSteps={BPM_STEPS.length} isPresenter={false}>
      <motion.button
        onClick={() => {
          playSound('click')
          setTaps((t) => t + 1)
        }}
        whileTap={{ scale: 0.85 }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: periodMs / 1000, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full aspect-square rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white text-6xl font-black shadow-2xl"
      >
        👏
      </motion.button>
      <p className="text-center text-slate-500 text-sm">탭 횟수: {taps} · {bpm} BPM</p>
    </GameFrame>
  )
}

// ─── OX Pose ───
const OX_PROMPTS = [
  '아침형이다?',
  '커피보다 차를 좋아한다?',
  '주말에 집에 있는 걸 선호한다?',
  '여행 계획을 세우는 편이다?',
  '매운 음식을 잘 먹는다?',
  '운동을 꾸준히 한다?',
  '영화를 자주 본다?',
  'SNS를 자주 한다?',
]

const OXPose: React.FC<{ isPresenter: boolean; game: Game }> = ({ isPresenter, game }) => {
  const [idx, setIdx] = useState(0)
  const [counts, setCounts] = useState({ o: 0, x: 0 })
  const { playSound } = useSound()

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % OX_PROMPTS.length)
      setCounts({ o: 0, x: 0 })
    }, 10000)
    return () => clearInterval(t)
  }, [])

  if (isPresenter) {
    return (
      <GameFrame game={game} step={idx + 1} totalSteps={OX_PROMPTS.length} isPresenter>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="text-7xl font-black text-center max-w-5xl"
          >
            {OX_PROMPTS[idx]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-20 mt-4">
          <div className="text-center">
            <p className="text-9xl">⭕</p>
            <p className="text-5xl font-black mt-2">{counts.o}</p>
          </div>
          <div className="text-center">
            <p className="text-9xl">❌</p>
            <p className="text-5xl font-black mt-2">{counts.x}</p>
          </div>
        </div>
      </GameFrame>
    )
  }
  return (
    <GameFrame game={game} step={idx + 1} totalSteps={OX_PROMPTS.length} isPresenter={false}>
      <p className="text-xl font-bold text-slate-900 text-center min-h-[3rem]">
        {OX_PROMPTS[idx]}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playSound('success')
            setCounts((c) => ({ ...c, o: c.o + 1 }))
          }}
          className="aspect-square rounded-3xl bg-emerald-50 border-4 border-emerald-300 text-8xl"
        >
          ⭕
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playSound('error')
            setCounts((c) => ({ ...c, x: c.x + 1 }))
          }}
          className="aspect-square rounded-3xl bg-rose-50 border-4 border-rose-300 text-8xl"
        >
          ❌
        </motion.button>
      </div>
    </GameFrame>
  )
}

// ─── Rock Paper Scissors ───
type RPS = 'rock' | 'paper' | 'scissors'
const RPS_EMOJI: Record<RPS, string> = { rock: '✊', paper: '✋', scissors: '✌' }
const RPS_ROUNDS = 5

const RPSTournament: React.FC<{ isPresenter: boolean; game: Game }> = ({ isPresenter, game }) => {
  const [round, setRound] = useState(1)
  const [countdown, setCountdown] = useState(3)
  const [lastPick, setLastPick] = useState<RPS | null>(null)
  const [tally, setTally] = useState({ rock: 0, paper: 0, scissors: 0 })
  const { playSound } = useSound()

  useEffect(() => {
    if (round > RPS_ROUNDS) return
    setCountdown(3)
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t)
          setTimeout(() => setRound((r) => r + 1), 2000)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [round])

  const pick = (p: RPS) => {
    playSound('click')
    setLastPick(p)
    setTally((t) => ({ ...t, [p]: t[p] + 1 }))
  }

  if (isPresenter) {
    return (
      <GameFrame game={game} step={Math.min(round, RPS_ROUNDS)} totalSteps={RPS_ROUNDS} isPresenter>
        <motion.p
          key={`cd-${round}-${countdown}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          className="text-[14rem] font-black leading-none"
        >
          {countdown > 0 ? countdown : '✊✋✌'}
        </motion.p>
        <div className="flex gap-12 text-3xl">
          <span>✊ {tally.rock}</span>
          <span>✋ {tally.paper}</span>
          <span>✌ {tally.scissors}</span>
        </div>
      </GameFrame>
    )
  }
  return (
    <GameFrame game={game} step={Math.min(round, RPS_ROUNDS)} totalSteps={RPS_ROUNDS} isPresenter={false}>
      <p className="text-center text-2xl font-bold">라운드 {Math.min(round, RPS_ROUNDS)}</p>
      <div className="grid grid-cols-3 gap-2">
        {(['rock', 'paper', 'scissors'] as RPS[]).map((p) => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.88 }}
            onClick={() => pick(p)}
            className={`aspect-square rounded-2xl text-6xl border-4 transition-all ${
              lastPick === p
                ? 'bg-orange-100 border-orange-400'
                : 'bg-white border-slate-200'
            }`}
          >
            {RPS_EMOJI[p]}
          </motion.button>
        ))}
      </div>
      <p className="text-center text-sm text-slate-500">
        ✊ {tally.rock} · ✋ {tally.paper} · ✌ {tally.scissors}
      </p>
    </GameFrame>
  )
}

// ─── Main ───
const BodyGames: React.FC<BodyGamesProps> = ({
  duration = SECONDS_PER_GAME,
  onComplete,
  isPresenter = false,
}) => {
  const [gameIdx, setGameIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const { playSound } = useSound()
  const game = GAMES[gameIdx]

  const handlePhaseEnd = useCallback(() => {
    if (gameIdx < GAMES.length - 1) {
      playSound('notification')
      setGameIdx((i) => i + 1)
    } else {
      playSound('success')
      setIsComplete(true)
      onComplete?.({ played: GAMES.length })
    }
  }, [gameIdx, playSound, onComplete])

  const content =
    game.key === 'clap' ? (
      <ClapBeat isPresenter={isPresenter} game={game} />
    ) : game.key === 'ox' ? (
      <OXPose isPresenter={isPresenter} game={game} />
    ) : (
      <RPSTournament isPresenter={isPresenter} game={game} />
    )

  if (isPresenter) {
    return (
      <SpotLayoutV2
        title={game.title}
        subtitle={game.subtitle}
        isPresenter
        duration={duration}
        timerKey={`body-${game.key}`}
        onTimerComplete={handlePhaseEnd}
        isComplete={isComplete}
        completionTitle="게임 끝!"
        completionMessage="몸이 풀렸습니다"
        theme="energy"
        presenterContent={content}
      />
    )
  }

  return (
    <SpotLayoutV2
      title={game.title}
      subtitle={game.subtitle}
      duration={duration}
      timerKey={`body-${game.key}`}
      onTimerComplete={handlePhaseEnd}
      isComplete={isComplete}
      completionTitle="게임 끝!"
      completionMessage="수고하셨습니다"
      theme="energy"
    >
      {content}
    </SpotLayoutV2>
  )
}

export default BodyGames
