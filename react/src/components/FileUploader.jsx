import { useRef, useState } from 'react'
import { createUploadUrl, fetchUploadProgress, uploadFile } from '../api/uploadApi'

const PROGRESS_POLL_INTERVAL_MS = 2000

/**
 * Kollus 업로드 URL을 발급받아 파일을 직접 전송하고,
 * 백엔드 프록시로 업로드 진행률을 폴링해 표시하는 컴포넌트.
 */
function FileUploader() {
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

  function startProgressPolling(uploadFileKey) {
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Kollus 업로드 진행률 조회: 백엔드 프록시가 Kollus progress_url을 대신 호출
        const percent = await fetchUploadProgress(uploadFileKey)
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
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      const { uploadUrl, uploadFileKey } = await createUploadUrl(selectedFile.name)
      startProgressPolling(uploadFileKey)
      await uploadFile(uploadUrl, selectedFile, setProgress)
      setIsDone(true)
    } catch (err) {
      // 업로드 실패: 사용자에게 에러 상태 표시 후 재시도 유도
      console.error('[Kollus] 파일 업로드 실패:', err.message)
      setError('파일 업로드에 실패했습니다.')
    } finally {
      stopProgressPolling()
      setIsUploading(false)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      <button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
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
