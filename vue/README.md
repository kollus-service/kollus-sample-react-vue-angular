# Kollus Sample Vue — 플레이어 임베드 & 파일 업로드

## 개요

이 샘플은 Vue 3(Composition API) + Vite를 사용해 Kollus 플레이어 임베드(브라우저 JWT 서명), 파일 업로드(Kollus VOD API 직접 호출), 재생 이벤트 처리를 구현하는 방법을 보여줍니다. 별도 백엔드 없이 동작합니다.

## 사전 요구사항

- Node.js 22.18 이상 (최소 요구: `^22.18.0 || >=24.12.0`, `package.json`의 `engines` 기준)
- Kollus 서비스 계정의 보안 키 / 사용자 키(custom_key) / API 접근 토큰 / 미디어 콘텐츠 키(mckey)

## 환경 설정

별도 설정 파일이 없습니다. 키는 실행 후 화면 폼에 직접 입력하며 저장되지 않습니다.

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 로컬 미리보기
```

## 주요 파일

| 파일 | 설명 |
|------|------|
| `src/utils/kollusJwt.js` | Kollus 재생용 JWT(HS256)를 브라우저에서 직접 서명 |
| `src/api/uploadApi.js` | Kollus VOD API 직접 호출 (업로드 URL 발급/전송/진행률) |
| `src/components/KollusPlayer.vue` | 플레이어 iframe 임베드 + VG Controller 이벤트 수신 |
| `src/components/FileUploader.vue` | 파일 업로드 UI, 진행률 표시 |
| `src/App.vue` | 키 입력 폼 및 데모 페이지 구성 |

## API 흐름

**재생**: 폼 입력(보안 키, custom_key, cuid, mckey) → 브라우저에서 JWT 서명(Web Crypto HMAC-SHA256, `src/utils/kollusJwt.js`) → `https://v.kr.kollus.com/s?jwt=<JWT>&custom_key=<KEY>`를 iframe으로 로드(`src/components/KollusPlayer.vue`) → iframe load 후 VG Controller SDK 연결 → 재생 이벤트(loaded/ready/play/pause/done/waiting) 수신해 상태 표시.

**업로드**: 폼 입력(access_token) + 파일 선택 → `POST /api/upload/create-url`로 업로드 URL·진행률 URL 발급(`src/api/uploadApi.js`) → 발급된 `upload_url`에 파일을 multipart POST(필드명 `upload-file`) → `progress_url`을 2초 간격으로 폴링해 진행률 표시(`src/components/FileUploader.vue`) → 완료.

상세 흐름도와 배경 설명은 [루트 README의 API 흐름](../README.md#api-흐름)을 참고하세요.

## 관련 문서

- [Kollus 개발자 문서](https://docs.kollus.com)
- [루트 README](../README.md) — 전체 개요, 기능 설명, 주의사항
