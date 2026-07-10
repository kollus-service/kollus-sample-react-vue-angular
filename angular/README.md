# Kollus Sample (Angular)

Kollus 미디어 플랫폼 연동 샘플의 Angular 19 구현체입니다. 전체 개요와 기능 설명, 목(mock) API 모드는 [루트 README](../README.md)를 참고하세요.

## 실행

```bash
npm install
npm start        # (= ng serve) http://localhost:4200
npm run build    # (= ng build)
```

## 구성

- `src/app/services/kollus-api.service.ts` — JWT 발급, 업로드 URL/진행률/전송 (HttpClient 기반)
- `src/app/services/kollus-mock-api.ts` — 목 API 모드
- `src/app/components/kollus-player/` — 플레이어 임베드 + 이벤트 처리
- `src/app/components/file-uploader/` — 파일 업로드
- `src/environments/environment.ts` — `apiBaseUrl`, `useMockApi` 설정 (gitignore)
