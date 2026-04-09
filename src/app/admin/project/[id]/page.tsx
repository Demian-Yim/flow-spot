'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useFirestore } from '@/hooks/useFirestore'
import { where } from 'firebase/firestore'
import { QRCodeSVG } from 'qrcode.react'
import { Play, Users, ArrowLeft, Copy, Settings, Check, Plus, Trash2, ChevronUp, ChevronDown, Monitor, Smartphone, BarChart3, Pencil, Files, AlertTriangle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { SPOT_LABELS, SpotType } from '@/types'

interface Project {
  id: string
  name: string
  instructorId: string
  sessionCode: string
  spotSequence: SpotType[]
  status: 'draft' | 'active' | 'completed'
}

interface Participant {
  id: string
  name: string
  organization: string
  title: string
  joinedAt: string
  status: 'active' | 'inactive'
}

interface Session {
  id: string
  projectId: string
  sessionCode: string
  currentSpotIndex: number
  status: string
  createdAt: string
}

// Phase C: Only the 7 NEW (cinematic V2) spots are selectable. The legacy
// text-heavy spot types ('manner', 'stretch', 'greeting', 'ground-rules',
// 'mini-games', 'self-intro', 'cafe-order') are intentionally retired from
// the host selection UI. Their components and SpotRenderer switch cases
// remain intact so any pre-existing sessions/projects keep rendering.
const ALL_SPOT_TYPES: SpotType[] = [
  'greeting-circle',
  'mirror-stretch',
  'intro-relay',
  'role-roulette',
  'body-games',
  'rule-ritual',
  'cafe-break',
]

const statusMap: Record<string, { label: string; variant: 'neutral' | 'info' | 'success' | 'warning' }> = {
  waiting: { label: '대기 중', variant: 'neutral' },
  active: { label: '진행 중', variant: 'info' },
  completed: { label: '완료', variant: 'success' },
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editSequence, setEditSequence] = useState<SpotType[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  const { getDocument, subscribeToQuery, updateDocument, deleteDocument, createDocument } = useFirestore()

  useEffect(() => {
    getDocument<Project>('projects', projectId).then((data) => {
      if (data) setProject(data)
      setLoading(false)
    })

    const unsubSession = subscribeToQuery<Session>(
      'sessions',
      [where('projectId', '==', projectId)],
      (sessions) => { if (sessions.length > 0) setSession(sessions[0]) }
    )

    const unsubParticipants = subscribeToQuery<Participant>(
      'participants',
      [where('projectId', '==', projectId)],
      setParticipants
    )

    return () => { unsubSession(); unsubParticipants() }
  }, [projectId, getDocument, subscribeToQuery])

  const handleRename = async () => {
    if (!newName.trim() || !project) return
    const ok = await updateDocument('projects', projectId, { name: newName.trim() })
    if (ok) {
      setProject({ ...project, name: newName.trim() })
      setEditingName(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    // Delete session first, then project
    if (session) await deleteDocument('sessions', session.id)
    const ok = await deleteDocument('projects', projectId)
    if (ok) router.push('/admin/dashboard')
  }

  const handleDuplicate = async () => {
    if (!project || duplicating) return
    setDuplicating(true)
    const newId = uuidv4()
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const now = new Date().toISOString()

    const newProject = {
      ...project,
      id: newId,
      name: `${project.name} (복사본)`,
      sessionCode: newCode,
      createdAt: now,
      status: 'draft' as const,
    }

    const newSession = {
      id: uuidv4(),
      projectId: newId,
      sessionCode: newCode,
      instructorId: project.instructorId,
      currentSpotIndex: 0,
      participantCount: 0,
      status: 'waiting',
      createdAt: now,
    }

    const r1 = await createDocument('projects', newId, newProject)
    if (r1.success) {
      await createDocument('sessions', newSession.id, newSession)
      router.push(`/admin/project/${newId}`)
    }
    setDuplicating(false)
  }

  const getAppUrl = () => typeof window !== 'undefined' ? window.location.origin : ''

  const copyCode = () => {
    navigator.clipboard.writeText(session?.sessionCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <PageSkeleton />

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <Card variant="elevated" className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-2">프로젝트를 찾을 수 없습니다</h1>
          <p className="text-slate-500 text-sm mb-4">삭제되었거나 잘못된 링크입니다.</p>
          <Button onClick={() => router.push('/admin/dashboard')} variant="primary">
            대시보드로 돌아가기
          </Button>
        </Card>
      </div>
    )
  }

  const sessionStatus = statusMap[session?.status || 'waiting']

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">대시보드</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          {editingName ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
                className="input-base text-sm !py-1.5 flex-1 min-w-0"
                autoFocus
              />
              <button onClick={handleRename} className="text-xs text-accent-600 font-medium whitespace-nowrap">저장</button>
              <button onClick={() => setEditingName(false)} className="text-xs text-slate-500 font-medium whitespace-nowrap">취소</button>
            </div>
          ) : (
            <button
              onClick={() => { setNewName(project.name); setEditingName(true) }}
              className="font-bold text-slate-900 truncate flex items-center gap-1.5 hover:text-primary-700 transition-colors group"
              title="이름 편집"
            >
              {project.name}
              <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={sessionStatus.variant} showDot={session?.status === 'active'}>
              {sessionStatus.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push(`/session/${projectId}?mode=admin`)}
              variant="primary"
              size="lg"
              icon={<Play className="w-5 h-5" />}
            >
              관리자 모드
            </Button>
            <Button
              onClick={() => window.open(`/session/${projectId}?mode=projector`, '_blank', 'width=1920,height=1080')}
              variant="secondary"
              size="lg"
              icon={<Monitor className="w-5 h-5" />}
            >
              프로젝터
            </Button>
            <Button
              onClick={() => router.push(`/session/${projectId}?mode=participant`)}
              variant="outline"
              size="lg"
              icon={<Smartphone className="w-5 h-5" />}
            >
              참가자 미리보기
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Activity Sequence */}
            <Card variant="default">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  활동 순서
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{project.spotSequence.length}개</span>
                  {!editing ? (
                    <button
                      onClick={() => { setEditing(true); setEditSequence([...project.spotSequence]) }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      편집
                    </button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={async () => {
                          await updateDocument('projects', projectId, { spotSequence: editSequence })
                          setProject({ ...project, spotSequence: editSequence })
                          setEditing(false)
                        }}
                        className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {(editing ? editSequence : project.spotSequence).map((spot, index) => {
                  const isCurrent = !editing && session?.currentSpotIndex === index
                  const info = SPOT_LABELS[spot] || { name: spot, emoji: '📌', description: '' }
                  return (
                    <div
                      key={`${spot}-${index}`}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        isCurrent
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isCurrent ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-lg mr-1">{info.emoji}</span>
                      <span className={`font-medium flex-1 ${isCurrent ? 'text-primary-700' : 'text-slate-700'}`}>
                        {info.name}
                      </span>
                      {isCurrent && (
                        <Badge variant="info" showDot>진행 중</Badge>
                      )}
                      {editing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (index === 0) return
                              const arr = [...editSequence]
                              ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
                              setEditSequence(arr)
                            }}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => {
                              if (index === editSequence.length - 1) return
                              const arr = [...editSequence]
                              ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
                              setEditSequence(arr)
                            }}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                            disabled={index === editSequence.length - 1}
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => setEditSequence(editSequence.filter((_, i) => i !== index))}
                            className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add activity button */}
              {editing && (
                <div className="mt-3 relative">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">활동 추가</span>
                  </button>
                  {showAddMenu && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-2 space-y-1">
                      {ALL_SPOT_TYPES.map((type) => {
                        const info = SPOT_LABELS[type]
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              setEditSequence([...editSequence, type])
                              setShowAddMenu(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left"
                          >
                            <span className="text-lg">{info.emoji}</span>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{info.name}</p>
                              <p className="text-xs text-slate-500">{info.description}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Participants */}
            {participants.length > 0 && (
              <Card variant="default" noPadding>
                <div className="p-5 sm:p-6 pb-0">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-slate-400" />
                    참가자 ({participants.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-5 sm:px-6 font-medium text-slate-500">이름</th>
                        <th className="text-left py-3 px-5 sm:px-6 font-medium text-slate-500">소속</th>
                        <th className="text-left py-3 px-5 sm:px-6 font-medium text-slate-500 hidden sm:table-cell">호칭</th>
                        <th className="text-left py-3 px-5 sm:px-6 font-medium text-slate-500">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 sm:px-6 font-medium text-slate-900">{p.name}</td>
                          <td className="py-3 px-5 sm:px-6 text-slate-600">{p.organization}</td>
                          <td className="py-3 px-5 sm:px-6 text-slate-600 hidden sm:table-cell">{p.title}</td>
                          <td className="py-3 px-5 sm:px-6">
                            <Badge variant={p.status === 'active' ? 'success' : 'neutral'} showDot={p.status === 'active'}>
                              {p.status === 'active' ? '참가 중' : '비활성'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* QR & Code */}
            <Card variant="elevated">
              <h3 className="text-sm font-medium text-slate-500 mb-3">참가 코드</h3>
              <div className="flex items-center gap-2 mb-4">
                <code className="text-2xl font-bold text-primary-600 tracking-wider tabular-nums">
                  {session?.sessionCode}
                </code>
                <button
                  onClick={copyCode}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="복사"
                >
                  {copied ? <Check className="w-4 h-4 text-accent-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 flex justify-center">
                <QRCodeSVG
                  value={`${getAppUrl()}/join/${session?.sessionCode || ''}`}
                  size={160}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-slate-400 text-center mt-3">QR 코드를 스캔하여 참가</p>
            </Card>

            {/* Results Link */}
            <Card variant="interactive" onClick={() => router.push(`/admin/project/${projectId}/results`)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">결과 & 분석</p>
                  <p className="text-xs text-slate-500">응답 확인 · CSV 내보내기</p>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card variant="default">
              <h3 className="text-sm font-medium text-slate-500 mb-3">세션 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">참가자</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">{participants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">활동 수</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">{project.spotSequence.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">현재 활동</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">{(session?.currentSpotIndex || 0) + 1}</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card variant="default">
              <h3 className="text-sm font-medium text-slate-500 mb-3">세션 관리</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Files className="w-4 h-4" />}
                  onClick={handleDuplicate}
                  loading={duplicating}
                >
                  세션 복제
                </Button>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="!text-red-500 !border-red-200 hover:!bg-red-50"
                  >
                    세션 삭제
                  </Button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <p className="text-xs font-medium">정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" className="flex-1 !bg-red-500 hover:!bg-red-600" onClick={handleDelete}>
                        삭제
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
