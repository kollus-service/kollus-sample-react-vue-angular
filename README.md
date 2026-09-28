# Kollus Sample Frontend — React·Vue·Angular 플레이어 임베드 & 파일 업로드

## 개요

React, Vue, Angular 세 가지 프레임워크로 Kollus 미디어 플랫폼 연동을 동일하게 구현한 샘플입니다. 플레이어 임베드, 파일 업로드, 재생 이벤트 처리 세 가지 기능을 다룹니다.

**별도 백엔드 없이 프론트엔드만으로 동작합니다.** 재생용 JWT 서명과 파일 업로드 모두 브라우저에서 직접 처리하며, 필요한 키는 앱 실행 후 화면 폼에 입력합니다. 입력한 키는 컴포넌트 상태로만 유지되므로 코드·설정 파일·스토리지 어디에도 남지 않으며, 새로고침하면 사라집니다.

### 저장소 구조

```
kollus-sample-react-vue-angular/
├── react/      # React 18 + Vite  (http://localhost:5173)
├── vue/        # Vue 3 + Vite     (http://localhost:5174)
└── angular/    # Angular 19       (http://localhost:4200)
```

세 프로젝트는 서로 독립적이며, 같은 기능을 각 프레임워크의 방식으로 구현합니다. 하나만 골라 실행해도 됩니다.

## 사전 요구사항

- **Node.js 22.18 이상 권장** — 세 프로젝트의 요구 버전을 공통으로 만족하는 버전입니다.
- Kollus 서비스 계정 정보 — VOD 콘솔의 [서비스 계정] 메뉴에서 확인할 수 있습니다.
  - 보안 키 (Secret Key)
  - 사용자 키 (custom_key)
  - API 접근 토큰 (access_token)
  - 재생할 콘텐츠의 미디어 콘텐츠 키 (mckey)

프로젝트별 최소 Node.js 버전(`engines` 기준)은 다음과 같습니다.

| 프로젝트 | 최소 Node.js 버전 | 근거 |
|------|------|------|
| `react/` | `^20.19.0 \|\| >=22.12.0` | Vite 8 (`package-lock.json`의 `engines`) |
| `vue/` | `^22.18.0 \|\| >=24.12.0` | `package.json`의 `engines` |
| `angular/` | `^18.19.1 \|\| ^20.11.1 \|\| >=22.0.0` | Angular CLI 19 (`package-lock.json`의 `engines`) |

## 환경 설정

환경 변수나 설정 파일(`.env` 등)은 따로 없습니다. 위 키들은 앱 실행 후 화면 폼에 직접 입력하며, 컴포넌트 상태로만 유지되고 어디에도 저장되지 않습니다(새로고침 시 사라짐).

