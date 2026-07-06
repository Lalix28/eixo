import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Workout } from './Workout'
import { useAppStore } from '../../store/useAppStore'
import type { Baseline, Session, SessionStatus } from '../../domain/types'

const baseline: Baseline = {
  id: 'b1',
  createdAt: '2026-01-01T00:00:00.000Z',
  level: 'beginner',
  lowBackPain: 3,
  adductorPain: 5,
  atrophySide: 'left',
  worstSide: 'left',
  canSprint: true,
  hasBike: false,
  dailyMinutes: 20,
  goal: 'all',
}

function completed(dayIndex: number): Session {
  return {
    id: `s-${dayIndex}`,
    planDayId: `day-${dayIndex}`,
    dayIndex,
    dayKey: `2026-01-0${dayIndex}`,
    startedAt: 0,
    completedAt: 1,
    status: 'completed' as SessionStatus,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

beforeEach(() => {
  useAppStore.setState({
    initialized: true,
    status: 'ready',
    baseline,
    sessions: [],
    view: 'workout',
    activeSessionId: 's-active',
  })
})

describe('Workout (execução)', () => {
  it('mostra exercício manual (por reps) com botão Concluir no dia 1', () => {
    render(<Workout />)
    // dia 1 (segunda), primeiro exercício = Gato-camelo (reps → manual)
    expect(screen.getByText('Gato-camelo')).toBeInTheDocument()
    expect(screen.getByText('Exercício 1 de 6')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeInTheDocument()
  })

  it('mostra timer e controles em exercício por tempo', () => {
    // 3 sessões concluídas → dia atual = 4 (quinta), 1º exercício por tempo
    useAppStore.setState({
      sessions: [completed(1), completed(2), completed(3)],
    })
    render(<Workout />)
    expect(
      screen.getByText('Alongamento de flexor de quadril'),
    ).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Esforço')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument()
  })

  it('Iniciar revela Pausar e Pular fase', async () => {
    useAppStore.setState({
      sessions: [completed(1), completed(2), completed(3)],
    })
    const user = userEvent.setup()
    render(<Workout />)
    await user.click(screen.getByRole('button', { name: 'Iniciar' }))
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pular fase' })).toBeInTheDocument()
  })

  it('Concluir avança para o próximo exercício', async () => {
    const user = userEvent.setup()
    render(<Workout />)
    await user.click(screen.getByRole('button', { name: 'Concluir' }))
    // índice 2 do dia 1 = Rotação torácica (reps)
    expect(screen.getByText('Rotação torácica')).toBeInTheDocument()
    expect(screen.getByText('Exercício 2 de 6')).toBeInTheDocument()
  })

  it('Finalizar chama finishWorkout', async () => {
    const finish = vi.fn().mockResolvedValue(undefined)
    useAppStore.setState({ finishWorkout: finish })
    const user = userEvent.setup()
    render(<Workout />)
    await user.click(screen.getByRole('button', { name: 'Finalizar' }))
    expect(finish).toHaveBeenCalledWith('partial')
  })
})
