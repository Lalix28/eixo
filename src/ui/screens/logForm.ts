import type { Side, SideMetricKind } from '../../domain/types'
import type { SideMetricInput } from '../../persistence/repository'

/** Dor por lado com fases antes/depois (escopo de lado compartilhado). */
export interface SidePainValue {
  side: Side
  before: number
  after: number
}

/** Tempo por lado (valores independentes por lado quando 'both'). */
export interface SideTimeValue {
  side: Side
  left: string
  right: string
}

export function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim()
  if (t === '') return null
  const n = Number(t)
  if (Number.isNaN(n) || n < 0) return null
  return n
}

/**
 * Dor de quadril/adutores → SideMetric adductor_pain com phase before/after.
 * O lado pode ser 'both' — a expansão em left/right acontece na persistência.
 * 'not_applicable' não gera métrica.
 */
export function adductorPainInputs(v: SidePainValue): SideMetricInput[] {
  if (v.side === 'not_applicable') return []
  return [
    { metric: 'adductor_pain', side: v.side, phase: 'before', value: v.before },
    { metric: 'adductor_pain', side: v.side, phase: 'after', value: v.after },
  ]
}

/**
 * Tempo por lado (prancha lateral, controle de quadril/core) → SideMetric phase 'single'.
 * Produz linhas left/right independentes; 'not_applicable' não gera métrica.
 */
export function sideTimeInputs(
  metric: SideMetricKind,
  v: SideTimeValue,
): SideMetricInput[] {
  if (v.side === 'not_applicable') return []
  const rows: SideMetricInput[] = []
  const add = (side: 'left' | 'right', raw: string) => {
    const n = parseOptionalNumber(raw)
    if (n != null) rows.push({ metric, side, phase: 'single', value: n })
  }
  if (v.side === 'left') add('left', v.left)
  else if (v.side === 'right') add('right', v.right)
  else {
    add('left', v.left)
    add('right', v.right)
  }
  return rows
}
