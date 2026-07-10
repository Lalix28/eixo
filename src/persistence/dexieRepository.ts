import { EixoDB, db } from './db'
import {
  PersistenceError,
  type DataBundle,
  type NewLog,
  type NewSession,
  type Repository,
  type SessionPatch,
  type SideMetricInput,
} from './repository'
import { expandSideMetricInputs, toBaseline } from './mappers'
import { buildExportBundle, type ExportBundle } from './exportBundle'
import { createId } from '../lib/createId'
import type {
  Baseline,
  BaselineInput,
  Session,
  SessionLog,
  SideMetric,
} from '../domain/types'

function nowIso(): string {
  return new Date().toISOString()
}

/** Implementação real da persistência sobre Dexie/IndexedDB. */
export class DexieRepository implements Repository {
  private db: EixoDB

  constructor(database: EixoDB) {
    this.db = database
  }

  /** Preserva a causa técnica e expõe um erro único de dados locais à aplicação. */
  private async run<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op()
    } catch (err) {
      throw new PersistenceError(
        'Não foi possível concluir a operação com os dados locais.',
        err,
      )
    }
  }

  // --- Baseline ---

  saveBaseline(input: BaselineInput): Promise<Baseline> {
    return this.run(async () => {
      const baseline = toBaseline(input, {
        id: createId(),
        createdAt: nowIso(),
      })
      await this.db.baselines.add(baseline)
      return baseline
    })
  }

  getBaseline(): Promise<Baseline | undefined> {
    return this.run(async () => {
      const all = await this.db.baselines.orderBy('createdAt').reverse().toArray()
      return all[0]
    })
  }

  // --- Sessions ---

  createSession(input: NewSession): Promise<Session> {
    return this.run(async () => {
      const session: Session = {
        id: createId(),
        planDayId: input.planDayId,
        dayIndex: input.dayIndex,
        dayKey: input.dayKey,
        startedAt: input.startedAt,
        completedAt: input.completedAt ?? null,
        status: input.status,
        createdAt: nowIso(),
      }
      await this.db.sessions.add(session)
      return session
    })
  }

  updateSession(id: string, patch: SessionPatch): Promise<void> {
    return this.run(async () => {
      await this.db.sessions.update(id, patch)
    })
  }

  listSessions(): Promise<Session[]> {
    return this.run(() => this.db.sessions.toArray())
  }

  // --- Logs ---

  saveLog(input: NewLog): Promise<SessionLog> {
    return this.run(async () => {
      const log: SessionLog = {
        id: createId(),
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
        createdAt: nowIso(),
      }
      await this.db.logs.add(log)
      return log
    })
  }

  getLogBySession(sessionId: string): Promise<SessionLog | undefined> {
    return this.run(() =>
      this.db.logs.where('sessionId').equals(sessionId).first(),
    )
  }

  listLogs(): Promise<SessionLog[]> {
    return this.run(() => this.db.logs.toArray())
  }

  // --- Métricas por lado ---

  saveSideMetrics(
    logId: string,
    dayKey: string,
    inputs: SideMetricInput[],
  ): Promise<SideMetric[]> {
    return this.run(async () => {
      const rows: SideMetric[] = expandSideMetricInputs(inputs).map((e) => ({
        id: createId(),
        logId,
        dayKey,
        ...e,
      }))
      if (rows.length > 0) await this.db.sideMetrics.bulkAdd(rows)
      return rows
    })
  }

  listSideMetrics(): Promise<SideMetric[]> {
    return this.run(() => this.db.sideMetrics.toArray())
  }

  // --- Consultas ---

  getDayData(dayKey: string): Promise<DataBundle> {
    return this.run(async () => {
      const [sessions, logs, sideMetrics] = await Promise.all([
        this.db.sessions.where('dayKey').equals(dayKey).toArray(),
        this.db.logs.where('dayKey').equals(dayKey).toArray(),
        this.db.sideMetrics.where('dayKey').equals(dayKey).toArray(),
      ])
      return { sessions, logs, sideMetrics }
    })
  }

  getProgressData(): Promise<DataBundle> {
    return this.run(async () => {
      const [sessions, logs, sideMetrics] = await Promise.all([
        this.db.sessions.toArray(),
        this.db.logs.toArray(),
        this.db.sideMetrics.toArray(),
      ])
      return { sessions, logs, sideMetrics }
    })
  }

  exportData(): Promise<ExportBundle> {
    return this.run(async () => {
      const [baselines, sessions, logs, sideMetrics] = await Promise.all([
        this.db.baselines.toArray(),
        this.db.sessions.toArray(),
        this.db.logs.toArray(),
        this.db.sideMetrics.toArray(),
      ])
      return buildExportBundle({ baselines, sessions, logs, sideMetrics })
    })
  }

  // --- Manutenção ---

  resetAll(): Promise<void> {
    return this.run(async () => {
      await Promise.all([
        this.db.baselines.clear(),
        this.db.sessions.clear(),
        this.db.logs.clear(),
        this.db.sideMetrics.clear(),
      ])
    })
  }
}

/** Instância padrão da aplicação, ligada ao banco singleton. */
export const repository: Repository = new DexieRepository(db)
