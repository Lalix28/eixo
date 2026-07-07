import type {
  Baseline,
  Session,
  SessionLog,
  SideMetric,
} from '../domain/types'

export const EXPORT_WARNING =
  'Backup local de dados de treino e saúde. Não substitui acompanhamento profissional.'

export interface ExportData {
  baselines: Baseline[]
  sessions: Session[]
  logs: SessionLog[]
  sideMetrics: SideMetric[]
}

export interface ExportBundle {
  app: 'Eixo'
  exportVersion: 1
  exportedAt: string
  source: 'local-indexeddb'
  warning: string
  data: ExportData
}

/** Monta o envelope versionado sem alterar ou fabricar registros locais. */
export function buildExportBundle(
  data: ExportData,
  exportedAt = new Date().toISOString(),
): ExportBundle {
  return {
    app: 'Eixo',
    exportVersion: 1,
    exportedAt,
    source: 'local-indexeddb',
    warning: EXPORT_WARNING,
    data,
  }
}

