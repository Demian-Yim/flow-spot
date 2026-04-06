# FLOW SPOT Vercel 배포 가이드

## 배포 전 체크리스트

- [ ] 로컬 테스트 완료
- [ ] 모든 환경 변수 설정 완료
- [ ] Firebase 프로젝트 생성 완료
- [ ] Gemini API 키 발급 완료
- [ ] GitHub 저장소 생성 완료

## 배포 아키텍처

```
GitHub Repository
        ↓
    Vercel
        ↓
    Production App
        ↓
   Firebase (Firestore, Auth)
   Google Gemini API
```

## 단계별 배포 프로세스

### 1단계: GitHub 저장소 준비

#### 1.1 초기 커밋
```bash
cd /sessions/eager-gracious-brown/mnt/SPOT/flow-spot-app

# Git 초기화
git init
git add .
git commit -m "Initial commit: FLOW SPOT - Corporate training game platform"

# 기본 브랜치 설정
git branch -M main
```

#### 1.2 GitHub에 푸시
```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/flow-spot-app.git
git push -u origin main
```

### 2단계: Vercel 프로젝트 설정

#### 2.1 Vercel 가입
1. https://vercel.com에 접속
2. "Sign Up" 클릭
3. GitHub로 가입 (권장)
4. 계정 확인

#### 2.2 프로젝트 임포트
1. Vercel Dashboard 접속
2. "Add New" → "Project" 클릭
3. "Import Git Repository" 클릭
4. GitHub 계정 승인
5. `flow-spot-app` 저장소 선택
6. "Import" 클릭

#### 2.3 프로젝트 설정
1. Framework: "Next.js" (자동 감지)
2. Root Directory: "./" (기본값)
3. Environment Variables: 아래 내용 추가

### 3단계: 환경 변수 설정

#### 3.1 Vercel에서 환경 변수 추가

"Environment Variables" 섹션에서 다음을 추가:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your_api_key | Firebase Config에서 복사 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | project.firebaseapp.com | Firebase Config에서 복사 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your_project_id | Firebase Config에서 복사 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | project.appspot.com | Firebase Config에서 복사 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 123456789 | Firebase Config에서 복사 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:123456789:web:xxxxx | Firebase Config에서 복사 |
| `GEMINI_API_KEY` | your_gemini_key | Google AI Studio에서 복사 |

**주의**: `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에 노출됩니다. 노출되어도 괜찮은 정보만 포함해야 합니다.

#### 3.2 환경 선택
- Production: 실제 배포용
- Preview: PR 미리보기용
- Development: 선택사항

### 4단계: 배포 실행

#### 4.1 초기 배포
```
Vercel Dashboard에서:
1. "Deploy" 버튼 클릭
2. 배포 진행 상황 확인 (3-5분)
3. 배포 완료 → Production URL 생성
```

예상 URL: `https://flow-spot-app.vercel.app`

#### 4.2 배포 확인
배포 페이지에서:
- 빌드 로그 확인
- 배포 상태 확인
- Preview URL 클릭하여 테스트

### 5단계: 배포 후 설정

#### 5.1 도메인 연결 (선택사항)

1. Vercel Project → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: flowspot.app)
4. DNS 설정 지시사항 따르기

#### 5.2 환경 선택적 설정

**Production 환경 강화**:
```
Settings → Domains → Production
SSL/TLS: Automatic (기본값)
```

**Preview URL 보호** (선택사항):
```
Settings → Security → Password Protection
```

### 6단계: 운영 및 모니터링

#### 6.1 배포 자동화

GitHub에 푸시할 때마다 자동 배포:
```bash
# 새 기능 추가
git add .
git commit -m "Add new feature"
git push origin main

# Vercel이 자동으로 감지하여 배포
```

#### 6.2 배포 롤백

이전 버전으로 돌아가기:
1. Vercel Dashboard → Deployments
2. 이전 배포 선택
3. "Promote to Production" 클릭

#### 6.3 분석 및 모니터링

**성능 모니터링**:
- Vercel Analytics (활성화 필수)
- Core Web Vitals 확인
- Edge Request 확인

**에러 모니터링** (선택사항):
```bash
npm install @vercel/edge
```

