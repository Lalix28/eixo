import { useEffect, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ScreenShell } from '../components/ScreenShell'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useAppStore } from '../../store/useAppStore'
import {
  bestHoldBySide,
  buildAdductorPainSeriesBySide,
  buildLowBackSeries,
  buildReachToFloorSeries,
  computeActiveStreak,
  computeDelta,
  toDayKey,
} from '../../domain/progress'
import type { Delta, SideSeries, TimePoint } from '../../domain/types'

const C_PRIMARY = '#059669' // brand-600
const C_LEFT = '#059669'
const C_RIGHT = '#64748b' // ink-500 (discreto)

function shortDate(dayKey: string): string {
  const [, m, d] = dayKey.split('-')
  return `${d}/${m}`
}

/** Une séries por lado em linhas para o Recharts, preservando nulos. */
function mergeSideSeries(
  s: SideSeries,
): { dayKey: string; left: number | null; right: number | null }[] {
  const keys = new Set<string>([
    ...s.left.map((p) => p.dayKey),
    ...s.right.map((p) => p.dayKey),
  ])
  const lmap = new Map(s.left.map((p) => [p.dayKey, p.value]))
  const rmap = new Map(s.right.map((p) => [p.dayKey, p.value]))
  return [...keys]
    .sort()
    .map((k) => ({ dayKey: k, left: lmap.get(k) ?? null, right: rmap.get(k) ?? null }))
}

function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 border-l-2 border-brand-100 pl-3 sm:pl-4">
      <p className="text-sm leading-tight text-ink-600">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-ink-900">
        {value}
      </p>
    </div>
  )
}

function DeltaBadge({ delta }: { delta: Delta }) {
  return (
    <span className="rounded-md bg-ink-100 px-2.5 py-1 text-[0.8125rem] font-medium text-ink-700">
      Primeiro → atual: {delta.first} → {delta.last}
    </span>
  )
}

function ChartSection({
  title,
  dataCount,
  emptyText,
  singleValue,
  delta,
  children,
}: {
  title: string
  dataCount: number
  emptyText: string
  singleValue?: ReactNode
  delta?: Delta | null
  children: ReactNode
}) {
  const hasTrend = dataCount > 1

  return (
    <Card className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        {hasTrend && delta && <DeltaBadge delta={delta} />}
        {dataCount === 1 && singleValue != null && singleValue !== '' && (
          <span className="rounded-md bg-brand-50 px-2.5 py-1 text-[0.8125rem] font-semibold text-brand-800">
            {singleValue}
          </span>
        )}
      </div>
      {dataCount > 0 ? (
        <>
          <div
            className="h-60 w-full sm:h-64"
            role="img"
            aria-label={`Gráfico de ${title.toLocaleLowerCase('pt-BR')}`}
          >
            {children}
          </div>
          {dataCount === 1 && (
            <p className="mt-2 text-center text-sm text-ink-600">
              Sem tendência por enquanto.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-[var(--radius-card)] bg-ink-50 px-4 py-8 text-center text-sm text-ink-600">
          {emptyText}
        </p>
      )}
    </Card>
  )
}

function seconds(v: number | null): ReactNode {
  return v != null ? `${v}s` : '—'
}

function sidePointLabel(
  row: { left: number | null; right: number | null } | undefined,
): ReactNode {
  if (!row) return null
  const values = [
    row.left != null ? `E ${row.left}/10` : null,
    row.right != null ? `D ${row.right}/10` : null,
  ].filter(Boolean)
  return values.join(' · ')
}

function ProgressError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card role="alert">
      <h2 className="font-semibold text-ink-900">
        Não foi possível atualizar o progresso
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-600">{message}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        Tentar novamente
      </Button>
    </Card>
  )
}

