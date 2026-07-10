# Kollus Sample (React)

Kollus 미디어 플랫폼 연동 샘플의 React 구현체입니다. 전체 개요와 기능 설명, 목(mock) API 모드는 [루트 README](../README.md)를 참고하세요.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 로컬 미리보기
```

## 구성

- `src/api/` — `playerApi.js`(JWT 발급), `uploadApi.js`(업로드 URL/진행률/전송), `mockApi.js`(목 API 모드), `config.js`(환경변수)
- `src/components/` — `KollusPlayer.jsx`(플레이어 임베드 + 이벤트 처리), `FileUploader.jsx`(파일 업로드)
- `.env.local` — `VITE_API_BASE_URL`, `VITE_USE_MOCK_API` 설정 (gitignore)
