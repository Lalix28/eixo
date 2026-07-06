import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from './Onboarding'
import { useAppStore } from '../../store/useAppStore'

describe('Onboarding', () => {
  beforeEach(() => {
    useAppStore.setState({ initialized: true, status: 'ready' })
  })

  it('renderiza as perguntas principais', () => {
    render(<Onboarding />)
    expect(screen.getByText('Nível atual')).toBeInTheDocument()
    expect(screen.getByText('Dor lombar média')).toBeInTheDocument()
    expect(
      screen.getByText('Qual perna tem atrofia ou maior limitação?'),
    ).toBeInTheDocument()
    expect(screen.getByText('Meta principal')).toBeInTheDocument()
  })

  it('ao salvar, chama submitOnboarding com as respostas coletadas', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    useAppStore.setState({ submitOnboarding: submit })

    render(<Onboarding />)
    // ajusta uma escolha para garantir que o estado é coletado
    await userEvent.click(screen.getByRole('button', { name: 'Intermediário' }))
    await userEvent.click(screen.getByRole('button', { name: 'Começar' }))

    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'intermediate',
        atrophySide: 'unknown',
        canSprint: true,
        hasBike: false,
        dailyMinutes: 20,
        goal: 'all',
      }),
    )
  })
})