> ⚠️ 보안 키와 API 접근 토큰을 클라이언트에서 다루는 구조는 샘플·테스트 전용입니다. 실제 서비스에서는 Kollus 공식 가이드대로 [재생 URL 생성(JWT)](https://docs.kollus.com/dev-guide/vod/player/jwt/)과 [업로드](https://docs.kollus.com/dev-guide/vod/api/upload-api/)를 서버 사이드에서 처리하세요. 자세한 내용은 아래 [주의사항](#주의사항)을 참고하세요.

### 주의사항

- **실서비스에 그대로 쓰지 마세요.** 보안 키와 API 접근 토큰을 클라이언트에서 다루는 구조는 샘플·테스트 전용입니다. 실제 서비스에서는 JWT 발급과 업로드를 반드시 서버 사이드로 옮기세요.
- JWT 서명에 쓰는 Web Crypto API는 secure context(https 또는 localhost)에서만 동작합니다. `http://<사설IP>` 같은 주소로 접속하면 플레이어 로드가 실패합니다.
- 업로드 진행률(`progress_url`) 응답의 필드 스펙이 공개 문서에 없어, `data.percent`와 `percent` 중 존재하는 값을 사용하도록 방어적으로 파싱합니다.
- Kollus VOD API를 브라우저에서 직접 호출하는 구조 특성상, CORS 정책이나 네트워크 환경에 따라 요청이 실패할 수 있습니다.

## 실행 방법

원하는 프로젝트 디렉터리로 이동해 실행합니다.

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

### 동작 확인

1. 원하는 프로젝트의 dev 서버를 띄웁니다.
2. **플레이어**: 보안 키·사용자 키·시청자 ID·mckey를 입력하고 [플레이어 불러오기]를 클릭합니다. 유효한 계정 정보라면 플레이어가 뜨고 재생이 시작되며, 잘못된 값이면 Kollus 쪽 에러 화면이 표시됩니다.
3. **파일 업로드**: API 접근 토큰을 입력하고 파일을 선택한 뒤 업로드 버튼을 클릭합니다. 유효한 토큰이라면 실제로 업로드되면서 진행률이 올라갑니다.

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

### 기능 설명

#### 1. 플레이어 임베드

브라우저에서 Web Crypto API(HMAC-SHA256)로 재생용 JWT를 직접 서명하고, 아래 형식의 S링크(보안 URL)를 만들어 `<iframe>`으로 삽입합니다.

```
https://v.kr.kollus.com/s?jwt=<JWT>&custom_key=<CUSTOM_KEY>
```

JWT payload는 Kollus 표준 규격(`cuid`, `expt`, `mc: [{ mckey }]`)을 따르며, 화면 폼에 입력한 보안 키로 서명합니다. iframe에는 DRM 콘텐츠 재생에 필요한 `allow="encrypted-media; autoplay"` 권한을 부여합니다.

iframe이 로드되면 Kollus **VG Controller SDK**(`vg-controller-client.latest.min.js`)로 플레이어와 연결해 재생 라이프사이클 이벤트(`loaded` / `ready` / `play` / `pause` / `done` / `waiting`)를 구독하고, 현재 재생 상태를 화면에 표시합니다.

> ⚠️ 보안 키를 클라이언트에 두는 방식은 백엔드 없이 빠르게 테스트하기 위한 것입니다. 실제 서비스에서는 Kollus 공식 가이드대로 JWT를 서버 사이드에서 발급하세요.

#### 2. 파일 업로드

Kollus VOD REST API(`POST https://c-api-kr.kollus.com/api/upload/create-url`)를 브라우저에서 직접 호출해 업로드 서버 URL과 진행률 조회 URL을 발급받고, 파일을 Kollus 업로드 서버로 바로 전송합니다. 이때 multipart 필드명은 반드시 `upload-file`이어야 합니다.

인증에는 화면 폼에 입력한 API 접근 토큰(access_token)을 쿼리 파라미터로 사용합니다.

업로드 진행률은 create-url 응답으로 받은 `progress_url`을 2초 간격으로 폴링해 표시합니다. XHR의 `upload.progress` 이벤트를 쓰지 않는 이유는, 업로드 진행률 리스너를 달면 CORS preflight가 강제되는데 Kollus 업로드 서버가 OPTIONS 요청에 응답하지 않아 전송 자체가 실패하기 때문입니다.

> 이 API는 원래 서버 사이드 호출용입니다. 브라우저에서 직접 호출해도 CORS로 차단되지 않는 것을 확인했지만, 계정이나 네트워크 환경에 따라 달라질 수 있습니다.

#### 3. 재생 이벤트 처리

재생·DRM·LMS 콜백은 서버 사이드에서 처리하는 것이 원칙입니다. 이 샘플의 프론트엔드는 VG Controller SDK가 postMessage로 전달하는 이벤트를 받아 재생 상태를 화면에 표시하는 역할만 하며, 플레이어 임베드 컴포넌트에 함께 구현되어 있습니다.

## 관련 문서

- [Kollus 개발자 문서](https://docs.kollus.com)
- [재생 URL 생성 (JWT)](https://docs.kollus.com/dev-guide/vod/player/jwt/)
- [업로드 API](https://docs.kollus.com/dev-guide/vod/api/upload-api/)
- [Web Player Controller (VG Controller)](https://docs.kollus.com/dev-guide/vod/player/web-player-controller/)
