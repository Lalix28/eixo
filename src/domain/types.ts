/**
 * Modelo de dados canônico do Eixo.
 * Tipos puros, sem dependência de React, Dexie ou qualquer IO.
 * Esta é a fonte de verdade compartilhada entre data, domain, store e persistence.
 */

// ---------------------------------------------------------------------------
// Enums / uniões básicas
// ---------------------------------------------------------------------------

/** Lado como cidadão de primeira classe (perfil com atrofia em uma perna). */
export type Side = 'left' | 'right' | 'both' | 'not_applicable'

/** Lados válidos para uma métrica numérica materializada (nunca `both`/N.A.). */
export type NumericSide = 'left' | 'right'

export type WorstSide = 'left' | 'right' | 'both' | 'varies'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type Goal = 'mobility' | 'hip_core' | 'calisthenics' | 'low_back' | 'all'

export type SessionStatus = 'completed' | 'partial' | 'not_completed'

/** Métricas numéricas registradas por lado. */
export type SideMetricKind =
  | 'adductor_pain'
  | 'side_plank_sec'
  | 'hip_core_hold_sec'

/** Fase de uma métrica por lado: dor tem antes/depois; tempos são únicos. */
export type MetricPhase = 'before' | 'after' | 'single'

export type ExerciseKind = 'time' | 'reps' | 'distance' | 'interval'

export type ExerciseCategory =
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'hip'
  | 'mobility'
  | 'conditioning'
  | 'recovery'

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type WeekNumber = 1 | 2 | 3 | 4

export type DailyMinutes = 10 | 20 | 30 | 45

// ---------------------------------------------------------------------------
// Conteúdo estático (dado versionado em src/data) — NÃO vai ao Dexie
// ---------------------------------------------------------------------------

export interface Exercise {
  /** Slug estável (ex.: 'side-plank'); serve de identificador lógico. */
  id: string
  name: string
  category: ExerciseCategory
  /** Uma dica curta de execução. */
  cue: string
  kind: ExerciseKind
  /** Exige registro/execução por lado (esquerdo/direito). */
  requiresSide: boolean
  /** Substituição simples quando aplicável (id de outro exercício). */
  substitutionId?: string
}

export type PlanBlockKind =
  | 'mobility'
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'hip_core'
  | 'conditioning'
  | 'posture'
  | 'recovery'

/** Referência a qual progressão semanal um bloco de intervalo consome. */
export type ProgressionRef = 'sprints' | 'hip_core'

export interface PlanItem {
  exerciseId: string
  sets?: number
  reps?: number
  timeSec?: number
  /** Blocos de intervalo puxam a dose da progressão da semana. */
  useProgression?: ProgressionRef
  note?: string
}

export interface PlanBlock {
  title: string
  kind: PlanBlockKind
  items: PlanItem[]
}

export interface PlanDay {
  /** Slug estável, ex.: 'day-01'. */
  id: string
  dayIndex: number // 1..30
  week: WeekNumber
  weekday: Weekday
  focus: string
  blocks: PlanBlock[]
}

/** Progressão de tiros por semana. */
export interface SprintSpec {
  reps: number
  workSec: number
  /** Presente quando a duração é uma faixa (ex.: 10–12s). */
  workSecMax?: number
  restSecMin: number
  restSecMax: number
  /** Intensidade alvo 0..10, quando especificada. */
  intensity?: number
  /** Alternativa equivalente (ex.: 6 tiros de 20s na semana 4). */
  alt?: { reps: number; workSec: number }
}

/** Progressão de resistência de quadril/core por semana. */
export interface HoldSpec {
  workSec: number
  restSecMin: number
  restSecMax: number
}

export interface WeekProgression {
  sprints: SprintSpec
  hipCore: HoldSpec
}

// ---------------------------------------------------------------------------
// Entidades persistidas (modelo do usuário) — tipos puros, sem Dexie
// UUIDs e timestamps são carimbados na fronteira de persistência (Fase 3+).
// ---------------------------------------------------------------------------

