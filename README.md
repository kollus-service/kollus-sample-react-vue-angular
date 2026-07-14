# Kollus Sample Frontend

Kollus 미디어 플랫폼 연동 샘플입니다. React, Vue, Angular 세 가지 프론트엔드 프레임워크로 동일한 기능(플레이어 임베드, 파일 업로드, 이벤트 처리)을 구현합니다.

**별도 백엔드 없이 프론트엔드만으로 동작합니다.** JWT는 브라우저에서 직접 서명하고, 파일 업로드도 Kollus VOD API를 브라우저에서 직접 호출합니다. 재생/업로드에 필요한 키는 화면 폼에 입력하며, 어디에도 저장되지 않습니다(새로고침 시 사라짐).

## 저장소 구조

```
kollus-sample-frontend/
├── react/      # React 18 + Vite  (http://localhost:5173)
├── vue/        # Vue 3 + Vite     (http://localhost:5174)
└── angular/    # Angular 19       (http://localhost:4200)
```

세 프로젝트는 서로 독립적이며, 동일한 구조로 같은 기능을 각 프레임워크 방식으로 구현합니다.

## 기능 설명

### 1. Kollus 플레이어 임베드

브라우저에서 Web Crypto API(HMAC-SHA256)로 재생용 JWT를 직접 서명해 아래 형식의 S링크(보안 URL)를 구성하고, `<iframe>`으로 삽입합니다.

```
https://v.kr.kollus.com/s?jwt=<JWT>&custom_key=<CUSTOM_KEY>
```

JWT payload는 Kollus 표준 규격(`cuid`, `expt`, `mc: [{ mckey }]`)을 따르며, 화면 폼에 입력한 **보안 키(Secret Key)**로 서명합니다. 보안 키·사용자 키(custom_key)·시청자 ID(cuid)·미디어 콘텐츠 키(mckey)는 모두 컴포넌트 상태로만 유지되고 localStorage/서버 등 어디에도 저장되지 않습니다.

iframe이 로드된 뒤 Kollus의 **VG Controller SDK**(`vg-controller-client.latest.min.js`)를 통해 플레이어와 통신하며, 재생 라이프사이클 이벤트(`loaded`, `ready`, `play`, `pause`, `done`, `waiting`)를 구독해 화면에 현재 재생 상태를 표시합니다.

> ⚠️ 보안 키를 클라이언트 코드에 두는 것은 실제 서비스에서는 권장되지 않습니다(Kollus 공식 가이드도 JWT는 서버 사이드에서 발급하도록 안내합니다). 이 샘플은 백엔드 없이 빠르게 테스트하기 위한 용도입니다.

### 2. 파일 업로드

Kollus VOD REST API(`POST https://c-api-kr.kollus.com/api/upload/create-url`)를 브라우저에서 **직접 호출**해 업로드 서버 URL과 진행률 조회 URL을 발급받은 뒤, 파일을 Kollus 업로드 서버로 직접 전송(fetch POST)합니다. 이때 필드명은 반드시 `upload-file` 이어야 합니다.

인증은 화면 폼에 입력한 **API 접근 토큰(access_token)**을 쿼리 파라미터로 전달합니다. 이 토큰도 컴포넌트 상태로만 유지되며 저장되지 않습니다.

업로드 진행률은 create-url 응답으로 받은 `progress_url`을 2초 간격으로 폴링해 표시합니다. (XHR의 `upload.progress` 이벤트를 쓰지 않는 이유: 업로드 진행률 리스너를 달면 CORS preflight가 강제되는데, Kollus 업로드 서버가 OPTIONS 요청에 응답하지 않아 전송이 실패합니다.)

업로드가 끝나면 "업로드 완료 (100%)" 메시지를 표시하고, 실패 시 에러 메시지를 표시합니다.

> 이 API는 원래 서버 사이드 호출용이지만, 브라우저에서 직접 호출해도 CORS로 차단되지 않는 것을 확인했습니다. 다만 계정/네트워크 환경에 따라 달라질 수 있습니다.

### 3. 플레이어 이벤트 처리

콜백(재생, DRM, LMS)은 서버 사이드에서 처리하는 것이 원칙이며, 프론트엔드는 VG Controller SDK 이벤트를 postMessage 기반으로 수신해 재생 상태(`재생 상태: ready` 등)를 화면에 표시하는 역할만 담당합니다. 플레이어 임베드 컴포넌트에 함께 구현되어 있습니다.

## 사전 요구사항

