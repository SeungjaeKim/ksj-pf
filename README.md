# ksj-pf

## Gemini + Cloudflare Pages Functions

- 설정 문서: [docs/cloudflare-pages-functions.md](docs/cloudflare-pages-functions.md)
- 여행 플래너 API: `functions/api/travel-plan.js`
- 바이브 큐레이터 API: `functions/api/vibe-note.js`
- 면접 코치 API: `functions/api/interview-coach.js`

배포 시 민감한 키는 Cloudflare Pages의 `Settings -> Variables and Secrets`에서 `GEMINI_API_KEY`를 `Secret(Encrypt)`로 등록하면 됩니다.