export function Progress() {
  const reduceMotion = useReducedMotion()
  const progressData = useAppStore((s) => s.progressData)
  const progressLoading = useAppStore((s) => s.progressLoading)
  const progressError = useAppStore((s) => s.progressError)
  const loadProgress = useAppStore((s) => s.loadProgress)
  const setView = useAppStore((s) => s.setView)

  useEffect(() => {
    void loadProgress()
  }, [loadProgress])

  const sessions = progressData?.sessions ?? []
  const logs = progressData?.logs ?? []
  const sideMetrics = progressData?.sideMetrics ?? []

  const todayKey = toDayKey(new Date())
  const streak = computeActiveStreak(sessions, todayKey)
  const totalLogged = logs.length
  const hipCore = bestHoldBySide(sideMetrics, 'hip_core_hold_sec')
  const sidePlank = bestHoldBySide(sideMetrics, 'side_plank_sec')
  const historicalHolds = [
    { label: 'Quadril/core E (melhor)', value: hipCore.left },
    { label: 'Quadril/core D (melhor)', value: hipCore.right },
    { label: 'Prancha lateral E (melhor)', value: sidePlank.left },
    { label: 'Prancha lateral D (melhor)', value: sidePlank.right },
  ].filter((item): item is { label: string; value: number } => item.value != null)

  const lowBack: TimePoint[] = buildLowBackSeries(logs)
  const adductor = buildAdductorPainSeriesBySide(sideMetrics)
  const reach: TimePoint[] = buildReachToFloorSeries(logs)
  const adductorRows = mergeSideSeries(adductor)

  const nothingYet = totalLogged === 0 && sideMetrics.length === 0

  if (progressLoading && !progressData) {
    return (
      <ScreenShell title="Progresso" subtitle="Sua evolução ao longo dos dias">
        <div
          className="space-y-4"
          role="status"
          aria-label="Carregando dados de progresso"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-ink-100"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-ink-100" />
          <p className="text-sm text-ink-500">Carregando seus registros…</p>
        </div>
      </ScreenShell>
    )
  }

  if (progressError && !progressData) {
    return (
      <ScreenShell title="Progresso" subtitle="Sua evolução ao longo dos dias">
        <ProgressError
          message={progressError}
          onRetry={() => void loadProgress()}
        />
      </ScreenShell>
    )
  }

  return (
    <ScreenShell title="Progresso" subtitle="Sua evolução ao longo dos dias">
      <div className="space-y-5">
        {progressError && (
          <ProgressError
            message={progressError}
            onRetry={() => void loadProgress()}
          />
        )}

        {/* Resumo único: dados reais; zeros e — são estados honestos. */}
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-ink-900">Resumo</h2>
            <p className="mt-1 text-sm text-ink-600">
              Acompanhe tendências, não perfeição.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <StatTile label="Dias ativos (sequência)" value={streak} />
            <StatTile label="Treinos registrados" value={totalLogged} />
          </div>
        </Card>

        {historicalHolds.length > 0 && (
          <Card>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-ink-900">
                Marcas históricas
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Melhores tempos já registrados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
              {historicalHolds.map((item) => (
                <StatTile
                  key={item.label}
                  label={item.label}
                  value={seconds(item.value)}
                />
              ))}
            </div>
          </Card>
        )}

        {nothingYet ? (
          <EmptyState
            icon={
              <span
                className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-700"
                aria-hidden="true"
              >
                ↗
              </span>
            }
            title="Seu progresso começa no primeiro registro"
            description="Conclua um treino e salve o registro para acompanhar dor, mobilidade e resistência ao longo dos dias."
            action={
              <Button variant="secondary" onClick={() => setView('today')}>
                Ver treino de hoje
              </Button>
            }
          />
        ) : (
          <>
            {totalLogged > 0 && totalLogged < 4 && (
              <p className="rounded-[var(--radius-card)] border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                Continue registrando para enxergar a tendência com mais clareza.
              </p>
            )}

            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
              <div className="min-w-0 lg:col-span-2">
                <ChartSection
                  title="Dor lombar"
                  dataCount={lowBack.length}
                  emptyText="Registre alguns treinos para ver sua evolução aqui."
                  singleValue={
                    lowBack[0] ? `${lowBack[0].value}/10` : undefined
                  }
                  delta={computeDelta(lowBack)}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lowBack} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dayKey" tickFormatter={shortDate} fontSize={12} tick={{ fill: '#475569' }} tickMargin={8} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} fontSize={12} tick={{ fill: '#475569' }} width={30} axisLine={false} tickLine={false} />
                      <Tooltip labelFormatter={(l) => shortDate(String(l))} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', color: '#334155', fontSize: 13 }} labelStyle={{ color: '#334155', fontWeight: 600 }} />
                      <Line type="monotone" dataKey="value" name="Dor lombar" stroke={C_PRIMARY} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={!reduceMotion} animationDuration={240} animationEasing="ease-out" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartSection>
              </div>

              <ChartSection
                title="Dor de quadril/adutores por lado"
                dataCount={adductorRows.length}
                emptyText="Ainda não há métricas por lado suficientes."
                singleValue={sidePointLabel(adductorRows[0])}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adductorRows} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="dayKey" tickFormatter={shortDate} fontSize={12} tick={{ fill: '#475569' }} tickMargin={8} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} fontSize={12} tick={{ fill: '#475569' }} width={30} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(l) => shortDate(String(l))} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', color: '#334155', fontSize: 13 }} labelStyle={{ color: '#334155', fontWeight: 600 }} />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: 13, color: '#475569' }} />
                    <Line type="monotone" dataKey="left" name="Esquerdo" stroke={C_LEFT} strokeWidth={2.5} dot={{ r: 4 }} connectNulls isAnimationActive={!reduceMotion} animationDuration={240} animationEasing="ease-out" />
                    <Line type="monotone" dataKey="right" name="Direito" stroke={C_RIGHT} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} connectNulls isAnimationActive={!reduceMotion} animationDuration={240} animationEasing="ease-out" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartSection>

              {reach.length > 0 && (
                <ChartSection
                  title="Distância mão-chão"
                  dataCount={reach.length}
                  emptyText=""
                  singleValue={reach[0] ? `${reach[0].value} cm` : undefined}
                  delta={computeDelta(reach)}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reach} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dayKey" tickFormatter={shortDate} fontSize={12} tick={{ fill: '#475569' }} tickMargin={8} axisLine={false} tickLine={false} />
                      <YAxis fontSize={12} tick={{ fill: '#475569' }} width={30} axisLine={false} tickLine={false} />
                      <Tooltip labelFormatter={(l) => shortDate(String(l))} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', color: '#334155', fontSize: 13 }} labelStyle={{ color: '#334155', fontWeight: 600 }} />
                      <Line type="monotone" dataKey="value" name="Mão-chão (cm)" stroke={C_PRIMARY} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={!reduceMotion} animationDuration={240} animationEasing="ease-out" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartSection>
              )}
            </div>
          </>
        )}
      </div>
    </ScreenShell>
  )
}
