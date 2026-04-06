'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { TEAM_ROLES, TeamRoleDef } from '@/lib/spot-data'
import { TeamId, TeamRole } from '@/types'
import { Shuffle, Users } from 'lucide-react'

interface GreetingRoleProps {
  duration?: number
  onComplete?: (data: any) => void
  isPresenter?: boolean
  participants?: Array<{ id: string; name: string; team?: TeamId }>
}

type Phase = 'team-assign' | 'role-assign' | 'done'

const TEAM_COLORS: Record<TeamId, { bg: string; border: string; text: string; light: string }> = {
  A: { bg: 'bg-primary-500', border: 'border-primary-300', text: 'text-primary-700', light: 'bg-primary-50' },
  B: { bg: 'bg-secondary-500', border: 'border-secondary-300', text: 'text-secondary-700', light: 'bg-secondary-50' },
  C: { bg: 'bg-accent-500', border: 'border-accent-300', text: 'text-accent-700', light: 'bg-accent-50' },
  D: { bg: 'bg-violet-500', border: 'border-violet-300', text: 'text-violet-700', light: 'bg-violet-50' },
}

const GreetingRole: React.FC<GreetingRoleProps> = ({
  duration = 60,
  onComplete,
  isPresenter = false,
  participants = [],
}) => {
  const [phase, setPhase] = useState<Phase>('team-assign')
  const [teamAssignments, setTeamAssignments] = useState<Record<TeamId, string[]>>({ A: [], B: [], C: [], D: [] })
  const [roleAssignments, setRoleAssignments] = useState<Record<string, TeamRole>>({})
  const [isComplete, setIsComplete] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const teamIds: TeamId[] = ['A', 'B', 'C', 'D']

  const handleShuffleTeams = () => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const teams: Record<TeamId, string[]> = { A: [], B: [], C: [], D: [] }
    shuffled.forEach((p, i) => {
      teams[teamIds[i % 4]].push(p.id)
    })
    setTeamAssignments(teams)
    playSound('success')
  }

  const handleAssignRole = (participantId: string, role: TeamRole) => {
    setRoleAssignments({ ...roleAssignments, [participantId]: role })
    playSound('click')
  }

  const handleNextPhase = () => {
    if (phase === 'team-assign') {
      setPhase('role-assign')
      playSound('click')
    } else {
      finishSpot()
    }
  }

  const finishSpot = () => {
    setIsComplete(true)
    playCelebrateSound()
    onComplete?.({ teamAssignments, roleAssignments })
  }

  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name || id

  const hasTeams = Object.values(teamAssignments).some((arr) => arr.length > 0)

  // ─── Presenter Content ───
  const presenterContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {teamIds.map((team) => {
          const colors = TEAM_COLORS[team]
          const members = teamAssignments[team] || []
          return (
            <div key={team} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className={`${colors.bg} text-white rounded-lg px-3 py-1.5 text-center mb-3`}>
                <span className="font-bold">팀 {team}</span>
              </div>
              <div className="space-y-1.5">
                {members.length > 0 ? members.map((id) => (
                  <div key={id} className="text-sm text-slate-200 bg-white/5 rounded-lg px-3 py-1.5">
                    {getParticipantName(id)}
                    {roleAssignments[id] && (
                      <span className="text-xs text-slate-400 ml-1">
                        ({TEAM_ROLES.find((r) => r.id === roleAssignments[id])?.icon})
                      </span>
                    )}
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 text-center py-2">비어있음</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Roles legend */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-6">
        {TEAM_ROLES.map((role) => (
          <div key={role.id} className="flex items-center gap-2 text-slate-300">
            <span className="text-xl">{role.icon}</span>
            <span className="text-sm">{role.name}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // ─── Participant Content ───
  const participantContent = (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {participants.length === 0 ? (
        <Card variant="elevated" className="text-center shadow-lg">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">참가자가 없습니다</p>
          <p className="text-slate-400 text-xs mt-1">참가자가 접속하면 팀을 배정할 수 있습니다</p>
        </Card>
      ) : phase === 'team-assign' ? (
        <Card variant="elevated" className="shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">팀 배정</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShuffleTeams}
              icon={<Shuffle className="w-3.5 h-3.5" />}
            >
              자동 섞기
            </Button>
          </div>

          {/* Team preview */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {teamIds.map((team) => {
              const colors = TEAM_COLORS[team]
              const members = teamAssignments[team] || []
              return (
                <div key={team} className={`${colors.light} border ${colors.border} rounded-xl p-3`}>
                  <p className={`text-xs font-bold ${colors.text} mb-1.5`}>팀 {team}</p>
                  {members.length > 0 ? (
                    <div className="space-y-1">
                      {members.map((id) => (
                        <p key={id} className="text-xs text-slate-700 truncate">
                          {getParticipantName(id)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">비어있음</p>
                  )}
                </div>
              )
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNextPhase}
            disabled={!hasTeams}
          >
            {hasTeams ? '역할 배정으로 →' : '먼저 팀을 배정하세요'}
          </Button>
        </Card>
      ) : (
        <Card variant="elevated" className="shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">역할 배정</h3>
            <button
              onClick={() => setPhase('team-assign')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              ← 팀 배정
            </button>
          </div>

          {/* Role selection per team */}
          {teamIds.map((team) => {
            const colors = TEAM_COLORS[team]
            const members = teamAssignments[team] || []
            if (members.length === 0) return null
            return (
              <div key={team} className="mb-4">
                <p className={`text-xs font-bold ${colors.text} mb-2`}>팀 {team}</p>
                <div className="space-y-2">
                  {members.map((id) => (
                    <div key={id} className="flex items-center gap-2">
                      <span className="text-sm text-slate-700 w-20 truncate">
                        {getParticipantName(id)}
                      </span>
                      <div className="flex gap-1 flex-1">
                        {TEAM_ROLES.map((role) => (
                          <motion.button
                            key={role.id}
                            onClick={() => handleAssignRole(id, role.id as TeamRole)}
                            className={`flex-1 text-center py-1.5 rounded-lg text-xs transition-all ${
                              roleAssignments[id] === role.id
                                ? 'bg-primary-100 border border-primary-300 text-primary-700'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="block text-base">{role.icon}</span>
                            <span className="block text-[10px]">{role.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <Button variant="primary" size="lg" fullWidth onClick={finishSpot}>
            역할 배정 완료!
          </Button>
        </Card>
      )}
    </motion.div>
  )

  return (
    <SpotLayout
      title="팀 빌딩"
      subtitle="TEAM BUILDING"
      progress={{ current: phase === 'team-assign' ? 1 : 2, total: 2 }}
      duration={duration}
      onTimerComplete={finishSpot}
      isComplete={isComplete}
      completionEmoji="🎭"
      completionTitle="팀 빌딩 완료!"
      completionMessage="팀 배정과 역할이 모두 정해졌습니다!"
      completionDetail="이제 팀에서 함께 활동합시다!"
      theme="purple"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default GreetingRole
