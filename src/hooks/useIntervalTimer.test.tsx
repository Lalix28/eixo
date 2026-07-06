import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIntervalTimer } from './useIntervalTimer'
import type { TimerPhase } from '../domain/types'

const phases: TimerPhase[] = [
  { kind: 'work', durationMs: 1000, label: 'A' },
  { kind: 'rest', durationMs: 1000, label: 'Descanso' },
]

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
})
afterEach(() => {
  vi.useRealTimers()
})

describe('useIntervalTimer', () => {
  it('snapshot inicial reflete a primeira fase, sem rodar', () => {
    const { result } = renderHook(() => useIntervalTimer({ phases }))
    expect(result.current.isRunning).toBe(false)
    expect(result.current.snapshot.phaseIndex).toBe(0)
    expect(result.current.snapshot.remainingMs).toBe(1000)
  })

  it('start roda e transita work → rest → done chamando onComplete', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({ phases, onComplete }),
    )

    act(() => result.current.start())
    expect(result.current.isRunning).toBe(true)

    act(() => vi.advanceTimersByTime(1200))
    expect(result.current.snapshot.phaseIndex).toBe(1)
    expect(result.current.snapshot.phaseKind).toBe('rest')

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.snapshot.done).toBe(true)
    expect(result.current.isRunning).toBe(false)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('pause congela o tempo efetivo; resume retoma', () => {
    const { result } = renderHook(() => useIntervalTimer({ phases }))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(500))
    act(() => result.current.pause())

    const frozen = result.current.snapshot.phaseIndex
    expect(result.current.isRunning).toBe(false)

    // tempo passa durante a pausa, mas o snapshot não avança
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.snapshot.phaseIndex).toBe(frozen)

    act(() => result.current.resume())
    expect(result.current.isRunning).toBe(true)
    // + 600ms de execução real → elapsed ~1100 → fase rest
    act(() => vi.advanceTimersByTime(600))
    expect(result.current.snapshot.phaseIndex).toBe(1)
  })

  it('skipPhase pula para a próxima fase', () => {
    const { result } = renderHook(() => useIntervalTimer({ phases }))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(100))
    act(() => result.current.skipPhase())
    expect(result.current.snapshot.phaseKind).toBe('rest')
  })

  it('reset volta ao estado inicial', () => {
    const { result } = renderHook(() => useIntervalTimer({ phases }))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(500))
    act(() => result.current.reset())
    expect(result.current.isRunning).toBe(false)
    expect(result.current.snapshot.phaseIndex).toBe(0)
    expect(result.current.snapshot.remainingMs).toBe(1000)
  })
})
