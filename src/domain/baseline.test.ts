import { describe, it, expect } from 'vitest'
import { normalizeOnboarding } from './baseline'
import type { OnboardingAnswers } from './types'

const base: OnboardingAnswers = {
  level: 'beginner',
  lowBackPain: 3,
  adductorPain: 5,
  atrophySide: 'left',
  worstSide: 'left',
  canSprint: true,
  hasBike: false,
  dailyMinutes: 20,
  goal: 'all',
}

describe('normalizeOnboarding', () => {
  it("mapeia atrophySide 'unknown' para 'not_applicable'", () => {
    const r = normalizeOnboarding({ ...base, atrophySide: 'unknown' })
    expect(r.atrophySide).toBe('not_applicable')
  })

  it('preserva lados conhecidos', () => {
    expect(normalizeOnboarding({ ...base, atrophySide: 'right' }).atrophySide).toBe(
      'right',
    )
    expect(normalizeOnboarding({ ...base, atrophySide: 'both' }).atrophySide).toBe(
      'both',
    )
  })

  it('clampa e arredonda dores para 0..10 inteiro', () => {
    const r = normalizeOnboarding({
      ...base,
      lowBackPain: 12,
      adductorPain: -3,
    })
    expect(r.lowBackPain).toBe(10)
    expect(r.adductorPain).toBe(0)

    const r2 = normalizeOnboarding({ ...base, lowBackPain: 4.6 })
    expect(r2.lowBackPain).toBe(5)
  })

  it('não carimba id nem createdAt (feito na persistência)', () => {
    const r = normalizeOnboarding(base)
    expect(r).not.toHaveProperty('id')
    expect(r).not.toHaveProperty('createdAt')
  })

  it('repassa os demais campos', () => {
    const r = normalizeOnboarding(base)
    expect(r).toMatchObject({
      level: 'beginner',
      worstSide: 'left',
      canSprint: true,
      hasBike: false,
      dailyMinutes: 20,
      goal: 'all',
    })
  })
})
