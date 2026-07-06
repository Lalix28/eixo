import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { useAppStore } from './store/useAppStore'
import type { Baseline } from './domain/types'

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

// `initialized: true` impede o init() do useEffect de sobrescrever o estado.
const setState = useAppStore.setState

describe('App — gate por estado', () => {
  beforeEach(() => {
    useAppStore.setState({
      status: 'loading',
      error: null,
      baseline: null,
      sessions: [],
      view: 'today',
      initialized: true,
    })
  })

  it('mostra carregando enquanto status = loading', () => {
    setState({ status: 'loading' })
    render(<App />)
    expect(screen.getByText('Carregando…')).toBeInTheDocument()
  })

  it('mostra erro amigável com opção de tentar novamente', () => {
    setState({ status: 'error', error: 'Falha no armazenamento' })
    render(<App />)
    expect(screen.getByText('Falha no armazenamento')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument()
  })

  it('mostra onboarding quando não há baseline', () => {
    setState({ status: 'ready', baseline: null })
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Vamos calibrar o Eixo' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('mostra o dashboard e a barra quando há baseline', () => {
    setState({ status: 'ready', baseline, sessions: [], view: 'today' })
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Eixo' })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('esconde a barra em telas de fluxo dedicado', () => {
    setState({ status: 'ready', baseline, view: 'workout' })
    render(<App />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('navega para o dashboard ao clicar em Progresso e voltar em Hoje', async () => {
    setState({ status: 'ready', baseline, sessions: [], view: 'today' })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Progresso' }))
    expect(useAppStore.getState().view).toBe('progress')
  })
})
