import { API_BASE_URL, USE_MOCK_API } from './config'
import { mockFetchPlayerToken } from './mockApi'

/**
 * Kollus 플레이어 재생용 JWT를 백엔드에서 발급받는다.
 * @param {string} mediaContentKey - 재생할 콘텐츠의 미디어 콘텐츠 키(mckey)
 * @returns {Promise<{ jwt: string, customKey: string }>}
 */
export async function fetchPlayerToken(mediaContentKey) {
  if (USE_MOCK_API) {
    return mockFetchPlayerToken(mediaContentKey)
  }

  const response = await fetch(`${API_BASE_URL}/jwt/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_content_key: mediaContentKey }),
  })

  if (!response.ok) {
    throw new Error(`JWT 발급 실패 (status: ${response.status})`)
  }

  const data = await response.json()
  return { jwt: data.jwt, customKey: data.custom_key }
}
