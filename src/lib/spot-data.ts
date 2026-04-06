// ─── Self Introduction Data (ported from v8 prototype) ───

export const ANIMALS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎',
  '🦖', '🦕', '🐙',
] as const

export const FOODS = [
  { emoji: '🍕', name: '피자' },
  { emoji: '🍔', name: '버거' },
  { emoji: '🍟', name: '감튀' },
  { emoji: '🌭', name: '핫도그' },
  { emoji: '🍝', name: '파스타' },
  { emoji: '🍜', name: '라멘' },
  { emoji: '🍲', name: '찌개' },
  { emoji: '🍛', name: '카레' },
  { emoji: '🍣', name: '스시' },
  { emoji: '🍱', name: '도시락' },
  { emoji: '🥘', name: '파에야' },
  { emoji: '🥗', name: '샐러드' },
  { emoji: '🍗', name: '치킨' },
  { emoji: '🥩', name: '스테이크' },
  { emoji: '🦐', name: '새우' },
  { emoji: '🥞', name: '팬케이크' },
  { emoji: '🍞', name: '식빵' },
  { emoji: '🥐', name: '크로와상' },
  { emoji: '🥖', name: '바게트' },
  { emoji: '🥨', name: '프레첼' },
  { emoji: '🧀', name: '치즈' },
  { emoji: '🍚', name: '쌀밥' },
  { emoji: '🍘', name: '센베이' },
  { emoji: '🥟', name: '만두' },
  { emoji: '🧁', name: '컵케이크' },
  { emoji: '🍰', name: '케이크' },
  { emoji: '🍩', name: '도넛' },
  { emoji: '🍪', name: '쿠키' },
  { emoji: '🍫', name: '초콜릿' },
  { emoji: '🍦', name: '아이스크림' },
  { emoji: '🧇', name: '와플' },
  { emoji: '🥯', name: '베이글' },
] as const

export const KEYWORDS = [
  '리더십', '창의성', '협업', '소통', '책임감', '열정', '신뢰', '배려',
  '긍정', '도전', '성장', '공감', '존중', '효율성', '혁신', '겸손',
  '끈기', '정직', '배움', '이해', '결단력', '실행력', '집중', '시간관리',
  '문제해결', '기획력', '추진력', '주도성', '개방성', '분석력',
  '통찰력', '자신감', '유연성', '민첩성', '사교성', '감정조절',
  '목표지향', '자율성', '신뢰성', '전문성', '조화', '균형',
  '진정성', '동정심', '감사', '기여', '나눔', '용기', '지혜',
  '인내', '헌신', '유머', '호기심',
] as const

// ─── Stretching Programs (ported from v8) ───

export interface StretchProgram {
  id: string
  name: string
  icon: string
  description: string
  steps: Array<{ instruction: string; duration: number }>
}

