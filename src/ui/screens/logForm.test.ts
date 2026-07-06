import { describe, it, expect } from 'vitest'
import {
  adductorPainInputs,
  parseOptionalNumber,
  sideTimeInputs,
} from './logForm'

describe('parseOptionalNumber', () => {
  it('vazio ou inválido → null; número válido → number', () => {
    expect(parseOptionalNumber('')).toBeNull()
    expect(parseOptionalNumber('  ')).toBeNull()
    expect(parseOptionalNumber('abc')).toBeNull()
    expect(parseOptionalNumber('-5')).toBeNull()
    expect(parseOptionalNumber('40')).toBe(40)
  })
})

describe('adductorPainInputs', () => {
  it('gera antes/depois com o lado escolhido', () => {
    expect(
      adductorPainInputs({ side: 'left', before: 6, after: 4 }),
    ).toEqual([
      { metric: 'adductor_pain', side: 'left', phase: 'before', value: 6 },
      { metric: 'adductor_pain', side: 'left', phase: 'after', value: 4 },
    ])
  })

  it("preserva 'both' (expansão ocorre na persistência)", () => {
    const rows = adductorPainInputs({ side: 'both', before: 5, after: 3 })
    expect(rows).toHaveLength(2)
    expect(rows.every((r) => r.side === 'both')).toBe(true)
  })

  it("'not_applicable' não gera métrica", () => {
    expect(adductorPainInputs({ side: 'not_applicable', before: 5, after: 3 })).toEqual(
      [],
    )
  })
})

describe('sideTimeInputs', () => {
  it('lado único gera uma linha', () => {
    expect(
      sideTimeInputs('side_plank_sec', { side: 'left', left: '20', right: '' }),
    ).toEqual([
      { metric: 'side_plank_sec', side: 'left', phase: 'single', value: 20 },
    ])
  })

  it("'both' gera linhas independentes left/right", () => {
    const rows = sideTimeInputs('hip_core_hold_sec', {
      side: 'both',
      left: '30',
      right: '25',
    })
    expect(rows).toEqual([
      { metric: 'hip_core_hold_sec', side: 'left', phase: 'single', value: 30 },
      { metric: 'hip_core_hold_sec', side: 'right', phase: 'single', value: 25 },
    ])
  })

  it('ignora campos vazios', () => {
    expect(
      sideTimeInputs('side_plank_sec', { side: 'both', left: '20', right: '' }),
    ).toEqual([
      { metric: 'side_plank_sec', side: 'left', phase: 'single', value: 20 },
    ])
  })

  it("'not_applicable' não gera métrica", () => {
    expect(
      sideTimeInputs('side_plank_sec', {
        side: 'not_applicable',
        left: '20',
        right: '25',
      }),
    ).toEqual([])
  })
})
