import { describe, it, expect } from 'vitest'
import {
  getExercisesForDay,
  getPlanDay,
  getWeekProgression,
  resolveTodayDay,
  substituteExercise,
  weekOfDayIndex,
} from './plan'
import { PLAN_DAYS, PLAN_LENGTH } from '../data/plan'
import { EXERCISES, EXERCISES_BY_ID } from '../data/exercises'
import type { Session, SessionStatus } from './types'

function session(dayIndex: number, status: SessionStatus, dayKey: string): Session {
  return {
    id: `s-${dayIndex}`,
    planDayId: `day-${dayIndex}`,
    dayIndex,
    dayKey,
    startedAt: 0,
    completedAt: null,
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('getPlanDay', () => {
  it('retorna o dia pelo índice e undefined fora do intervalo', () => {
    expect(getPlanDay(PLAN_DAYS, 1)?.dayIndex).toBe(1)
    expect(getPlanDay(PLAN_DAYS, 30)?.dayIndex).toBe(30)
    expect(getPlanDay(PLAN_DAYS, 31)).toBeUndefined()
  })
})

describe('weekOfDayIndex', () => {
  it('mapeia dias para semanas 1..4 (extras usam a semana 4)', () => {
    expect(weekOfDayIndex(1)).toBe(1)
    expect(weekOfDayIndex(7)).toBe(1)
    expect(weekOfDayIndex(8)).toBe(2)
    expect(weekOfDayIndex(14)).toBe(2)
    expect(weekOfDayIndex(15)).toBe(3)
    expect(weekOfDayIndex(21)).toBe(3)
    expect(weekOfDayIndex(22)).toBe(4)
    expect(weekOfDayIndex(28)).toBe(4)
    expect(weekOfDayIndex(29)).toBe(4)
    expect(weekOfDayIndex(30)).toBe(4)
  })
})

describe('getWeekProgression', () => {
  it('semana 1: 6 tiros de 10s, intensidade 8; hold 30/60', () => {
    const p = getWeekProgression(1)
    expect(p.sprints).toMatchObject({ reps: 6, workSec: 10, intensity: 8 })
    expect(p.hipCore).toMatchObject({ workSec: 30, restSecMin: 60 })
  })

  it('semana 2: faixa de 10–12s; hold 40/50', () => {
    const p = getWeekProgression(8)
    expect(p.sprints).toMatchObject({ reps: 8, workSec: 10, workSecMax: 12 })
    expect(p.hipCore.workSec).toBe(40)
  })

  it('semana 4: 10 tiros de 15s com alternativa 6x20s; hold 60/30–40', () => {
    const p = getWeekProgression(22)
    expect(p.sprints).toMatchObject({ reps: 10, workSec: 15 })
    expect(p.sprints.alt).toEqual({ reps: 6, workSec: 20 })
    expect(p.hipCore).toMatchObject({ workSec: 60, restSecMin: 30, restSecMax: 40 })
  })
})

describe('resolveTodayDay', () => {
  it('sem sessões, começa no dia 1', () => {
    const r = resolveTodayDay(PLAN_DAYS, [], '2026-01-10')
    expect(r.dayIndex).toBe(1)
    expect(r.loggedToday).toBe(false)
    expect(r.programComplete).toBe(false)
  })

  it('avança apenas com sessões completed/partial', () => {
    const sessions = [
      session(1, 'completed', '2026-01-01'),
      session(2, 'partial', '2026-01-02'),
      session(3, 'not_completed', '2026-01-03'),
    ]
    // 2 avanços (completed + partial) → dia atual = 3
    const r = resolveTodayDay(PLAN_DAYS, sessions, '2026-01-04')
    expect(r.dayIndex).toBe(3)
  })

  it('marca loggedToday quando há sessão na data de hoje', () => {
    const r = resolveTodayDay(
      PLAN_DAYS,
      [session(1, 'completed', '2026-01-05')],
      '2026-01-05',
    )
    expect(r.loggedToday).toBe(true)
  })

  it('programa completo após 30 avanços, clampeado ao dia 30', () => {
    const sessions = Array.from({ length: 30 }, (_, i) =>
      session(i + 1, 'completed', `2026-02-${String(i + 1).padStart(2, '0')}`),
    )
    const r = resolveTodayDay(PLAN_DAYS, sessions, '2026-03-05')
    expect(r.programComplete).toBe(true)
    expect(r.dayIndex).toBe(30)
  })
})

describe('getExercisesForDay', () => {
  it('achata os blocos do dia em exercícios resolvidos', () => {
    const day = PLAN_DAYS[0] // segunda
    const resolved = getExercisesForDay(day, EXERCISES)
    const totalItems = day.blocks.reduce((n, b) => n + b.items.length, 0)
    expect(resolved).toHaveLength(totalItems)
    expect(resolved[0].exercise.id).toBe(day.blocks[0].items[0].exerciseId)
    expect(resolved[0].block).toBe(day.blocks[0].title)
  })
})

describe('substituteExercise', () => {
  it('retorna a substituição quando existe', () => {
    const pushup = EXERCISES_BY_ID['pushup']
    expect(substituteExercise(pushup, EXERCISES)?.id).toBe('incline-pushup')
  })

  it('retorna undefined quando não há substituição', () => {
    const wall = EXERCISES_BY_ID['wall-pushup']
    expect(substituteExercise(wall, EXERCISES)).toBeUndefined()
  })
})

describe('integridade dos dados estáticos', () => {
  it('o plano tem 30 dias com índices sequenciais', () => {
    expect(PLAN_DAYS).toHaveLength(PLAN_LENGTH)
    PLAN_DAYS.forEach((d, i) => expect(d.dayIndex).toBe(i + 1))
  })

  it('dia 1 é segunda-feira e a semana cicla', () => {
    expect(PLAN_DAYS[0].weekday).toBe('mon')
    expect(PLAN_DAYS[6].weekday).toBe('sun')
    expect(PLAN_DAYS[7].weekday).toBe('mon')
  })

  it('todo item do plano referencia um exercício existente', () => {
    for (const day of PLAN_DAYS) {
      for (const block of day.blocks) {
        for (const item of block.items) {
          expect(
            EXERCISES_BY_ID[item.exerciseId],
            `exercício ausente: ${item.exerciseId}`,
          ).toBeDefined()
        }
      }
    }
  })

  it('toda substituição referencia um exercício existente', () => {
    for (const ex of EXERCISES) {
      if (ex.substitutionId) {
        expect(
          EXERCISES_BY_ID[ex.substitutionId],
          `substituição ausente: ${ex.substitutionId}`,
        ).toBeDefined()
      }
    }
  })

  it('ids de exercícios são únicos', () => {
    const ids = EXERCISES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
