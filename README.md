# FLOW SPOT - 기업 교육 게임 플랫폼

기업 교육 게임으로 좋은 매너와 팀워크를 배우는 혁신적인 플랫폼입니다.

## 주요 기능

- **매너 모드**: 직장에서의 올바른 매너를 배웁니다
- **스트레칭 & 정리**: 몸과 마음을 리프레시합니다
- **인사 & 역할**: 팀 역할을 할당받고 팀워크를 강화합니다
- **팀 규칙**: 함께 만드는 팀의 규칙에 동의합니다
- **미니 게임**: 즐거운 게임으로 팀 문화를 형성합니다

## 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **UI Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase (Authentication, Firestore)
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 빠른 시작

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd flow-spot-app

# 의존성 설치
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (Email/Password)
3. Firestore Database 생성 (Production mode)
4. 프로젝트 설정에서 Firebase Config 복사

### 3. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local`에 다음 정보 추가:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성
2. `.env.local`에 추가

### 5. 로컬 실행

```bash
npm run dev
```

앱은 `http://localhost:3000`에서 실행됩니다.

## 데이터베이스 구조 (Firestore)

### Collections

#### `projects`
```javascript
{
  id: string,
  name: string,
  instructorId: string,
  sessionCode: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  spotSequence: ["manner", "stretch", "greeting", "ground-rules", "mini-games"],
  status: "draft" | "active" | "completed",
  description?: string,
  settings: {
    enableSound: boolean,
    enableConfetti: boolean,
    enableAvatars: boolean,
    timePerSpot: number
  }
}
```

#### `sessions`
```javascript
{
  id: string,
  projectId: string,
  sessionCode: string,
  instructorId: string,
  createdAt: timestamp,
  startedAt?: timestamp,
  endedAt?: timestamp,
  currentSpotIndex: number,
  participantCount: number,
  status: "waiting" | "active" | "completed"
}
```

#### `participants`
```javascript
{
  id: string,
  projectId: string,
  name: string,
  organization: string,
  title: string,
  email?: string,
  avatar?: string,
  sessionCode: string,
  joinedAt: timestamp,
  responses: [{
    spotId: string,
    spotType: string,
    response: object,
    respondedAt: timestamp,
    avatar?: string
  }],
  status: "active" | "inactive"
}
```

## 사용 흐름

### 강사 (Instructor)

1. `/admin`에서 로그인
2. `/admin/dashboard`에서 새 세션 생성
3. 세션 코드 또는 QR 코드로 참가자 초대
4. `/presenter/[id]`에서 프레젠터 모드 시작
5. 프로젝터에 연결하여 활동 진행

### 참가자 (Participant)

1. 홈 페이지에서 "참가자 입장" 선택
2. 세션 코드 입력
3. 이름, 소속, 호칭 입력
4. `/session/[id]`에서 각 활동에 참여
5. 활동별 반응 및 응답 기록

## Firestore 보안 규칙

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Vercel 배포

### 1. GitHub에 푸시

```bash
git push origin main
```

### 2. Vercel 연결

1. [Vercel Dashboard](https://vercel.com)에 접속
2. "Import Project" 선택
3. GitHub 저장소 선택
4. 환경 변수 설정

### 3. 환경 변수 추가

Vercel 프로젝트 설정에서 다음을 추가:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY`

### 4. 배포

```bash
git push
```

자동으로 배포가 시작됩니다.

## 개발 가이드

### 새로운 Spot 컴포넌트 추가

1. `src/components/spots/[SpotName].tsx` 생성
2. Props 인터페이스 정의
3. Tailwind CSS로 UI 구현
4. `useSound` 훅 활용
5. 프레젠터 모드 구현 (`isPresenter` prop)
6. `src/app/session/[id]/page.tsx`에 추가

### Firestore 쿼리

```typescript
import { useFirestore } from '@/hooks/useFirestore'
import { where } from 'firebase/firestore'

const { queryDocuments, subscribeToQuery } = useFirestore()

// 한 번 조회
const projects = await queryDocuments('projects', [
  where('instructorId', '==', userId)
])

// 실시간 구독
const unsubscribe = subscribeToQuery('participants',
  [where('projectId', '==', projectId)],
  setParticipants
)
```

## 트러블슈팅

### Firebase 연결 실패

- `.env.local` 파일 확인
- Firebase Console에서 프로젝트 설정 재확인
- 브라우저 콘솔에서 에러 메시지 확인

### Gemini API 오류

- API 키가 올바른지 확인
- [Google AI Studio](https://makersuite.google.com/app/apikey)에서 키 상태 확인
- 일일 요청 한도 확인

### 세션 코드 미인식

- 세션 코드가 대문자인지 확인
- Firestore에서 `sessions` collection 확인

## 성능 최적화

- 이미지 최적화: Next.js Image 컴포넌트 사용
- 코드 분할: 동적 임포트 활용
- 상태 관리: Zustand 활용 (optional)
- 캐싱: SWR 또는 TanStack Query (optional)

## 보안

- Firebase Authentication 사용
- Firestore 보안 규칙 구성
- 환경 변수에 민감 정보 저장
- 클라이언트 사이드 검증 + 서버 사이드 검증

## 라이선스

MIT License

## 지원

문제가 발생하면 GitHub Issues를 통해 보고해주세요.

## 변경 로그

### v1.0.0 (2024-03-28)

- 초기 릴리스
- 5가지 Spot 활동 구현
- Firebase 통합
- Gemini API 통합
- Vercel 배포 준비
