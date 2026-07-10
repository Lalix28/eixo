function formatUuid(bytes: Uint8Array): string {
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  )
}

/** Gera UUID v4 para chaves locais, inclusive fora de contextos HTTP seguros. */
export function createId(): string {
  const webCrypto = globalThis.crypto

  if (typeof webCrypto?.randomUUID === 'function') {
    try {
      return webCrypto.randomUUID()
    } catch {
      // Alguns navegadores expõem a função, mas bloqueiam a chamada em HTTP.
    }
  }

  const bytes = new Uint8Array(16)
  if (typeof webCrypto?.getRandomValues === 'function') {
    try {
      webCrypto.getRandomValues(bytes)
      return formatUuid(bytes)
    } catch {
      // Continua para o fallback restrito abaixo.
    }
  }

  // Fallback apenas para IDs locais, nunca para tokens ou decisões de segurança.
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256)
  }
  return formatUuid(bytes)
}
