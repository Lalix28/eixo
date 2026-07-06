import { create } from 'zustand'

/**
 * Navegação por estado (sem router), conforme decisão de arquitetura.
 * A `view` atual determina qual tela o App renderiza.
 */
export type View =
  | 'onboarding'
  | 'today'
  | 'workout'
  | 'log'
  | 'progress'
  | 'settings'

/** Telas acessíveis pela barra de navegação inferior. */
export const NAV_VIEWS = ['today', 'progress', 'settings'] as const
export type NavView = (typeof NAV_VIEWS)[number]

interface AppState {
  view: View
  setView: (view: View) => void
}

export const useAppStore = create<AppState>((set) => ({
  // A tela inicial real (onboarding vs. today) será decidida na Fase 4,
  // quando existir baseline persistido. Por ora, entra em 'today'.
  view: 'today',
  setView: (view) => set({ view }),
}))
