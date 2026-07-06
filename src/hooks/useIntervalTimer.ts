import { useCallback, useEffect, useRef, useState } from 'react'
import { computeTimerState, initialSnapshot } from '../domain/timer'
import type { TimerPhase, TimerSnapshot } from '../domain/types'
import { useWakeLock } from './useWakeLock'

interface UseIntervalTimerParams {
  phases: TimerPhase[]
  autoStart?: boolean
  onPhaseChange?: (snapshot: TimerSnapshot) => void
  onComplete?: () => void
}

export interface UseIntervalTimerReturn {
  snapshot: TimerSnapshot
  isRunning: boolean
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skipPhase: () => void
}

/** rAF com fallback para setTimeout (ambientes sem requestAnimationFrame). */
function raf(cb: () => void): number {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(cb)
  }
  return setTimeout(cb, 16) as unknown as number
}
function caf(id: number): void {
  if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(id)
  else clearTimeout(id)
}

/** Vibra na troca de fase / conclusão, se suportado (degrada em silêncio). */
function vibrate(kind: 'work' | 'rest' | 'done'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(kind === 'done' ? [80, 40, 80] : kind === 'rest' ? 40 : 60)
  } catch {
    // silencioso
  }
}

/**
 * Timer de intervalos baseado em timestamp.
 * O requestAnimationFrame apenas dispara o recálculo visual; o tempo real
 * vem sempre de `Date.now()` via `computeTimerState` (nunca soma de ticks).
 */
export function useIntervalTimer({
  phases,
  autoStart = false,
  onPhaseChange,
  onComplete,
}: UseIntervalTimerParams): UseIntervalTimerReturn {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() =>
    initialSnapshot(phases),
  )
  const [isRunning, setIsRunning] = useState(false)

  const startedAtRef = useRef<number | null>(null)
  const pausedMsRef = useRef(0)
  const pauseStartRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevPhaseRef = useRef(0)
  const prevDoneRef = useRef(false)

  const cbRef = useRef({ onPhaseChange, onComplete })
  cbRef.current = { onPhaseChange, onComplete }

  useWakeLock(isRunning)

  const cancelRaf = useCallback(() => {
    if (rafRef.current != null) {
      caf(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const recompute = useCallback(() => {
    const startedAt = startedAtRef.current
    if (startedAt == null) {
      setSnapshot(initialSnapshot(phases))
      return
    }
    const refNow = pauseStartRef.current ?? Date.now()
    const snap = computeTimerState(phases, startedAt, refNow, pausedMsRef.current)
    setSnapshot(snap)

    if (!snap.done && snap.phaseIndex !== prevPhaseRef.current) {
      prevPhaseRef.current = snap.phaseIndex
      vibrate(snap.phaseKind === 'rest' ? 'rest' : 'work')
      cbRef.current.onPhaseChange?.(snap)
    }
    if (snap.done && !prevDoneRef.current) {
      prevDoneRef.current = true
      cancelRaf()
      setIsRunning(false)
      vibrate('done')
      cbRef.current.onComplete?.()
    }
  }, [phases, cancelRaf])

  const loop = useCallback(() => {
    recompute()
    if (!prevDoneRef.current) {
      rafRef.current = raf(loop)
    }
  }, [recompute])

  const startLoop = useCallback(() => {
    cancelRaf()
    rafRef.current = raf(loop)
  }, [cancelRaf, loop])

  const start = useCallback(() => {
    if (phases.length === 0) return
    startedAtRef.current = Date.now()
    pausedMsRef.current = 0
    pauseStartRef.current = null
    prevPhaseRef.current = 0
    prevDoneRef.current = false
    setIsRunning(true)
    startLoop()
  }, [phases, startLoop])

  const pause = useCallback(() => {
    if (startedAtRef.current == null || pauseStartRef.current != null) return
    pauseStartRef.current = Date.now()
    setIsRunning(false)
    cancelRaf()
    recompute()
  }, [cancelRaf, recompute])

  const resume = useCallback(() => {
    if (startedAtRef.current == null || pauseStartRef.current == null) return
    pausedMsRef.current += Date.now() - pauseStartRef.current
    pauseStartRef.current = null
    setIsRunning(true)
    startLoop()
  }, [startLoop])

  const reset = useCallback(() => {
    cancelRaf()
    startedAtRef.current = null
    pausedMsRef.current = 0
    pauseStartRef.current = null
    prevPhaseRef.current = 0
    prevDoneRef.current = false
    setIsRunning(false)
    setSnapshot(initialSnapshot(phases))
  }, [cancelRaf, phases])

  const skipPhase = useCallback(() => {
    const startedAt = startedAtRef.current
    if (startedAt == null) return
    const refNow = pauseStartRef.current ?? Date.now()
    let elapsed = refNow - startedAt - pausedMsRef.current
    if (elapsed < 0) elapsed = 0

    let acc = 0
    let endOffset: number | null = null
    for (const p of phases) {
      if (elapsed < acc + p.durationMs) {
        endOffset = acc + p.durationMs
        break
      }
      acc += p.durationMs
    }
    if (endOffset == null) return

    // Empurra o tempo efetivo para o fim da fase atual reduzindo o pausedMs.
    pausedMsRef.current -= endOffset - elapsed + 1
    recompute()
    if (!prevDoneRef.current && pauseStartRef.current == null) startLoop()
  }, [phases, recompute, startLoop])

  // Reset ao trocar de conjunto de fases (ex.: próximo exercício).
  useEffect(() => {
    reset()
    if (autoStart && phases.length > 0) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases])

  // Limpeza ao desmontar.
  useEffect(() => cancelRaf, [cancelRaf])

  return { snapshot, isRunning, start, pause, resume, reset, skipPhase }
}
