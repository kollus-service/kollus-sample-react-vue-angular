import { useEffect, useRef, useState } from 'react'
import { fetchPlayerToken } from '../api/playerApi'

const VG_CONTROLLER_SCRIPT_URL =
  'https://file.kollus.com/vgcontroller/vg-controller-client.latest.min.js'
const PLAYER_GATEWAY_URL = 'https://v.kr.kollus.com/s'
// VgControllerClient가 노출하는 재생 라이프사이클 이벤트 목록
const PLAYER_EVENTS = ['loaded', 'ready', 'play', 'pause', 'done', 'waiting']

let vgControllerScriptPromise = null

/**
 * VG Controller 스크립트를 1회만 로드하고 이후 호출은 같은 Promise를 재사용한다.
 */
function loadVgControllerScript() {
  if (vgControllerScriptPromise) {
    return vgControllerScriptPromise
  }

  vgControllerScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = VG_CONTROLLER_SCRIPT_URL
    script.onload = () => resolve(window.VgControllerClient)
    script.onerror = () => reject(new Error('VG Controller 스크립트 로드 실패'))
    document.head.appendChild(script)
  })

  return vgControllerScriptPromise
}

/**
 * Kollus 플레이어 임베드 컴포넌트.
 * 백엔드에서 JWT를 발급받아 S링크 URL을 구성해 iframe으로 재생하고,
 * VG Controller SDK를 통해 재생 상태 이벤트를 수신한다.
 */
function KollusPlayer({ mediaContentKey }) {
  const iframeRef = useRef(null)
  const [playerUrl, setPlayerUrl] = useState(null)
  const [error, setError] = useState(null)
  const [playerStatus, setPlayerStatus] = useState('idle')

  useEffect(() => {
    let isCancelled = false

    async function loadPlayerUrl() {
      try {
        // Kollus API: POST /jwt/create - 재생용 JWT + 사용자 키(custom_key) 발급
        const { jwt, customKey } = await fetchPlayerToken(mediaContentKey)
        if (isCancelled) return
        setPlayerUrl(`${PLAYER_GATEWAY_URL}?jwt=${jwt}&custom_key=${customKey}`)
      } catch (err) {
        // JWT 발급 실패: 사용자에게 에러 상태 표시 후 재시도 유도
        console.error('[Kollus] 토큰 발급 실패:', err.message)
        if (!isCancelled) setError('플레이어를 불러올 수 없습니다.')
      }
    }

    loadPlayerUrl()
    return () => {
      isCancelled = true
    }
  }, [mediaContentKey])

  useEffect(() => {
    if (!playerUrl) return

    let controller
    let isCancelled = false
    const iframe = iframeRef.current

    // iframe.src 설정 직후에는 contentWindow가 about:blank 상태라 load 이벤트 이후에 controller를 생성해야 함
    async function handleIframeLoad() {
      try {
        const VgControllerClient = await loadVgControllerScript()
        if (isCancelled) return

        controller = new VgControllerClient({ target_window: iframe.contentWindow })
        PLAYER_EVENTS.forEach((eventName) => {
          controller.on(eventName, () => setPlayerStatus(eventName))
        })
      } catch (err) {
        // SDK 로드 실패: 이벤트 상태 표시만 불가하며 재생 자체는 iframe으로 계속 진행
        console.error('[Kollus] VG Controller 초기화 실패:', err.message)
      }
    }

    iframe.addEventListener('load', handleIframeLoad)
    return () => {
      isCancelled = true
      iframe.removeEventListener('load', handleIframeLoad)
    }
  }, [playerUrl])

  if (error) {
    return <p className="error-text">{error}</p>
  }

  if (!playerUrl) {
    return <p>플레이어를 불러오는 중...</p>
  }

  return (
    <div>
      <iframe
        ref={iframeRef}
        src={playerUrl}
        width="640"
        height="360"
        frameBorder="0"
        allowFullScreen
        title="Kollus Player"
      />
      <p>재생 상태: <code>{playerStatus}</code></p>
    </div>
  )
}

export default KollusPlayer
