'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import MannerMode from '@/components/spots/MannerMode'
import StretchActivity from '@/components/spots/StretchActivity'
import GreetingRole from '@/components/spots/GreetingRole'
import GroundRules from '@/components/spots/GroundRules'
import MiniGames from '@/components/spots/MiniGames'
import SelfIntroduction from '@/components/spots/SelfIntroduction'
import CafeOrder from '@/components/spots/CafeOrder'
import GreetingCircle from '@/components/spots/GreetingCircle'
import MirrorStretch from '@/components/spots/MirrorStretch'
import IntroRelay from '@/components/spots/IntroRelay'
import RoleRoulette from '@/components/spots/RoleRoulette'
import BodyGames from '@/components/spots/BodyGames'
import RuleRitual from '@/components/spots/RuleRitual'
import CafeBreak from '@/components/spots/CafeBreak'
import ActivityFlowController from '@/components/spots/ActivityFlowController'
import { useSessionSync } from '@/hooks/useSessionSync'
import { useFirestore } from '@/hooks/useFirestore'
import { SessionMode, SpotType, SPOT_LABELS, Project, SessionLiveState, Participant, TeamId } from '@/types'
import { Users, Loader2, AlertCircle, PartyPopper, Wifi, WifiOff, Trophy, Medal } from 'lucide-react'

export default function SessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const mode = (searchParams.get('mode') || 'participant') as SessionMode
  const participantId = searchParams.get('participant') || undefined

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { getDocument } = useFirestore()

  const {
    liveState,
    participants,
    connected,
    launchActivity,
    endActivity,
    nextSpot,
    updateTeamScores,
    shuffleSeats,
    sendAnnouncement,
    submitResponse,
  } = useSessionSync({
    projectId,
    sessionCode: project?.sessionCode || '',
    mode,
    participantId,
  })

  useEffect(() => {
    getDocument<Project>('projects', projectId).then((data) => {
      if (data) setProject(data)
      setLoading(false)
    })
  }, [projectId, getDocument])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">세션 준비 중...</p>
        </motion.div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <Card variant="elevated" className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900 mb-2">프로젝트를 찾을 수 없습니다</h1>
          <p className="text-sm text-slate-500">코드를 다시 확인해주세요</p>
        </Card>
      </div>
    )
  }

  const currentSpotIndex = liveState?.currentSpotIndex ?? 0
  const currentSpot = project.spotSequence[currentSpotIndex]
  const isPresenter = mode === 'projector'

  // ─── Route by mode ───
  switch (mode) {
    case 'admin':
      return (
        <AdminView
          project={project}
          liveState={liveState}
          participants={participants}
          connected={connected}
          currentSpot={currentSpot}
          currentSpotIndex={currentSpotIndex}
          onLaunchActivity={launchActivity}
          onEndActivity={endActivity}
          onNextSpot={nextSpot}
          onShuffleSeats={shuffleSeats}
          onSendAnnouncement={sendAnnouncement}
          onUpdateScore={updateTeamScores}
        />
      )

    case 'projector':
      return (
        <ProjectorView
          project={project}
          liveState={liveState}
          currentSpot={currentSpot}
          currentSpotIndex={currentSpotIndex}
          participants={participants}
          connected={connected}
          onNextSpot={nextSpot}
        />
      )

    default:
      return (
        <ParticipantView
          project={project}
          currentSpot={currentSpot}
          currentSpotIndex={currentSpotIndex}
          participants={participants}
          connected={connected}
          onComplete={submitResponse}
        />
      )
  }
}

// ═══════════════════════════════════════════════
// ─── Participant View ───
// ═══════════════════════════════════════════════

