# FLOW SPOT - 빠른 시작 가이드

5분 안에 시작하세요!

## 필수 사항

1. **Firebase 설정** (5분)
   - https://console.firebase.google.com → 새 프로젝트 만들기
   - Authentication 활성화 (Email/Password)
   - Firestore Database 생성
   - 프로젝트 설정에서 Web App config 복사

2. **Gemini API 키** (2분)
   - https://makersuite.google.com/app/apikey → API 키 생성
   - API 키 복사

## 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 편집하여 Firebase config와 Gemini API 키 입력
```

## 실행

```bash
npm run dev
# http://localhost:3000에서 접속
```

## 테스트 계정

```
이메일: test@example.com
비밀번호: test123456
```

## 기본 플로우

### 강사 (강사입장)
1. `/admin` → 로그인/회원가입
2. `/admin/dashboard` → "새 세션 만들기"
3. 세션 코드 또는 QR 코드로 참가자 초대
4. `/presenter/[id]` → 프레젠터 모드 시작

### 참가자 (참가자입장)
1. 홈 → "참가자 입장"
2. 세션 코드 입력
3. 정보 입력 (이름, 소속, 호칭)
4. 게임 진행

## 배포

### Vercel에 배포

```bash
# 1. GitHub에 푸시
git push origin main

# 2. Vercel에서 자동 배포
# 또는 수동으로: https://vercel.com → Import Project
```

### 환경 변수 추가
Vercel Project Settings → Environment Variables에서 추가:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- GEMINI_API_KEY

## 파일 구조

```
flow-spot-app/
├── src/
│   ├── app/                    # 페이지 및 API
│   ├── components/
│   │   ├── ui/                 # 기본 UI 컴포넌트
│   │   └── spots/              # 게임 활동 컴포넌트
│   ├── hooks/                  # 커스텀 훅 (Firebase, Sound, Session)
│   ├── lib/                    # Firebase, Gemini 초기화
│   └── types/                  # TypeScript 타입 정의
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 주요 페이지

| URL | 설명 | 사용자 |
|-----|------|--------|
| `/` | 홈 페이지 | 모두 |
| `/admin` | 강사 로그인 | 강사 |
| `/admin/dashboard` | 강사 대시보드 | 강사 |
| `/admin/project/[id]` | 프로젝트 관리 | 강사 |
| `/join/[code]` | 참가자 입장 | 참가자 |
| `/session/[id]` | 참가자 게임 화면 | 참가자 |
| `/presenter/[id]` | 프레젠터 모드 | 강사 |

## 커스터마이징

### 색상 변경
`tailwind.config.js`에서 색상 변경:
```javascript
colors: {
  primary: '#FF8C6B',      // 메인 색
  secondary: '#7EC8E3',    // 보조 색
  accent: '#A8D5BA',       // 강조 색
  purple: '#C3A6D8',       // 보라색
  yellow: '#FFD966',       // 노란색
}
```

### 시간 설정
각 Spot 컴포넌트에서 `duration` prop 수정:
```typescript
<MannerMode duration={30} /> // 30초
<StretchActivity duration={90} /> // 90초
```

### 텍스트 한국화
각 컴포넌트의 텍스트 수정

## 문제 해결

**로컬에서 안 되면:**
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제
npm run build
rm -rf .next

# 다시 실행
npm run dev
```

**Firebase 오류:**
- `.env.local` 확인
- Firebase 프로젝트 설정 확인
- 브라우저 콘솔 에러 확인

**Gemini 오류:**
- API 키 확인
- 일일 할당량 확인

## 다음 단계

1. **커스텀 Spot 추가**
   - `src/components/spots/[NewSpot].tsx` 생성
   - UI 구현 (Tailwind CSS)
   - 페이지에 추가

2. **데이터 분석**
   - Firestore 데이터 조회
   - 참가자 응답 분석
   - 대시보드에 표시

3. **배포 최적화**
   - 이미지 최적화
   - 번들 크기 분석
   - 성능 모니터링

## 문서

- **상세 가이드**: `SETUP.md` 읽기
- **배포 가이드**: `DEPLOYMENT.md` 읽기
- **API 문서**: `README.md` 읽기

## 커뮤니티

- GitHub Issues에서 버그 보고
- 기능 요청은 Discussions 사용
- 코드 기여는 Pull Request로

## 라이선스

MIT License

---

**문제가 생기면 설명서를 참고하세요!**
