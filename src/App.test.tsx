import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { useAppStore } from './store/useAppStore'

describe('App (shell + navegação)', () => {
  beforeEach(() => {
    useAppStore.setState({ view: 'today' })
  })

  it('monta na tela Hoje com a barra de navegação', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Hoje' })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('navega entre telas de nível superior pela barra', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    expect(screen.getByRole('heading', { name: 'Ajustes' })).toBeInTheDocument()
  })

  it('telas de fluxo dedicado escondem a barra de navegação', () => {
    useAppStore.setState({ view: 'workout' })
    render(<App />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
