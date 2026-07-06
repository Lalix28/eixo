import { describe, it, expect } from 'vitest'
import {
  addDaysToKey,
  bestHoldBySide,
  buildAdductorPainSeriesBySide,
  buildLowBackSeries,
  buildReachToFloorSeries,
  computeActiveStreak,
  computeDelta,
  hasEnoughData,
  toDayKey,
} from './progress'
import type {
  MetricPhase,
  NumericSide,
  Session,
  SessionLog,
  SessionStatus,
  SideMetric,
  SideMetricKind,
} from './types'

function log(dayKey: string, over: Partial<SessionLog>): SessionLog {
  return {
    id: `l-${dayKey}`,
    sessionId: `s-${dayKey}`,
    dayKey,
    lowBackPainBefore: null,
    lowBackPainAfter: null,
    rpe: null,
    frontPlankSec: null,
    reachToFloorCm: null,
    botheredExerciseId: null,
    botheredSide: 'not_applicable',
    notes: null,
    createdAt: `${dayKey}T00:00:00.000Z`,
    ...over,
  }
}

function metric(
  dayKey: string,
  kind: SideMetricKind,
  side: NumericSide,
  phase: MetricPhase,
  value: number,
): SideMetric {
  return { id: `${dayKey}-${kind}-${side}-${phase}`, logId: `l-${dayKey}`, dayKey, metric: kind, side, phase, value }
}

function session(dayKey: string, status: SessionStatus): Session {
  return {
    id: `s-${dayKey}`,
    planDayId: 'day-01',
    dayIndex: 1,
    dayKey,
    startedAt: 0,
    completedAt: null,
    status,
    createdAt: `${dayKey}T00:00:00.000Z`,
  }
}

describe('helpers de data', () => {
  it('addDaysToKey soma dias sem drift de fuso', () => {
    expect(addDaysToKey('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDaysToKey('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('toDayKey formata a data local', () => {
    expect(toDayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('buildLowBackSeries', () => {
  it('usa o valor pós-treino, cai para o pré e ignora nulos, ordenado', () => {
    const logs = [
      log('2026-01-03', { lowBackPainAfter: 2 }),
      log('2026-01-01', { lowBackPainBefore: 5 }), // só antes
      log('2026-01-02', {}), // sem dado → ignorado
    ]
    const s = buildLowBackSeries(logs)
    expect(s).toEqual([
      { dayKey: '2026-01-01', value: 5 },
      { dayKey: '2026-01-03', value: 2 },
    ])
  })
})

describe('buildReachToFloorSeries', () => {
  it('coleta a distância mão-chão ordenada', () => {
    const logs = [
      log('2026-01-05', { reachToFloorCm: 8 }),
      log('2026-01-02', { reachToFloorCm: 12 }),
    ]
    expect(buildReachToFloorSeries(logs)).toEqual([
      { dayKey: '2026-01-02', value: 12 },
      { dayKey: '2026-01-05', value: 8 },
    ])
  })
})

describe('buildAdductorPainSeriesBySide', () => {
  it('separa lados e prefere a dor pós-treino', () => {
    const metrics = [
      metric('2026-01-01', 'adductor_pain', 'left', 'before', 6),
      metric('2026-01-01', 'adductor_pain', 'left', 'after', 4),
      metric('2026-01-01', 'adductor_pain', 'right', 'before', 3),
    ]
    const s = buildAdductorPainSeriesBySide(metrics)
    expect(s.left).toEqual([{ dayKey: '2026-01-01', value: 4 }]) // after
    expect(s.right).toEqual([{ dayKey: '2026-01-01', value: 3 }]) // fallback before
  })

  it("'ambos' aparece como duas linhas (left + right)", () => {
    // O registro de 'both' materializa left e right separadamente.
    const metrics = [
      metric('2026-01-02', 'adductor_pain', 'left', 'after', 5),
      metric('2026-01-02', 'adductor_pain', 'right', 'after', 5),
    ]
    const s = buildAdductorPainSeriesBySide(metrics)
    expect(s.left).toHaveLength(1)
    expect(s.right).toHaveLength(1)
  })
})

describe('bestHoldBySide', () => {
  it('retorna o máximo por lado e null quando não há dados', () => {
    const metrics = [
      metric('2026-01-01', 'side_plank_sec', 'left', 'single', 20),
      metric('2026-01-02', 'side_plank_sec', 'left', 'single', 28),
      metric('2026-01-01', 'side_plank_sec', 'right', 'single', 22),
    ]
    expect(bestHoldBySide(metrics, 'side_plank_sec')).toEqual({
      left: 28,
      right: 22,
    })
    expect(bestHoldBySide(metrics, 'hip_core_hold_sec')).toEqual({
      left: null,
      right: null,
    })
  })
})

describe('computeActiveStreak', () => {
  it('conta dias consecutivos terminando hoje', () => {
    const sessions = [
      session('2026-01-03', 'completed'),
      session('2026-01-04', 'partial'),
      session('2026-01-05', 'completed'),
    ]
    expect(computeActiveStreak(sessions, '2026-01-05')).toBe(3)
  })

  it('conta até ontem quando hoje ainda não teve treino', () => {
    const sessions = [
      session('2026-01-03', 'completed'),
      session('2026-01-04', 'completed'),
    ]
    expect(computeActiveStreak(sessions, '2026-01-05')).toBe(2)
  })

  it('quebra em lacunas e ignora not_completed', () => {
    const sessions = [
      session('2026-01-01', 'completed'),
      session('2026-01-03', 'completed'), // lacuna no dia 02
      session('2026-01-04', 'not_completed'), // não conta
    ]
    expect(computeActiveStreak(sessions, '2026-01-04')).toBe(1) // só dia 03
  })

  it('retorna 0 sem atividade recente', () => {
    expect(computeActiveStreak([], '2026-01-05')).toBe(0)
    expect(
      computeActiveStreak([session('2026-01-01', 'completed')], '2026-01-10'),
    ).toBe(0)
  })
})

describe('computeDelta / hasEnoughData', () => {
  it('computeDelta é null com menos de 2 pontos', () => {
    expect(computeDelta([])).toBeNull()
    expect(computeDelta([{ dayKey: '2026-01-01', value: 5 }])).toBeNull()
  })

  it('computeDelta usa primeiro e último ponto', () => {
    expect(
      computeDelta([
        { dayKey: '2026-01-01', value: 6 },
        { dayKey: '2026-01-02', value: 8 },
        { dayKey: '2026-01-05', value: 3 },
      ]),
    ).toEqual({ first: 6, last: 3, delta: -3 })
  })

  it('hasEnoughData respeita o mínimo', () => {
    expect(hasEnoughData([{ dayKey: 'x', value: 1 }], 2)).toBe(false)
    expect(
      hasEnoughData(
        [
          { dayKey: 'a', value: 1 },
          { dayKey: 'b', value: 2 },
        ],
        2,
      ),
    ).toBe(true)
  })
})
