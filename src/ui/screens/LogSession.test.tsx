import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

  it('renderiza o fluxo curto sem métricas complementares', () => {
    render(<LogSession />)
    expect(
      screen.getByRole('heading', { name: 'Registro do treino' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Dor lombar')).toBeInTheDocument()
    expect(screen.getByText('Dor de quadril/adutores')).toBeInTheDocument()
    expect(screen.getByText('Desconforto durante o treino')).toBeInTheDocument()
    expect(screen.queryByText('Métricas opcionais')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('spinbutton', { name: 'Prancha frontal' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Prancha lateral (tempo)')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('spinbutton', { name: 'Distância mão-chão' }),
    ).not.toBeInTheDocument()
  })

  it('salva status, dores, RPE, desconforto e observações', async () => {
    const save = vi.fn()
    useAppStore.setState({ saveSessionLog: save })
    const user = userEvent.setup()

    render(<LogSession />)
    await user.click(screen.getByRole('button', { name: 'Parcial' }))
    fireEvent.change(
      screen.getByRole('slider', { name: 'Esforço percebido (RPE)' }),
      { target: { value: '7' } },
    )
    fireEvent.change(screen.getAllByRole('slider', { name: 'Depois' })[0], {
      target: { value: '2' },
    })
    const exerciseSelect = screen.getByRole('combobox', {
      name: 'Algum exercício incomodou?',
    })
    await user.selectOptions(
      exerciseSelect,
      screen.getByRole('option', { name: 'Flexão inclinada' }),
    )
    const rightButtons = screen.getAllByRole('button', { name: 'Direito' })
    await user.click(rightButtons[rightButtons.length - 1])
    await user.type(
      screen.getByRole('textbox', { name: 'Observações' }),
      'Reduzir a amplitude no próximo treino.',
    )
    await user.click(screen.getByRole('button', { name: 'Salvar registro' }))

    expect(save).toHaveBeenCalledTimes(1)
    const submission = save.mock.calls[0][0]
    expect(submission.status).toBe('partial')
    expect(submission.globals).toMatchObject({
      lowBackPainBefore: 4,
      lowBackPainAfter: 2,
      rpe: 7,
      botheredSide: 'right',
      notes: 'Reduzir a amplitude no próximo treino.',
    })
    expect(submission.globals.botheredExerciseId).toBeTruthy()
    expect(submission.globals).not.toHaveProperty('frontPlankSec')
    expect(submission.globals).not.toHaveProperty('reachToFloorCm')
    expect(submission.sideInputs).toHaveLength(2)
    expect(
      submission.sideInputs.every(
        (row: { metric: string }) => row.metric === 'adductor_pain',
      ),
    ).toBe(true)
  })
})
