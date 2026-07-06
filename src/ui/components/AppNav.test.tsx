import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppNav } from './AppNav'
import { useAppStore } from '../../store/useAppStore'

describe('AppNav', () => {
  beforeEach(() => {
    useAppStore.setState({ view: 'today' })
  })

  it('marca a aba atual com aria-current', () => {
    render(<AppNav />)
    expect(screen.getByRole('button', { name: 'Hoje' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('clicar em uma aba troca a view no store', async () => {
    render(<AppNav />)
    await userEvent.click(screen.getByRole('button', { name: 'Progresso' }))
    expect(useAppStore.getState().view).toBe('progress')
  })
})
