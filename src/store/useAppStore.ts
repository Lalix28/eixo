import { create } from 'zustand'
import type {
  Baseline,
  OnboardingAnswers,
  Session,
  SessionStatus,
} from '../domain/types'
import { normalizeOnboarding } from '../domain/baseline'
import { resolveTodayDay } from '../domain/plan'
import { toDayKey } from '../domain/progress'
import { PLAN_DAYS } from '../data/plan'
import { repository } from '../persistence/dexieRepository'
import type { Repository } from '../persistence/repository'

/**
 * Navegação por estado (sem router), conforme decisão de arquitetura.
 * A `view` atual determina qual tela o App renderiza.
 */
export type View =
  | 'onboarding'
  | 'today'
  | 'workout'
  | 'log'
  | 'progress'
  | 'settings'

/** Telas acessíveis pela barra de navegação inferior. */
export const NAV_VIEWS = ['today', 'progress', 'settings'] as const
export type NavView = (typeof NAV_VIEWS)[number]

export type AppStatus = 'loading' | 'ready' | 'error'

const IDB_ERROR_MESSAGE =
  'Não foi possível acessar o armazenamento local deste navegador. ' +
  'Verifique se não está em uma janela privada e tente novamente.'

interface AppState {
  view: View
  status: AppStatus
  error: string | null
  baseline: Baseline | null
  sessions: Session[]
  initialized: boolean

  /** Sessão de treino em andamento (criada ao iniciar, limpa ao concluir). */
  activeSessionId: string | null
  /** Guarda contra criação de sessões duplicadas em cliques repetidos. */
  starting: boolean

  setView: (view: View) => void
  /** Carrega baseline e sessões do repositório (uma vez). */
  init: () => Promise<void>
  /** Normaliza o onboarding, persiste o baseline e vai para o dashboard. */
  submitOnboarding: (answers: OnboardingAnswers) => Promise<void>
  /** Cria a Session do dia (status 'not_completed') e abre a execução. */
  startWorkout: () => Promise<void>
  /** Marca a sessão ativa como concluída/parcial e vai para o registro. */
  finishWorkout: (status: Extract<SessionStatus, 'completed' | 'partial'>) => Promise<void>
}

/**
 * Store como factory para permitir injeção do repositório nos testes.
 * A UI nunca acessa o banco direto — sempre via estas ações.
 */
export function createAppStore(repo: Repository) {
  return create<AppState>((set, get) => ({
    view: 'today',
    status: 'loading',
    error: null,
    baseline: null,
    sessions: [],
    initialized: false,
    activeSessionId: null,
    starting: false,

    setView: (view) => set({ view }),

    init: async () => {
      if (get().initialized) return
      set({ status: 'loading', error: null })
      try {
        const [baseline, sessions] = await Promise.all([
          repo.getBaseline(),
          repo.listSessions(),
        ])
        set({
          baseline: baseline ?? null,
          sessions,
          status: 'ready',
          initialized: true,
          view: baseline ? 'today' : 'onboarding',
        })
      } catch {
        set({ status: 'error', error: IDB_ERROR_MESSAGE, initialized: true })
      }
    },

    submitOnboarding: async (answers) => {
      const input = normalizeOnboarding(answers)
      try {
        const baseline = await repo.saveBaseline(input)
        set({ baseline, status: 'ready', error: null, view: 'today' })
      } catch {
        set({ status: 'error', error: IDB_ERROR_MESSAGE })
      }
    },

    startWorkout: async () => {
      const { starting, activeSessionId } = get()
      // Já iniciando ou já há sessão ativa → só abre a execução, sem recriar.
      if (starting || activeSessionId) {
        set({ view: 'workout' })
        return
      }
      set({ starting: true })
      try {
        const todayKey = toDayKey(new Date())
        const { day, dayIndex } = resolveTodayDay(
          PLAN_DAYS,
          get().sessions,
          todayKey,
        )
        const session = await repo.createSession({
          planDayId: day.id,
          dayIndex,
          dayKey: todayKey,
          startedAt: Date.now(),
          status: 'not_completed', // em andamento; não avança o programa
        })
        set((state) => ({
          activeSessionId: session.id,
          sessions: [...state.sessions, session],
          starting: false,
          view: 'workout',
        }))
      } catch {
        set({ starting: false, status: 'error', error: IDB_ERROR_MESSAGE })
      }
    },

    finishWorkout: async (status) => {
      const id = get().activeSessionId
      if (!id) {
        set({ view: 'log' })
        return
      }
      const completedAt = Date.now()
      try {
        await repo.updateSession(id, { status, completedAt })
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status, completedAt } : s,
          ),
          activeSessionId: null,
          view: 'log',
        }))
      } catch {
        set({ status: 'error', error: IDB_ERROR_MESSAGE })
      }
    },
  }))
}

/** Instância singleton ligada ao repositório real (Dexie). */
export const useAppStore = createAppStore(repository)
