# Cloudflare Pages Functions 설정 가이드

이 레포는 정적 포트폴리오를 Cloudflare Pages에 배포하면서, Gemini API 키는 `Pages Functions`에서만 읽도록 구성할 수 있습니다.

## 이번에 Gemini를 연결한 프로젝트

- `projects/travel-planner/index.html`
  - API: `/api/travel-plan`
- `projects/vibe-note/index.html`
  - API: `/api/vibe-note`
- `projects/ai-interview-coach/index.html`
  - API: `/api/interview-coach`

실시간 통역 프로젝트는 브라우저 Web Speech API 기반으로 유지했고, 이번 구조 변경 대상에서 제외했습니다.

## Cloudflare Pages에 저장할 값

Cloudflare Dashboard 경로:
`Workers & Pages -> 내 Pages 프로젝트 -> Settings -> Variables and Secrets`

### Secret(Encrypt)로 저장할 값

- 이름: `GEMINI_API_KEY`
- 타입: `Secret` 또는 `Encrypt`
- 값: Google AI Studio에서 발급받은 실제 Gemini API Key

이 값은 민감정보이므로 반드시 Secret으로 저장해야 합니다.
코드에서는 `context.env.GEMINI_API_KEY`로만 읽습니다.

### 일반 Variable로 저장 가능한 값

- 이름: `GEMINI_MODEL`
- 타입: 일반 Variable
- 예시 값: `gemini-2.5-flash`

모델명은 민감정보가 아니므로 일반 Variable로 둬도 됩니다.
설정하지 않으면 코드 기본값 `gemini-2.5-flash`를 사용합니다.

## 실제 저장 예시

### Secret 예시

- Key: `GEMINI_API_KEY`
- Value: `AIza...실제키...`
- 옵션: `Encrypt` 켜기

### Variable 예시

- Key: `GEMINI_MODEL`
- Value: `gemini-2.5-flash`

## 코드에서 읽는 방식

```js
const apiKey = context.env.GEMINI_API_KEY;
const model = context.env.GEMINI_MODEL || "gemini-2.5-flash";
```

## 로컬 테스트 방법

정적 HTML을 `file://`로 직접 열면 `/api/...` Functions 라우트가 없어서 실제 Gemini 호출은 되지 않습니다.
이 경우 현재 프런트는 데모 fallback 로직으로 동작합니다.

실제 Gemini까지 로컬에서 확인하려면 Functions가 함께 떠야 하므로 `wrangler pages dev` 방식으로 실행하는 것이 좋습니다.

### 1. 로컬 변수 파일 준비

루트에 `.dev.vars` 파일을 만들고 아래처럼 넣습니다.

```env
GEMINI_API_KEY=your-real-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

예시 파일은 `.dev.vars.example`에 들어 있습니다.

### 2. 로컬 실행

```bash
npx wrangler pages dev .
```

그러면 정적 파일과 `functions/` 아래 API가 같이 떠서, 내 PC에서도 실제 Gemini 응답을 확인할 수 있습니다.

## 배포 후 동작 흐름

### Voyage Flow Planner

1. 사용자가 여행 조건 입력
2. 브라우저가 `/api/travel-plan` 호출
3. Function이 `GEMINI_API_KEY`로 Gemini 호출
4. AI 일정, 예산, 체크리스트를 받아 화면에 렌더링

### VIBE NOTE

1. 사용자가 현재 감정과 에너지 입력
2. 브라우저가 `/api/vibe-note` 호출
3. Function이 감정 큐레이션 JSON 생성
4. 추천 음악, 콘텐츠, 한 줄 문장을 렌더링

### AI Interview Coach

1. 사용자가 자기소개 입력
2. 브라우저가 `/api/interview-coach` 호출
3. 질문 생성, 답변 평가, STAR 초안을 Gemini가 반환
4. 프런트가 질문 카드/리포트/UI에 반영

## 현재 추가된 서버 파일

- `functions/_shared/http.js`
- `functions/_shared/gemini.js`
- `functions/api/travel-plan.js`
- `functions/api/vibe-note.js`
- `functions/api/interview-coach.js`

## 주의할 점

- 프런트 JS에 API 키를 하드코딩하면 바로 노출됩니다.
- 민감정보는 반드시 Functions 런타임에서만 읽게 해야 합니다.
- Secret을 바꿨다면 그 값을 사용하는 새 배포가 한 번 다시 이루어져야 반영됩니다.
- `file://` 직접 실행은 fallback 데모만 확인하는 용도이고, 실제 AI 테스트는 `wrangler pages dev` 또는 Cloudflare Pages 배포 주소에서 해야 합니다.

## 참고 문서

- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/
- Cloudflare Pages Bindings / Secrets: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare Environment variables / Secrets: https://developers.cloudflare.com/workers/configuration/environment-variables/
