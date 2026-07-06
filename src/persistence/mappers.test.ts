import { describe, it, expect } from 'vitest'
import {
  expandSideMetricInputs,
  sidesForInput,
  toBaseline,
} from './mappers'
import type { SideMetricInput } from './repository'
import type { BaselineInput } from '../domain/types'

describe('sidesForInput', () => {
  it("expande 'both' em left+right", () => {
    expect(sidesForInput('both')).toEqual(['left', 'right'])
  })

  it('mantém left/right', () => {
    expect(sidesForInput('left')).toEqual(['left'])
    expect(sidesForInput('right')).toEqual(['right'])
  })

  it("'not_applicable' não gera lado", () => {
    expect(sidesForInput('not_applicable')).toEqual([])
  })
})

describe('expandSideMetricInputs', () => {
  it("materializa 'both' como duas linhas left/right com o mesmo valor", () => {
    const inputs: SideMetricInput[] = [
      { metric: 'adductor_pain', side: 'both', phase: 'after', value: 5 },
    ]
    const rows = expandSideMetricInputs(inputs)
    expect(rows).toEqual([
      { metric: 'adductor_pain', side: 'left', phase: 'after', value: 5 },
      { metric: 'adductor_pain', side: 'right', phase: 'after', value: 5 },
    ])
  })

  it("descarta 'not_applicable' (nenhuma métrica numérica)", () => {
    const inputs: SideMetricInput[] = [
      { metric: 'side_plank_sec', side: 'not_applicable', phase: 'single', value: 30 },
    ]
    expect(expandSideMetricInputs(inputs)).toEqual([])
  })

  it('só produz lados left/right', () => {
    const inputs: SideMetricInput[] = [
      { metric: 'side_plank_sec', side: 'left', phase: 'single', value: 20 },
      { metric: 'side_plank_sec', side: 'both', phase: 'single', value: 25 },
    ]
    const sides = expandSideMetricInputs(inputs).map((r) => r.side)
    expect(sides).toEqual(['left', 'left', 'right'])
    expect(sides.every((s) => s === 'left' || s === 'right')).toBe(true)
  })
})

describe('toBaseline', () => {
  const input: BaselineInput = {
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

  it('carimba id e createdAt a partir do meta injetado', () => {
    const b = toBaseline(input, { id: 'abc', createdAt: '2026-01-01T00:00:00.000Z' })
    expect(b.id).toBe('abc')
    expect(b.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(b).toMatchObject(input)
  })
})
