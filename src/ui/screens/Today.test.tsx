import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Today } from './Today'
import { useAppStore } from '../../store/useAppStore'
import type { Baseline } from '../../domain/types'

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

describe('Today (dashboard)', () => {
  beforeEach(() => {
    useAppStore.setState({
      initialized: true,
      status: 'ready',
      baseline,
      sessions: [],
      activeSessionId: null,
      view: 'today',
    })
  })

  it('mostra o dia atual e o foco do plano (dia 1 = segunda)', () => {
    render(<Today />)
    expect(screen.getByText(/Dia 1 de 30/)).toBeInTheDocument()
    expect(
      screen.getByText('Empurrar + core + mobilidade curta'),
    ).toBeInTheDocument()
  })

  it('lista exercícios reais do plano', () => {
    render(<Today />)
    expect(screen.getByText('Flexão inclinada')).toBeInTheDocument()
    expect(screen.getByText('Prancha frontal')).toBeInTheDocument()
  })

  it('mostra status honesto quando não há sessão registrada', () => {
    render(<Today />)
    expect(screen.getByText('Treino ainda não iniciado')).toBeInTheDocument()
  })

  it('reconhece o treino registrado do dia', () => {
    const todayKey = new Date()
    const key = `${todayKey.getFullYear()}-${String(todayKey.getMonth() + 1).padStart(2, '0')}-${String(todayKey.getDate()).padStart(2, '0')}`
    useAppStore.setState({
      sessions: [
        {
          id: 's1',
          planDayId: 'day-01',
          dayIndex: 1,
          dayKey: key,
          startedAt: 0,
          completedAt: 1,
          status: 'completed',
          createdAt: '2026-07-06T00:00:00.000Z',
        },
      ],
    })
    render(<Today />)
    expect(screen.getByText('Treino registrado')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Começar treino' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Treino de hoje concluído.')).toBeInTheDocument()
  })

  it('não oferece novo treino quando o registro foi parcial', () => {
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    useAppStore.setState({
      sessions: [
        {
          id: 's-partial',
          planDayId: 'day-01',
          dayIndex: 1,
          dayKey: key,
          startedAt: 0,
          completedAt: 1,
          status: 'partial',
          createdAt: '2026-07-06T00:00:00.000Z',
        },
      ],
    })
    render(<Today />)
    expect(screen.getByText('Treino parcial')).toBeInTheDocument()
    expect(screen.getByText('Registro parcial salvo.')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Começar treino' }),
    ).not.toBeInTheDocument()
  })

  it('nomeia corretamente uma sessão não concluída', () => {
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    useAppStore.setState({
      activeSessionId: 's-open',
      sessions: [
        {
          id: 's-open',
          planDayId: 'day-01',
          dayIndex: 1,
          dayKey: key,
          startedAt: 0,
          completedAt: null,
          status: 'not_completed',
          createdAt: '2026-07-06T00:00:00.000Z',
        },
      ],
    })
    const { rerender } = render(<Today />)
    expect(screen.getByRole('button', { name: 'Retomar treino' })).toBeInTheDocument()

    useAppStore.setState({ activeSessionId: null })
    rerender(<Today />)
    expect(
      screen.getByRole('button', { name: 'Recomeçar treino' }),
    ).toBeInTheDocument()
  })

  it('resume o baseline real', () => {
    render(<Today />)
    expect(screen.getByText('Seu ponto de partida')).toBeInTheDocument()
    expect(screen.getByText('Maior limitação')).toBeInTheDocument()
    expect(screen.getByText('Esquerda')).toBeInTheDocument()
  })

  it('tem CTA para começar o treino', () => {
    render(<Today />)
    expect(
      screen.getByRole('button', { name: 'Começar treino' }),
    ).toBeInTheDocument()
  })
})
