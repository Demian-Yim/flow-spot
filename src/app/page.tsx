'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import {
  Users,
  Radio,
  ArrowRight,
  Target,
  Activity,
  Gamepad2,
  ShieldCheck,
  BarChart3,
  Zap,
} from 'lucide-react'

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function HomePage() {
  const router = useRouter()
  const [sessionCode, setSessionCode] = useState('')

  const handleInstructorClick = () => {
    router.push('/admin')
  }

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      router.push(`/join/${sessionCode.toUpperCase()}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinSession()
    }
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200/60 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-button flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base tracking-tight">FS</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">FLOW SPOT</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstructorClick}
              icon={<Radio className="w-4 h-4" />}
            >
              강사 로그인
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-slate-950 overflow-hidden">
        {/* Background gradient accents */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-slate-400 mb-8">
              <Zap className="w-3.5 h-3.5 text-primary-400" />
              <span>기업 교육의 새로운 패러다임</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-display font-bold text-white leading-tight tracking-tight mb-6">
              기업의 팀 문화를
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                게임으로 만듭니다
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12">
              실시간 참여형 게임 기반 교육으로 팀워크와 소통 능력을 강화하세요.
              <br className="hidden sm:block" />
              강사는 세션을 만들고, 참가자는 코드 하나로 바로 참여합니다.
            </p>

            {/* Stats row */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 sm:gap-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { value: '50+', label: '교육 세션 진행' },
                { value: '1,200+', label: '누적 참가자' },
                { value: '4.8', label: '만족도 (5점)' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-primary to-transparent" />
      </section>

      {/* Entry Section */}
      <section className="relative -mt-8 z-10 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {/* Instructor Card */}
            <motion.div variants={staggerItem}>
              <Card
                variant="elevated"
                className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-card bg-primary-50 flex items-center justify-center mb-5">
                    <Radio className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-title font-bold text-slate-900 mb-2">
                    강사 입장
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    교육 세션을 생성하고 실시간으로 참가자를 관리하세요.
                    게임 진행 상황을 한눈에 모니터링할 수 있습니다.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleInstructorClick}
                  icon={<ArrowRight className="w-4.5 h-4.5" />}
                >
                  강사 대시보드
                </Button>
              </Card>
            </motion.div>

            {/* Participant Card */}
            <motion.div variants={staggerItem}>
              <Card
                variant="elevated"
                className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-card bg-secondary-50 flex items-center justify-center mb-5">
                    <Users className="w-6 h-6 text-secondary-600" />
                  </div>
                  <h3 className="text-title font-bold text-slate-900 mb-2">
                    참가자 입장
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    강사에게 받은 세션 코드를 입력하면 바로 게임에 참여할 수 있습니다.
                  </p>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="세션 코드 입력"
                        value={sessionCode}
                        onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyPress}
                        maxLength={6}
                        leftIcon={<Gamepad2 className="w-4 h-4" />}
                        className="text-center font-semibold tracking-widest uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={handleJoinSession}
                    disabled={!sessionCode.trim()}
                    icon={<ArrowRight className="w-4.5 h-4.5" />}
                  >
                    세션 참가하기
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-secondary py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-heading font-bold text-slate-900 mb-3">
              참여형 교육 활동
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              다양한 게임과 활동을 통해 팀의 소통과 협업 능력을 자연스럽게 향상시킵니다.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              {
                icon: Target,
                color: 'primary' as const,
                title: '매너 체크',
                description:
                  '직장 내 올바른 소통 방법을 게임으로 학습합니다. 실제 상황 기반의 시나리오로 자연스럽게 매너를 익힐 수 있습니다.',
              },
              {
                icon: Activity,
                color: 'accent' as const,
                title: '팀 스트레칭',
                description:
                  '몸과 마음을 이완하는 스트레칭 활동입니다. 교육 중간에 삽입하여 참가자들의 집중력을 회복시킵니다.',
              },
              {
                icon: Gamepad2,
                color: 'secondary' as const,
                title: '미니 게임',
                description:
                  '팀 단위 미니 게임을 통해 협업과 소통 능력을 강화합니다. 실시간 점수와 순위로 몰입감을 높입니다.',
              },
            ].map((feature) => {
              const iconColorMap = {
                primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
                accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
                secondary: { bg: 'bg-secondary-50', text: 'text-secondary-600' },
              }
              const colors = iconColorMap[feature.color]

              return (
                <motion.div key={feature.title} variants={staggerItem}>
                  <Card variant="default" className="h-full">
                    <div className={`w-11 h-11 rounded-button ${colors.bg} flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Trust / Why Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-heading font-bold text-slate-900 mb-3">
              FLOW SPOT을 선택하는 이유
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              강사와 참가자 모두를 위한 직관적이고 효과적인 교육 도구입니다.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              {
                icon: Zap,
                title: '즉시 시작',
                description: '별도 설치 없이 웹 브라우저에서 바로 시작합니다. 세션 코드만 있으면 즉시 참여 가능합니다.',
              },
              {
                icon: BarChart3,
                title: '실시간 분석',
                description: '참가자 응답과 게임 결과를 실시간으로 모니터링하고, 교육 효과를 즉각적으로 확인합니다.',
              },
              {
                icon: ShieldCheck,
                title: '안전한 환경',
                description: '세션 기반 접근 제어로 인가된 참가자만 참여할 수 있으며, 데이터는 안전하게 보호됩니다.',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-button bg-slate-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-950 py-16 sm:py-20">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <h2 className="text-heading font-bold text-white mb-4">
            팀 교육을 시작할 준비가 되셨나요?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            지금 바로 세션을 만들고 팀원들과 함께 참여형 교육을 경험하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              size="xl"
              onClick={handleInstructorClick}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              무료로 시작하기
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">FS</span>
              </div>
              <span className="text-sm font-semibold text-slate-400">FLOW SPOT</span>
            </div>
            <p className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()} FLOW SPOT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
