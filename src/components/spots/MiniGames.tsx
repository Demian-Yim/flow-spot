'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { MINI_GAMES, MiniGameDef, generateStroopQuestions, StroopQuestion, STROOP_COLORS } from '@/lib/spot-data'
import { ArrowLeft, Trophy, Circle, X as XIcon, MessageSquare, Target, BookOpen, Zap } from 'lucide-react'

interface MiniGamesProps {
  duration?: number
  onComplete?: (responses: Record<string, number>) => void
  isPresenter?: boolean
}

const gameColors: Record<string, { bg: string; border: string; text: string }> = {
  'ox-quiz':      { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-600' },
  'clap':         { bg: 'bg-secondary-50', border: 'border-secondary-200', text: 'text-secondary-600' },
  'word-chain':   { bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-600' },
  'bingo':        { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
  'truth-lie':    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  'relay-story':  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
  'stroop':       { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
}

// ─── Difficulty Types ───
type Difficulty = 'easy' | 'normal' | 'hard'
const DIFFICULTY_LABELS: Record<Difficulty, { label: string; emoji: string; color: string }> = {
  easy: { label: '쉬움', emoji: '🌱', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  normal: { label: '보통', emoji: '⚡', color: 'bg-primary-50 border-primary-200 text-primary-700' },
  hard: { label: '어려움', emoji: '🔥', color: 'bg-red-50 border-red-200 text-red-700' },
}

// ─── Difficulty Selector ───
const DifficultySelector: React.FC<{ onSelect: (d: Difficulty) => void }> = ({ onSelect }) => (
  <div className="space-y-4">
    <p className="text-center text-sm font-semibold text-slate-700">난이도를 선택하세요</p>
    <div className="grid grid-cols-3 gap-2">
      {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, typeof DIFFICULTY_LABELS[Difficulty]][]).map(([key, { label, emoji, color }]) => (
        <motion.button
          key={key}
          onClick={() => onSelect(key)}
          className={`border-2 rounded-xl py-4 text-center transition-all ${color}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-2xl block mb-1">{emoji}</span>
          <span className="text-sm font-bold">{label}</span>
        </motion.button>
      ))}
    </div>
  </div>
)

// ─── OX Quiz Game ───
const oxQuestionPool = {
  easy: [
    { q: '좋은 팀워크의 기본은 소통이다', answer: true },
    { q: '리더만이 의견을 낼 수 있다', answer: false },
    { q: '경청은 상대방의 말을 끝까지 듣는 것이다', answer: true },
    { q: '혼자 일하는 것이 항상 효율적이다', answer: false },
    { q: '피드백은 성장의 기회이다', answer: true },
  ],
  normal: [
    { q: '갈등은 항상 부정적인 결과만 가져온다', answer: false },
    { q: '회의에서 침묵은 동의를 의미한다', answer: false },
    { q: '건설적 비판은 개인 비난과 다르다', answer: true },
    { q: '다양한 의견은 더 나은 결정을 이끈다', answer: true },
    { q: '효율적인 회의에는 명확한 안건이 필요하다', answer: true },
    { q: '팀의 성과는 가장 뛰어난 개인이 결정한다', answer: false },
    { q: '심리적 안전감은 팀 성과와 관련이 있다', answer: true },
  ],
  hard: [
    { q: 'Tuckman 모델에서 Storming 단계는 갈등이 최소화되는 시기이다', answer: false },
    { q: 'RACI 매트릭스에서 R은 Responsible(실행 책임자)을 의미한다', answer: true },
    { q: '소셜 로핑(social loafing)은 팀 규모가 커질수록 줄어드는 현상이다', answer: false },
    { q: 'Agile 방법론에서 스프린트 회고는 선택 사항이다', answer: false },
    { q: 'Psychological Safety는 Amy Edmondson이 제안한 개념이다', answer: true },
    { q: '5 Whys 기법은 근본 원인 분석에 사용된다', answer: true },
    { q: 'OKR에서 Key Result는 측정 불가능한 목표여도 된다', answer: false },
    { q: '디자인 씽킹의 첫 단계는 문제 정의(Define)이다', answer: false },
    { q: 'Belbin의 팀 역할 모델에는 9가지 역할이 있다', answer: true },
  ],
}

const OXQuizGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [lastChoice, setLastChoice] = useState<'O' | 'X' | null>(null)
  const { playSound } = useSound()

  if (!difficulty) return <DifficultySelector onSelect={setDifficulty} />

  const questions = oxQuestionPool[difficulty]
  const pointsPerQ = Math.round(100 / questions.length)

  const handleAnswer = (choice: boolean) => {
    const isCorrect = choice === questions[round].answer
    setLastChoice(choice ? 'O' : 'X')
    setShowResult(true)
    if (isCorrect) {
      setScore(score + pointsPerQ)
      playSound('success')
    } else {
      playSound('error')
    }

    setTimeout(() => {
      setShowResult(false)
      setLastChoice(null)
      if (round < questions.length - 1) {
        setRound(round + 1)
      } else {
        onComplete(score + (isCorrect ? pointsPerQ : 0))
      }
    }, 1200)
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{round + 1}/{questions.length}</p>
        <h3 className="text-base font-bold text-slate-900">{questions[round].q}</h3>
      </div>

      {showResult ? (
        <div className={`text-center py-6 rounded-xl ${
          lastChoice === 'O' === questions[round].answer
            ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <p className="text-3xl font-bold mb-1">
            {lastChoice === 'O' === questions[round].answer ? '정답!' : '오답!'}
          </p>
          <p className="text-sm">정답: {questions[round].answer ? 'O' : 'X'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => handleAnswer(true)}
            className="bg-secondary-50 border-2 border-secondary-200 rounded-2xl py-8 text-center hover:border-secondary-400"
            whileTap={{ scale: 0.95 }}
          >
            <Circle className="w-12 h-12 text-secondary-500 mx-auto mb-2" />
            <span className="text-lg font-bold text-secondary-700">O</span>
          </motion.button>
          <motion.button
            onClick={() => handleAnswer(false)}
            className="bg-red-50 border-2 border-red-200 rounded-2xl py-8 text-center hover:border-red-400"
            whileTap={{ scale: 0.95 }}
          >
            <XIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <span className="text-lg font-bold text-red-700">X</span>
          </motion.button>
        </div>
      )}

      <p className="text-center text-sm text-slate-500">현재 점수: {score}점</p>
    </div>
  )
}

// ─── Word Chain Game ───
const WordChainGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [words, setWords] = useState<string[]>(['사과'])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const { playSound } = useSound()

  const handleSubmit = () => {
    if (!input.trim()) return
    const lastWord = words[words.length - 1]
    const lastChar = lastWord[lastWord.length - 1]

    if (input[0] !== lastChar) {
      setError(`"${lastChar}"(으)로 시작하는 단어를 입력하세요`)
      playSound('error')
      return
    }
    if (words.includes(input)) {
      setError('이미 사용한 단어입니다')
      playSound('error')
      return
    }

    setWords([...words, input])
    setScore(score + 10)
    setInput('')
    setError('')
    playSound('success')

    if (score + 10 >= 100) {
      onComplete(score + 10)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">현재 단어</p>
        <p className="text-2xl font-bold text-slate-900">{words[words.length - 1]}</p>
        <p className="text-xs text-slate-400 mt-1">
          "{words[words.length - 1][words[words.length - 1].length - 1]}"(으)로 시작하는 단어를 입력하세요
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="input-base flex-1 text-sm !py-2"
          placeholder="단어 입력..."
          autoFocus
        />
        <Button size="sm" variant="primary" onClick={handleSubmit}>입력</Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-1.5">
        {words.map((w, i) => (
          <span key={i} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs">
            {w}
          </span>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500">점수: {score}점 (100점 달성 시 완료)</p>
      <Button size="sm" variant="outline" fullWidth onClick={() => onComplete(score)}>
        게임 종료
      </Button>
    </div>
  )
}

// ─── Truth or Lie Game ───
const TruthLieGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [statements, setStatements] = useState<string[]>(['', '', ''])
  const [lieIndex, setLieIndex] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const { playSound } = useSound()

  const handleSubmit = () => {
    if (statements.some((s) => !s.trim()) || lieIndex === null) return
    setSubmitted(true)
    playSound('success')
    onComplete(30)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 text-center">
        자신에 대한 이야기 3가지를 적으세요. 1개는 거짓!
      </p>

      {!submitted ? (
        <>
          {statements.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.button
                onClick={() => setLieIndex(i)}
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  lieIndex === i
                    ? 'bg-red-100 border-red-400 text-red-600'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {lieIndex === i ? '거짓' : i + 1}
              </motion.button>
              <input
                type="text"
                value={s}
                onChange={(e) => {
                  const newStatements = [...statements]
                  newStatements[i] = e.target.value
                  setStatements(newStatements)
                }}
                className="input-base flex-1 text-sm !py-2"
                placeholder={`이야기 ${i + 1}...`}
              />
            </div>
          ))}

          <p className="text-xs text-slate-400 text-center">
            거짓인 항목의 번호를 클릭하세요
          </p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={statements.some((s) => !s.trim()) || lieIndex === null}
          >
            제출하기
          </Button>
        </>
      ) : (
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-emerald-700 font-semibold">제출 완료!</p>
          <p className="text-sm text-slate-600 mt-1">다른 참가자들이 맞춰볼 차례예요</p>
        </div>
      )}
    </div>
  )
}

// ─── Clap Game ───
const ClapGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [showPattern, setShowPattern] = useState(true)
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const { playSound } = useSound()

  const patterns = [
    { beats: [1, 1, 2], display: '👏 👏 👏👏', desc: '1박 1박 2박' },
    { beats: [2, 1, 1], display: '👏👏 👏 👏', desc: '2박 1박 1박' },
    { beats: [1, 2, 1], display: '👏 👏👏 👏', desc: '1박 2박 1박' },
    { beats: [2, 2, 1], display: '👏👏 👏👏 👏', desc: '2박 2박 1박' },
    { beats: [1, 1, 1, 2], display: '👏 👏 👏 👏👏', desc: '1박 1박 1박 2박' },
  ]

  const currentPattern = patterns[round]

  const handleClap = (count: number) => {
    const newInput = [...playerInput, count]
    setPlayerInput(newInput)
    playSound('click')

    if (newInput.length === currentPattern.beats.length) {
      const isCorrect = newInput.every((v, i) => v === currentPattern.beats[i])
      setFeedback(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) {
        setScore(score + 20)
        playSound('success')
      } else {
        playSound('error')
      }

      setTimeout(() => {
        setFeedback(null)
        setPlayerInput([])
        setShowPattern(true)
        if (round < patterns.length - 1) {
          setRound(round + 1)
        } else {
          onComplete(score + (isCorrect ? 20 : 0))
        }
      }, 1200)
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">라운드 {round + 1}/{patterns.length}</p>
        <h3 className="text-base font-bold text-slate-900 mb-3">박수 패턴을 따라하세요!</h3>
      </div>

      {showPattern ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-6 mb-4">
            <p className="text-3xl mb-3">{currentPattern.display}</p>
            <p className="text-sm font-medium text-secondary-700">{currentPattern.desc}</p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setShowPattern(false)}
          >
            패턴 기억했어요!
          </Button>
        </motion.div>
      ) : feedback ? (
        <div className={`text-center py-6 rounded-xl ${
          feedback === 'correct' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <p className="text-3xl font-bold mb-1">{feedback === 'correct' ? '정답!' : '오답!'}</p>
          <p className="text-sm">정답: {currentPattern.desc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center min-h-[2rem]">
            {playerInput.map((v, i) => (
              <span key={i} className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
                {v}박
              </span>
            ))}
            {playerInput.length < currentPattern.beats.length && (
              <span className="text-slate-300 text-sm self-center">
                {currentPattern.beats.length - playerInput.length}개 남음
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => handleClap(1)}
              className="bg-secondary-50 border-2 border-secondary-200 rounded-2xl py-8 text-center hover:border-secondary-400 active:bg-secondary-100"
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-4xl block mb-2">👏</span>
              <span className="text-lg font-bold text-secondary-700">1박</span>
            </motion.button>
            <motion.button
              onClick={() => handleClap(2)}
              className="bg-accent-50 border-2 border-accent-200 rounded-2xl py-8 text-center hover:border-accent-400 active:bg-accent-100"
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-4xl block mb-2">👏👏</span>
              <span className="text-lg font-bold text-accent-700">2박</span>
            </motion.button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-slate-500">현재 점수: {score}점</p>
    </div>
  )
}

// ─── Bingo Game ───
const BingoGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [grid, setGrid] = useState<string[]>(Array(9).fill(''))
  const [marked, setMarked] = useState<boolean[]>(Array(9).fill(false))
  const [phase, setPhase] = useState<'fill' | 'play'>('fill')
  const [bingoCount, setBingoCount] = useState(0)
  const { playSound } = useSound()

  const checkBingo = (newMarked: boolean[]): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6],            // diags
    ]
    return lines.filter((line) => line.every((i) => newMarked[i])).length
  }

  const handleCellInput = (index: number, value: string) => {
    const newGrid = [...grid]
    newGrid[index] = value
    setGrid(newGrid)
  }

  const handleStartPlay = () => {
    if (grid.some((cell) => !cell.trim())) return
    setPhase('play')
    playSound('success')
  }

  const handleMarkCell = (index: number) => {
    if (marked[index]) return
    const newMarked = [...marked]
    newMarked[index] = true
    setMarked(newMarked)
    const newBingo = checkBingo(newMarked)
    setBingoCount(newBingo)
    playSound(newBingo > bingoCount ? 'success' : 'click')

    if (newBingo >= 3) {
      setTimeout(() => onComplete(newBingo * 30), 500)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {phase === 'fill' ? '빙고판에 이름을 채우세요' : '이름이 불리면 터치!'}
        </h3>
        {phase === 'play' && (
          <p className="text-sm text-violet-600 font-bold">빙고: {bingoCount}줄</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {grid.map((cell, i) => (
          phase === 'fill' ? (
            <input
              key={i}
              type="text"
              value={cell}
              onChange={(e) => handleCellInput(i, e.target.value)}
              placeholder={`${i + 1}`}
              className="input-base text-center text-sm !py-3 !px-2"
              maxLength={6}
            />
          ) : (
            <motion.button
              key={i}
              onClick={() => handleMarkCell(i)}
              className={`rounded-xl py-4 text-center text-sm font-medium transition-all border-2 ${
                marked[i]
                  ? 'bg-violet-500 border-violet-600 text-white'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-violet-300'
              }`}
              whileTap={marked[i] ? {} : { scale: 0.9 }}
            >
              {marked[i] ? '✓' : cell}
            </motion.button>
          )
        ))}
      </div>

      {phase === 'fill' ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStartPlay}
          disabled={grid.some((cell) => !cell.trim())}
        >
          빙고 시작!
        </Button>
      ) : (
        <Button variant="outline" size="sm" fullWidth onClick={() => onComplete(bingoCount * 30)}>
          게임 종료 ({bingoCount}줄 빙고)
        </Button>
      )}
    </div>
  )
}

// ─── Relay Story Game ───
const RelayStoryGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [sentences, setSentences] = useState<string[]>(['옛날 옛적에'])
  const [input, setInput] = useState('')
  const [maxSentences] = useState(8)
  const { playSound } = useSound()

  const handleSubmit = () => {
    if (!input.trim()) return
    const newSentences = [...sentences, input.trim()]
    setSentences(newSentences)
    setInput('')
    playSound('success')

    if (newSentences.length >= maxSentences) {
      onComplete(newSentences.length * 10)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{sentences.length}/{maxSentences} 문장</p>
        <h3 className="text-base font-bold text-slate-900">이야기를 이어가세요!</h3>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 max-h-48 overflow-y-auto">
        {sentences.map((s, i) => (
          <motion.p
            key={i}
            className={`text-sm leading-relaxed ${i === sentences.length - 1 ? 'text-rose-700 font-semibold' : 'text-slate-600'}`}
            initial={i === sentences.length - 1 ? { opacity: 0, y: 8 } : {}}
            animate={{ opacity: 1, y: 0 }}
          >
            {s}
          </motion.p>
        ))}
      </div>

      {sentences.length < maxSentences ? (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="input-base flex-1 text-sm !py-2"
              placeholder="이어질 문장을 입력하세요..."
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={!input.trim()}>
              추가
            </Button>
          </div>
          <p className="text-xs text-slate-400 text-center">
            마지막 문장: &quot;{sentences[sentences.length - 1]}&quot;
          </p>
        </>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-sm text-emerald-600 font-semibold">이야기가 완성되었습니다!</p>
          <Button variant="primary" size="lg" fullWidth onClick={() => onComplete(sentences.length * 10)}>
            완료 ({sentences.length * 10}점)
          </Button>
        </div>
      )}

      <Button size="sm" variant="outline" fullWidth onClick={() => onComplete(sentences.length * 10)}>
        게임 종료
      </Button>
    </div>
  )
}

// ─── Stroop Test Game ───
const STROOP_DIFFICULTY: Record<Difficulty, { count: number; timeLimit: number }> = {
  easy: { count: 6, timeLimit: 5000 },
  normal: { count: 10, timeLimit: 3000 },
  hard: { count: 15, timeLimit: 2000 },
}

const StroopGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [questions, setQuestions] = useState<StroopQuestion[]>([])
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [avgTime, setAvgTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const answeringRef = React.useRef(false)
  const { playSound } = useSound()

  if (!difficulty) {
    return <DifficultySelector onSelect={(d) => {
      setDifficulty(d)
      setQuestions(generateStroopQuestions(STROOP_DIFFICULTY[d].count))
      setStartTime(Date.now())
      setTimeRemaining(STROOP_DIFFICULTY[d].timeLimit)
      answeringRef.current = false
    }} />
  }

  if (questions.length === 0) return null
  const currentQ = questions[round]
  const timeLimitMs = STROOP_DIFFICULTY[difficulty].timeLimit

  // Timeout timer — auto-wrong when time runs out
  React.useEffect(() => {
    if (feedback) return
    answeringRef.current = false
    setTimeRemaining(timeLimitMs)
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 100
        if (next <= 0) {
          clearInterval(interval)
          if (!answeringRef.current) {
            answeringRef.current = true
            // Timeout — treat as wrong answer
            setFeedback('timeout')
            playSound('error')
            const elapsed = timeLimitMs
            const newTotal = totalTime + elapsed
            setTotalTime(newTotal)
            setAvgTime(Math.round(newTotal / (round + 1)))
            setTimeout(() => {
              setFeedback(null)
              if (round < questions.length - 1) {
                setRound(round + 1)
                setStartTime(Date.now())
              } else {
                onComplete(score)
              }
            }, 800)
          }
          return 0
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [round, feedback, timeLimitMs])

  const handleAnswer = (colorName: string) => {
    if (answeringRef.current) return
    answeringRef.current = true
    const elapsed = Date.now() - startTime
    const isCorrect = colorName === currentQ.correctAnswer
    setFeedback(isCorrect ? 'correct' : 'wrong')

    const newTotal = totalTime + elapsed
    setTotalTime(newTotal)
    setAvgTime(Math.round(newTotal / (round + 1)))

    if (isCorrect) {
      const timeBonus = elapsed < timeLimitMs * 0.5 ? 15 : elapsed < timeLimitMs ? 10 : 5
      setScore(score + timeBonus)
      playSound('success')
    } else {
      playSound('error')
    }

    setTimeout(() => {
      setFeedback(null)
      if (round < questions.length - 1) {
        setRound(round + 1)
        setStartTime(Date.now())
      } else {
        onComplete(score + (isCorrect ? 10 : 0))
      }
    }, 800)
  }

  const timerPercent = timeLimitMs > 0 ? (timeRemaining / timeLimitMs) * 100 : 0
  const timerColor = timerPercent > 50 ? 'bg-emerald-500' : timerPercent > 25 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{round + 1}/{questions.length}</p>
        <h3 className="text-sm font-bold text-slate-900 mb-1">글자의 <u>색깔</u>을 맞추세요!</h3>
        <p className="text-xs text-slate-400">글자 내용이 아닌 글자의 색을 선택하세요</p>
      </div>

      {/* Timer bar */}
      {!feedback && (
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timerColor} rounded-full`}
            style={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {feedback ? (
        <div className={`text-center py-6 rounded-xl ${
          feedback === 'correct' ? 'bg-emerald-50 text-emerald-700'
            : feedback === 'timeout' ? 'bg-orange-50 text-orange-700'
            : 'bg-red-50 text-red-700'
        }`}>
          <p className="text-3xl font-bold mb-1">
            {feedback === 'correct' ? '정답!' : feedback === 'timeout' ? '시간 초과!' : '오답!'}
          </p>
          <p className="text-sm">정답: {currentQ.correctAnswer}</p>
        </div>
      ) : (
        <>
          <motion.div
            key={round}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-slate-200 py-10 text-center shadow-sm"
          >
            <span className={`text-5xl font-black ${currentQ.textColor}`}>
              {currentQ.text}
            </span>
          </motion.div>

          <div className="grid grid-cols-5 gap-2">
            {STROOP_COLORS.map((color) => (
              <motion.button
                key={color.name}
                onClick={() => handleAnswer(color.name)}
                className={`${color.class} rounded-xl py-3 text-sm font-bold bg-white border-2 border-slate-200 hover:border-slate-400 transition-colors`}
                whileTap={{ scale: 0.9 }}
              >
                {color.name}
              </motion.button>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between text-xs text-slate-500">
        <span>점수: {score}점</span>
        <span>평균 반응: {avgTime ? `${(avgTime / 1000).toFixed(1)}초` : '-'}</span>
      </div>
    </div>
  )
}

// ─── Main Component ───

const MiniGames: React.FC<MiniGamesProps> = ({
  duration = 180,
  onComplete,
  isPresenter = false,
}) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameScore, setGameScore] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const completedCount = Object.keys(gameScore).length
  const totalScore = Object.values(gameScore).reduce((a, b) => a + b, 0)

  const handleGameComplete = (gameId: string, score: number) => {
    const newScores = { ...gameScore, [gameId]: score }
    setGameScore(newScores)
    playSound('success')
    setSelectedGame(null)
  }

  const finishGames = () => {
    setIsComplete(true)
    playCelebrateSound()
    onComplete?.(gameScore)
  }

  // ─── Presenter Content ───
  const presenterContent = (
    <div className="grid grid-cols-3 gap-4">
      {MINI_GAMES.map((game, i) => {
        const score = gameScore[game.id]
        return (
          <motion.div
            key={game.id}
            className={`bg-white/5 border border-white/10 rounded-2xl p-5 text-center ${
              score !== undefined ? 'ring-2 ring-emerald-400/30' : ''
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-4xl mb-2">{game.icon}</div>
            <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
            <p className="text-slate-400 text-xs">{game.projectorDescription}</p>
            {score !== undefined && (
              <div className="mt-2 bg-emerald-500/15 rounded-lg px-3 py-1 inline-block">
                <span className="text-emerald-300 text-sm font-bold">{score}점</span>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )

  // ─── Participant Content ───
  const participantContent = selectedGame ? (
    <motion.div key={selectedGame} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="elevated" className="shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> 목록
          </button>
          <span className="text-lg">{MINI_GAMES.find((g) => g.id === selectedGame)?.icon}</span>
        </div>

        {selectedGame === 'ox-quiz' && (
          <OXQuizGame onComplete={(s) => handleGameComplete('ox-quiz', s)} />
        )}
        {selectedGame === 'word-chain' && (
          <WordChainGame onComplete={(s) => handleGameComplete('word-chain', s)} />
        )}
        {selectedGame === 'truth-lie' && (
          <TruthLieGame onComplete={(s) => handleGameComplete('truth-lie', s)} />
        )}
        {selectedGame === 'clap' && (
          <ClapGame onComplete={(s) => handleGameComplete('clap', s)} />
        )}
        {selectedGame === 'bingo' && (
          <BingoGame onComplete={(s) => handleGameComplete('bingo', s)} />
        )}
        {selectedGame === 'relay-story' && (
          <RelayStoryGame onComplete={(s) => handleGameComplete('relay-story', s)} />
        )}
        {selectedGame === 'stroop' && (
          <StroopGame onComplete={(s) => handleGameComplete('stroop', s)} />
        )}
      </Card>
    </motion.div>
  ) : (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="elevated" className="shadow-lg">
        {completedCount > 0 && (
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-primary-700">
                {completedCount}/{MINI_GAMES.length} 완료
              </span>
            </div>
            <span className="text-sm font-bold text-primary-600">{totalScore}점</span>
          </div>
        )}

        <p className="text-center text-sm text-slate-600 mb-4">게임을 선택하세요</p>

        <div className="grid grid-cols-2 gap-3">
          {MINI_GAMES.map((game) => {
            const colors = gameColors[game.id]
            const isDone = gameScore[game.id] !== undefined
            return (
              <motion.button
                key={game.id}
                onClick={() => !isDone && setSelectedGame(game.id)}
                className={`${colors.bg} border ${colors.border} rounded-xl p-3.5 text-left transition-all ${
                  isDone ? 'opacity-60' : 'hover:shadow-md'
                }`}
                whileHover={isDone ? {} : { scale: 1.02 }}
                whileTap={isDone ? {} : { scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{game.icon}</span>
                  <h4 className={`font-bold text-sm ${colors.text}`}>{game.name}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-tight">{game.description}</p>
                {isDone && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1.5">{gameScore[game.id]}점 ✓</p>
                )}
              </motion.button>
            )
          })}
        </div>

        {completedCount > 0 && (
          <Button variant="primary" size="lg" fullWidth className="mt-4" onClick={finishGames}>
            게임 종료
          </Button>
        )}
      </Card>
    </motion.div>
  )

  return (
    <SpotLayout
      title="미니 게임"
      subtitle="MINI GAMES"
      progress={{ current: completedCount, total: MINI_GAMES.length }}
      duration={duration}
      onTimerComplete={finishGames}
      isComplete={isComplete}
      completionEmoji="🏆"
      completionTitle="게임 완료!"
      completionMessage="모든 미니 게임을 즐겼습니다!"
      completionDetail={`총 획득 점수: ${totalScore}점`}
      theme="primary"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default MiniGames
