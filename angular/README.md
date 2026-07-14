# Kollus Sample Angular — 플레이어 임베드 & 파일 업로드

## 개요

이 샘플은 Angular 19(Standalone 컴포넌트)를 사용해 Kollus 플레이어 임베드(브라우저 JWT 서명), 파일 업로드(Kollus VOD API 직접 호출), 재생 이벤트 처리를 구현하는 방법을 보여줍니다. 별도 백엔드 없이 동작합니다.

## 사전 요구사항

- Node.js `^22.18.0 || >=24.12.0`
- Kollus 서비스 계정의 보안 키 / 사용자 키(custom_key) / API 접근 토큰 / 미디어 콘텐츠 키(mckey)

## 환경 설정

별도 설정 파일이 없습니다. 키는 실행 후 화면 폼에 직접 입력하며 저장되지 않습니다.

## 실행 방법

```bash
npm install
npm start        # (= ng serve) http://localhost:4200
npm run build    # (= ng build)
```

## 주요 파일

| 파일 | 설명 |
|------|------|
| `src/app/utils/kollus-jwt.ts` | Kollus 재생용 JWT(HS256)를 브라우저에서 직접 서명 |
| `src/app/services/kollus-api.service.ts` | Kollus VOD API 직접 호출 (업로드 URL 발급/전송/진행률) |
| `src/app/components/kollus-player/` | 플레이어 iframe 임베드 + VG Controller 이벤트 수신 |
| `src/app/components/file-uploader/` | 파일 업로드 UI, 진행률 표시 |
| `src/app/app.component.ts` | 키 입력 폼 및 데모 페이지 구성 |

## API 흐름

[루트 README의 API 흐름](../README.md#api-흐름)을 참고하세요.

## 관련 문서

- [Kollus 개발자 문서](https://docs.kollus.com)
- [루트 README](../README.md) — 전체 개요, 기능 설명, 알려진 한계
