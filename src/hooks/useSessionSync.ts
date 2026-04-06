'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  SessionLiveState,
  SessionEvent,
  SessionEventType,
  SessionMode,
  SpotType,
  TeamState,
  TeamId,
  Participant,
  CafeOrder,
} from '@/types'

// ─── Default State ───

const defaultTeamState: TeamState = {
  scores: { A: 0, B: 0, C: 0, D: 0 },
  assignments: { A: [], B: [], C: [], D: [] },
}

function createDefaultLiveState(projectId: string, sessionCode: string): Omit<SessionLiveState, 'id'> {
  return {
    projectId,
    sessionCode,
    mode: 'participant',
    currentSpotIndex: 0,
    currentSpotType: null,
    status: 'waiting',
    teams: defaultTeamState,
    activeModule: null,
    activeModuleData: null,
    announcement: null,
    updatedAt: new Date(),
  }
}

// ─── Hook ───

interface UseSessionSyncOptions {
  projectId: string
  sessionCode: string
  mode: SessionMode
  participantId?: string
}

export function useSessionSync({
  projectId,
  sessionCode,
  mode,
  participantId,
}: UseSessionSyncOptions) {
  const [liveState, setLiveState] = useState<SessionLiveState | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [cafeOrders, setCafeOrders] = useState<CafeOrder[]>([])
  const [recentEvents, setRecentEvents] = useState<SessionEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const unsubscribesRef = useRef<Array<() => void>>([])
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  const liveDocId = `live-${projectId}`
  const liveDocRef = doc(db, 'sessionLive', liveDocId)

  // ─── Online/Offline detection ───
  useEffect(() => {
    const handleOnline = async () => {
      setReconnecting(true)
      try {
        await enableNetwork(db)
        setReconnecting(false)
      } catch (err) {
        console.error('Failed to re-enable network:', err)
        setReconnecting(false)
      }
    }

    const handleOffline = () => {
      setConnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ─── Initialize & Subscribe ───

  useEffect(() => {
    const subs: Array<() => void> = []

    // 1. Subscribe to live state
    const unsubLive = onSnapshot(
      liveDocRef,
      async (snap) => {
        if (!snap.exists()) {
          // Admin creates the live state doc
          if (mode === 'admin') {
            await setDoc(liveDocRef, {
              ...createDefaultLiveState(projectId, sessionCode),
              id: liveDocId,
              updatedAt: serverTimestamp(),
            })
          }
          return
        }
        setLiveState({ ...snap.data(), id: snap.id } as SessionLiveState)
        setConnected(true)
        setReconnecting(false)
      },
      (err) => {
        console.error('Live state subscription error:', err)
        setConnected(false)
      }
    )
    subs.push(unsubLive)

    // 2. Subscribe to participants
    const participantsQuery = query(
      collection(db, 'participants'),
      where('projectId', '==', projectId)
    )
    const unsubParticipants = onSnapshot(participantsQuery, (snap) => {
      const results: Participant[] = []
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as Participant))
      setParticipants(results)
    })
    subs.push(unsubParticipants)

    // 3. Subscribe to cafe orders
    const ordersQuery = query(
      collection(db, 'cafeOrders'),
      where('sessionId', '==', liveDocId)
    )
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const results: CafeOrder[] = []
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as CafeOrder))
      setCafeOrders(results)
    })
    subs.push(unsubOrders)

    // 4. Subscribe to recent events (last 20)
    const eventsQuery = query(
      collection(db, 'sessionEvents'),
      where('sessionId', '==', liveDocId),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      const results: SessionEvent[] = []
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as SessionEvent))
      setRecentEvents(results)
    })
    subs.push(unsubEvents)

    unsubscribesRef.current = subs
    return () => {
      subs.forEach((unsub) => unsub())
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [projectId, sessionCode, mode, liveDocId])

  // ─── Actions (Admin) ───

  const updateLiveState = useCallback(
    async (updates: Partial<SessionLiveState>) => {
      try {
        await updateDoc(liveDocRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('Failed to update live state:', err)
      }
    },
    [liveDocRef]
  )

  const emitEvent = useCallback(
    async (type: SessionEventType, data: Record<string, any> = {}) => {
      try {
        await addDoc(collection(db, 'sessionEvents'), {
          sessionId: liveDocId,
          type,
          data,
          createdAt: serverTimestamp(),
          createdBy: participantId || 'admin',
        })
      } catch (err) {
        console.error('Failed to emit event:', err)
      }
    },
    [liveDocId, participantId]
  )

  // ─── Admin Actions ───

  const launchActivity = useCallback(
    async (spotType: SpotType, spotIndex: number, moduleData?: Record<string, any>) => {
      await updateLiveState({
        currentSpotIndex: spotIndex,
        currentSpotType: spotType,
        status: 'active',
        activeModule: spotType,
        activeModuleData: moduleData || null,
      })
      await emitEvent('ACTIVITY_LAUNCH', { spotType, spotIndex, moduleData })
    },
    [updateLiveState, emitEvent]
  )

  const endActivity = useCallback(async () => {
    await updateLiveState({
      activeModule: null,
      activeModuleData: null,
    })
    await emitEvent('ACTIVITY_END', {
      spotType: liveState?.currentSpotType,
    })
  }, [updateLiveState, emitEvent, liveState?.currentSpotType])

  const nextSpot = useCallback(async () => {
    const nextIndex = (liveState?.currentSpotIndex ?? 0) + 1
    await updateLiveState({ currentSpotIndex: nextIndex })
  }, [updateLiveState, liveState?.currentSpotIndex])

  const updateTeamScores = useCallback(
    async (teamId: TeamId, delta: number) => {
      if (!liveState) return
      const currentScores = { ...liveState.teams.scores }
      currentScores[teamId] = (currentScores[teamId] || 0) + delta
      await updateLiveState({
        teams: { ...liveState.teams, scores: currentScores },
      })
      await emitEvent('SCORE_UPDATE', { teamId, delta, scores: currentScores })
    },
    [updateLiveState, emitEvent, liveState]
  )

  const assignTeams = useCallback(
    async (assignments: Record<TeamId, string[]>) => {
      if (!liveState) return
      await updateLiveState({
        teams: { ...liveState.teams, assignments },
      })
      await emitEvent('TEAM_FORMATION', { assignments })
    },
    [updateLiveState, emitEvent, liveState]
  )

  const sendAnnouncement = useCallback(
    async (message: string) => {
      await updateLiveState({ announcement: message })
      await emitEvent('ANNOUNCEMENT', { message })
    },
    [updateLiveState, emitEvent]
  )

  const shuffleSeats = useCallback(async () => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const teams: Record<TeamId, string[]> = { A: [], B: [], C: [], D: [] }
    const teamIds: TeamId[] = ['A', 'B', 'C', 'D']
    shuffled.forEach((p, i) => {
      teams[teamIds[i % 4]].push(p.id)
    })
    await assignTeams(teams)
    await emitEvent('SEAT_SHUFFLE', { teams })
  }, [participants, assignTeams, emitEvent])

  // ─── Participant Actions ───

  const submitCafeOrder = useCallback(
    async (order: Omit<CafeOrder, 'id' | 'orderedAt'>) => {
      try {
        await addDoc(collection(db, 'cafeOrders'), {
          ...order,
          sessionId: liveDocId,
          orderedAt: serverTimestamp(),
        })
        await emitEvent('FOOD_ORDER', {
          participantId: order.participantId,
          participantName: order.participantName,
          items: order.items,
        })
      } catch (err) {
        console.error('Failed to submit cafe order:', err)
      }
    },
    [liveDocId, emitEvent]
  )

  const submitResponse = useCallback(
    async (spotType: SpotType, response: Record<string, any>) => {
      await emitEvent('PARTICIPANT_RESPONSE', {
        participantId,
        spotType,
        response,
      })
    },
    [emitEvent, participantId]
  )

  return {
    // State
    liveState,
    participants,
    cafeOrders,
    recentEvents,
    connected,
    reconnecting,

    // Admin actions
    launchActivity,
    endActivity,
    nextSpot,
    updateTeamScores,
    assignTeams,
    shuffleSeats,
    sendAnnouncement,
    updateLiveState,

    // Participant actions
    submitCafeOrder,
    submitResponse,
    emitEvent,
  }
}