export interface Baseline {
  id: string
  createdAt: string // ISO
  level: Level
  lowBackPain: number // 0–10
  adductorPain: number // 0–10
  atrophySide: Side
  worstSide: WorstSide
  canSprint: boolean
  hasBike: boolean
  dailyMinutes: DailyMinutes
  goal: Goal
}

export interface Session {
  id: string
  planDayId: string
  dayIndex: number // 1..30
  dayKey: string // 'YYYY-MM-DD'
  startedAt: number // ms epoch
  completedAt: number | null // ms epoch
  status: SessionStatus
  createdAt: string // ISO
}

export interface SessionLog {
  id: string
  sessionId: string
  dayKey: string

  lowBackPainBefore: number | null
  lowBackPainAfter: number | null
  rpe: number | null // 1–10
  frontPlankSec: number | null
  reachToFloorCm: number | null
  botheredExerciseId: string | null
  botheredSide: Side
  notes: string | null

  createdAt: string // ISO
}

export interface SideMetric {
  id: string
  logId: string
  dayKey: string
  metric: SideMetricKind
  side: NumericSide
  phase: MetricPhase
  value: number
}

// ---------------------------------------------------------------------------
// Tipos auxiliares de domínio (entradas/saídas de funções puras)
// ---------------------------------------------------------------------------

/** Resposta 'não sei' do onboarding para o lado atrofiado. */
export type OnboardingAtrophySide = 'left' | 'right' | 'both' | 'unknown'

export interface OnboardingAnswers {
  level: Level
  lowBackPain: number
  adductorPain: number
  atrophySide: OnboardingAtrophySide
  worstSide: WorstSide
  canSprint: boolean
  hasBike: boolean
  dailyMinutes: DailyMinutes
  goal: Goal
}

/** Campos normalizados do baseline; id/createdAt são carimbados na persistência. */
export type BaselineInput = Omit<Baseline, 'id' | 'createdAt'>

/** Exercício do plano já resolvido contra a biblioteca. */
export interface ResolvedExercise {
  exercise: Exercise
  block: string
  blockKind: PlanBlockKind
  sets?: number
  reps?: number
  timeSec?: number
  useProgression?: ProgressionRef
  note?: string
}

/** Resolução do dia atual do programa. */
export interface TodayResolution {
  day: PlanDay
  dayIndex: number
  /** Já houve algum registro de sessão hoje. */
  loggedToday: boolean
  /** Todos os 30 dias já têm sessão ativa. */
  programComplete: boolean
}

/** Ponto de uma série temporal (ordenada por dayKey ascendente). */
export interface TimePoint {
  dayKey: string // 'YYYY-MM-DD'
  value: number
}

/** Séries paralelas por lado. */
export interface SideSeries {
  left: TimePoint[]
  right: TimePoint[]
}

export interface Delta {
  first: number
  last: number
  delta: number
}

// ---------------------------------------------------------------------------
// Timer (execução de treino)
// ---------------------------------------------------------------------------

export type TimerPhaseKind = 'work' | 'rest'

/** Uma fase do timer: esforço ou descanso, com duração fixa. */
export interface TimerPhase {
  kind: TimerPhaseKind
  durationMs: number
  label: string
  exerciseId?: string
}

/** Especificação de um bloco intervalado (tiros, quadril/core). */
export interface IntervalSpec {
  rounds: number
  workMs: number
  restMs: number
  label: string
  exerciseId?: string
}

/** Estado derivado do timer a partir de timestamps (nunca acumulado). */
export interface TimerSnapshot {
  phaseIndex: number
  phaseKind: TimerPhaseKind | 'done'
  remainingMs: number
  phaseDurationMs: number
  /** Progresso 0..1 dentro da fase atual. */
  progress: number
  totalRemainingMs: number
  done: boolean
}