export const STRETCH_PROGRAMS: StretchProgram[] = [
  {
    id: 'neck',
    name: '목 스트레칭',
    icon: '🔄',
    description: '경직된 목을 풀어봅시다',
    steps: [
      { instruction: '고개를 천천히 오른쪽으로 기울이세요', duration: 10 },
      { instruction: '5초 유지하세요', duration: 5 },
      { instruction: '고개를 천천히 왼쪽으로 기울이세요', duration: 10 },
      { instruction: '5초 유지하세요', duration: 5 },
      { instruction: '앞으로 천천히 숙여 목 뒤를 풀어주세요', duration: 10 },
    ],
  },
  {
    id: 'shoulder',
    name: '어깨 스트레칭',
    icon: '💪',
    description: '긴장된 어깨를 풀어봅시다',
    steps: [
      { instruction: '어깨를 귀 쪽으로 올리세요', duration: 5 },
      { instruction: '천천히 어깨를 뒤로 회전하세요', duration: 10 },
      { instruction: '반대로 앞으로 회전하세요', duration: 10 },
      { instruction: '오른팔을 왼쪽으로 당겨주세요', duration: 10 },
      { instruction: '왼팔을 오른쪽으로 당겨주세요', duration: 10 },
    ],
  },
  {
    id: 'back',
    name: '허리 스트레칭',
    icon: '🧘',
    description: '뻣뻣한 허리를 풀어봅시다',
    steps: [
      { instruction: '의자에 앉아 상체를 앞으로 숙이세요', duration: 10 },
      { instruction: '양손을 깍지 끼고 위로 쭉 펴세요', duration: 10 },
      { instruction: '상체를 오른쪽으로 비틀어주세요', duration: 10 },
      { instruction: '상체를 왼쪽으로 비틀어주세요', duration: 10 },
      { instruction: '고양이 자세: 등을 둥글게 말아주세요', duration: 10 },
    ],
  },
  {
    id: 'wrist',
    name: '손목 스트레칭',
    icon: '🤲',
    description: '타이핑으로 지친 손목을 풀어봅시다',
    steps: [
      { instruction: '양손을 앞으로 뻗고 손목을 돌려주세요', duration: 10 },
      { instruction: '오른손을 아래로 꺾어 왼손으로 당기세요', duration: 10 },
      { instruction: '왼손을 아래로 꺾어 오른손으로 당기세요', duration: 10 },
      { instruction: '양손을 주먹 쥐었다 펴기를 반복하세요', duration: 10 },
      { instruction: '손가락을 하나씩 펴면서 마무리하세요', duration: 5 },
    ],
  },
  {
    id: 'eye',
    name: '눈 운동',
    icon: '👁️',
    description: '피로한 눈을 쉬게 해줍시다',
    steps: [
      { instruction: '눈을 감고 5초간 쉬세요', duration: 5 },
      { instruction: '멀리 있는 물체를 10초간 바라보세요', duration: 10 },
      { instruction: '눈을 시계 방향으로 천천히 돌리세요', duration: 10 },
      { instruction: '눈을 반시계 방향으로 천천히 돌리세요', duration: 10 },
      { instruction: '손바닥으로 눈을 가볍게 덮고 쉬세요', duration: 10 },
    ],
  },
  {
    id: 'full',
    name: '전신 스트레칭',
    icon: '🏃',
    description: '온몸을 시원하게 풀어봅시다',
    steps: [
      { instruction: '양팔을 올려 쭉 펴세요', duration: 10 },
      { instruction: '왼쪽으로 옆으로 기울여 펴세요', duration: 10 },
      { instruction: '오른쪽으로 옆으로 기울여 펴세요', duration: 10 },
      { instruction: '제자리에서 가볍게 뛰세요', duration: 15 },
      { instruction: '심호흡 3회로 마무리하세요', duration: 15 },
    ],
  },
]

// ─── Cafe Menu (ported from v8) ───

export interface CafeMenuCategory {
  cat: string
  items: Array<{ name: string; price: string; emoji: string }>
}

export const CAFE_MENU: CafeMenuCategory[] = [
  {
    cat: '☕ 커피',
    items: [
      { name: '아메리카노', price: '4,500원', emoji: '☕' },
      { name: '카페라떼', price: '5,000원', emoji: '🥛' },
      { name: '카푸치노', price: '5,000원', emoji: '☕' },
      { name: '바닐라라떼', price: '5,500원', emoji: '🍶' },
      { name: '카라멜마키아토', price: '5,500원', emoji: '🍯' },
      { name: '콜드브루', price: '5,000원', emoji: '🧊' },
      { name: '에스프레소', price: '3,500원', emoji: '☕' },
      { name: '디카페인', price: '5,000원', emoji: '💤' },
    ],
  },
  {
    cat: '🍵 차/음료',
    items: [
      { name: '녹차라떼', price: '5,500원', emoji: '🍵' },
      { name: '얼그레이', price: '4,500원', emoji: '🫖' },
      { name: '캐모마일', price: '4,500원', emoji: '🌼' },
      { name: '레몬에이드', price: '5,000원', emoji: '🍋' },
      { name: '자몽에이드', price: '5,500원', emoji: '🍊' },
      { name: '스무디', price: '6,000원', emoji: '🥤' },
      { name: '핫초코', price: '5,000원', emoji: '🍫' },
      { name: '밀크티', price: '5,500원', emoji: '🧋' },
    ],
  },
  {
    cat: '🥐 디저트',
    items: [
      { name: '크로와상', price: '4,000원', emoji: '🥐' },
      { name: '마카롱', price: '3,000원', emoji: '🧁' },
      { name: '치즈케이크', price: '6,500원', emoji: '🍰' },
      { name: '브라우니', price: '4,500원', emoji: '🍫' },
      { name: '스콘', price: '3,500원', emoji: '🍞' },
      { name: '와플', price: '5,000원', emoji: '🧇' },
      { name: '머핀', price: '4,000원', emoji: '🧁' },
      { name: '쿠키', price: '2,500원', emoji: '🍪' },
    ],
  },
  {
    cat: '🍔 식사',
    items: [
      { name: '샌드위치', price: '7,000원', emoji: '🥪' },
      { name: '파니니', price: '7,500원', emoji: '🥖' },
      { name: '샐러드', price: '8,000원', emoji: '🥗' },
      { name: '베이글세트', price: '6,500원', emoji: '🥯' },
      { name: '토스트', price: '5,500원', emoji: '🍞' },
      { name: '키시', price: '7,000원', emoji: '🥧' },
      { name: '수프', price: '6,000원', emoji: '🍲' },
      { name: '김밥', price: '4,500원', emoji: '🍙' },
    ],
  },
]

