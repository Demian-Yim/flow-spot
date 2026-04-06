'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useFirestore } from '@/hooks/useFirestore'
import { where } from 'firebase/firestore'
import { ArrowLeft, Download, Users, Trophy, BarChart3, FileText, Printer } from 'lucide-react'
import { SPOT_LABELS, SpotType, TeamId, Participant, CafeOrder, SessionEvent } from '@/types'

interface Project {
  id: string
  name: string
  spotSequence: SpotType[]
  sessionCode: string
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<SessionEvent[]>([])
  const [cafeOrders, setCafeOrders] = useState<CafeOrder[]>([])
  const [loading, setLoading] = useState(true)

  const { getDocument, queryDocuments } = useFirestore()

  useEffect(() => {
    Promise.all([
      getDocument<Project>('projects', projectId),
      queryDocuments<Participant>('participants', [where('projectId', '==', projectId)]),
      queryDocuments<SessionEvent>('sessionEvents', [where('sessionId', '==', `live-${projectId}`)]),
      queryDocuments<CafeOrder>('cafeOrders', [where('sessionId', '==', `live-${projectId}`)]),
    ]).then(([proj, parts, evts, orders]) => {
      if (proj) setProject(proj)
      setParticipants(parts)
      setEvents(evts)
      setCafeOrders(orders)
      setLoading(false)
    })
  }, [projectId, getDocument, queryDocuments])

  // ─── CSV Export ───
  const exportParticipantsCSV = useCallback(() => {
    const headers = ['이름', '소속', '호칭', '팀', '역할', '상태']
    const rows = participants.map((p) => [
      p.name, p.organization, p.title, p.team || '', p.role || '', p.status,
    ])
    downloadCSV(headers, rows, `${project?.name || 'session'}-participants.csv`)
  }, [participants, project])

  const exportOrdersCSV = useCallback(() => {
    const headers = ['참가자', '메뉴', '수량']
    const rows: string[][] = []
    cafeOrders.forEach((order) => {
      order.items.forEach((item) => {
        rows.push([order.participantName, item.name, String(item.quantity)])
      })
    })
    downloadCSV(headers, rows, `${project?.name || 'session'}-orders.csv`)
  }, [cafeOrders, project])

  const exportResponsesCSV = useCallback(() => {
    const responseEvents = events.filter((e) => e.type === 'PARTICIPANT_RESPONSE')
    const headers = ['참가자ID', '활동', '응답', '시간']
    const rows = responseEvents.map((e) => [
      e.data.participantId || '',
      e.data.spotType || '',
      JSON.stringify(e.data.response || {}),
      e.createdAt ? new Date(String(e.createdAt)).toLocaleString('ko-KR') : '',
    ])
    downloadCSV(headers, rows, `${project?.name || 'session'}-responses.csv`)
  }, [events, project])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <Card variant="elevated" className="text-center">
          <p className="text-slate-500">프로젝트를 찾을 수 없습니다</p>
        </Card>
      </div>
    )
  }

  // ─── Stats ───
  const responseEvents = events.filter((e) => e.type === 'PARTICIPANT_RESPONSE')
  const scoreEvents = events.filter((e) => e.type === 'SCORE_UPDATE')
  const lastScoreEvent = scoreEvents[scoreEvents.length - 1]
  const teamScores: Record<TeamId, number> = lastScoreEvent?.data?.scores || { A: 0, B: 0, C: 0, D: 0 }

  const totalOrderItems = cafeOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0),
    0
  )

  // Order aggregation
  const orderAgg: Record<string, { emoji: string; count: number }> = {}
  cafeOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!orderAgg[item.name]) orderAgg[item.name] = { emoji: item.emoji, count: 0 }
      orderAgg[item.name].count += item.quantity
    })
  })
  const topOrders = Object.entries(orderAgg)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/project/${projectId}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-slate-900 truncate">{project.name} — 결과</h1>
          <div className="ml-auto flex gap-2">
            <Badge variant="info">{participants.length}명 참가</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card variant="elevated" className="text-center">
            <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{participants.length}</p>
            <p className="text-xs text-slate-500">참가자</p>
          </Card>
          <Card variant="elevated" className="text-center">
            <BarChart3 className="w-6 h-6 text-secondary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{project.spotSequence.length}</p>
            <p className="text-xs text-slate-500">활동 수</p>
          </Card>
          <Card variant="elevated" className="text-center">
            <FileText className="w-6 h-6 text-accent-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{responseEvents.length}</p>
            <p className="text-xs text-slate-500">응답 수</p>
          </Card>
          <Card variant="elevated" className="text-center">
            <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{cafeOrders.length}</p>
            <p className="text-xs text-slate-500">카페 주문</p>
          </Card>
        </div>

        {/* Team Scores */}
        <Card variant="default">
          <h2 className="text-lg font-bold text-slate-900 mb-4">팀 점수</h2>
          <div className="grid grid-cols-4 gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((team) => {
              const score = teamScores[team] || 0
              const maxScore = Math.max(...Object.values(teamScores), 1)
              return (
                <div key={team} className="text-center">
                  <div className="h-24 bg-slate-100 rounded-xl relative overflow-hidden mb-2 flex items-end justify-center">
                    <motion.div
                      className="bg-primary-500 rounded-t-lg w-full"
                      initial={{ height: 0 }}
                      animate={{ height: `${(score / maxScore) * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    />
                  </div>
                  <p className="text-lg font-bold text-slate-900">{score}</p>
                  <p className="text-xs text-slate-500">팀 {team}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Activity Breakdown */}
        <Card variant="default">
          <h2 className="text-lg font-bold text-slate-900 mb-4">활동별 응답</h2>
          <div className="space-y-3">
            {project.spotSequence.map((spot, i) => {
              const info = SPOT_LABELS[spot]
              const spotResponses = responseEvents.filter((e) => e.data.spotType === spot)
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                  <span className="text-lg">{info?.emoji}</span>
                  <span className="text-sm font-medium text-slate-700 flex-1">{info?.name}</span>
                  <Badge variant="neutral">{spotResponses.length}건</Badge>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Cafe Orders Summary */}
        {cafeOrders.length > 0 && (
          <Card variant="default">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              카페 주문 집계 ({totalOrderItems}개)
            </h2>
            <div className="space-y-2">
              {topOrders.map(([name, { emoji, count }]) => (
                <div key={name} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm text-slate-700 flex-1">{name}</span>
                  <span className="text-sm font-bold text-primary-600">{count}개</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Export */}
        <Card variant="elevated" className="no-print">
          <h2 className="text-lg font-bold text-slate-900 mb-4">데이터 내보내기</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="primary"
              size="md"
              icon={<Printer className="w-4 h-4" />}
              fullWidth
              onClick={() => window.print()}
            >
              PDF 저장
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Download className="w-4 h-4" />}
              fullWidth
              onClick={exportParticipantsCSV}
            >
              참가자 CSV
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Download className="w-4 h-4" />}
              fullWidth
              onClick={exportResponsesCSV}
            >
              응답 CSV
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Download className="w-4 h-4" />}
              fullWidth
              onClick={exportOrdersCSV}
              disabled={cafeOrders.length === 0}
            >
              주문 CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── CSV Helper ───

function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const BOM = '\uFEFF'
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
