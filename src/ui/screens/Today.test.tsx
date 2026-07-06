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
      view: 'today',
    })
  })

  it('mostra o dia atual e o foco do plano (dia 1 = segunda)', () => {
    render(<Today />)
    expect(screen.getByText('Dia 1 de 30')).toBeInTheDocument()
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
