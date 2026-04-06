'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Legacy presenter route — redirects to unified session page with projector mode.
 * /presenter/[id] → /session/[id]?mode=projector
 */
export default function PresenterRedirect() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  useEffect(() => {
    router.replace(`/session/${projectId}?mode=projector`)
  }, [projectId, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-slate-400 text-sm">프로젝터 모드로 이동 중...</p>
    </div>
  )
}
