import type {
  Baseline,
  BaselineInput,
  MetricPhase,
  Session,
  SessionLog,
  SessionStatus,
  Side,
  SideMetric,
  SideMetricKind,
} from '../domain/types'
import type { ExportBundle } from './exportBundle'

/**
 * Contrato de persistência. A UI e o store dependem desta interface,
 * nunca do Dexie diretamente. Isso mantém a arquitetura desacoplada e
 * deixa a porta aberta para uma futura implementação com sync (Supabase)
 * sem reescrever o app.
 */

// --- DTOs de entrada (o que a aplicação entrega ao repositório) ---

export interface NewSession {
  planDayId: string
  dayIndex: number
  dayKey: string
  startedAt: number
  status: SessionStatus
  completedAt?: number | null
}

export type SessionPatch = Partial<Pick<Session, 'status' | 'completedAt'>>

export interface NewLog {
  sessionId: string
  dayKey: string
  lowBackPainBefore?: number | null
  lowBackPainAfter?: number | null
  rpe?: number | null
  frontPlankSec?: number | null
  reachToFloorCm?: number | null
  botheredExerciseId?: string | null
  botheredSide?: Side
  notes?: string | null
}

/**
 * Entrada de métrica por lado antes da materialização.
 * `both` expande em duas linhas (left+right); `not_applicable` não gera linha.
 */
export interface SideMetricInput {
  metric: SideMetricKind
  side: Side
  phase: MetricPhase
  value: number
}

/** Conjunto de registros para uma consulta (por dia ou para o progresso). */
export interface DataBundle {
  sessions: Session[]
  logs: SessionLog[]
  sideMetrics: SideMetric[]
}

// --- Contrato ---

export interface Repository {
  // Baseline
  saveBaseline(input: BaselineInput): Promise<Baseline>
  getBaseline(): Promise<Baseline | undefined>

  // Sessions
  createSession(input: NewSession): Promise<Session>
  updateSession(id: string, patch: SessionPatch): Promise<void>
  listSessions(): Promise<Session[]>

  // Logs
  saveLog(input: NewLog): Promise<SessionLog>
  getLogBySession(sessionId: string): Promise<SessionLog | undefined>
  listLogs(): Promise<SessionLog[]>

  // Métricas por lado (materializa left/right; nunca both/not_applicable)
  saveSideMetrics(
    logId: string,
    dayKey: string,
    inputs: SideMetricInput[],
  ): Promise<SideMetric[]>
  listSideMetrics(): Promise<SideMetric[]>

  // Consultas
  getDayData(dayKey: string): Promise<DataBundle>
  getProgressData(): Promise<DataBundle>
  /** Snapshot completo e versionado para backup manual local. */
  exportData(): Promise<ExportBundle>

  // Manutenção
  resetAll(): Promise<void>
}

/** Erro de persistência (ex.: IndexedDB indisponível ou bloqueado). */
export class PersistenceError extends Error {
  cause?: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'PersistenceError'
    this.cause = cause
  }
}
