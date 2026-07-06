import {
  type DataBundle,
  type NewLog,
  type NewSession,
  type Repository,
  type SessionPatch,
  type SideMetricInput,
} from './repository'
import { expandSideMetricInputs, toBaseline } from './mappers'
import type {
  Baseline,
  BaselineInput,
  Session,
  SessionLog,
  SideMetric,
} from '../domain/types'

/**
 * Repositório em memória — SOMENTE para testes (store/UI) sem IndexedDB.
 * Não é usado como fonte de dados real da aplicação.
 * Compartilha os mesmos mappers da implementação Dexie para manter paridade
 * de comportamento (expansão de lado, carimbo de baseline).
 */
export class FakeRepository implements Repository {
  private baselines: Baseline[] = []
  private sessions: Session[] = []
  private logs: SessionLog[] = []
  private sideMetrics: SideMetric[] = []
  private seq = 0

  private uuid(): string {
    // IDs determinísticos e únicos para os testes (não são UUIDs reais).
    return `fake-${(++this.seq).toString().padStart(6, '0')}`
  }

  private nowIso(): string {
    // createdAt monotônico para ordenação estável nos testes.
    return new Date(1_700_000_000_000 + this.seq).toISOString()
  }

  async saveBaseline(input: BaselineInput): Promise<Baseline> {
    const baseline = toBaseline(input, {
      id: this.uuid(),
      createdAt: this.nowIso(),
    })
    this.baselines.push(baseline)
    return baseline
  }

  async getBaseline(): Promise<Baseline | undefined> {
    return [...this.baselines]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .at(0)
  }

  async createSession(input: NewSession): Promise<Session> {
    const session: Session = {
      id: this.uuid(),
      planDayId: input.planDayId,
      dayIndex: input.dayIndex,
      dayKey: input.dayKey,
      startedAt: input.startedAt,
      completedAt: input.completedAt ?? null,
      status: input.status,
      createdAt: this.nowIso(),
    }
    this.sessions.push(session)
    return session
  }

  async updateSession(id: string, patch: SessionPatch): Promise<void> {
    const s = this.sessions.find((x) => x.id === id)
    if (s) Object.assign(s, patch)
  }

  async listSessions(): Promise<Session[]> {
    return [...this.sessions]
  }

  async saveLog(input: NewLog): Promise<SessionLog> {
    const log: SessionLog = {
      id: this.uuid(),
      sessionId: input.sessionId,
      dayKey: input.dayKey,
      lowBackPainBefore: input.lowBackPainBefore ?? null,
      lowBackPainAfter: input.lowBackPainAfter ?? null,
      rpe: input.rpe ?? null,
      frontPlankSec: input.frontPlankSec ?? null,
      reachToFloorCm: input.reachToFloorCm ?? null,
      botheredExerciseId: input.botheredExerciseId ?? null,
      botheredSide: input.botheredSide ?? 'not_applicable',
      notes: input.notes ?? null,
      createdAt: this.nowIso(),
    }
    this.logs.push(log)
    return log
  }

  async getLogBySession(sessionId: string): Promise<SessionLog | undefined> {
    return this.logs.find((l) => l.sessionId === sessionId)
  }

  async listLogs(): Promise<SessionLog[]> {
    return [...this.logs]
  }

  async saveSideMetrics(
    logId: string,
    dayKey: string,
    inputs: SideMetricInput[],
  ): Promise<SideMetric[]> {
    const rows: SideMetric[] = expandSideMetricInputs(inputs).map((e) => ({
      id: this.uuid(),
      logId,
      dayKey,
      ...e,
    }))
    this.sideMetrics.push(...rows)
    return rows
  }

  async listSideMetrics(): Promise<SideMetric[]> {
    return [...this.sideMetrics]
  }

  async getDayData(dayKey: string): Promise<DataBundle> {
    return {
      sessions: this.sessions.filter((s) => s.dayKey === dayKey),
      logs: this.logs.filter((l) => l.dayKey === dayKey),
      sideMetrics: this.sideMetrics.filter((m) => m.dayKey === dayKey),
    }
  }

  async getProgressData(): Promise<DataBundle> {
    return {
      sessions: [...this.sessions],
      logs: [...this.logs],
      sideMetrics: [...this.sideMetrics],
    }
  }

  async resetAll(): Promise<void> {
    this.baselines = []
    this.sessions = []
    this.logs = []
    this.sideMetrics = []
  }
}
