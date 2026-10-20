// 루트 컴포넌트: 키 입력 폼과 플레이어 임베드/파일 업로드 섹션으로 데모 페이지를 구성한다.
import { useState } from 'react'
import KollusPlayer from './components/KollusPlayer'
import FileUploader from './components/FileUploader'

const DEFAULT_CUID = 'guest'

/**
 * Kollus 미디어 플랫폼 연동 샘플 (React): 플레이어 임베드 + 파일 업로드 데모.
 * 백엔드 없이 동작하며, JWT는 브라우저에서 폼 입력값으로 직접 서명한다.
 */
function App() {
  const [securityKey, setSecurityKey] = useState('')
  const [customKey, setCustomKey] = useState('')
  const [cuid, setCuid] = useState(DEFAULT_CUID)
  const [mediaContentKey, setMediaContentKey] = useState('')
  // 타이핑 중 매 글자마다 JWT 서명/플레이어 로드가 반복되지 않도록,
  // 버튼 클릭 시점의 입력값 스냅샷으로만 플레이어를 렌더링한다.
  const [appliedConfig, setAppliedConfig] = useState(null)

  const canLoadPlayer = Boolean(securityKey && customKey && cuid && mediaContentKey)

  function handleLoadPlayer() {
    setAppliedConfig({ securityKey, customKey, cuid, mediaContentKey })
  }

  return (
    <>
      <section>
        <h1>Kollus Sample (React)</h1>
      </section>

      <section>
        <h2>플레이어 임베드</h2>
        <p className="hint-text">
          아래 값은 브라우저 메모리에서만 사용되며 저장되지 않습니다(새로고침 시 사라짐).
        </p>
        <div className="field-group">
          <label>
            보안 키 (Security Key)
            <input
              type="password"
              value={securityKey}
              onChange={(event) => setSecurityKey(event.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            사용자 키 (custom_key)
            <input
              type="text"
              value={customKey}
              onChange={(event) => setCustomKey(event.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            시청자 ID (cuid)
            <input
              type="text"
              value={cuid}
              onChange={(event) => setCuid(event.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            미디어 콘텐츠 키 (mckey)
            <input
              type="text"
              value={mediaContentKey}
              onChange={(event) => setMediaContentKey(event.target.value)}
              autoComplete="off"
            />
          </label>
        </div>
        <button type="button" onClick={handleLoadPlayer} disabled={!canLoadPlayer}>
          플레이어 불러오기
        </button>
        {appliedConfig ? (
          <KollusPlayer
            securityKey={appliedConfig.securityKey}
            customKey={appliedConfig.customKey}
            cuid={appliedConfig.cuid}
            mediaContentKey={appliedConfig.mediaContentKey}
          />
        ) : (
          <p>모든 값을 입력한 뒤 [플레이어 불러오기]를 클릭하면 플레이어가 표시됩니다.</p>
        )}
      </section>

      <section>
        <h2>파일 업로드</h2>
        <FileUploader />
      </section>
    </>
  )
}

export default App
