'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useFirestore } from './useFirestore'
import { Session, Project, Participant } from '@/types'
import { where } from 'firebase/firestore'

export function useSession(sessionCode: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const { subscribeToQuery, getDocument } = useFirestore()
  const participantUnsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const unsubscribeSession = subscribeToQuery<Session>(
      'sessions',
      [where('sessionCode', '==', sessionCode)],
      (sessions) => {
        if (sessions.length > 0) {
          const currentSession = sessions[0]
          setSession(currentSession)

          getDocument<Project>('projects', currentSession.projectId).then(
            (projectData) => {
              if (projectData) {
                setProject(projectData)
              }
            }
          )

          // Clean up previous participant subscription before creating new one
          if (participantUnsubRef.current) {
            participantUnsubRef.current()
          }

          participantUnsubRef.current = subscribeToQuery<Participant>(
            'participants',
            [where('projectId', '==', currentSession.projectId)],
            setParticipants
          )

          setLoading(false)
        }
      }
    )

    return () => {
      unsubscribeSession()
      if (participantUnsubRef.current) {
        participantUnsubRef.current()
      }
    }
  }, [sessionCode, subscribeToQuery, getDocument])

  const getCurrentSpot = useCallback(() => {
    if (!session || !project) return null
    return project.spotSequence[session.currentSpotIndex] || null
  }, [session, project])

  const getParticipantCount = useCallback(() => {
    return participants.length
  }, [participants])

  return {
    session,
    project,
    participants,
    loading,
    getCurrentSpot,
    getParticipantCount,
  }
}
