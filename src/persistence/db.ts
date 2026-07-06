import Dexie, { type Table } from 'dexie'
import type { Baseline, Session, SessionLog, SideMetric } from '../domain/types'

/**
 * Banco local (IndexedDB via Dexie).
 * Camada isolada — nunca acessa UI. Schema versionado desde a v1.
 *
 * Índices (Fase 0 §2):
 *  - baselines:  id (PK), createdAt
 *  - sessions:   id (PK), dayKey, dayIndex, startedAt
 *  - logs:       id (PK), sessionId, dayKey
 *  - sideMetrics:id (PK), logId, dayKey, [metric+side] (composto)
 *
 * PKs são UUID (string) gerados na aplicação — sem auto-incremento.
 */
export class EixoDB extends Dexie {
  baselines!: Table<Baseline, string>
  sessions!: Table<Session, string>
  logs!: Table<SessionLog, string>
  sideMetrics!: Table<SideMetric, string>

  constructor(name = 'eixo') {
    super(name)
    this.version(1).stores({
      baselines: 'id, createdAt',
      sessions: 'id, dayKey, dayIndex, startedAt',
      logs: 'id, sessionId, dayKey',
      sideMetrics: 'id, logId, dayKey, [metric+side]',
    })
  }
}

/** Instância singleton usada pela aplicação. */
export const db = new EixoDB()
