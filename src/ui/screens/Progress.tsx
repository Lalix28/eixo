import { useEffect, type ReactNode } from 'react'
import {
  CartesianGrid,
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
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">{value}</p>
    </div>
  )
}

function DeltaBadge({ delta }: { delta: Delta }) {
  return (
    <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600">
      Primeiro → atual: {delta.first} → {delta.last}
    </span>
  )
}

function ChartSection({
  title,
  hasData,
  emptyText,
  delta,
  children,
}: {
  title: string
  hasData: boolean
  emptyText: string
  delta?: Delta | null
  children: ReactNode
}) {
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink-900">{title}</h3>
        {hasData && delta && <DeltaBadge delta={delta} />}
      </div>
      {hasData ? (
        <div className="h-52 w-full">{children}</div>
      ) : (
        <p className="py-6 text-center text-sm text-ink-400">{emptyText}</p>
      )}
    </Card>
  )
}

function seconds(v: number | null): ReactNode {
  return v != null ? `${v}s` : '—'
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
  const progressData = useAppStore((s) => s.progressData)
  const progressLoading = useAppStore((s) => s.progressLoading)
  const progressError = useAppStore((s) => s.progressError)
  const loadProgress = useAppStore((s) => s.loadProgress)

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
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
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

        {/* Cards de resumo (dados reais; zeros e — são honestos) */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Dias ativos (sequência)" value={streak} />
          <StatTile label="Treinos registrados" value={totalLogged} />
          <StatTile label="Quadril/core E (melhor)" value={seconds(hipCore.left)} />
          <StatTile label="Quadril/core D (melhor)" value={seconds(hipCore.right)} />
          <StatTile label="Prancha lateral E (melhor)" value={seconds(sidePlank.left)} />
          <StatTile label="Prancha lateral D (melhor)" value={seconds(sidePlank.right)} />
        </div>

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
          />
        ) : (
          <>
            <ChartSection
              title="Dor lombar"
              hasData={lowBack.length > 0}
              emptyText="Registre alguns treinos para ver sua evolução aqui."
              delta={computeDelta(lowBack)}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lowBack} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dayKey" tickFormatter={shortDate} fontSize={11} tickMargin={6} />
                  <YAxis domain={[0, 10]} fontSize={11} width={28} />
                  <Tooltip labelFormatter={(l) => shortDate(String(l))} />
                  <Line type="monotone" dataKey="value" name="Dor lombar" stroke={C_PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection
              title="Dor de quadril/adutores por lado"
              hasData={adductorRows.length > 0}
              emptyText="Ainda não há métricas por lado suficientes."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adductorRows} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dayKey" tickFormatter={shortDate} fontSize={11} tickMargin={6} />
                  <YAxis domain={[0, 10]} fontSize={11} width={28} />
                  <Tooltip labelFormatter={(l) => shortDate(String(l))} />
                  <Line type="monotone" dataKey="left" name="Esquerdo" stroke={C_LEFT} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="right" name="Direito" stroke={C_RIGHT} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection
              title="Distância mão-chão"
              hasData={reach.length > 0}
              emptyText="Registre a distância mão-chão para acompanhar aqui."
              delta={computeDelta(reach)}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reach} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dayKey" tickFormatter={shortDate} fontSize={11} tickMargin={6} />
                  <YAxis fontSize={11} width={28} />
                  <Tooltip labelFormatter={(l) => shortDate(String(l))} />
                  <Line type="monotone" dataKey="value" name="Mão-chão (cm)" stroke={C_PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>
          </>
        )}
      </div>
    </ScreenShell>
  )
}
