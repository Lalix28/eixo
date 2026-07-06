import type {
  Delta,
  NumericSide,
  SessionLog,
  SideMetric,
  SideMetricKind,
  SideSeries,
  Session,
  TimePoint,
} from './types'

// ---------------------------------------------------------------------------
// Helpers de data (puros; chave = calendário 'YYYY-MM-DD')
// ---------------------------------------------------------------------------

/** Chave de dia local para uma data. */
export function toDayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Soma `delta` dias a uma chave, sem drift de fuso (aritmética em UTC). */
export function addDaysToKey(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + delta)
  return dt.toISOString().slice(0, 10)
}

function sortByDayKey(points: TimePoint[]): TimePoint[] {
  return [...points].sort((a, b) =>
    a.dayKey < b.dayKey ? -1 : a.dayKey > b.dayKey ? 1 : 0,
  )
}

// ---------------------------------------------------------------------------
// Séries a partir de dados REAIS do usuário (nunca fabricados)
// ---------------------------------------------------------------------------

/** Dor lombar ao longo dos dias (usa o valor pós-treino; cai para o pré). */
export function buildLowBackSeries(logs: SessionLog[]): TimePoint[] {
  const points: TimePoint[] = []
  for (const log of logs) {
    const value = log.lowBackPainAfter ?? log.lowBackPainBefore
    if (value == null) continue
    points.push({ dayKey: log.dayKey, value })
  }
  return sortByDayKey(points)
}

/** Evolução da distância mão-chão (cm) ao longo dos dias. */
export function buildReachToFloorSeries(logs: SessionLog[]): TimePoint[] {
  const points: TimePoint[] = []
  for (const log of logs) {
    if (log.reachToFloorCm == null) continue
    points.push({ dayKey: log.dayKey, value: log.reachToFloorCm })
  }
  return sortByDayKey(points)
}

function adductorSeriesForSide(
  metrics: SideMetric[],
  side: NumericSide,
): TimePoint[] {
  // Por dia: prefere a dor pós-treino; cai para pré; depois para 'single'.
  const byDay = new Map<
    string,
    { before?: number; after?: number; single?: number }
  >()

  for (const m of metrics) {
    if (m.metric !== 'adductor_pain' || m.side !== side) continue
    const slot = byDay.get(m.dayKey) ?? {}
    slot[m.phase] = m.value
    byDay.set(m.dayKey, slot)
  }

  const points: TimePoint[] = []
  for (const [dayKey, slot] of byDay) {
    const value = slot.after ?? slot.before ?? slot.single
    if (value == null) continue
    points.push({ dayKey, value })
  }
  return sortByDayKey(points)
}

/** Dor de quadril/adutores por lado ao longo dos dias. */
export function buildAdductorPainSeriesBySide(
  metrics: SideMetric[],
): SideSeries {
  return {
    left: adductorSeriesForSide(metrics, 'left'),
    right: adductorSeriesForSide(metrics, 'right'),
  }
}

function maxForSide(
  metrics: SideMetric[],
  kind: SideMetricKind,
  side: NumericSide,
): number | null {
  let best: number | null = null
  for (const m of metrics) {
    if (m.metric !== kind || m.side !== side) continue
    if (best === null || m.value > best) best = m.value
  }
  return best
}

/** Melhor tempo sustentado por lado para a métrica dada (prancha lateral, hold). */
export function bestHoldBySide(
  metrics: SideMetric[],
  kind: SideMetricKind,
): { left: number | null; right: number | null } {
  return {
    left: maxForSide(metrics, kind, 'left'),
    right: maxForSide(metrics, kind, 'right'),
  }
}

// ---------------------------------------------------------------------------
// Streak, deltas e suficiência de dados
// ---------------------------------------------------------------------------

/** Sequência de dias ativos terminando em `today` (ou ontem, se hoje vazio). */
export function computeActiveStreak(
  sessions: Session[],
  today: string,
): number {
  const active = new Set(
    sessions
      .filter((s) => s.status === 'completed' || s.status === 'partial')
      .map((s) => s.dayKey),
  )
  if (active.size === 0) return 0

  let cursor = today
  if (!active.has(cursor)) {
    cursor = addDaysToKey(today, -1)
    if (!active.has(cursor)) return 0
  }

  let streak = 0
  while (active.has(cursor)) {
    streak++
    cursor = addDaysToKey(cursor, -1)
  }
  return streak
}

/** Delta Dia 1 → hoje de uma série; null quando não há pontos suficientes. */
export function computeDelta(series: TimePoint[]): Delta | null {
  if (series.length < 2) return null
  const first = series[0].value
  const last = series[series.length - 1].value
  return { first, last, delta: last - first }
}

/** Há pontos suficientes para mostrar um gráfico honesto. */
export function hasEnoughData(series: TimePoint[], min: number): boolean {
  return series.length >= min
}
