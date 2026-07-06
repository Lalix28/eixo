import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './useAppStore'

describe('useAppStore (navegação)', () => {
  beforeEach(() => {
    useAppStore.setState({ view: 'today' })
  })

  it('começa na view "today"', () => {
    expect(useAppStore.getState().view).toBe('today')
  })

  it('setView troca a view atual', () => {
    useAppStore.getState().setView('progress')
    expect(useAppStore.getState().view).toBe('progress')
  })
})
