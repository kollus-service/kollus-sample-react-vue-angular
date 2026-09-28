// 파일 선택 → Kollus 업로드 URL 발급 → 직접 전송 → 진행률 폴링을 담당하는 업로드 컴포넌트.
import { useRef, useState } from 'react'
import { createUploadUrl, fetchUploadProgress, uploadFile } from '../api/uploadApi'

const PROGRESS_POLL_INTERVAL_MS = 2000

/**
 * Kollus VOD API를 직접 호출해 업로드 URL을 발급받아 파일을 직접 전송하고,
 * 업로드 진행률을 폴링해 표시하는 컴포넌트.
 * API 접근 토큰은 폼 입력값만 컴포넌트 상태로 유지하며 저장하지 않는다.
 */
function FileUploader() {
  const [accessToken, setAccessToken] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [isDone, setIsDone] = useState(false)
  const pollIntervalRef = useRef(null)

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0] ?? null)
    setIsDone(false)
    setError(null)
  }

  function startProgressPolling(progressUrl) {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const percent = await fetchUploadProgress(progressUrl)
        setProgress((current) => Math.max(current, percent))
      } catch (err) {
        // 진행률 조회 실패는 업로드 자체를 막지 않으므로 로그만 남김
        console.error('[Kollus] 업로드 진행률 조회 실패:', err.message)
      }
    }, PROGRESS_POLL_INTERVAL_MS)
  }

  function stopProgressPolling() {
    clearInterval(pollIntervalRef.current)
    pollIntervalRef.current = null
  }

  async function handleUpload() {
    if (!selectedFile || !accessToken) return

    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Kollus API: POST /upload/create-url - 업로드 서버 URL + 진행률 조회 URL 발급
      const { uploadUrl, progressUrl } = await createUploadUrl(selectedFile.name, accessToken)
      startProgressPolling(progressUrl)
      await uploadFile(uploadUrl, selectedFile)
      setProgress(100)
      setIsDone(true)
    } catch (err) {
      // 업로드 실패: 사용자에게 에러 상태 표시 후 재시도 유도 (주로 잘못된 access_token)
      console.error('[Kollus] 파일 업로드 실패:', err.message)
      setError('파일 업로드에 실패했습니다. API 접근 토큰을 확인해 주세요.')
    } finally {
      stopProgressPolling()
      setIsUploading(false)
    }
  }

  return (
    <div>
      <p className="hint-text">
        API 접근 토큰은 브라우저 메모리에서만 사용되며 저장되지 않습니다(새로고침 시 사라짐).
      </p>
      <div className="field-group">
        <label>
          API 접근 토큰 (access_token)
          <input
            type="password"
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            autoComplete="off"
            disabled={isUploading}
          />
        </label>
      </div>

      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || !accessToken || isUploading}
      >
        업로드
      </button>

      {(isUploading || isDone) && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
      {isDone && <p>업로드 완료 ({progress}%)</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

export default FileUploader
