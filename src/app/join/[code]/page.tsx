'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { FormSkeleton } from '@/components/ui/Skeleton'
import { useFirestore } from '@/hooks/useFirestore'
import { v4 as uuidv4 } from 'uuid'
import { where } from 'firebase/firestore'
import { User, Building2, BadgeCheck, ArrowRight, AlertCircle } from 'lucide-react'

interface ParticipantFormData {
  name: string
  organization: string
  title: string
}

export default function JoinPage() {
  const router = useRouter()
  const params = useParams()
  const sessionCode = params.code as string
  const { createDocument, queryDocuments } = useFirestore()
  const [formData, setFormData] = useState<ParticipantFormData>({
    name: '',
    organization: '',
    title: '',
  })
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  React.useEffect(() => {
    const validateSession = async () => {
      const sessions = await queryDocuments<any>('sessions', [
        where('sessionCode', '==', sessionCode.toUpperCase()),
      ])
      if (sessions.length > 0) {
        setSessionValid(true)
        setSessionId(sessions[0].id)
        setProjectId(sessions[0].projectId)
      }
      setValidating(false)
    }
    validateSession()
  }, [sessionCode, queryDocuments])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.name || !formData.organization || !formData.title) {
      setSubmitError('모든 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const participantId = uuidv4()
      const result = await createDocument('participants', participantId, {
        id: participantId,
        projectId,
        sessionCode: sessionCode.toUpperCase(),
        name: formData.name,
        organization: formData.organization,
        title: formData.title,
        joinedAt: new Date().toISOString(),
        avatar: null,
        responses: [],
        status: 'active',
      })

      if (result.success) {
        router.push(`/session/${projectId}?participant=${participantId}`)
      } else {
        setSubmitError('참가 등록 실패: ' + (result.errorMessage || '알 수 없는 오류'))
      }
    } catch (err: any) {
      setSubmitError('참가 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card variant="elevated">
            <FormSkeleton />
          </Card>
        </div>
      </div>
    )
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card variant="elevated" className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">세션을 찾을 수 없습니다</h1>
            <p className="text-slate-500 text-sm mb-6">
              코드 <span className="font-mono font-bold text-slate-700">{sessionCode}</span>에 해당하는
              세션이 없습니다. 코드를 다시 확인해주세요.
            </p>
            <Button onClick={() => router.push('/')} variant="primary" fullWidth>
              홈으로 돌아가기
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="elevated">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Badge variant="info" className="text-sm px-3 py-1">
                  <span className="font-mono font-bold">{sessionCode.toUpperCase()}</span>
                </Badge>
              </div>
              <h1 className="text-xl font-bold text-slate-900">참가자 정보</h1>
              <p className="text-sm text-slate-500 mt-1">게임에 참가하려면 아래 정보를 입력해주세요</p>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-700 text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {submitError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="소속"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="마케팅팀"
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />
              <Input
                label="호칭"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="팀장"
                leftIcon={<BadgeCheck className="w-4 h-4" />}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading || !formData.name || !formData.organization || !formData.title}
                  icon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
                >
                  게임 입장
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← 홈으로 돌아가기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