### 7단계: 운영 체크리스트

#### 매일 확인
- [ ] 서비스 정상 작동 확인
- [ ] 에러 로그 확인

#### 매주 확인
- [ ] Vercel Analytics 검토
- [ ] 사용자 피드백 확인
- [ ] 성능 메트릭 확인

#### 월간 확인
- [ ] Firebase 사용량 및 비용 검토
- [ ] Gemini API 할당량 확인
- [ ] 보안 업데이트 확인

## 문제 해결

### 배포 실패

**증상**: 빌드 실패

**확인 사항**:
1. 빌드 로그 확인 (Vercel Dashboard → Deployments)
2. 공통 오류:
   - 타입 스크립트 에러: `npm run type-check` 실행
   - 빌드 에러: `npm run build` 로컬에서 실행
   - 의존성 문제: `npm install` 재실행

### 환경 변수 오류

**증상**: "Firebase not initialized" 오류

**해결책**:
1. 모든 환경 변수 확인
2. 값에 여백이 없는지 확인
3. Vercel Dashboard에서 "Redeploy" 클릭

### 성능 문제

**증상**: 로딩 느림

**개선책**:
1. Vercel Analytics에서 느린 페이지 확인
2. 이미지 최적화 확인
3. Code splitting 확인

## 커스텀 도메인 설정

### Vercel에서 도메인 연결

1. Vercel Project Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력
4. DNS 레코드 업데이트

### DNS 설정 예시 (Namecheap)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

또는:

```
Type: A
Name: @
Value: 76.76.19.163
```

## 비용 및 할당량

### Vercel

- 무료 티어: 충분한 대부분의 경우
- 프로  티어: $20/달 (추가 기능)

### Firebase

무료 사용량:
- Firestore: 50,000 읽기/일
- Storage: 5GB
- Auth: 제한 없음

### Gemini API

- 월 60 요청 무료
- 초과: 요청당 비용

## 스케일링 전략

### 1단계: 현재 상태 (최대 100-500 동시 사용자)
- Vercel 무료 티어 충분
- Firestore 무료 할당량 충분
- Gemini API 유료로 업그레이드 권장

### 2단계: 성장 (500-5000 동시 사용자)
- Vercel Pro 고려
- Firebase Pro로 업그레이드
- 데이터베이스 인덱싱 최적화
- CDN 활용

### 3단계: 엔터프라이즈 (5000+ 동시 사용자)
- 마이크로서비스 아키텍처 검토
- 전용 데이터베이스 서버 고려
- 로드 밸런싱 구현

## 보안 점검

배포 전 확인사항:
- [ ] `.env.local`이 `.gitignore`에 있음
- [ ] 환경 변수에 민감 정보 보안
- [ ] Firebase 보안 규칙 설정됨
- [ ] CORS 설정 확인
- [ ] 인증 필수 페이지 보호

## 배포 후 최적화

### 1. 이미지 최적화
```typescript
import Image from 'next/image'
// 자동 최적화 적용
```

### 2. 번들 크기 최적화
```bash
npm install -g next-bundle-analyzer
ANALYZE=true npm run build
```

### 3. 캐싱 전략
```javascript
// next.config.js
headers: async () => {
  return [
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000' }
      ]
    }
  ]
}
```

## 자동 배포 트리거

### GitHub Actions (선택사항)

`.github/workflows/deploy.yml` 생성:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 모니터링 및 분석

### Vercel Analytics 활성화

1. Project Settings → Analytics
2. Web Analytics 활성화
3. Speed Insights 활성화

### 추가 도구 (선택사항)

- **Sentry**: 에러 추적
- **LogRocket**: 사용자 세션 기록
- **Datadog**: 성능 모니터링

## 지원 및 문제 해결

### 공식 문서
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)

### 커뮤니티
- [Vercel Discussions](https://github.com/vercel/next.js/discussions)
- [Firebase Community](https://stackoverflow.com/questions/tagged/firebase)

## 긴급 연락처

배포 문제 발생 시:
1. Vercel Status Page 확인
2. GitHub Issues 확인
3. Vercel Support 문의 (Pro 플랜)
