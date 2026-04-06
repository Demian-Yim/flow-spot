'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { PageSkeleton, CardSkeleton } from '@/components/ui/Skeleton'
import { useFirestore } from '@/hooks/useFirestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { where } from 'firebase/firestore'
import { QRCodeSVG } from 'qrcode.react'
import {
  LogOut,
  Plus,
  Copy,
  Check,
  Eye,
  RefreshCw,
  AlertTriangle,
  Users,
  Zap,
  Clock,
  FolderOpen,
  X,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Project {
  id: string
  name: string
  instructorId: string
  sessionCode: string
  createdAt: string
  spotSequence: string[]
  status: 'draft' | 'active' | 'completed'
}

interface Session {
  id: string
  projectId: string
  sessionCode: string
  instructorId: string
  currentSpotIndex: number
  participantCount: number
  status: 'waiting' | 'active' | 'completed'
  createdAt: string
}

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
  draft: { variant: 'neutral', label: '준비 중' },
  active: { variant: 'success', label: '진행 중' },
  completed: { variant: 'info', label: '완료' },
  waiting: { variant: 'warning', label: '대기 중' },
}

function formatRelativeDate(isoDate: string): string {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 30) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR')
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const { createDocument, queryDocuments } = useFirestore()
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        loadProjects(currentUser.uid)
      } else {
        router.push('/admin')
      }
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadProjects = async (instructorId: string) => {
    if (!hasLoadedOnce.current) {
      setInitialLoading(true)
    }
    setLoadError(null)
    try {
      const projectData = await queryDocuments<Project>('projects', [
        where('instructorId', '==', instructorId),
      ])
      setProjects(projectData)

      if (projectData.length > 0) {
        const sessionData = await queryDocuments<Session>('sessions', [
          where('instructorId', '==', instructorId),
        ])
        setSessions(sessionData)
      } else {
        setSessions([])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '데이터 로드 실패'
      console.error('Failed to load projects:', err)
      setLoadError(message)
    } finally {
      setInitialLoading(false)
      hasLoadedOnce.current = true
    }
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setCreateError('세션 이름을 입력해주세요.')
      return
    }
    if (!user) {
      setCreateError('로그인이 필요합니다. 페이지를 새로고침해주세요.')
      return
    }

    setCreateError(null)
    setCreating(true)

    const projectId = uuidv4()
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const now = new Date().toISOString()

    const newProject: Project = {
      id: projectId,
      name: projectName.trim(),
      instructorId: user.uid,
      sessionCode,
      createdAt: now,
      spotSequence: ['manner', 'stretch', 'greeting', 'ground-rules', 'mini-games'],
      status: 'draft',
    }

    const sessionId = uuidv4()
    const newSession: Session = {
      id: sessionId,
      projectId,
      sessionCode,
      instructorId: user.uid,
      currentSpotIndex: 0,
      participantCount: 0,
      status: 'waiting',
      createdAt: now,
    }

    try {
      const projectResult = await createDocument('projects', projectId, newProject)
      if (!projectResult.success) {
        setCreateError('프로젝트 생성 실패: ' + (projectResult.errorMessage || '알 수 없는 오류'))
        setCreating(false)
        return
      }

      const sessionResult = await createDocument('sessions', sessionId, newSession)
      if (!sessionResult.success) {
        setCreateError('세션 생성 실패: ' + (sessionResult.errorMessage || '알 수 없는 오류'))
        setCreating(false)
        return
      }

      // Update local state directly (no full reload needed)
      setProjects((prev) => [...prev, newProject])
      setSessions((prev) => [...prev, newSession])
      setProjectName('')
      setShowNewProject(false)
      setCreateError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      setCreateError('오류: ' + message)
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getAppUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return process.env.NEXT_PUBLIC_APP_URL || ''
  }

  // --- Loading State ---
  if (initialLoading) {
    return <PageSkeleton />
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                FLOW SPOT
              </span>
            </div>

            {/* Right side: user + actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="neutral" className="hidden sm:inline-flex">
                {user?.email}
              </Badge>
              <Button
                onClick={() => user && loadProjects(user.uid)}
                variant="ghost"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                aria-label="새로고침"
              >
                <span className="hidden sm:inline">새로고침</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                aria-label="로그아웃"
              >
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Banner */}
        <AnimatePresence>
          {loadError && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-6"
            >
              <Card variant="outlined" className="border-red-200 bg-red-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-800 text-sm">데이터 로드 오류</p>
                    <p className="text-sm text-red-600 mt-0.5 break-words">{loadError}</p>
                  </div>
                  <Button
                    onClick={() => user && loadProjects(user.uid)}
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="flex-shrink-0"
                  >
                    다시 시도
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Header + Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">내 세션</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {projects.length > 0
                ? `총 ${projects.length}개의 세션`
                : '새 세션을 만들어 시작하세요'}
            </p>
          </div>
          {!showNewProject && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                onClick={() => setShowNewProject(true)}
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
              >
                새 세션
              </Button>
            </motion.div>
          )}
        </div>

        {/* Slide-down Create Panel */}
        <AnimatePresence>
          {showNewProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden mb-6"
            >
              <Card variant="elevated" className="relative">
                {/* Close button */}
                <button
                  onClick={() => {
                    setShowNewProject(false)
                    setProjectName('')
                    setCreateError(null)
                  }}
                  disabled={creating}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg font-bold text-slate-900 mb-1">새 세션 만들기</h3>
                <p className="text-sm text-slate-500 mb-5">
                  세션을 생성하면 참가자 코드가 자동으로 발급됩니다.
                </p>

                {createError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 break-words">
                      {createError}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="예) 팀 빌딩 교육"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && projectName.trim() && !creating) {
                          handleCreateProject()
                        }
                      }}
                      disabled={creating}
                      leftIcon={<FolderOpen className="w-4 h-4" />}
                    />
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      onClick={handleCreateProject}
                      variant="primary"
                      disabled={!projectName.trim() || creating}
                      loading={creating}
                      className="flex-1 sm:flex-initial"
                    >
                      만들기
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewProject(false)
                        setProjectName('')
                        setCreateError(null)
                      }}
                      variant="outline"
                      disabled={creating}
                      className="flex-1 sm:flex-initial"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {projects.length === 0 && !loadError && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="outlined" className="text-center py-16 sm:py-20 border-dashed border-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                <FolderOpen className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1.5">
                아직 세션이 없습니다
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                첫 세션을 만들어 팀 빌딩 활동을 시작하세요. 참가자 코드가 자동으로 생성됩니다.
              </p>
              <Button
                onClick={() => setShowNewProject(true)}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                첫 세션 만들기
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {projects.map((project, idx) => {
              const session = sessions.find((s) => s.projectId === project.id)
              const code = session?.sessionCode || project.sessionCode
              const isCopied = copiedCode === code
              const sessionStatus = session?.status || project.status
              const config = statusConfig[sessionStatus] || statusConfig.draft

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                >
                  <Card variant="elevated" className="h-full flex flex-col">
                    {/* Card Top: Title + Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-bold text-slate-900 break-words leading-snug flex-1">
                        {project.name}
                      </h3>
                      <Badge variant={config.variant} showDot className="flex-shrink-0">
                        {config.label}
                      </Badge>
                    </div>

                    {/* Meta line: date */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeDate(project.createdAt)}</span>
                    </div>

                    {/* Session Code Pill */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-500 mb-2">참가 코드</p>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="group inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-150"
                        title="클릭하여 복사"
                      >
                        <code className="text-lg font-bold text-primary-600 tabular-nums tracking-widest">
                          {code}
                        </code>
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        )}
                      </button>
                      {isCopied && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-emerald-600 mt-1.5 ml-1"
                        >
                          클립보드에 복사됨
                        </motion.p>
                      )}
                    </div>

                    {/* Compact Stats */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">
                            {session?.participantCount || 0}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">참가자</span>
                        </div>
                      </div>
                      <div className="w-px h-5 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">
                            {project.spotSequence.length}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">활동</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => router.push(`/admin/project/${project.id}`)}
                        variant="secondary"
                        size="md"
                        fullWidth
                        icon={<Eye className="w-4 h-4" />}
                      >
                        세션 관리
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
