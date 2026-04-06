'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { Heart, Lightbulb, Users, Check, X } from 'lucide-react'

interface MannerModeProps {
  duration?: number
  onComplete?: (responses: Record<string, string>) => void
  isPresenter?: boolean
}

interface MannerScenario {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  goodResponses: string[]
  badResponses: string[]
}

const scenarios: MannerScenario[] = [
  {
    id: 'greeting',
    title: '인사의 중요성',
    description: '좋은 인사가 관계를 시작합니다',
    icon: <Heart className="w-6 h-6" />,
    goodResponses: ['큰 목소리로 인사', '눈을 마주치며 인사', '미소 지으며 인사'],
    badResponses: ['작은 목소리로 인사', '휴대폰을 보며 인사', '인사 생략'],
  },
  {
    id: 'listening',
    title: '경청의 기술',
    description: '상대방 말을 귀 기울여 듣기',
    icon: <Lightbulb className="w-6 h-6" />,
    goodResponses: ['고개를 끄덕이며 듣기', '질문으로 관심 표현', '메모하며 듣기'],
    badResponses: ['멍하니 보기', '자꾸만 끼어들기', '핸드폰 확인'],
  },
  {
    id: 'teamwork',
    title: '팀워크 정신',
    description: '함께할 때 더 큰 결과 만들기',
    icon: <Users className="w-6 h-6" />,
    goodResponses: ['적극적으로 돕기', '아이디어 공유', '함께 기뻐하기'],
    badResponses: ['혼자만 하기', '평가하기', '비판하기'],
  },
]

const MannerMode: React.FC<MannerModeProps> = ({
  duration = 30,
  onComplete,
  isPresenter = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null)
  const [isGoodChoice, setIsGoodChoice] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const currentScenario = scenarios[currentIndex]

  const handleSelectResponse = (response: string, isGood: boolean) => {
    playSound(isGood ? 'success' : 'error')
    setSelectedResponse(response)
    setIsGoodChoice(isGood)
    setResponses({ ...responses, [currentScenario.id]: response })
    setShowFeedback(true)
  }

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowFeedback(false)
      setSelectedResponse(null)
      playSound('click')
    } else {
      finishSpot()
    }
  }

  const finishSpot = () => {
    setIsComplete(true)
    playCelebrateSound()
    onComplete?.(responses)
  }

  // ─── Presenter Content ───
  const presenterContent = (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 lg:p-12"
    >
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary-500/20 text-primary-400">
          {currentScenario.icon}
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white">
          {currentScenario.title}
        </h2>
      </div>
      <p className="text-xl text-slate-300 text-center mb-10">
        {currentScenario.description}
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5" /> 좋은 매너
          </h3>
          <div className="space-y-3">
            {currentScenario.goodResponses.map((r) => (
              <p key={r} className="text-slate-200 text-lg">{r}</p>
            ))}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <X className="w-5 h-5" /> 피해야 할 매너
          </h3>
          <div className="space-y-3">
            {currentScenario.badResponses.map((r) => (
              <p key={r} className="text-slate-300 text-lg">{r}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  // ─── Participant Content ───
  const participantContent = (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card variant="elevated" className="shadow-lg">
        {/* Scenario Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary-50 text-primary-500">
            {currentScenario.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{currentScenario.title}</h3>
            <p className="text-sm text-slate-500">{currentScenario.description}</p>
          </div>
        </div>

        {!showFeedback ? (
          <>
            <p className="text-sm font-semibold text-slate-700 mb-4">
              어떻게 하는 게 좋을까요?
            </p>

            {/* Good Responses */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                좋은 매너
              </p>
              <div className="space-y-2">
                {currentScenario.goodResponses.map((response) => (
                  <motion.button
                    key={response}
                    onClick={() => handleSelectResponse(response, true)}
                    className="w-full text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium transition-colors border border-emerald-100"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {response}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bad Responses */}
            <div>
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">
                피해야 할 매너
              </p>
              <div className="space-y-2">
                {currentScenario.badResponses.map((response) => (
                  <motion.button
                    key={response}
                    onClick={() => handleSelectResponse(response, false)}
                    className="w-full text-left bg-red-50 hover:bg-red-100 text-red-700 rounded-xl px-4 py-3 text-sm font-medium transition-colors border border-red-100"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="flex items-center gap-2.5">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      {response}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`rounded-xl p-4 mb-5 ${isGoodChoice ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-sm font-semibold ${isGoodChoice ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isGoodChoice ? '좋은 선택입니다!' : '다음에는 더 좋은 선택을 해봐요!'}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                선택: <strong>{selectedResponse}</strong>
              </p>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              매너와 배려가 직장 문화의 기초입니다.
            </p>
            <Button onClick={handleNext} variant="primary" size="lg" fullWidth>
              {currentIndex < scenarios.length - 1 ? '다음 시나리오' : '완료'}
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )

  return (
    <SpotLayout
      title="매너 모드"
      subtitle="MANNER MODE"
      progress={{ current: currentIndex + 1, total: scenarios.length }}
      duration={duration}
      onTimerComplete={finishSpot}
      isComplete={isComplete}
      completionEmoji="🤝"
      completionTitle="매너 학습 완료!"
      completionMessage="좋은 매너 배우기를 완료했습니다!"
      completionDetail="좋은 매너가 좋은 관계를 만듭니다. 오늘 배운 것을 실천해봅시다!"
      theme="primary"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default MannerMode
