import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EixoDB } from './db'
import { DexieRepository } from './dexieRepository'
import type { BaselineInput } from '../domain/types'
import type { SideMetricInput } from './repository'

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

let dbName: string
let db: EixoDB
let repo: DexieRepository

beforeEach(() => {
  dbName = `eixo-test-${crypto.randomUUID()}`
  db = new EixoDB(dbName)
  repo = new DexieRepository(db)
})

afterEach(async () => {
  await db.delete()
})

describe('DexieRepository — baseline', () => {
  it('salva e carrega o baseline, gerando UUID e createdAt', async () => {
    const saved = await repo.saveBaseline(baselineInput)
    expect(saved.id).toBeTruthy()
    expect(saved.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    const loaded = await repo.getBaseline()
    expect(loaded).toEqual(saved)
  })

  it('getBaseline retorna o mais recente', async () => {
    await repo.saveBaseline(baselineInput)
    const second = await repo.saveBaseline({ ...baselineInput, level: 'advanced' })
    const loaded = await repo.getBaseline()
    expect(loaded?.id).toBe(second.id)
    expect(loaded?.level).toBe('advanced')
  })
})

describe('DexieRepository — sessions e logs', () => {
  it('cria session com UUID e atualiza status/completedAt', async () => {
    const session = await repo.createSession({
      planDayId: 'day-01',
      dayIndex: 1,
      dayKey: '2026-01-05',
      startedAt: 1_000,
      status: 'partial',
    })
    expect(session.id).toBeTruthy()
    expect(session.completedAt).toBeNull()

    await repo.updateSession(session.id, {
      status: 'completed',
      completedAt: 2_000,
    })
    const [updated] = await repo.listSessions()
    expect(updated.status).toBe('completed')
    expect(updated.completedAt).toBe(2_000)
  })

  it('salva log com defaults e lê por sessionId', async () => {
    const session = await repo.createSession({
      planDayId: 'day-01',
      dayIndex: 1,
      dayKey: '2026-01-05',
      startedAt: 0,
      status: 'completed',
    })
    const log = await repo.saveLog({
      sessionId: session.id,
      dayKey: '2026-01-05',
      lowBackPainAfter: 2,
    })
    expect(log.id).toBeTruthy()
    expect(log.botheredSide).toBe('not_applicable') // default
    expect(log.rpe).toBeNull()

    const found = await repo.getLogBySession(session.id)
    expect(found?.id).toBe(log.id)
  })
})

describe('DexieRepository — sideMetrics', () => {
  it("expande 'both' em duas linhas left/right ao persistir", async () => {
    const inputs: SideMetricInput[] = [
      { metric: 'adductor_pain', side: 'both', phase: 'after', value: 4 },
    ]
    const rows = await repo.saveSideMetrics('log-1', '2026-01-05', inputs)
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.side).sort()).toEqual(['left', 'right'])
    rows.forEach((r) => expect(r.id).toBeTruthy())

    const stored = await repo.listSideMetrics()
    expect(stored).toHaveLength(2)
  })

  it("'not_applicable' não gera nenhuma métrica numérica", async () => {
    const inputs: SideMetricInput[] = [
      { metric: 'side_plank_sec', side: 'not_applicable', phase: 'single', value: 30 },
    ]
    const rows = await repo.saveSideMetrics('log-1', '2026-01-05', inputs)
    expect(rows).toEqual([])
    expect(await repo.listSideMetrics()).toHaveLength(0)
  })

  it('só armazena left ou right', async () => {
    await repo.saveSideMetrics('log-1', '2026-01-05', [
      { metric: 'side_plank_sec', side: 'left', phase: 'single', value: 20 },
      { metric: 'side_plank_sec', side: 'both', phase: 'single', value: 25 },
    ])
    const stored = await repo.listSideMetrics()
    expect(stored.every((m) => m.side === 'left' || m.side === 'right')).toBe(true)
  })
})

describe('DexieRepository — consultas e reset', () => {
  it('getDayData filtra por dayKey', async () => {
    await repo.createSession({
      planDayId: 'day-01',
      dayIndex: 1,
      dayKey: '2026-01-05',
      startedAt: 0,
      status: 'completed',
    })
    await repo.createSession({
      planDayId: 'day-02',
      dayIndex: 2,
      dayKey: '2026-01-06',
      startedAt: 0,
      status: 'completed',
    })
    await repo.saveSideMetrics('log-x', '2026-01-05', [
      { metric: 'adductor_pain', side: 'left', phase: 'after', value: 3 },
    ])

    const day = await repo.getDayData('2026-01-05')
    expect(day.sessions).toHaveLength(1)
    expect(day.sessions[0].dayKey).toBe('2026-01-05')
    expect(day.sideMetrics).toHaveLength(1)
  })

  it('getProgressData retorna todos os registros', async () => {
    await repo.saveBaseline(baselineInput)
    await repo.createSession({
      planDayId: 'day-01',
      dayIndex: 1,
      dayKey: '2026-01-05',
      startedAt: 0,
      status: 'completed',
    })
    const bundle = await repo.getProgressData()
    expect(bundle.sessions).toHaveLength(1)
  })

  it('exportData retorna metadados e todas as tabelas reais', async () => {
    const baseline = await repo.saveBaseline(baselineInput)
    const session = await repo.createSession({
      planDayId: 'day-01',
      dayIndex: 1,
      dayKey: '2026-01-05',
      startedAt: 0,
      status: 'completed',
    })
    const log = await repo.saveLog({
      sessionId: session.id,
      dayKey: session.dayKey,
      lowBackPainAfter: 2,
    })
    await repo.saveSideMetrics(log.id, session.dayKey, [
      { metric: 'side_plank_sec', side: 'left', phase: 'single', value: 25 },
    ])

    const bundle = await repo.exportData()

    expect(bundle.app).toBe('Eixo')
    expect(bundle.exportVersion).toBe(1)
    expect(bundle.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(bundle.source).toBe('local-indexeddb')
    expect(bundle.warning).toMatch(/Backup local/)
    expect(bundle.data.baselines).toEqual([baseline])
    expect(bundle.data.sessions).toEqual([session])
    expect(bundle.data.logs).toEqual([log])
    expect(bundle.data.sideMetrics).toHaveLength(1)
  })

  it('resetAll limpa todas as tabelas', async () => {
    await repo.saveBaseline(baselineInput)
    await repo.createSession({
      planDayId: 'day-01',
      dayIndex: 1,
      dayKey: '2026-01-05',
      startedAt: 0,
      status: 'completed',
    })
    await repo.resetAll()

    expect(await repo.getBaseline()).toBeUndefined()
    expect(await repo.listSessions()).toHaveLength(0)
    expect(await repo.listSideMetrics()).toHaveLength(0)
  })
})

describe('DexieRepository — persistência real', () => {
  it('dados sobrevivem à reabertura do banco (nova instância, mesmo nome)', async () => {
    const saved = await repo.saveBaseline(baselineInput)
    db.close()

    // Reabre o MESMO banco numa nova instância — prova que foi ao IndexedDB.
    const reopened = new EixoDB(dbName)
    const reopenedRepo = new DexieRepository(reopened)
    const loaded = await reopenedRepo.getBaseline()
    expect(loaded?.id).toBe(saved.id)
    reopened.close()
  })
})
