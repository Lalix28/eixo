import { describe, it, expect } from 'vitest'
import { createAppStore } from './useAppStore'
import { FakeRepository } from '../persistence/fakeRepository'
import type { OnboardingAnswers } from '../domain/types'

const answers: OnboardingAnswers = {
  level: 'beginner',
  lowBackPain: 4,
  adductorPain: 6,
  atrophySide: 'unknown',
  worstSide: 'varies',
  canSprint: true,
  hasBike: false,
  dailyMinutes: 20,
  goal: 'all',
}

describe('useAppStore — init', () => {
  it('sem baseline salvo, vai para onboarding', async () => {
    const store = createAppStore(new FakeRepository())
    await store.getState().init()
    const s = store.getState()
    expect(s.status).toBe('ready')
    expect(s.baseline).toBeNull()
    expect(s.view).toBe('onboarding')
  })

  it('com baseline salvo, vai para o dashboard', async () => {
    const repo = new FakeRepository()
    await repo.saveBaseline({
      level: 'beginner',
      lowBackPain: 3,
      adductorPain: 5,
      atrophySide: 'left',
      worstSide: 'left',
      canSprint: true,
      hasBike: false,
      dailyMinutes: 20,
      goal: 'all',
    })
    const store = createAppStore(repo)
    await store.getState().init()
    const s = store.getState()
    expect(s.baseline).not.toBeNull()
    expect(s.view).toBe('today')
  })

  it('expõe erro amigável quando o repositório falha', async () => {
    const failing = new FakeRepository()
    failing.getBaseline = () => Promise.reject(new Error('idb down'))
    const store = createAppStore(failing)
    await store.getState().init()
    expect(store.getState().status).toBe('error')
    expect(store.getState().error).toBeTruthy()
  })
})

describe('useAppStore — submitOnboarding', () => {
  it('normaliza as respostas e persiste o baseline, indo ao dashboard', async () => {
    const repo = new FakeRepository()
    const store = createAppStore(repo)
    await store.getState().submitOnboarding(answers)

    const s = store.getState()
    expect(s.view).toBe('today')
    expect(s.baseline).not.toBeNull()
    // normalização: 'unknown' → 'not_applicable'
    expect(s.baseline?.atrophySide).toBe('not_applicable')

    // persistido de verdade no repositório
    const stored = await repo.getBaseline()
    expect(stored?.id).toBe(s.baseline?.id)
    expect(stored?.lowBackPain).toBe(4)
  })
})

describe('useAppStore — navegação', () => {
  it('setView troca a view', () => {
    const store = createAppStore(new FakeRepository())
    store.getState().setView('progress')
    expect(store.getState().view).toBe('progress')
  })
})

describe('useAppStore — sessão de treino', () => {
  it('startWorkout cria uma Session e abre a execução', async () => {
    const repo = new FakeRepository()
    const store = createAppStore(repo)
    await store.getState().startWorkout()

    const s = store.getState()
    expect(s.activeSessionId).toBeTruthy()
    expect(s.view).toBe('workout')
    expect(s.sessions).toHaveLength(1)
    // criada como 'not_completed' (não avança o programa)
    expect(s.sessions[0].status).toBe('not_completed')
    expect(await repo.listSessions()).toHaveLength(1)
  })

  it('não duplica sessão em cliques repetidos', async () => {
    const repo = new FakeRepository()
    const store = createAppStore(repo)
    await Promise.all([
      store.getState().startWorkout(),
      store.getState().startWorkout(),
    ])
    await store.getState().startWorkout()
    expect(await repo.listSessions()).toHaveLength(1)
  })

  it('finishWorkout abre o registro com status sugerido, mantendo a sessão ativa', async () => {
    const repo = new FakeRepository()
    const store = createAppStore(repo)
    await store.getState().startWorkout()
    const id = store.getState().activeSessionId

    store.getState().finishWorkout('partial')

    const s = store.getState()
    expect(s.view).toBe('log')
    expect(s.suggestedStatus).toBe('partial')
    // sessão continua ativa até salvar o registro
    expect(s.activeSessionId).toBe(id)
    // ainda não finalizou no banco
    const stored = (await repo.listSessions()).find((x) => x.id === id)
    expect(stored?.status).toBe('not_completed')
  })
})

describe('useAppStore — registro pós-treino', () => {
  const globals = {
    lowBackPainBefore: 4,
    lowBackPainAfter: 2,
    rpe: 6,
    frontPlankSec: 40,
    reachToFloorCm: 8,
    botheredExerciseId: null,
    botheredSide: 'not_applicable' as const,
    notes: null,
  }

  async function withActiveSession() {
    const repo = new FakeRepository()
    const store = createAppStore(repo)
    await store.getState().startWorkout()
    return { repo, store }
  }

  it('salva log e sideMetrics, atualiza a sessão e volta ao dashboard', async () => {
    const { repo, store } = await withActiveSession()
    const id = store.getState().activeSessionId

    await store.getState().saveSessionLog({
      status: 'completed',
      globals,
      sideInputs: [
        { metric: 'adductor_pain', side: 'left', phase: 'after', value: 3 },
        { metric: 'side_plank_sec', side: 'right', phase: 'single', value: 22 },
      ],
    })

    const s = store.getState()
    expect(s.activeSessionId).toBeNull()
    expect(s.view).toBe('today')

    const logs = await repo.listLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].lowBackPainAfter).toBe(2)
    expect(await repo.listSideMetrics()).toHaveLength(2)

    const session = (await repo.listSessions()).find((x) => x.id === id)
    expect(session?.status).toBe('completed')
    expect(session?.completedAt).not.toBeNull()
  })

  it("materializa 'both' em left+right e ignora 'not_applicable'", async () => {
    const { repo, store } = await withActiveSession()
    await store.getState().saveSessionLog({
      status: 'completed',
      globals,
      sideInputs: [
        { metric: 'adductor_pain', side: 'both', phase: 'after', value: 4 },
        { metric: 'side_plank_sec', side: 'not_applicable', phase: 'single', value: 30 },
      ],
    })
    const metrics = await repo.listSideMetrics()
    expect(metrics).toHaveLength(2) // both → 2; not_applicable → 0
    expect(metrics.map((m) => m.side).sort()).toEqual(['left', 'right'])
    expect(metrics.every((m) => m.side === 'left' || m.side === 'right')).toBe(true)
  })

  it('não salva duplicado em salvamento concorrente', async () => {
    const { repo, store } = await withActiveSession()
    await Promise.all([
      store.getState().saveSessionLog({ status: 'completed', globals, sideInputs: [] }),
      store.getState().saveSessionLog({ status: 'completed', globals, sideInputs: [] }),
    ])
    expect(await repo.listLogs()).toHaveLength(1)
  })

  it('sem sessão ativa, apenas volta ao dashboard', async () => {
    const repo = new FakeRepository()
    const store = createAppStore(repo)
    await store.getState().saveSessionLog({ status: 'completed', globals, sideInputs: [] })
    expect(store.getState().view).toBe('today')
    expect(await repo.listLogs()).toHaveLength(0)
  })
})
