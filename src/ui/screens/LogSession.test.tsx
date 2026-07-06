import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogSession } from './LogSession'
import { useAppStore } from '../../store/useAppStore'
import type { Baseline, Session } from '../../domain/types'

const baseline: Baseline = {
  id: 'b1',
  createdAt: '2026-01-01T00:00:00.000Z',
  level: 'beginner',
  lowBackPain: 4,
  adductorPain: 6,
  atrophySide: 'left',
  worstSide: 'left',
  canSprint: true,
  hasBike: false,
  dailyMinutes: 20,
  goal: 'all',
}

const session: Session = {
  id: 's-active',
  planDayId: 'day-01',
  dayIndex: 1,
  dayKey: '2026-07-06',
  startedAt: 0,
  completedAt: null,
  status: 'not_completed',
  createdAt: '2026-07-06T00:00:00.000Z',
}

beforeEach(() => {
  useAppStore.setState({
    initialized: true,
    status: 'ready',
    error: null,
    baseline,
    sessions: [session],
    activeSessionId: 's-active',
    suggestedStatus: 'completed',
    saving: false,
    view: 'log',
  })
})

describe('LogSession', () => {
  it('mostra estado honesto quando não há treino em registro', () => {
    useAppStore.setState({ activeSessionId: null, sessions: [] })
    render(<LogSession />)
    expect(screen.getByText('Nenhum treino para registrar')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Voltar ao início' }),
    ).toBeInTheDocument()
  })

  it('renderiza o formulário com status e campos por lado', () => {
    render(<LogSession />)
    expect(
      screen.getByRole('heading', { name: 'Registro do treino' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Dor lombar')).toBeInTheDocument()
    expect(screen.getByText('Dor de quadril/adutores')).toBeInTheDocument()
    expect(
      screen.getByText('Controle de quadril/core (tempo sustentado)'),
    ).toBeInTheDocument()
  })

  it('salvar chama saveSessionLog com status e métricas por lado', async () => {
    const save = vi.fn()
    useAppStore.setState({ saveSessionLog: save })
    const user = userEvent.setup()

    render(<LogSession />)
    await user.click(screen.getByRole('button', { name: 'Salvar registro' }))

    expect(save).toHaveBeenCalledTimes(1)
    const submission = save.mock.calls[0][0]
    expect(submission.status).toBe('completed')
    expect(submission.globals.lowBackPainBefore).toBe(4) // pré-preenchido do baseline
    // escopo de dor de adutores default = worstSide 'left' → gera métricas por lado
    expect(
      submission.sideInputs.some(
        (r: { metric: string }) => r.metric === 'adductor_pain',
      ),
    ).toBe(true)
  })
})
