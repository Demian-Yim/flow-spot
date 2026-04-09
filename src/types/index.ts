// ─── Auth & Users ───

export interface User {
  id: string
  email: string
  role: 'instructor' | 'participant'
  createdAt: Date
}

// ─── Project ───

export interface Project {
  id: string
  name: string
  instructorId: string
  sessionCode: string
  createdAt: Date
  updatedAt: Date
  description?: string
  status: 'draft' | 'active' | 'completed'
  spotSequence: SpotType[]
  settings: ProjectSettings
}

export interface ProjectSettings {
  enableSound: boolean
  enableConfetti: boolean
  enableAvatars: boolean
  timePerSpot: number
}

// ─── Spots ───

export type SpotType =
  | 'manner'
  | 'stretch'
  | 'greeting'
  | 'ground-rules'
  | 'mini-games'
  | 'self-intro'
  | 'cafe-order'
  // Phase A
  | 'greeting-circle'
  | 'mirror-stretch'
  // Phase B
  | 'intro-relay'
  | 'role-roulette'
  | 'body-games'
  | 'rule-ritual'
  | 'cafe-break'

export const SPOT_LABELS: Record<SpotType, { name: string; emoji: string; description: string }> = {
  'manner':       { name: '매너 모드',   emoji: '🤝', description: '좋은 매너를 배워봅시다' },
  'stretch':      { name: '스트레칭',    emoji: '🧘', description: '몸과 마음을 풀어봅시다' },
  'greeting':     { name: '역할 할당',   emoji: '🎭', description: '팀 역할을 정해봅시다' },
  'ground-rules': { name: '팀 규칙',     emoji: '📋', description: '함께 지킬 규칙을 정해요' },
  'mini-games':   { name: '미니 게임',   emoji: '🎮', description: '팀과 함께 게임을 즐겨요' },
  'self-intro':   { name: '자기소개',    emoji: '👋', description: '서로를 알아가는 시간' },
  'cafe-order':   { name: '카페 주문',   emoji: '☕', description: '음료/간식을 주문해요' },
  // Phase A
  'greeting-circle': { name: '인사 서클', emoji: '😊', description: '짝-그룹-전체 인사 릴레이' },
  'mirror-stretch':  { name: '미러 스트레칭', emoji: '🧘', description: '따라하는 스트레칭' },
  // Phase B
  'intro-relay':   { name: '소개 릴레이', emoji: '🎤', description: '30초 릴레이 자기소개' },
  'role-roulette': { name: '역할 룰렛',   emoji: '🎰', description: '역할을 돌려서 뽑아요' },
  'body-games':    { name: '몸 게임',     emoji: '💪', description: '박수·OX·가위바위보' },
  'rule-ritual':   { name: '약속 의식',   emoji: '🤝', description: '규칙을 몸으로 약속해요' },
  'cafe-break':    { name: '카페 타임',   emoji: '☕', description: '메뉴 고르고 잠시 쉬어요' },
}

export interface SpotActivity {
  id: string
  projectId: string
  type: SpotType
  sequence: number
  title: string
  description: string
  duration: number
  config: Record<string, any>
  status: 'pending' | 'active' | 'completed'
  startedAt?: Date
  completedAt?: Date
}

// ─── Participants ───

export interface Participant {
  id: string
  projectId: string
  name: string
  organization: string
  title: string
  email?: string
  avatar?: string
  sessionCode: string
  joinedAt: Date
  responses: ParticipantResponse[]
  status: 'active' | 'inactive'
  team?: TeamId
  role?: TeamRole
  selfIntro?: SelfIntroData
}

export interface ParticipantResponse {
  spotId: string
  spotType: SpotType
  response: Record<string, any>
  respondedAt: Date
  avatar?: string
}

// ─── Self Introduction ───

export interface SelfIntroData {
  animal: string       // emoji
  foods: string[]      // emoji array
  keywords: string[]   // keyword strings
}

// ─── Teams ───

export type TeamId = 'A' | 'B' | 'C' | 'D'
export type TeamRole = 'leader' | 'recorder' | 'presenter' | 'timekeeper'

export interface TeamState {
  scores: Record<TeamId, number>
  assignments: Record<TeamId, string[]>  // participant IDs per team
}

// ─── Cafe Orders ───

export interface CafeMenuItem {
  name: string
  price: string
  emoji: string
}

export interface CafeCategory {
  cat: string
  items: CafeMenuItem[]
}

export interface CafeOrder {
  id: string
  participantId: string
  participantName: string
  items: Array<{ name: string; emoji: string; quantity: number }>
  orderedAt: Date
  team?: TeamId
}

// ─── Session ───

export interface Session {
  id: string
  projectId: string
  sessionCode: string
  instructorId: string
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
  currentSpotIndex: number
  participantCount: number
  status: 'waiting' | 'active' | 'completed'
}

// ─── Session Live State (Firebase real-time document) ───

export type SessionMode = 'participant' | 'admin' | 'projector'

export interface SessionLiveState {
  id: string
  projectId: string
  sessionCode: string
  mode: SessionMode
  currentSpotIndex: number
  currentSpotType: SpotType | null
  status: 'waiting' | 'active' | 'paused' | 'completed'
  teams: TeamState
  activeModule: string | null
  activeModuleData: Record<string, any> | null
  announcement: string | null
  updatedAt: Date
}

// ─── Real-time Events ───

export type SessionEventType =
  | 'ACTIVITY_LAUNCH'
  | 'ACTIVITY_END'
  | 'SCORE_UPDATE'
  | 'TEAM_FORMATION'
  | 'ANNOUNCEMENT'
  | 'FOOD_ORDER'
  | 'PARTICIPANT_JOIN'
  | 'PARTICIPANT_RESPONSE'
  | 'PROJECTOR_REFRESH'
  | 'SEAT_SHUFFLE'

export interface SessionEvent {
  id: string
  sessionId: string
  type: SessionEventType
  data: Record<string, any>
  createdAt: Date
  createdBy: string  // participant or admin ID
}

// ─── Mini Games ───

export interface MiniGameResult {
  participantId: string
  score: number
  gameType: MiniGameType
  completedAt: Date
  team?: TeamId
}

export type MiniGameType = 'ox-quiz' | 'clap' | 'word-chain' | 'bingo' | 'truth-lie' | 'relay-story' | 'stroop'

export interface GameData {
  type: MiniGameType
  questions?: Question[]
  timeLimit: number
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

// ─── Results / Analytics ───

export interface SessionResult {
  sessionId: string
  projectId: string
  participantCount: number
  spotResults: SpotResult[]
  teamScores: Record<TeamId, number>
  cafeOrders: CafeOrder[]
  completedAt: Date
}

export interface SpotResult {
  spotType: SpotType
  responses: ParticipantResponse[]
  summary: Record<string, any>
}

// ─── Avatar ───

export interface AvatarConfig {
  character: string
  emotion: 'happy' | 'excited' | 'thinking' | 'laughing'
  accessory?: string
  background?: string
}

// ─── Error ───

export interface FirebaseError {
  code: string
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: FirebaseError
}
