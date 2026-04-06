'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { ANIMALS, FOODS, KEYWORDS } from '@/lib/spot-data'
import { SelfIntroData } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SelfIntroductionProps {
  duration?: number
  onComplete?: (data: SelfIntroData) => void
  isPresenter?: boolean
}

type Step = 'animal' | 'food' | 'keyword' | 'preview'
const STEPS: Step[] = ['animal', 'food', 'keyword', 'preview']

const stepLabels: Record<Step, { title: string; desc: string }> = {
  animal:  { title: '나를 닮은 동물', desc: '자신과 닮은 동물을 하나 선택하세요' },
  food:    { title: '좋아하는 음식', desc: '좋아하는 음식을 최대 3개 선택하세요' },
  keyword: { title: '나를 표현하는 키워드', desc: '자신을 표현하는 키워드를 3개 선택하세요' },
  preview: { title: '자기소개 완성!', desc: '선택한 내용을 확인하세요' },
}

const SelfIntroduction: React.FC<SelfIntroductionProps> = ({
  duration = 120,
  onComplete,
  isPresenter = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null)
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const currentStep = STEPS[stepIndex]

  const canProceed = () => {
    switch (currentStep) {
      case 'animal': return selectedAnimal !== null
      case 'food': return selectedFoods.length > 0
      case 'keyword': return selectedKeywords.length === 3
      case 'preview': return true
    }
  }

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1)
      playSound('click')
    } else {
      finishSpot()
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      playSound('click')
    }
  }

  const finishSpot = () => {
    setIsComplete(true)
    playCelebrateSound()
    onComplete?.({
      animal: selectedAnimal || '',
      foods: selectedFoods,
      keywords: selectedKeywords,
    })
  }

  const toggleFood = (emoji: string) => {
    if (selectedFoods.includes(emoji)) {
      setSelectedFoods(selectedFoods.filter((f) => f !== emoji))
    } else if (selectedFoods.length < 3) {
      setSelectedFoods([...selectedFoods, emoji])
      playSound('click')
    }
  }

  const toggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== kw))
    } else if (selectedKeywords.length < 3) {
      setSelectedKeywords([...selectedKeywords, kw])
      playSound('click')
    }
  }

  // ─── Presenter Content ───
  const presenterContent = (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-12 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">자기소개 시간</h2>
      <p className="text-xl text-slate-300 mb-10">
        동물, 음식, 키워드로 나를 표현해봅시다!
      </p>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-4xl mb-3">🐾</p>
          <h3 className="text-lg font-bold text-white">나를 닮은 동물</h3>
          <p className="text-slate-400 text-sm mt-1">43개 중 1개 선택</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-4xl mb-3">🍽️</p>
          <h3 className="text-lg font-bold text-white">좋아하는 음식</h3>
          <p className="text-slate-400 text-sm mt-1">32개 중 최대 3개</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-4xl mb-3">💡</p>
          <h3 className="text-lg font-bold text-white">나의 키워드</h3>
          <p className="text-slate-400 text-sm mt-1">53개 중 3개 선택</p>
        </div>
      </div>
    </div>
  )

  // ─── Participant Content ───
  const participantContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card variant="elevated" className="shadow-lg">
          {/* Step Header */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">{stepLabels[currentStep].title}</h3>
            <p className="text-sm text-slate-500">{stepLabels[currentStep].desc}</p>
          </div>

          {/* Animal Grid */}
          {currentStep === 'animal' && (
            <div className="grid grid-cols-7 gap-2 mb-5">
              {ANIMALS.map((animal) => (
                <motion.button
                  key={animal}
                  onClick={() => { setSelectedAnimal(animal); playSound('click') }}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    selectedAnimal === animal
                      ? 'bg-primary-100 border-2 border-primary-400 scale-110'
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {animal}
                </motion.button>
              ))}
            </div>
          )}

          {/* Food Grid */}
          {currentStep === 'food' && (
            <>
              <p className="text-xs text-slate-400 mb-3">
                {selectedFoods.length}/3 선택됨
              </p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {FOODS.map((food) => (
                  <motion.button
                    key={food.emoji}
                    onClick={() => toggleFood(food.emoji)}
                    className={`flex flex-col items-center p-2.5 rounded-xl transition-all text-center ${
                      selectedFoods.includes(food.emoji)
                        ? 'bg-accent-50 border-2 border-accent-400'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl">{food.emoji}</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">{food.name}</span>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {/* Keyword Grid */}
          {currentStep === 'keyword' && (
            <>
              <p className="text-xs text-slate-400 mb-3">
                {selectedKeywords.length}/3 선택됨
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {KEYWORDS.map((kw) => (
                  <motion.button
                    key={kw}
                    onClick={() => toggleKeyword(kw)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedKeywords.includes(kw)
                        ? 'bg-secondary-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {kw}
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {/* Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-4 mb-5">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">나를 닮은 동물</p>
                <p className="text-5xl">{selectedAnimal || '?'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">좋아하는 음식</p>
                <div className="flex gap-2 justify-center">
                  {selectedFoods.length > 0 ? selectedFoods.map((f) => (
                    <span key={f} className="text-3xl">{f}</span>
                  )) : <span className="text-slate-400">선택 없음</span>}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">나의 키워드</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {selectedKeywords.length > 0 ? selectedKeywords.map((kw) => (
                    <span key={kw} className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
                      {kw}
                    </span>
                  )) : <span className="text-slate-400">선택 없음</span>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" size="lg" onClick={handleBack} icon={<ChevronLeft className="w-4 h-4" />}>
                이전
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              disabled={!canProceed()}
              icon={stepIndex < STEPS.length - 1 ? <ChevronRight className="w-4 h-4" /> : undefined}
            >
              {currentStep === 'preview' ? '완료!' : '다음'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <SpotLayout
      title="자기소개"
      subtitle="SELF INTRODUCTION"
      progress={{ current: stepIndex + 1, total: STEPS.length }}
      duration={duration}
      onTimerComplete={finishSpot}
      isComplete={isComplete}
      completionEmoji="👋"
      completionTitle="자기소개 완성!"
      completionMessage="나만의 프로필을 완성했습니다!"
      completionDetail={`${selectedAnimal} · ${selectedFoods.join('')} · ${selectedKeywords.join(', ')}`}
      theme="secondary"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default SelfIntroduction