function ParticipantView({
  project,
  currentSpot,
  currentSpotIndex,
  participants,
  connected,
  onComplete,
}: {
  project: Project
  currentSpot: SpotType | undefined
  currentSpotIndex: number
  participants: Participant[]
  connected: boolean
  onComplete: (spotType: SpotType, response: Record<string, any>) => void
}) {
  const isAllComplete = !currentSpot

  if (isAllComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card variant="elevated" className="text-center max-w-sm shadow-xl">
            <PartyPopper className="w-14 h-14 text-primary-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">모든 활동 완료!</h1>
            <p className="text-sm text-slate-500 mb-5">고생하셨습니다!</p>
            <div className="bg-primary-50 rounded-xl p-3">
              <p className="text-xs text-primary-700 font-medium">
                {project.spotSequence.length}개 활동 · {participants.length}명 참가
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const handleSpotComplete = (responses: any) => {
    if (currentSpot) {
      onComplete(currentSpot, responses || {})
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Offline Banner */}
      {!connected && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[60] bg-red-500 text-white text-center py-1.5 text-xs font-medium"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
        >
          <WifiOff className="w-3 h-3 inline mr-1" /> 연결이 끊어졌습니다. 재연결 중...
        </motion.div>
      )}
      {/* Slim Top Bar */}
      <div className={`fixed ${connected ? 'top-0' : 'top-7'} left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 transition-all`}>
        <div className="max-w-lg mx-auto px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{SPOT_LABELS[currentSpot]?.emoji}</span>
            <span className="text-xs font-semibold text-slate-700">
              {SPOT_LABELS[currentSpot]?.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {project.spotSequence.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i < currentSpotIndex
                    ? 'w-1.5 h-1.5 bg-primary-500'
                    : i === currentSpotIndex
                      ? 'w-5 h-1.5 bg-primary-500'
                      : 'w-1.5 h-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            {connected ? <Wifi className="w-3 h-3 text-accent-500" /> : <WifiOff className="w-3 h-3 text-red-400" />}
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{participants.length}</span>
          </div>
        </div>
      </div>

      <div className="pt-11">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpotIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <SpotRenderer
              spotType={currentSpot}
              participants={participants}
              isPresenter={false}
              onComplete={handleSpotComplete}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// ─── Projector View ───
// ═══════════════════════════════════════════════

function ProjectorView({
  project,
  liveState,
  currentSpot,
  currentSpotIndex,
  participants,
  connected,
  onNextSpot,
}: {
  project: Project
  liveState: SessionLiveState | null
  currentSpot: SpotType | undefined
  currentSpotIndex: number
  participants: Participant[]
  connected: boolean
  onNextSpot: () => void
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  // Phase C: auto-chain between activities. When the current spot fires its
  // onComplete, ActivityFlowController shows a 10s pre-roll countdown and
  // then calls nextSpot() to advance. Reset whenever the index changes.
  const [spotComplete, setSpotComplete] = useState(false)
  useEffect(() => {
    setSpotComplete(false)
  }, [currentSpotIndex])
  const hasNext = currentSpotIndex < project.spotSequence.length - 1
  const nextLabel = hasNext
    ? SPOT_LABELS[project.spotSequence[currentSpotIndex + 1]]?.name
    : undefined

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
      if (e.key === 'Escape') exitFullscreen()
      if (e.key === 'l' || e.key === 'L') setShowLeaderboard((prev) => !prev)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      exitFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
    setIsFullscreen(false)
  }

  if (!currentSpot) {
    return (
      <div className="w-screen h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <PartyPopper className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">모든 활동 완료!</h1>
          <p className="text-xl text-slate-400">FLOW SPOT</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSpotIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full"
        >
          <ActivityFlowController
            isComplete={spotComplete && hasNext}
            onAutoAdvance={() => {
              if (hasNext) onNextSpot()
            }}
            preRollSeconds={10}
            nextActivityLabel={nextLabel}
          >
            <SpotRenderer
              spotType={currentSpot}
              participants={participants}
              isPresenter={true}
              onComplete={() => setSpotComplete(true)}
            />
          </ActivityFlowController>
        </motion.div>
      </AnimatePresence>

      {/* Leaderboard Overlay */}
      <AnimatePresence>
        {showLeaderboard && liveState?.teams && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-black/80 backdrop-blur-lg rounded-2xl p-5 min-w-[280px] border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-bold text-lg">팀 리더보드</h3>
            </div>
            {(['A', 'B', 'C', 'D'] as const)
              .map((teamId) => ({
                teamId,
                score: liveState.teams.scores[teamId] || 0,
                members: (liveState.teams.assignments[teamId] || []).length,
              }))
              .sort((a, b) => b.score - a.score)
              .map((team, idx) => {
                const colors = {
                  A: 'from-red-500 to-red-600',
                  B: 'from-blue-500 to-blue-600',
                  C: 'from-emerald-500 to-emerald-600',
                  D: 'from-purple-500 to-purple-600',
                }
                const medals = ['text-yellow-400', 'text-slate-300', 'text-amber-600', 'text-slate-500']
                return (
                  <div key={team.teamId} className="flex items-center gap-3 mb-2.5 last:mb-0">
                    <span className={`text-lg font-bold ${medals[idx]}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-sm">팀 {team.teamId}</span>
                        <span className="text-white font-bold text-base">{team.score}점</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[team.teamId]} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, team.score)}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{team.members}명</span>
                    </div>
                  </div>
                )
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projector Controls */}
      <div className="fixed bottom-4 left-4 right-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-xl px-4 py-2">
          {connected ? <Wifi className="w-4 h-4 text-accent-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
          <div className="flex items-center gap-1.5 text-white">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{participants.length}명</span>
          </div>
          <span className="text-slate-400 text-sm">
            {currentSpotIndex + 1}/{project.spotSequence.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaderboard((prev) => !prev)}
            className={`backdrop-blur-md px-4 py-2 rounded-xl text-sm transition-colors ${
              showLeaderboard ? 'bg-yellow-500/80 text-white' : 'bg-black/60 text-white hover:bg-black/80'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1.5" />
            {showLeaderboard ? 'L 숨기기' : 'L 리더보드'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm hover:bg-black/80 transition-colors"
          >
            {isFullscreen ? 'ESC 종료' : 'F 전체화면'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// ─── Admin View ───
// ═══════════════════════════════════════════════

function AdminView({
  project,
  liveState,
  participants,
  connected,
  currentSpot,
  currentSpotIndex,
  onLaunchActivity,
  onEndActivity,
  onNextSpot,
  onShuffleSeats,
  onSendAnnouncement,
  onUpdateScore,
}: {
  project: Project
  liveState: SessionLiveState | null
  participants: Participant[]
  connected: boolean
  currentSpot: SpotType | undefined
  currentSpotIndex: number
  onLaunchActivity: (spotType: SpotType, index: number) => void
  onEndActivity: () => void
  onNextSpot: () => void
  onShuffleSeats: () => void
  onSendAnnouncement: (msg: string) => void
  onUpdateScore: (team: TeamId, delta: number) => void
}) {
  const [announcementText, setAnnouncementText] = useState('')

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{project.name}</h1>
            <p className="text-xs text-slate-500">관리자 모드 · 코드: {project.sessionCode}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {connected
                ? <Wifi className="w-4 h-4 text-accent-500" />
                : <WifiOff className="w-4 h-4 text-red-400" />
              }
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold">{participants.length}명</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Activity Sequence */}
        <Card variant="elevated">
          <h2 className="text-sm font-bold text-slate-900 mb-3">활동 순서</h2>
          <div className="space-y-2">
            {project.spotSequence.map((spot, i) => {
              const label = SPOT_LABELS[spot]
              const isCurrent = i === currentSpotIndex
              const isDone = i < currentSpotIndex
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-primary-50 border border-primary-200'
                      : isDone
                        ? 'bg-slate-50 opacity-60'
                        : 'bg-white border border-slate-100'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                    isDone ? 'bg-accent-500 text-white' : isCurrent ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className="text-lg">{label?.emoji}</span>
                  <span className={`text-sm font-medium flex-1 ${isCurrent ? 'text-primary-700' : 'text-slate-700'}`}>
                    {label?.name}
                  </span>
                  {isCurrent && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onLaunchActivity(spot, i)}
                    >
                      시작
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="elevated">
            <h3 className="text-sm font-bold text-slate-900 mb-3">세션 제어</h3>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="primary"
                fullWidth
                onClick={onNextSpot}
                disabled={currentSpotIndex >= project.spotSequence.length - 1}
              >
                다음 활동 →
              </Button>
              <Button size="sm" variant="outline" fullWidth onClick={onEndActivity}>
                현재 활동 종료
              </Button>
              <Button size="sm" variant="secondary" fullWidth onClick={onShuffleSeats}>
                자리 섞기 🔀
              </Button>
            </div>
          </Card>

          <Card variant="elevated">
            <h3 className="text-sm font-bold text-slate-900 mb-3">팀 점수</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((team) => (
                <div key={team} className="text-center bg-slate-50 rounded-xl p-2">
                  <p className="text-xs font-semibold text-slate-500">팀 {team}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {liveState?.teams?.scores?.[team] || 0}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => onUpdateScore(team, 10)}
                      className="flex-1 text-xs bg-accent-100 text-accent-700 rounded py-0.5 hover:bg-accent-200"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => onUpdateScore(team, -10)}
                      className="flex-1 text-xs bg-red-100 text-red-700 rounded py-0.5 hover:bg-red-200"
                    >
                      -10
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Leaderboard scores={liveState?.teams?.scores || { A: 0, B: 0, C: 0, D: 0 }} />

        {/* Announcement */}
        <Card variant="elevated">
          <h3 className="text-sm font-bold text-slate-900 mb-3">공지</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="input-base flex-1 text-sm !py-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && announcementText.trim()) {
                  onSendAnnouncement(announcementText.trim())
                  setAnnouncementText('')
                }
              }}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (announcementText.trim()) {
                  onSendAnnouncement(announcementText.trim())
                  setAnnouncementText('')
                }
              }}
            >
              전송
            </Button>
          </div>
        </Card>

        {/* Participants List */}
        <Card variant="elevated">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            참가자 ({participants.length}명)
          </h3>
          {participants.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">대기 중...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => (
                <div key={p.id} className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 truncate">{p.organization || p.title}</p>
                  {p.team && (
                    <span className="text-xs font-semibold text-primary-600">팀 {p.team}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// ─── Leaderboard ───
// ═══════════════════════════════════════════════

const TEAM_MEDAL = ['🥇', '🥈', '🥉', '4️⃣']
const TEAM_BG: Record<string, string> = {
  A: 'bg-primary-50 border-primary-200',
  B: 'bg-secondary-50 border-secondary-200',
  C: 'bg-accent-50 border-accent-200',
  D: 'bg-violet-50 border-violet-200',
}

function Leaderboard({
  scores,
  variant = 'light',
}: {
  scores: Record<string, number>
  variant?: 'light' | 'dark'
}) {
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])

  if (variant === 'dark') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">리더보드</h3>
        </div>
        <div className="space-y-2">
          {ranked.map(([team, score], i) => (
            <motion.div
              key={team}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-xl">{TEAM_MEDAL[i] || ''}</span>
              <span className="text-white font-bold flex-1">팀 {team}</span>
              <span className="text-2xl font-black text-white tabular-nums">{score}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card variant="elevated">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900">리더보드</h3>
      </div>
      <div className="space-y-2">
        {ranked.map(([team, score], i) => (
          <div
            key={team}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${TEAM_BG[team] || 'bg-slate-50 border-slate-200'}`}
          >
            <span className="text-lg">{TEAM_MEDAL[i] || ''}</span>
            <span className="text-sm font-bold text-slate-800 flex-1">팀 {team}</span>
            <span className="text-lg font-black text-slate-900 tabular-nums">{score}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════
// ─── Spot Renderer ───
// ═══════════════════════════════════════════════

function SpotRenderer({
  spotType,
  participants,
  isPresenter,
  onComplete,
}: {
  spotType: SpotType
  participants: Participant[]
  isPresenter: boolean
  onComplete: (responses: any) => void
}) {
  switch (spotType) {
    case 'manner':
      return <MannerMode duration={30} onComplete={onComplete} isPresenter={isPresenter} />
    case 'stretch':
      return <StretchActivity duration={90} onComplete={onComplete} isPresenter={isPresenter} />
    case 'greeting':
      return <GreetingRole duration={45} participants={participants} onComplete={onComplete} isPresenter={isPresenter} />
    case 'ground-rules':
      return <GroundRules duration={60} onComplete={onComplete} isPresenter={isPresenter} />
    case 'mini-games':
      return <MiniGames duration={120} onComplete={onComplete} isPresenter={isPresenter} />
    case 'self-intro':
      return <SelfIntroduction duration={120} onComplete={onComplete} isPresenter={isPresenter} />
    case 'cafe-order':
      return <CafeOrder duration={180} onComplete={onComplete} isPresenter={isPresenter} />
    // Phase A
    case 'greeting-circle':
      return <GreetingCircle duration={60} onComplete={onComplete} isPresenter={isPresenter} />
    case 'mirror-stretch':
      return <MirrorStretch duration={30} onComplete={onComplete} isPresenter={isPresenter} />
    // Phase B
    case 'intro-relay':
      return <IntroRelay duration={30} participants={participants.map((p) => p.name)} onComplete={onComplete} isPresenter={isPresenter} />
    case 'role-roulette':
      return <RoleRoulette participants={participants.map((p) => p.name)} onComplete={onComplete} isPresenter={isPresenter} />
    case 'body-games':
      return <BodyGames duration={120} onComplete={onComplete} isPresenter={isPresenter} />
    case 'rule-ritual':
      return <RuleRitual duration={10} onComplete={onComplete} isPresenter={isPresenter} />
    case 'cafe-break':
      return <CafeBreak duration={60} participants={participants.map((p) => p.name)} onComplete={onComplete} isPresenter={isPresenter} />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card variant="elevated" className="text-center">
            <p className="text-slate-500">지원되지 않는 활동: {spotType}</p>
          </Card>
        </div>
      )
  }
}
