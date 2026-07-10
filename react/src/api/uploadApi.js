import { API_BASE_URL, USE_MOCK_API } from './config'
import { mockCreateUploadUrl, mockFetchUploadProgress, mockUploadFile } from './mockApi'

/**
 * 백엔드 프록시를 통해 Kollus 업로드 URL을 발급받는다.
 * @param {string} fileName - 업로드할 파일명
 * @returns {Promise<{ uploadUrl: string, uploadFileKey: string }>}
 */
export async function createUploadUrl(fileName) {
  if (USE_MOCK_API) {
    return mockCreateUploadUrl(fileName)
  }

  const response = await fetch(`${API_BASE_URL}/api/upload/create-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: fileName }),
  })

  if (!response.ok) {
    throw new Error(`업로드 URL 발급 실패 (status: ${response.status})`)
  }

  const { data } = await response.json()
  return { uploadUrl: data.upload_url, uploadFileKey: data.upload_file_key }
}

/**
 * 파일을 Kollus 업로드 서버에 XHR로 직접 전송한다. 필드명은 반드시 'upload-file'.
 * @param {string} uploadUrl - createUploadUrl로 발급받은 업로드 서버 URL
 * @param {File} file - 업로드할 파일
 * @param {(percent: number) => void} onProgress - 업로드 진행률 콜백 (0~100)
 */
export function uploadFile(uploadUrl, file, onProgress) {
  if (USE_MOCK_API) {
    return mockUploadFile(uploadUrl, onProgress)
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('upload-file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUrl)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`업로드 실패 (status: ${xhr.status})`))
      }
    })
    xhr.addEventListener('error', () => reject(new Error('업로드 중 네트워크 오류가 발생했습니다.')))

    xhr.send(formData)
  })
}

/**
 * 백엔드 프록시를 통해 업로드 진행률을 조회한다.
 * @param {string} uploadFileKey - createUploadUrl로 발급받은 업로드 파일 키
 * @returns {Promise<number>} 진행률 (0~100)
 */
export async function fetchUploadProgress(uploadFileKey) {
  if (USE_MOCK_API) {
    return mockFetchUploadProgress(uploadFileKey)
  }

  const response = await fetch(`${API_BASE_URL}/api/upload/progress/${uploadFileKey}`)

  if (!response.ok) {
    throw new Error(`업로드 진행률 조회 실패 (status: ${response.status})`)
  }

  const { data } = await response.json()
  return data.percent
}
