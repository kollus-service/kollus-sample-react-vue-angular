// Kollus 재생용 JWT(HS256)를 Web Crypto API로 브라우저에서 직접 서명하는 유틸.
const JWT_HEADER = { alg: 'HS256', typ: 'JWT' };
// JWT 기본 만료 시간(초): 1시간
const DEFAULT_JWT_EXPIRES_IN_SECONDS = 3600;

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeJwtPart(obj: unknown): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify(obj)));
}

interface CreatePlayerJwtParams {
  securityKey: string;
  cuid: string;
  mediaContentKey: string;
  expiresInSeconds?: number;
}

/**
 * Kollus 재생용 JWT(HS256)를 브라우저에서 직접 서명해 생성한다.
 * 보안 키는 인자로만 받아 그 자리에서 서명에 사용할 뿐, 어디에도 저장하지 않는다.
 * 샘플/테스트 용도로 설계된 방식이며, 보안 키를 클라이언트에 두는 것은
 * 실제 서비스에서는 권장되지 않는다(Kollus 공식 가이드도 서버 사이드 발급을 권장).
 * @param params JWT 생성 파라미터
 * @param params.securityKey Kollus 보안 키(Security Key) — HS256 JWT 서명용 secret (저장하지 않음)
 * @param params.cuid 시청자 ID
 * @param params.mediaContentKey 미디어 콘텐츠 키(mckey)
 * @param params.expiresInSeconds 만료까지 남은 초 (기본 DEFAULT_JWT_EXPIRES_IN_SECONDS = 1시간)
 * @returns 서명된 JWT 문자열
 */
export async function createPlayerJwt({
  securityKey,
  cuid,
  mediaContentKey,
  expiresInSeconds = DEFAULT_JWT_EXPIRES_IN_SECONDS,
}: CreatePlayerJwtParams): Promise<string> {
  const payload = {
    cuid,
    expt: Math.floor(Date.now() / 1000) + expiresInSeconds,
    mc: [{ mckey: mediaContentKey }],
  };

  const signingInput = `${encodeJwtPart(JWT_HEADER)}.${encodeJwtPart(payload)}`;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(securityKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signatureBuffer))}`;
}
