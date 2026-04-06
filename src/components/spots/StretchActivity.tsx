'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { STRETCH_PROGRAMS, StretchProgram } from '@/lib/spot-data'
import { CheckCircle } from 'lucide-react'

interface StretchActivityProps {
  duration?: number
  onComplete?: (responses: any) => void
  isPresenter?: boolean
}

const StretchActivity: React.FC<StretchActivityProps> = ({
  duration = 120,
  onComplete,
  isPresenter = false,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<StretchProgram | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [completedPrograms, setCompletedPrograms] = useState<string[]>([])
  const [stepTimer, setStepTimer] = useState(0)
  const { playSound, playCelebrateSound } = useSound()

  // Step timer countdown
  useEffect(() => {
    if (!selectedProgram || isComplete) return
    const step = selectedProgram.steps[currentStep]
    if (!step) return

    setStepTimer(step.duration)
    const interval = setInterval(() => {
      setStepTimer((t) => {
        if (t <= 1) {
          clearInterval(interval)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [selectedProgram, currentStep, isComplete])

  const handleSelectProgram = (program: StretchProgram) => {
    setSelectedProgram(program)
    setCurrentStep(0)
    playSound('click')
  }

  const handleNextStep = () => {
    if (!selectedProgram) return
    if (currentStep < selectedProgram.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      playSound('click')
    } else {
      completeProgram()
    }
  }

  const completeProgram = () => {
    if (!selectedProgram) return
    const newCompleted = [...completedPrograms, selectedProgram.id]
    setCompletedPrograms(newCompleted)
    playSound('success')
    setSelectedProgram(null)
    setCurrentStep(0)
  }

  const finishSpot = () => {
    setIsComplete(true)
    playCelebrateSound()
    onComplete?.({ completedPrograms })
  }

  // ─── Presenter Content ───
  const presenterContent = selectedProgram ? (
    <motion.div
      key={selectedProgram.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-12 text-center"
    >
      <div className="text-7xl mb-4">{selectedProgram.icon}</div>
      <h2 className="text-3xl font-bold text-white mb-2">{selectedProgram.name}</h2>
      <p className="text-xl text-slate-300 mb-8">{selectedProgram.description}</p>
      <div className="space-y-3 max-w-2xl mx-auto">
        {selectedProgram.steps.map((step, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl text-lg font-medium ${
              i === currentStep
                ? 'bg-accent-500/20 border border-accent-400/30 text-white scale-[1.02]'
                : i < currentStep
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-white/5 text-slate-500'
            }`}
          >
            {i === currentStep && <span className="text-accent-400 mr-2">{stepTimer}초</span>}
            {step.instruction}
          </div>
        ))}
      </div>
    </motion.div>
  ) : (
    <div className="grid grid-cols-3 gap-4">
      {STRETCH_PROGRAMS.map((p) => (
        <div
          key={p.id}
          className={`bg-white/5 border border-white/10 rounded-2xl p-6 text-center ${
            completedPrograms.includes(p.id) ? 'ring-2 ring-emerald-400/30' : ''
          }`}
        >
          <div className="text-4xl mb-2">{p.icon}</div>
          <h3 className="text-lg font-bold text-white">{p.name}</h3>
          <p className="text-sm text-slate-400">{p.description}</p>
          {completedPrograms.includes(p.id) && (
            <span className="text-emerald-400 text-sm mt-2 inline-block">✓ 완료</span>
          )}
        </div>
      ))}
    </div>
  )

  // ─── Participant Content ───
  const participantContent = selectedProgram ? (
    <motion.div
      key={`${selectedProgram.id}-${currentStep}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card variant="elevated" className="shadow-lg">
        {/* Program header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => { setSelectedProgram(null); setCurrentStep(0) }}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← 목록
          </button>
          <span className="text-2xl">{selectedProgram.icon}</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">{selectedProgram.name}</h3>
            <p className="text-xs text-slate-500">{selectedProgram.description}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 mb-5">
          {selectedProgram.steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                i === currentStep
                  ? 'bg-accent-50 border border-accent-200 text-accent-800'
                  : i < currentStep
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                    : 'bg-slate-50 border border-slate-100 text-slate-400'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                i < currentStep
                  ? 'bg-emerald-500 text-white'
                  : i === currentStep
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {i < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="flex-1">{step.instruction}</span>
              {i === currentStep && (
                <span className="text-accent-600 font-bold tabular-nums">{stepTimer}초</span>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleNextStep} variant="accent" size="lg" fullWidth>
          {currentStep < selectedProgram.steps.length - 1 ? '다음 스텝' : '프로그램 완료'}
        </Button>
      </Card>
    </motion.div>
  ) : (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="elevated" className="shadow-lg">
        <p className="text-sm text-slate-600 mb-4 text-center">스트레칭 프로그램을 선택하세요</p>

        {completedPrograms.length > 0 && (
          <div className="bg-accent-50 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-accent-700">
              {completedPrograms.length}/{STRETCH_PROGRAMS.length} 완료
            </span>
            <Button size="sm" variant="accent" onClick={finishSpot}>
              스트레칭 종료
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {STRETCH_PROGRAMS.map((program) => {
            const isDone = completedPrograms.includes(program.id)
            return (
              <motion.button
                key={program.id}
                onClick={() => !isDone && handleSelectProgram(program)}
                className={`rounded-xl p-4 text-center transition-all border ${
                  isDone
                    ? 'bg-emerald-50 border-emerald-200 opacity-70'
                    : 'bg-slate-50 border-slate-200 hover:border-accent-300 hover:shadow-md'
                }`}
                whileHover={isDone ? {} : { scale: 1.02 }}
                whileTap={isDone ? {} : { scale: 0.98 }}
              >
                <div className="text-3xl mb-2">{program.icon}</div>
                <h4 className="text-sm font-bold text-slate-800">{program.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{program.description}</p>
                {isDone && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ 완료</p>}
              </motion.button>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )

  return (
    <SpotLayout
      title="스트레칭"
      subtitle="STRETCH & REFRESH"
      progress={{ current: completedPrograms.length, total: STRETCH_PROGRAMS.length }}
      duration={duration}
      onTimerComplete={finishSpot}
      isComplete={isComplete}
      completionEmoji="✨"
      completionTitle="스트레칭 완료!"
      completionMessage="몸과 마음이 편해졌나요?"
      completionDetail={`${completedPrograms.length}개 프로그램을 완료했습니다`}
      theme="accent"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default StretchActivity
