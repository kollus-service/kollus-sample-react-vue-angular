// Kollus VOD API를 직접 호출해 파일 업로드(URL 발급/전송/진행률 조회)를 처리하는 API 클라이언트.

// Kollus VOD REST API (KR region). 원래는 서버 사이드 호출용 API이지만,
// 브라우저에서 직접 호출해도 CORS로 차단되지 않는 것을 확인했다.
const VOD_API_BASE_URL = 'https://c-api-kr.kollus.com/api'

/**
 * Kollus VOD API를 브라우저에서 직접 호출해 업로드 URL을 발급받는다.
 * API 접근 토큰(accessToken)은 인자로만 받아 저장하지 않는다.
 * @param {string} fileName - 업로드할 파일명(콘텐츠 제목으로 사용)
 * @param {string} accessToken - Kollus API 접근 토큰
 * @returns {Promise<{ uploadUrl: string, uploadFileKey: string, progressUrl: string }>}
 * @throws {Error} 응답 status가 2xx가 아닐 때 (주로 잘못된 access_token)
 */
export async function createUploadUrl(fileName, accessToken) {
  const body = new URLSearchParams({ title: fileName })
  const response = await fetch(
    `${VOD_API_BASE_URL}/upload/create-url?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    },
  )

  if (!response.ok) {
    throw new Error(`업로드 URL 발급 실패 (status: ${response.status})`)
  }

  const { data } = await response.json()
  return {
    uploadUrl: data.upload_url,
    uploadFileKey: data.upload_file_key,
    progressUrl: data.progress_url,
  }
}

/**
 * 파일을 Kollus 업로드 서버에 직접 전송한다. 필드명은 반드시 'upload-file'.
 * XHR에 upload progress 리스너를 달면 CORS preflight가 강제되어 Kollus 업로드 서버가
 * 거부하므로, preflight가 없는 단순 fetch POST로 전송하고 진행률은 progress_url 폴링으로 표시한다.
 * @param {string} uploadUrl - createUploadUrl로 발급받은 업로드 서버 URL
 * @param {File} file - 업로드할 파일
 * @returns {Promise<void>} 업로드 완료 시 resolve
 * @throws {Error} 업로드 서버 응답 status가 2xx가 아닐 때
 */
export async function uploadFile(uploadUrl, file) {
  const formData = new FormData()
  formData.append('upload-file', file)

  const response = await fetch(uploadUrl, { method: 'POST', body: formData })

  if (!response.ok) {
    throw new Error(`업로드 실패 (status: ${response.status})`)
  }
}

/**
 * createUploadUrl 응답의 progress_url을 그대로 호출해 업로드 진행률을 조회한다.
 * Kollus 진행률 응답의 정확한 필드 스펙이 공개 문서에 없어 방어적으로 파싱한다.
 * @param {string} progressUrl - createUploadUrl로 발급받은 진행률 조회 URL
 * @returns {Promise<number>} 진행률 (0~100)
 * @throws {Error} 진행률 조회 응답 status가 2xx가 아닐 때
 */
export async function fetchUploadProgress(progressUrl) {
  const response = await fetch(progressUrl)

  if (!response.ok) {
    throw new Error(`업로드 진행률 조회 실패 (status: ${response.status})`)
  }

  const result = await response.json()
  return result.data?.percent ?? result.percent ?? 0
}
