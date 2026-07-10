import { useState } from 'react'
import KollusPlayer from './components/KollusPlayer'
import FileUploader from './components/FileUploader'

const DEFAULT_MEDIA_CONTENT_KEY = ''

/**
 * Kollus 미디어 플랫폼 연동 샘플 (React): 플레이어 임베드 + 파일 업로드 데모.
 */
function App() {
  const [mediaContentKey, setMediaContentKey] = useState(DEFAULT_MEDIA_CONTENT_KEY)

  return (
    <>
      <section>
        <h1>Kollus Sample (React)</h1>
      </section>

      <section>
        <h2>플레이어 임베드</h2>
        <input
          type="text"
          placeholder="미디어 콘텐츠 키(mckey) 입력"
          value={mediaContentKey}
          onChange={(event) => setMediaContentKey(event.target.value)}
        />
        {mediaContentKey ? (
          <KollusPlayer mediaContentKey={mediaContentKey} />
        ) : (
          <p>미디어 콘텐츠 키를 입력하면 플레이어가 표시됩니다.</p>
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
