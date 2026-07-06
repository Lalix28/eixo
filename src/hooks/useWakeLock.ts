import { useEffect, useRef } from 'react'

interface WakeLockSentinelLike {
  release: () => Promise<void>
}
interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

function getWakeLock(): WakeLockLike | undefined {
  if (typeof navigator === 'undefined') return undefined
  return (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock
}

/**
 * Mantém a tela acesa enquanto `active` for true (Screen Wake Lock API).
 * Progressive enhancement: se a API não existir ou falhar, é um no-op
 * silencioso e nunca quebra o treino. Reativa ao voltar de background.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    const wakeLock = getWakeLock()
    if (!active || !wakeLock) return

    let released = false

    const acquire = async () => {
      try {
        if (document.visibilityState !== 'visible') return
        sentinelRef.current = await wakeLock.request('screen')
      } catch {
        // silencioso — sem suporte ou bloqueado
      }
    }

    const release = async () => {
      try {
        await sentinelRef.current?.release()
      } catch {
        // silencioso
      }
      sentinelRef.current = null
    }

    const onVisibility = () => {
      if (!released && document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibility)
      void release()
    }
  }, [active])
}
