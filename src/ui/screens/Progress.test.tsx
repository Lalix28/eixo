import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Progress } from './Progress'
import { useAppStore } from '../../store/useAppStore'
import type {
  Session,
  SessionLog,
  SideMetric,
  SideMetricKind,
  NumericSide,
} from '../../domain/types'
import type { DataBundle } from '../../persistence/repository'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function session(dayKey: string): Session {
  return {
    id: `s-${dayKey}`,
    planDayId: 'day-01',
    dayIndex: 1,
    dayKey,
    startedAt: 0,
    completedAt: 1,
    status: 'completed',
    createdAt: `${dayKey}T00:00:00.000Z`,
  }
}

function log(dayKey: string, over: Partial<SessionLog> = {}): SessionLog {
  return {
    id: `l-${dayKey}`,
    sessionId: `s-${dayKey}`,
    dayKey,
    lowBackPainBefore: null,
    lowBackPainAfter: null,
    rpe: null,
    frontPlankSec: null,
    reachToFloorCm: null,
    botheredExerciseId: null,
    botheredSide: 'not_applicable',
    notes: null,
    createdAt: `${dayKey}T00:00:00.000Z`,
    ...over,
  }
}

function metric(
  dayKey: string,
  kind: SideMetricKind,
  side: NumericSide,
  value: number,
): SideMetric {
  return {
    id: `${dayKey}-${kind}-${side}`,
    logId: `l-${dayKey}`,
    dayKey,
    metric: kind,
    side,
    phase: kind === 'adductor_pain' ? 'after' : 'single',
    value,
  }
}

function setProgress(data: Partial<DataBundle>) {
  useAppStore.setState({
    loadProgress: vi.fn(),
    progressLoading: false,
    progressError: null,
    progressData: {
      sessions: data.sessions ?? [],
      logs: data.logs ?? [],
      sideMetrics: data.sideMetrics ?? [],
    },
  })
}

beforeEach(() => {
  useAppStore.setState({ initialized: true, status: 'ready' })
})

describe('Progress', () => {
  it('mostra erro amigável e permite tentar novamente', () => {
    const loadProgress = vi.fn()
    useAppStore.setState({
      loadProgress,
      progressLoading: false,
      progressError: 'Falha no armazenamento local.',
      progressData: null,
    })

    render(<Progress />)

    expect(
      screen.getByText('Não foi possível atualizar o progresso'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(loadProgress).toHaveBeenCalled()
  })

  it('estado vazio honesto sem dados', () => {
    setProgress({})
    render(<Progress />)
    expect(
      screen.getByText('Seu progresso começa no primeiro registro'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Ainda não há métricas por lado suficientes.'),
    ).not.toBeInTheDocument()
    // melhores tempos por lado mostram — quando não há dados
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4)
  })

  it('mostra streak e total com sessões/logs reais', () => {
    const key = todayKey()
    setProgress({ sessions: [session(key)], logs: [log(key), log(key)] })
    render(<Progress />)
    expect(screen.getByText('Treinos registrados')).toBeInTheDocument()
    // total = 2, streak = 1 (valores reais)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('mostra melhores tempos por lado a partir de sideMetrics', () => {
    setProgress({
      sideMetrics: [
        metric('2026-01-01', 'hip_core_hold_sec', 'left', 40),
        metric('2026-01-02', 'hip_core_hold_sec', 'right', 35),
        metric('2026-01-01', 'side_plank_sec', 'left', 22),
      ],
    })
    render(<Progress />)
    expect(screen.getByText('40s')).toBeInTheDocument()
    expect(screen.getByText('35s')).toBeInTheDocument()
    expect(screen.getByText('22s')).toBeInTheDocument()
  })

  it('renderiza dor lombar quando há logs (sem estado vazio)', () => {
    setProgress({
      logs: [
        log('2026-01-01', { lowBackPainAfter: 5 }),
        log('2026-01-05', { lowBackPainAfter: 3 }),
      ],
    })
    render(<Progress />)
    expect(screen.getByText('Dor lombar')).toBeInTheDocument()
    // com dados, o texto vazio da seção não aparece
    expect(
      screen.queryByText('Registre alguns treinos para ver sua evolução aqui.'),
    ).not.toBeInTheDocument()
  })

  it('delta entre primeiro e atual só aparece com ≥2 pontos', () => {
    setProgress({ logs: [log('2026-01-01', { lowBackPainAfter: 5 })] })
    const { rerender } = render(<Progress />)
    expect(screen.queryByText(/Primeiro → atual/)).not.toBeInTheDocument()

    act(() => {
      setProgress({
        logs: [
          log('2026-01-01', { lowBackPainAfter: 5 }),
          log('2026-01-05', { lowBackPainAfter: 3 }),
        ],
      })
    })
    rerender(<Progress />)
    expect(screen.getByText(/Primeiro → atual/)).toBeInTheDocument()
  })
})
