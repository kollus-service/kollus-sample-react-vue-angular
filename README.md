# Kollus Sample Frontend

Kollus 미디어 플랫폼 연동 샘플입니다. React, Vue, Angular 세 가지 프론트엔드 프레임워크로 동일한 기능(플레이어 임베드, 파일 업로드, 이벤트 처리)을 구현합니다.

백엔드(JWT 발급, 콜백 처리)는 별도 저장소인 `kollus-sample-nodejs-express`를 함께 사용하도록 설계되어 있습니다. 백엔드 없이도 목(mock) API 모드로 UI 흐름만 바로 확인할 수 있습니다.

## 저장소 구조

```
kollus-sample-frontend/
├── react/      # React 18 + Vite  (http://localhost:5173)
├── vue/        # Vue 3 + Vite     (http://localhost:5174)
└── angular/    # Angular 19       (http://localhost:4200)
```

세 프로젝트는 서로 독립적이며, 동일한 백엔드 API 계약을 기준으로 같은 기능을 각 프레임워크 방식으로 구현합니다.

## 기능 설명

### 1. Kollus 플레이어 임베드

백엔드(`POST /jwt/create`)에서 재생용 JWT와 사용자 키(`custom_key`)를 발급받아 아래 형식의 S링크(보안 URL)를 구성하고, `<iframe>`으로 삽입합니다.

```
https://v.kr.kollus.com/s?jwt=<JWT>&custom_key=<CUSTOM_KEY>
```

iframe이 로드된 뒤 Kollus의 **VG Controller SDK**(`vg-controller-client.latest.min.js`)를 통해 플레이어와 통신하며, 재생 라이프사이클 이벤트(`loaded`, `ready`, `play`, `pause`, `done`, `waiting`)를 구독해 화면에 현재 재생 상태를 표시합니다.

- 미디어 콘텐츠 키(mckey)를 입력하면 해당 콘텐츠로 플레이어가 로드됩니다.
- JWT 발급에 실패하면 에러 메시지를 표시합니다.

### 2. 파일 업로드

백엔드 프록시(`POST /api/upload/create-url`)를 통해 Kollus 업로드 서버 URL과 업로드 파일 키를 발급받은 뒤, 파일을 Kollus 업로드 서버로 **XHR 직접 전송**합니다. 이때 필드명은 반드시 `upload-file` 이어야 합니다.

업로드 중에는 두 가지 방식으로 진행률을 갱신합니다.
- XHR의 `upload.progress` 이벤트로 실시간 전송 진행률 표시
- 백엔드 프록시(`GET /api/upload/progress/:upload_file_key`)를 2초 간격으로 폴링해 Kollus 서버 기준 진행률도 함께 반영

업로드가 끝나면 "업로드 완료 (100%)" 메시지를 표시하고, 실패 시 에러 메시지를 표시합니다.

### 3. 플레이어 이벤트 처리

콜백(재생, DRM, LMS)은 서버 사이드에서 처리하는 것이 원칙이며, 프론트엔드는 VG Controller SDK 이벤트를 postMessage 기반으로 수신해 재생 상태(`재생 상태: ready` 등)를 화면에 표시하는 역할만 담당합니다. 플레이어 임베드 컴포넌트에 함께 구현되어 있습니다.

## 사전 준비

- Node.js 20 이상 (Angular는 `^22.18.0 || >=24.12.0` 권장)
- (선택) `kollus-sample-nodejs-express` 백엔드를 `http://localhost:3000`에서 실행 — 목 모드를 쓰면 없어도 됩니다.

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

## 환경 변수 설정

각 프로젝트 루트에 `.env.local`(React/Vue) 또는 `src/environments/environment.ts`(Angular)를 생성합니다. 이 파일들은 gitignore 처리되어 있으니 실제 값은 각자 로컬에서 관리하세요.

**React / Vue (Vite)** — `.env.local`

```
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK_API=false
```

**Angular** — `src/environments/environment.ts`

```ts
export const environment = {
  apiBaseUrl: 'http://localhost:3000',
  useMockApi: false,
};
```

| 파일 | 용도 | 커밋 여부 |
|------|------|-----------|
| `.env.example` | 키 없는 템플릿 | O |
| `.env.local` | 실제 값 | X (gitignore) |
| `environment.example.ts` | 키 없는 템플릿 | O |
| `environment.ts` | 실제 값 | X (gitignore) |

## 백엔드 없이 테스트하기 (목 API 모드)

`VITE_USE_MOCK_API=true` (React/Vue) 또는 `useMockApi: true` (Angular)로 설정하면, 백엔드를 호출하는 대신 가짜 데이터로 응답합니다.

- **JWT 발급**: 약 0.4초 지연 후 고정된 mock JWT/custom_key를 반환합니다.
- **업로드 URL 발급**: 약 0.4초 지연 후 mock 업로드 URL/파일 키를 반환합니다.
- **파일 업로드**: 실제 전송 없이 0.2초 간격으로 진행률을 20%씩 올려 100%까지 시뮬레이션합니다.
- **업로드 진행률 조회**: 위 시뮬레이션 값을 그대로 반환합니다.

이 모드로는 화면 흐름(로딩 → 완료/에러 상태, 진행률 애니메이션)만 검증할 수 있습니다. **플레이어 iframe 자체는 Kollus의 실제 도메인(`v.kr.kollus.com`)을 호출**하므로, mock JWT로는 iframe은 정상 렌더링되지만 실제 콘텐츠 재생이나 `ready`/`play` 같은 진짜 이벤트는 발생하지 않습니다(콘텐츠 로드 실패 화면이 뜨는 것이 정상입니다). 실제 재생·이벤트까지 확인하려면 목 모드를 끄고 유효한 백엔드 + 실제 mckey가 필요합니다.

각 프로젝트는 로컬 개발 편의를 위해 `.env.local` / `environment.ts`에 목 모드가 기본 활성화되어 있습니다. 백엔드에 붙여 테스트하려면 `false`로 바꾸세요.

## 테스트 방법 요약

1. 위 실행 방법대로 원하는 프로젝트의 dev 서버를 띄웁니다.
2. 목 모드가 켜진 상태(기본값)라면 바로 브라우저에서:
   - "미디어 콘텐츠 키(mckey) 입력"란에 아무 값이나 입력 → 플레이어 iframe이 뜨는지 확인
   - 파일 선택 → 업로드 버튼 클릭 → 진행률 바가 0→100%로 올라가고 완료 메시지가 뜨는지 확인
3. 실제 백엔드로 검증하려면 `kollus-sample-nodejs-express`를 `http://localhost:3000`에서 실행하고, 목 모드를 끈 뒤 유효한 mckey로 테스트합니다.

## 알려진 한계

- 백엔드 저장소가 이 리포지터리에 포함되어 있지 않아, `/jwt/create` · `/api/upload/create-url` · `/api/upload/progress/:key`의 요청/응답 필드명은 Kollus 공식 문서를 기준으로 구성했습니다. 실제 백엔드 스펙이 다르면 각 프로젝트의 API 클라이언트(`api/playerApi.js`, `api/uploadApi.js` 또는 Angular `KollusApiService`)만 수정하면 됩니다.
