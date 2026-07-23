// Kollus 재생용 JWT(HS256)를 Web Crypto API로 브라우저에서 직접 서명하는 유틸.
const JWT_HEADER = { alg: 'HS256', typ: 'JWT' };

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
  secretKey: string;
  cuid: string;
  mediaContentKey: string;
  expiresInSeconds?: number;
}

/**
 * Kollus 재생용 JWT(HS256)를 브라우저에서 직접 서명해 생성한다.
 * 보안 키는 인자로만 받아 그 자리에서 서명에 사용할 뿐, 어디에도 저장하지 않는다.
 * 샘플/테스트 용도로 설계된 방식이며, 보안 키를 클라이언트에 두는 것은
 * 실제 서비스에서는 권장되지 않는다(Kollus 공식 가이드도 서버 사이드 발급을 권장).
 */
export async function createPlayerJwt({
  secretKey,
  cuid,
  mediaContentKey,
  expiresInSeconds = 3600,
}: CreatePlayerJwtParams): Promise<string> {
  const payload = {
    cuid,
    expt: Math.floor(Date.now() / 1000) + expiresInSeconds,
    mc: [{ mckey: mediaContentKey }],
  };

  const signingInput = `${encodeJwtPart(JWT_HEADER)}.${encodeJwtPart(payload)}`;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
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
