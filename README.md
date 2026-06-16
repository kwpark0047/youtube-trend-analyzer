# YouTube 트렌드 분석기

YouTube Data API v3를 활용하여 급상승 영상, 교육 카테고리 영상, 최신 광고 영상을 분석하는 웹 애플리케이션입니다.

![Next.js](https://img.shields.io/badge/Next.js-15.5.18-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f48120)

## 기능

### 🔥 급상승 영상 분석
- 국가별 TOP 25/50/100 급상승 영상 조회
- 카테고리별 필터링 (영화, 음악, 게임, 교육 등 30개국 지원)
- 조회수, 좋아요, 댓글 수 등 상세 통계
- CSV 다운로드 기능

### 📚 교육 영상 분석
- 3가지 전략으로 교육 카테고리 영상 수집
  - **전략 1**: 트렌딩 교육 카테고리 (quota: 1)
  - **전략 2**: 검색 API 기반 (quota: 101)
  - **전략 3**: 전체 급상승 필터링 (quota: 2)
- 교육 영상 전용 대시보드

### 📺 최신 광고 영상
- 키워드 기반 광고 영상 검색
- 국가별 맞춤 검색 쿼리 (한국: "광고 OR CF", 미국: "commercial OR advertisement" 등)
- 최신순 정렬

### 💬 댓글 분석
- 영상별 댓글 조회
- 댓글 CSV 다운로드
- 댓글 비활성화 영상 처리

### 🔐 사용자 인증
- 이메일/비밀번호 인증
- Google OAuth 인증
- 사용자 설정 저장 (API 키, 기본 국가, 조회 수)

## 설치 방법

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- YouTube Data API v3 키
- Supabase 프로젝트 (인증용)

### 1. 저장소 클론
```bash
git clone https://github.com/kwpark0047/youtube-trend-analyzer.git
cd youtube-trend-analyzer
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어서 다음 변수들을 설정하세요:

```env
# YouTube API 키
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하세요.

## 환경 변수

| 변수명 | 설명 | 필수 | 기본값 |
|--------|------|------|--------|
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 키 | Yes | - |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名 키 | Yes | - |

### YouTube API 키 발급 방법
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. YouTube Data API v3 활성화
4. 인증 정보 → API 키 생성
5. API 키 제한 설정 (YouTube Data API v3만 허용)

### Supabase 설정 방법
1. [Supabase](https://supabase.com/) 접속
2. 새 프로젝트 생성
3. Settings → API에서 URL과 anon key 확인
4. Authentication → Providers에서 Google OAuth 설정 (선택사항)

## 배포

### Cloudflare Workers 배포
```bash
# 빌드
npm run build

# Cloudflare Workers 빌드
npm run preview

# 배포
npm run deploy
```

### 환경 변수 설정 (Cloudflare)
Cloudflare 대시보드 → Workers → 설정 → 환경 변수에서 설정하세요.

## 프로젝트 구조

```
youtube-trend-analyzer/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── trending/             # 급상승 영상 조회
│   │   ├── education/            # 교육 영상 조회
│   │   ├── ads/                  # 광고 영상 검색
│   │   ├── categories/           # 카테고리 목록
│   │   └── comments/             # 댓글 조회
│   ├── auth/                     # 인증 콜백
│   ├── page.tsx                  # 메인 페이지
│   └── layout.tsx                # 루트 레이아웃
├── components/                   # React 컴포넌트
│   ├── VideoGrid.tsx             # 영상 그리드
│   ├── VideoCard.tsx             # 영상 카드
│   ├── VideoModal.tsx            # 영상 상세 모달
│   ├── CommentList.tsx           # 댓글 목록
│   ├── EducationTab.tsx          # 교육 탭
│   ├── AdsTab.tsx                # 광고 탭
│   ├── ApiKeyManager.tsx         # API 키 관리
│   ├── RollingBanner.tsx         # 롤링 배너
│   ├── UserMenu.tsx              # 사용자 메뉴
│   ├── AuthModal.tsx             # 인증 모달
│   └── SettingsModal.tsx         # 설정 모달
├── contexts/                     # React Context
│   └── AuthContext.tsx            # 인증 상태 관리
├── lib/                          # 유틸리티 함수
│   ├── youtube.ts                # YouTube API 호출
│   ├── supabase.ts               # Supabase 클라이언트
│   └── constants.ts              # 상수 정의
├── types/                        # TypeScript 타입
│   └── youtube.ts                # YouTube 관련 타입
└── 설정 파일들
```

## API 엔드포인트

### GET /api/trending
급상승 영상 조회

**파라미터:**
- `apiKey` (필수): YouTube API 키
- `regionCode` (선택): 국가 코드 (기본: KR)
- `categoryId` (선택): 카테고리 ID
- `maxResults` (선택): 조회 수 (기본: 100)

### GET /api/education
교육 영상 조회

**파라미터:**
- `apiKey` (필수): YouTube API 키
- `regionCode` (선택): 국가 코드 (기본: KR)
- `maxResults` (선택): 조회 수 (기본: 30)

### GET /api/ads
최신 광고 영상 검색

**파라미터:**
- `apiKey` (필수): YouTube API 키
- `regionCode` (선택): 국가 코드 (기본: KR)
- `maxResults` (선택): 조회 수 (기본: 30)

### GET /api/categories
카테고리 목록 조회

**파라미터:**
- `apiKey` (필수): YouTube API 키
- `regionCode` (선택): 국가 코드 (기본: KR)
- `hl` (선택): 언어 (기본: ko)

### GET /api/comments
댓글 조회

**파라미터:**
- `apiKey` (필수): YouTube API 키
- `videoId` (필수): 영상 ID
- `maxResults` (선택): 조회 수 (기본: 20)
- `order` (선택): 정렬 순서 (relevance/time)

## 기술적 고려사항

### Quota 관리
YouTube Data API v3는 일일 할당량이 있습니다. 본 애플리케이션은 효율적인 quota 사용을 위해:

1. **교육 영상**: 3가지 전략으로 quota 최적화
   - 전략 1 (트렌딩): 1 quota
   - 전략 2 (검색): 101 quota
   - 전략 3 (필터링): 2 quota

2. **광고 영상**: 키워드 기반 검색으로 quota 절약

### 에러 핸들링
- API 키 오류: 사용자 친화적 에러 메시지
- 네트워크 오류: 재시도 로직
- quota 초과: 경고 메시지 표시
- 댓글 비활성화: 별도 처리

### 보안
- API 키는 클라이언트에서 관리 (Supabase 연동 시 서버 저장)
- Supabase RLS (Row Level Security) 적용
- 환경 변수를 통한 시크릿 관리

## 문제 해결

### API 키 오류
```
API 키가 필요합니다.
```
→ API 키를 올바르게 입력했는지 확인하세요.

### Quota 초과
```
 quota has been exceeded
```
→ YouTube API 일일 할당량을 초과했습니다. 내일 다시 시도하거나 quota를 늘리세요.

### 댓글을 가져올 수 없습니다
```
commentsDisabled
```
→ 해당 영상은 댓글이 비활성화되어 있습니다.

## 라이선스

MIT License

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 감사의 말

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
