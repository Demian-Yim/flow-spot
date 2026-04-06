# FLOW SPOT 상세 설정 가이드

## 사전 요구사항

- Node.js 18+ 및 npm
- Git
- GitHub 계정 (배포용)
- Google Firebase 계정
- Google AI Studio 계정

## 단계별 설정

### 1단계: Firebase 프로젝트 생성

#### 1.1 Firebase Console 접속
- [Firebase Console](https://console.firebase.google.com/)에 접속
- Google 계정으로 로그인

#### 1.2 새 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름: `FLOW SPOT` (또는 원하는 이름)
3. 분석 활성화 (선택사항)
4. "프로젝트 만들기" 클릭
5. 프로젝트 생성 완료 대기

#### 1.3 Authentication 설정
1. 좌측 메뉴에서 "빌드" → "Authentication" 클릭
2. "시작하기" 클릭
3. "이메일/비밀번호" 선택
4. 활성화하기

#### 1.4 Firestore Database 생성
1. 좌측 메뉴에서 "빌드" → "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치: 가장 가까운 리전 선택 (예: asia-northeast1)
4. 보안 규칙: "프로덕션 모드에서 시작"
5. "만들기" 클릭

#### 1.5 Firebase Config 가져오기
1. 프로젝트 설정 클릭 (좌상단 톱니 아이콘)
2. "일반" 탭에서 "웹" 앱 추가
3. 앱 닉네임: `flow-spot-web`
4. "앱 등록" 클릭
5. 표시되는 firebaseConfig 코드 복사

예시:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxx",
  authDomain: "flow-spot-xxxxx.firebaseapp.com",
  projectId: "flow-spot-xxxxx",
  storageBucket: "flow-spot-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

### 2단계: Google Gemini API 설정

#### 2.1 API 키 생성
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. "새 API 키 만들기" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 복사

#### 2.2 API 활성화 (필요시)
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 선택
2. "API 및 서비스" → "라이브러리" 클릭
3. "Generative Language API" 검색
4. "활성화" 클릭

### 3단계: 로컬 프로젝트 설정

#### 3.1 저장소 클론
```bash
cd /sessions/eager-gracious-brown/mnt/SPOT
```

프로젝트는 이미 생성되어 있습니다.

#### 3.2 의존성 설치
```bash
cd flow-spot-app
npm install
```

설치 시간: 약 2-3분

#### 3.3 환경 변수 설정
```bash
cp .env.example .env.local
```

`flow-spot-app/.env.local` 파일을 편집:

```
# 1단계에서 복사한 Firebase Config 값들
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flow-spot-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flow-spot-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flow-spot-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# 2단계에서 복사한 Gemini API 키
GEMINI_API_KEY=AIzaSyDxxxxx

# 로컬 개발용 (배포 시 자동으로 변경됨)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4단계: 로컬 테스트

#### 4.1 개발 서버 실행
```bash
npm run dev
```

예상 출력:
```
> next dev

  ▲ Next.js 14.x.x

  ✓ Ready in 2.5s
```

#### 4.2 앱 접속
브라우저에서 `http://localhost:3000` 접속

#### 4.3 강사 로그인 테스트
1. 홈 페이지에서 "강사 입장" 클릭
2. 테스트 계정 생성:
   - 이메일: `test@example.com`
   - 비밀번호: `test123456`
3. 회원가입 클릭
4. 대시보드에 도착하면 성공!

#### 4.4 참가자 입장 테스트
1. 대시보드에서 "새 세션 만들기"
2. 세션명: `테스트 세션`
3. 생성된 세션 코드 복사 (예: `ABC123`)
4. 새 창/탭에서 `http://localhost:3000` 접속
5. "참가자 입장" 클릭
6. 세션 코드 입력
7. 정보 입력 후 진행

### 5단계: Firestore 보안 규칙 설정

#### 5.1 현재 규칙 확인
1. Firebase Console → Firestore Database
2. "규칙" 탭 클릭

#### 5.2 규칙 편집
현재 규칙:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

프로덕션용 더 엄격한 규칙 (선택사항):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 컬렉션
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // 프로젝트 컬렉션
    match /projects/{projectId} {
      allow read, write: if request.auth.uid == resource.data.instructorId;
    }

    // 세션 컬렉션
    match /sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.instructorId;
    }

    // 참가자 컬렉션
    match /participants/{participantId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6단계: GitHub에 푸시

#### 6.1 Git 초기화 (아직 안 한 경우)
```bash
cd flow-spot-app
git init
git add .
git commit -m "Initial commit: FLOW SPOT project"
```

#### 6.2 GitHub 저장소 생성
1. [GitHub](https://github.com/new)에서 새 저장소 생성
2. 저장소명: `flow-spot-app`
3. "Create repository" 클릭

#### 6.3 원격 저장소 추가 및 푸시
```bash
git remote add origin https://github.com/YOUR_USERNAME/flow-spot-app.git
git branch -M main
git push -u origin main
```

### 7단계: Vercel 배포

#### 7.1 Vercel 계정 생성/로그인
- [Vercel](https://vercel.com)에서 GitHub로 가입/로그인

#### 7.2 프로젝트 임포트
1. Vercel Dashboard에서 "Add New..." → "Project"
2. "Import Git Repository" 클릭
3. `flow-spot-app` 저장소 선택
4. "Import" 클릭

#### 7.3 환경 변수 설정
"Environment Variables" 섹션에서 다음 추가:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = flow-spot-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = flow-spot-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = flow-spot-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456789:web:xxxxx
GEMINI_API_KEY = AIzaSyDxxxxx
```

#### 7.4 배포 시작
1. "Deploy" 클릭
2. 배포 완료 대기 (약 3-5분)
3. 배포 URL 확인

예: `https://flow-spot-app.vercel.app`

### 8단계: 배포된 앱 테스트

#### 8.1 프로덕션 앱 접속
Vercel에서 제공한 URL로 접속

#### 8.2 강사 기능 테스트
1. 강사 로그인
2. 세션 생성
3. 세션 코드 확인

#### 8.3 참가자 기능 테스트
1. 새 창에서 앱 접속
2. 참가자 입장
3. 세션 코드 입력
4. 게임 진행

## 주요 파일 구조

```
flow-spot-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 홈 페이지
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── globals.css           # 전역 스타일
│   │   ├── admin/
│   │   │   ├── page.tsx          # 강사 로그인
│   │   │   ├── dashboard/        # 강사 대시보드
│   │   │   └── project/          # 프로젝트 관리
│   │   ├── join/
│   │   │   └── [code]/           # 참가자 입장
│   │   ├── session/
│   │   │   └── [id]/             # 참가자 게임 화면
│   │   ├── presenter/            # 프레젠터 모드
│   │   └── api/
│   │       └── avatar/           # 아바타 생성 API
│   ├── components/
│   │   ├── ui/                   # UI 컴포넌트
│   │   └── spots/                # 게임 활동 컴포넌트
│   ├── hooks/                    # 커스텀 훅
│   ├── lib/                      # 유틸리티 & 라이브러리
│   └── types/                    # TypeScript 타입 정의
├── public/                       # 정적 파일
├── .env.example                  # 환경 변수 템플릿
├── tsconfig.json                 # TypeScript 설정
├── tailwind.config.js            # Tailwind 설정
├── next.config.js                # Next.js 설정
├── package.json                  # 의존성
└── README.md                     # 프로젝트 문서
```

## 문제 해결

### Firebase 연결 오류

**증상**: "Failed to initialize Firebase" 메시지

**해결책**:
1. `.env.local` 파일 확인
2. Firebase Config 값들이 정확한지 확인
3. `npm run dev` 재시작
4. 브라우저 캐시 삭제

### Gemini API 오류

**증상**: 아바타 생성 실패

**해결책**:
1. API 키가 올바른지 확인
2. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 키 활성화 상태 확인
3. 일일 할당량 확인

### 세션 코드 인식 안 됨

**증상**: "세션을 찾을 수 없습니다" 오류

**해결책**:
1. 코드가 대문자인지 확인 (예: `ABC123`)
2. Firebase Console에서 `sessions` 컬렉션 확인
3. 세션이 실제로 생성되었는지 확인

### 배포 후 빈 페이지

**증상**: Vercel 배포 후 흰색 페이지 표시

**해결책**:
1. 환경 변수가 모두 설정되었는지 확인
2. Vercel 빌드 로그 확인
3. 브라우저 개발자 도구 → Console 확인

## 성능 팁

1. **이미지 최적화**: CDN 활용으로 로딩 속도 향상
2. **번들 크기**: Next.js 자동 코드 분할
3. **데이터베이스**: Firestore 인덱스 생성으로 쿼리 성능 향상

## 보안 체크리스트

- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] 민감한 정보가 환경 변수에 저장됨
- [ ] Firestore 보안 규칙이 설정됨
- [ ] Firebase Authentication이 활성화됨
- [ ] HTTPS가 배포 서버에서 사용됨

## 다음 단계

1. 커스텀 Spot 활동 추가
2. 참가자 응답 분석 대시보드 구현
3. 실시간 알림 기능 추가
4. 모바일 앱 개발 (React Native)
5. 다국어 지원 추가

## 연락처 및 지원

- GitHub Issues: 버그 보고 및 기능 요청
- 문서: README.md 및 코드 주석 참고