- Node.js 20 이상 (Angular는 `^22.18.0 || >=24.12.0` 권장)
- Kollus 서비스 계정의 **보안 키**, **사용자 키(custom_key)**, **API 접근 토큰**, 재생할 콘텐츠의 **미디어 콘텐츠 키(mckey)** — 키 확인 경로는 Kollus VOD 콘솔 > [서비스 계정] 메뉴입니다.

## 환경 설정

별도 설정 파일이 없습니다. 재생/업로드에 필요한 키는 앱 실행 후 화면 폼에 직접 입력하며, 컴포넌트 상태로만 유지되고 어디에도 저장되지 않습니다.

## 실행 방법

각 프로젝트 디렉터리에서 실행합니다.

```bash
# React
cd react
npm install
npm run dev      # http://localhost:5173
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 로컬 미리보기

# Vue
cd vue
npm install
npm run dev      # http://localhost:5174
npm run build
npm run preview

# Angular
cd angular
npm install
npm start        # (= ng serve) http://localhost:4200
npm run build    # (= ng build)
```

테스트 스위트는 구성되어 있지 않습니다.

## 주요 파일

| 파일 (React 기준, Vue/Angular 동일 구조) | 설명 |
|------|------|
| `src/utils/kollusJwt.js` | Kollus 재생용 JWT(HS256)를 Web Crypto API로 브라우저에서 직접 서명 |
| `src/api/uploadApi.js` | Kollus VOD API 직접 호출 (업로드 URL 발급, 파일 전송, 진행률 조회) |
| `src/components/KollusPlayer.*` | 플레이어 iframe 임베드 + VG Controller 이벤트 수신 |
| `src/components/FileUploader.*` | 파일 선택/업로드 UI, 진행률 표시 |

Angular는 `src/app/utils/kollus-jwt.ts`, `src/app/services/kollus-api.service.ts`, `src/app/components/` 경로를 사용합니다.

## API 흐름

**재생**

```
폼 입력(보안 키, custom_key, cuid, mckey)
  → 브라우저에서 JWT 서명 (Web Crypto HMAC-SHA256)
  → iframe: https://v.kr.kollus.com/s?jwt=<JWT>&custom_key=<KEY>
  → VG Controller SDK 연결 → 재생 이벤트 수신 (loaded/ready/play/pause/done/waiting)
```

**업로드**

```
폼 입력(access_token) + 파일 선택
  → POST https://c-api-kr.kollus.com/api/upload/create-url?access_token=..
  ← upload_url, progress_url, upload_file_key
  → POST upload_url (multipart, 필드명 upload-file)
  → GET progress_url 2초 폴링 → 진행률 표시 → 완료
```

## 테스트 방법 요약

1. 위 실행 방법대로 원하는 프로젝트의 dev 서버를 띄웁니다.
2. **플레이어**: 보안 키·사용자 키·시청자 ID·mckey를 입력하고 [플레이어 불러오기]를 클릭하면 클라이언트에서 JWT가 서명되어 iframe이 뜹니다. 실제 Kollus 계정 정보를 넣으면 정상 재생되고, 가짜 값이면 Kollus 쪽 에러 화면이 뜨는 게 정상입니다.
3. **파일 업로드**: API 접근 토큰과 파일을 선택하고 업로드 버튼을 클릭하면 Kollus API를 직접 호출합니다. 유효한 토큰이면 실제로 업로드되고 진행률이 올라갑니다.

## 알려진 한계

- JWT 서명에 사용하는 Web Crypto API는 secure context(https 또는 localhost)에서만 동작합니다. `http://<사설IP>` 등으로 접속하면 플레이어 로드가 실패합니다.
- 업로드 진행률 조회(`progress_url`) 응답의 정확한 필드 스펙이 공개 문서에 없어 방어적으로 파싱합니다(`data.percent` 또는 `percent` 중 있는 값을 사용).
- Kollus VOD API를 브라우저에서 직접 호출하는 구조라 CORS 정책이나 네트워크 환경에 따라 실패할 수 있습니다.
- 보안 키·API 접근 토큰을 클라이언트에 두는 구조는 샘플/테스트 목적입니다. 실제 서비스에 배포할 때는 반드시 서버 사이드에서 JWT를 발급하고 업로드를 프록시하도록 변경하세요.

## 관련 문서

- [Kollus 개발자 문서](https://docs.kollus.com)
- [재생 URL 생성 (JWT)](https://docs.kollus.com/dev-guide/vod/player/jwt/)
- [업로드 API](https://docs.kollus.com/dev-guide/vod/api/upload-api/)
- [Web Player Controller (VG Controller)](https://docs.kollus.com/dev-guide/vod/player/web-player-controller/)
