import { describe, it, expect } from 'vitest'
import { FakeRepository } from './fakeRepository'
import type { BaselineInput } from '../domain/types'

const baselineInput: BaselineInput = {
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

describe('FakeRepository (paridade de contrato)', () => {
  it('salva/carrega baseline e reflete a expansão de lado', async () => {
    const repo = new FakeRepository()

    const saved = await repo.saveBaseline(baselineInput)
    expect(await repo.getBaseline()).toEqual(saved)

    await repo.saveSideMetrics('log-1', '2026-01-05', [
      { metric: 'adductor_pain', side: 'both', phase: 'after', value: 4 },
      { metric: 'side_plank_sec', side: 'not_applicable', phase: 'single', value: 30 },
    ])
    const metrics = await repo.listSideMetrics()
    expect(metrics).toHaveLength(2) // both → 2; not_applicable → 0
    expect(metrics.every((m) => m.side === 'left' || m.side === 'right')).toBe(true)
  })

  it('resetAll limpa o estado', async () => {
    const repo = new FakeRepository()
    await repo.saveBaseline(baselineInput)
    await repo.resetAll()
    expect(await repo.getBaseline()).toBeUndefined()
  })

  it('exportData funciona sem nenhum dado salvo', async () => {
    const bundle = await new FakeRepository().exportData()
    expect(bundle.data).toEqual({
      baselines: [],
      sessions: [],
      logs: [],
      sideMetrics: [],
    })
  })
})