// ─── Mini Games (ported from v8) ───

export interface MiniGameDef {
  id: string
  name: string
  icon: string
  description: string
  projectorDescription: string
  minPlayers: number
}

export const MINI_GAMES: MiniGameDef[] = [
  {
    id: 'ox-quiz',
    name: 'OX 퀴즈',
    icon: '⭕',
    description: '강사가 문제를 내면 O 또는 X로 답합니다. 정답자는 생존!',
    projectorDescription: '강사가 OX 문제를 내고 학습자들의 반응을 확인합니다.',
    minPlayers: 2,
  },
  {
    id: 'clap',
    name: '박수 게임',
    icon: '👏',
    description: '1박자=박수1번, 2박자=박수2번 규칙으로 진행. 틀리면 탈락!',
    projectorDescription: '박수 규칙을 화면에 표시합니다.',
    minPlayers: 3,
  },
  {
    id: 'word-chain',
    name: '끝말잇기',
    icon: '💬',
    description: '앞 사람 단어의 마지막 글자로 시작하는 단어를 말하세요!',
    projectorDescription: '현재 단어와 참가 순서를 표시합니다.',
    minPlayers: 2,
  },
  {
    id: 'bingo',
    name: '자기소개 빙고',
    icon: '🎯',
    description: '3×3 빙고판에 참가자 이름을 채우고, 먼저 빙고를 외치면 승리!',
    projectorDescription: '빙고 게임 현황을 표시합니다.',
    minPlayers: 4,
  },
  {
    id: 'truth-lie',
    name: '진실 vs 거짓',
    icon: '🎭',
    description: '자신에 대한 이야기 3가지 중 1개가 거짓. 나머지가 맞추면 돼요!',
    projectorDescription: '참가자의 3가지 이야기를 표시합니다.',
    minPlayers: 3,
  },
  {
    id: 'relay-story',
    name: '릴레이 이야기',
    icon: '📖',
    description: '한 사람씩 이야기를 이어갑니다. 자연스럽게 연결해 보세요!',
    projectorDescription: '현재까지의 이야기를 표시합니다.',
    minPlayers: 3,
  },
  {
    id: 'stroop',
    name: '스트룹 테스트',
    icon: '🌈',
    description: '글자의 색깔을 맞추세요! 빠르게 판단하는 집중력 게임입니다.',
    projectorDescription: '참가자별 반응속도와 정답률을 표시합니다.',
    minPlayers: 1,
  },
]

// ─── Stroop Test Data ───

export interface StroopQuestion {
  text: string       // 표시되는 글자 (예: "빨강")
  textColor: string  // 실제 글자 색상 CSS class
  correctAnswer: string  // 정답 색상 이름
}

const COLOR_MAP = [
  { name: '빨강', class: 'text-red-500' },
  { name: '파랑', class: 'text-blue-500' },
  { name: '초록', class: 'text-green-500' },
  { name: '노랑', class: 'text-yellow-500' },
  { name: '보라', class: 'text-purple-500' },
] as const

export function generateStroopQuestions(count: number): StroopQuestion[] {
  const questions: StroopQuestion[] = []
  for (let i = 0; i < count; i++) {
    const textIdx = Math.floor(Math.random() * COLOR_MAP.length)
    let colorIdx = Math.floor(Math.random() * COLOR_MAP.length)
    // 50% 확률로 불일치 (더 어렵게)
    if (Math.random() > 0.5) {
      while (colorIdx === textIdx) {
        colorIdx = Math.floor(Math.random() * COLOR_MAP.length)
      }
    }
    questions.push({
      text: COLOR_MAP[textIdx].name,
      textColor: COLOR_MAP[colorIdx].class,
      correctAnswer: COLOR_MAP[colorIdx].name,
    })
  }
  return questions
}

export const STROOP_COLORS = COLOR_MAP

// ─── Team Roles ───

export interface TeamRoleDef {
  id: string
  name: string
  icon: string
  description: string
}

export const TEAM_ROLES: TeamRoleDef[] = [
  { id: 'leader', name: '리더', icon: '👨‍💼', description: '팀의 방향을 제시하고 모두를 이끕니다' },
  { id: 'recorder', name: '기록자', icon: '📝', description: '회의 내용을 기록하고 정리합니다' },
  { id: 'presenter', name: '발표자', icon: '🎤', description: '팀의 결과를 대표하여 발표합니다' },
  { id: 'timekeeper', name: '시간관리자', icon: '⏱️', description: '시간을 관리하고 진행을 도웁니다' },
]
