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
import type {
  DataBundle,
  NewLog,
  Repository,
  SideMetricInput,
} from '../persistence/repository'
import type { ExportBundle } from '../persistence/exportBundle'

/** Campos globais do registro (tudo exceto sessionId/dayKey, carimbados no store). */
export type LogGlobals = Omit<NewLog, 'sessionId' | 'dayKey'>

/** Submissão do registro pós-treino: status final + globais + métricas por lado. */
export interface LogSubmission {
  status: SessionStatus
  globals: LogGlobals
  sideInputs: SideMetricInput[]
}

type SuggestedStatus = Extract<SessionStatus, 'completed' | 'partial'>

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

const LOCAL_DATA_ERROR_MESSAGE =
  'Não foi possível salvar ou acessar os dados locais neste dispositivo. ' +
  'Tente novamente e verifique as configurações de armazenamento do navegador.'

interface AppState {
  view: View
  status: AppStatus
  error: string | null
  baseline: Baseline | null
  sessions: Session[]
  initialized: boolean

  /** Sessão de treino em andamento (criada ao iniciar, limpa ao salvar o registro). */
  activeSessionId: string | null
  /** Guarda contra criação de sessões duplicadas em cliques repetidos. */
  starting: boolean
  /** Status sugerido ao abrir o registro (do fim do treino). */
  suggestedStatus: SuggestedStatus
  /** Salvamento do registro em andamento (evita duplo salvamento). */
  saving: boolean

  /** Snapshot de dados para o Progresso (sessions + logs + sideMetrics). */
  progressData: DataBundle | null
  progressLoading: boolean
  progressError: string | null

  setView: (view: View) => void
  /** Carrega baseline e sessões do repositório (uma vez). */
  init: () => Promise<void>
  /** Normaliza o onboarding, persiste o baseline e vai para o dashboard. */
  submitOnboarding: (answers: OnboardingAnswers) => Promise<void>
  /** Cria a Session do dia (status 'not_completed') e abre a execução. */
  startWorkout: () => Promise<void>
  /** Encerra a execução e abre o registro com status sugerido (mantém a sessão ativa). */
  finishWorkout: (status: SuggestedStatus) => void
  /** Persiste log + métricas por lado, atualiza a sessão e volta ao dashboard. */
  saveSessionLog: (submission: LogSubmission) => Promise<void>
  /** Carrega o snapshot de progresso do repositório. */
  loadProgress: () => Promise<void>
  /** Obtém um snapshot completo para backup; o download fica na camada de UI. */
  exportData: () => Promise<ExportBundle>
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
    suggestedStatus: 'completed',
    saving: false,
    progressData: null,
    progressLoading: false,
    progressError: null,

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
        set({ status: 'error', error: LOCAL_DATA_ERROR_MESSAGE, initialized: true })
      }
    },

    submitOnboarding: async (answers) => {
      const input = normalizeOnboarding(answers)
      try {
        const baseline = await repo.saveBaseline(input)
        set({ baseline, status: 'ready', error: null, view: 'today' })
      } catch {
        set({ status: 'error', error: LOCAL_DATA_ERROR_MESSAGE })
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
        set({
          starting: false,
          status: 'error',
          error: LOCAL_DATA_ERROR_MESSAGE,
        })
      }
    },

    finishWorkout: (status) => {
      // Não finaliza no banco ainda: mantém a sessão ativa e abre o registro
      // com o status sugerido. A finalização ocorre ao salvar o registro.
      set({ suggestedStatus: status, view: 'log' })
    },

    saveSessionLog: async (submission) => {
      const { saving, activeSessionId, sessions } = get()
      if (saving) return
      if (!activeSessionId) {
        set({ view: 'today' })
        return
      }
      set({ saving: true })
      try {
        const session = sessions.find((s) => s.id === activeSessionId)
        const dayKey = session?.dayKey ?? toDayKey(new Date())

        const log = await repo.saveLog({
          sessionId: activeSessionId,
          dayKey,
          ...submission.globals,
        })
        await repo.saveSideMetrics(log.id, dayKey, submission.sideInputs)

        const completedAt = session?.completedAt ?? Date.now()
        await repo.updateSession(activeSessionId, {
          status: submission.status,
          completedAt,
        })

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId
              ? { ...s, status: submission.status, completedAt }
              : s,
          ),
          activeSessionId: null,
          saving: false,
          view: 'today',
        }))
      } catch {
        set({ saving: false, status: 'error', error: LOCAL_DATA_ERROR_MESSAGE })
      }
    },

    loadProgress: async () => {
      set({ progressLoading: true, progressError: null })
      try {
        const data = await repo.getProgressData()
        set({ progressData: data, progressLoading: false })
      } catch {
        set({
          progressLoading: false,
          progressError: LOCAL_DATA_ERROR_MESSAGE,
        })
      }
    },

    exportData: () => repo.exportData(),
  }))
}

/** Instância singleton ligada ao repositório real (Dexie). */
export const useAppStore = createAppStore(repository)
