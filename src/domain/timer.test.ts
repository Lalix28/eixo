import { describe, it, expect } from 'vitest'
import {
  buildExercisePhases,
  buildIntervalPhases,
  computeTimerState,
  initialSnapshot,
} from './timer'
import type { ResolvedExercise, TimerPhase, WeekProgression } from './types'
import { getWeekProgression } from './plan'

const phases: TimerPhase[] = [
  { kind: 'work', durationMs: 1000, label: 'A' },
  { kind: 'rest', durationMs: 2000, label: 'Descanso' },
  { kind: 'work', durationMs: 1000, label: 'A' },
]

describe('computeTimerState', () => {
  it('fase inicial: começo da primeira fase (work)', () => {
    const s = computeTimerState(phases, 0, 0, 0)
    expect(s.phaseIndex).toBe(0)
    expect(s.phaseKind).toBe('work')
    expect(s.remainingMs).toBe(1000)
    expect(s.progress).toBe(0)
    expect(s.done).toBe(false)
  })

  it('transição work → rest', () => {
    // 1500ms: passou o work(1000), está no rest em 500ms
    const s = computeTimerState(phases, 0, 1500, 0)
    expect(s.phaseIndex).toBe(1)
    expect(s.phaseKind).toBe('rest')
    expect(s.remainingMs).toBe(1500) // 2000 - 500
  })

  it('conclusão quando elapsed >= total', () => {
    const s = computeTimerState(phases, 0, 99_999, 0)
    expect(s.done).toBe(true)
    expect(s.phaseKind).toBe('done')
    expect(s.remainingMs).toBe(0)
    expect(s.totalRemainingMs).toBe(0)
  })

  it('pausa: pausedMs congela o tempo efetivo', () => {
    // now=2000 mas pausedMs=1000 → elapsed=1000 → início da fase rest
    const s = computeTimerState(phases, 0, 2000, 1000)
    expect(s.phaseIndex).toBe(1)
    expect(s.progress).toBe(0)
  })

  it('salto correto quando now avança muito (background)', () => {
    // startedAt=0, now pula para 3200 → última fase work em 200ms
    const s = computeTimerState(phases, 0, 3200, 0)
    expect(s.phaseIndex).toBe(2)
    expect(s.phaseKind).toBe('work')
    expect(s.remainingMs).toBe(800)
  })

  it('progress nunca sai de 0..1', () => {
    for (const now of [-500, 0, 500, 1000, 2500, 4000, 10_000]) {
      const s = computeTimerState(phases, 0, now, 0)
      expect(s.progress).toBeGreaterThanOrEqual(0)
      expect(s.progress).toBeLessThanOrEqual(1)
    }
  })

  it('lista de fases vazia → done imediato', () => {
    const s = computeTimerState([], 0, 0, 0)
    expect(s.done).toBe(true)
  })
})

describe('initialSnapshot', () => {
  it('reflete o início da primeira fase', () => {
    expect(initialSnapshot(phases)).toMatchObject({
      phaseIndex: 0,
      phaseKind: 'work',
      remainingMs: 1000,
      done: false,
    })
  })
})

describe('buildIntervalPhases', () => {
  it('gera rounds× [work, rest] sem rest final', () => {
    const p = buildIntervalPhases({
      rounds: 3,
      workMs: 1000,
      restMs: 500,
      label: 'Tiros',
    })
    expect(p.map((x) => x.kind)).toEqual(['work', 'rest', 'work', 'rest', 'work'])
  })
})

describe('buildExercisePhases', () => {
  const progression: WeekProgression = getWeekProgression(1)

  function resolved(over: Partial<ResolvedExercise>): ResolvedExercise {
    return {
      exercise: {
        id: 'x',
        name: 'X',
        category: 'core',
        cue: '',
        kind: 'time',
        requiresSide: false,
      },
      block: 'B',
      blockKind: 'core',
      ...over,
    }
  }

  it('tiros: reps rounds a partir da progressão da semana', () => {
    const p = buildExercisePhases(
      resolved({
        exercise: {
          id: 'sprints',
          name: 'Tiros',
          category: 'conditioning',
          cue: '',
          kind: 'interval',
          requiresSide: false,
        },
        useProgression: 'sprints',
      }),
      progression,
    )
    // semana 1: 6 tiros de 10s → 6 works, 5 rests
    expect(p.filter((x) => x.kind === 'work')).toHaveLength(6)
    expect(p[0].durationMs).toBe(10_000)
  })

  it('quadril/core: uma dose work+rest', () => {
    const p = buildExercisePhases(
      resolved({ useProgression: 'hip_core' }),
      progression,
    )
    expect(p.map((x) => x.kind)).toEqual(['work'])
  })

  it('por tempo com séries: N esforços separados por descanso', () => {
    const p = buildExercisePhases(resolved({ timeSec: 30, sets: 3 }), progression)
    expect(p.map((x) => x.kind)).toEqual(['work', 'rest', 'work', 'rest', 'work'])
    expect(p[0].durationMs).toBe(30_000)
  })

  it('reps sem tempo: sem fases (passo manual)', () => {
    const p = buildExercisePhases(
      resolved({
        exercise: {
          id: 'r',
          name: 'R',
          category: 'core',
          cue: '',
          kind: 'reps',
          requiresSide: false,
        },
        reps: 10,
      }),
      progression,
    )
    expect(p).toEqual([])
  })
})
