import type {
  Baseline,
  BaselineInput,
  MetricPhase,
  NumericSide,
  Side,
  SideMetricKind,
} from '../domain/types'
import type { SideMetricInput } from './repository'

/** Metadados carimbados na fronteira de persistência. */
export interface StampMeta {
  id: string
  createdAt: string
}

/** Converte o input normalizado do onboarding em um Baseline persistível. */
export function toBaseline(input: BaselineInput, meta: StampMeta): Baseline {
  return { id: meta.id, createdAt: meta.createdAt, ...input }
}

/**
 * Lados numéricos materializados a partir de um `side` de entrada:
 *  - 'both'            → ['left', 'right']
 *  - 'left' | 'right'  → [ele mesmo]
 *  - 'not_applicable'  → [] (não gera métrica)
 */
export function sidesForInput(side: Side): NumericSide[] {
  if (side === 'both') return ['left', 'right']
  if (side === 'left' || side === 'right') return [side]
  return []
}

/** Métrica por lado já materializada (sem id/logId/dayKey ainda). */
export interface ExpandedSideMetric {
  metric: SideMetricKind
  side: NumericSide
  phase: MetricPhase
  value: number
}

/** Expande inputs por lado em linhas somente left/right. */
export function expandSideMetricInputs(
  inputs: SideMetricInput[],
): ExpandedSideMetric[] {
  const out: ExpandedSideMetric[] = []
  for (const input of inputs) {
    for (const side of sidesForInput(input.side)) {
      out.push({
        metric: input.metric,
        side,
        phase: input.phase,
        value: input.value,
      })
    }
  }
  return out
}
