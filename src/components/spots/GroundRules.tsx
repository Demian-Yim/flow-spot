'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface GroundRulesProps {
  duration?: number
  onComplete?: (responses: string[]) => void
  isPresenter?: boolean
}

interface Rule {
  id: string
  title: string
  description: string
  emoji: string
}

const defaultRules: Rule[] = [
  { id: 'respect', title: '존중', description: '모든 의견을 존중합니다', emoji: '🙏' },
  { id: 'listen', title: '경청', description: '상대방의 말을 끝까지 듣습니다', emoji: '👂' },
  { id: 'participate', title: '참여', description: '적극적으로 참여합니다', emoji: '🙋' },
  { id: 'punctual', title: '시간 준수', description: '약속된 시간을 지킵니다', emoji: '⏰' },
]

const GroundRules: React.FC<GroundRulesProps> = ({
  duration = 60,
  onComplete,
  isPresenter = false,
}) => {
  const [rules] = useState<Rule[]>(defaultRules)
  const [agreedRules, setAgreedRules] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const toggleRule = (ruleId: string) => {
    if (agreedRules.includes(ruleId)) {
      setAgreedRules(agreedRules.filter((id) => id !== ruleId))
      playSound('click')
    } else {
      setAgreedRules([...agreedRules, ruleId])
      playSound('success')
    }
  }

  const allRulesAgreed = agreedRules.length === rules.length

  const finishSpot = () => {
    if (allRulesAgreed) {
      setIsComplete(true)
      playCelebrateSound()
      onComplete?.(agreedRules)
    } else {
      playSound('error')
    }
  }

  // ─── Presenter Content ───
  const presenterContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-5xl mb-4">{rule.emoji}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{rule.title}</h3>
            <p className="text-slate-300">{rule.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
        <p className="text-slate-300">
          모든 팀원이 규칙에 동의하면 우리 팀의 문화가 만들어집니다!
        </p>
      </div>
    </div>
  )

  // ─── Participant Content ───
  const participantContent = (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="elevated" className="shadow-lg">
        <p className="text-center text-sm text-slate-600 mb-6">
          모든 규칙을 확인하고 동의해주세요
        </p>

        {/* Rule Checklist */}
        <div className="space-y-3 mb-6">
          {rules.map((rule) => {
            const isAgreed = agreedRules.includes(rule.id)
            return (
              <motion.button
                key={rule.id}
                onClick={() => toggleRule(rule.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all ${
                  isAgreed
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                    : 'bg-slate-50 border border-slate-200 hover:border-secondary-300'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isAgreed ? 'bg-emerald-500' : 'bg-white border-2 border-slate-300'
                }`}>
                  {isAgreed && <CheckCircle className="w-4 h-4 text-white" />}
                </div>

                {/* Emoji */}
                <span className="text-2xl flex-shrink-0">{rule.emoji}</span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm ${isAgreed ? 'text-emerald-800' : 'text-slate-900'}`}>
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Warning */}
        {!allRulesAgreed && (
          <motion.div
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              모든 규칙에 동의해야 완료할 수 있습니다 ({agreedRules.length}/{rules.length})
            </p>
          </motion.div>
        )}

        <Button
          onClick={finishSpot}
          variant={allRulesAgreed ? 'primary' : 'outline'}
          size="lg"
          fullWidth
          disabled={!allRulesAgreed}
        >
          {allRulesAgreed ? '규칙 동의 완료!' : `${agreedRules.length}/${rules.length} 동의됨`}
        </Button>
      </Card>
    </motion.div>
  )

  return (
    <SpotLayout
      title="팀 규칙"
      subtitle="GROUND RULES"
      progress={{ current: agreedRules.length, total: rules.length }}
      duration={duration}
      onTimerComplete={finishSpot}
      isComplete={isComplete}
      completionEmoji="📋"
      completionTitle="규칙 동의 완료!"
      completionMessage="모든 팀 규칙에 동의했습니다!"
      completionDetail="이제 우리 팀의 규칙을 함께 지켜나갑시다!"
      theme="secondary"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default GroundRules
