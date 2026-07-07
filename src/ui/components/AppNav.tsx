import { NAV_VIEWS, useAppStore, type NavView } from '../../store/useAppStore'

const LABELS: Record<NavView, string> = {
  today: 'Hoje',
  progress: 'Progresso',
  settings: 'Ajustes',
}

const ICONS: Record<NavView, string> = {
  today: 'M3 12l9-9 9 9M5 10v10h14V10',
  progress: 'M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z',
}

/**
 * Barra de navegação inferior. Troca a `view` no store — sem rotas.
 * Só aparece nas telas de nível superior (Hoje/Progresso/Ajustes).
 */
export function AppNav() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-100 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.04)]"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_VIEWS.map((v) => {
          const active = view === v
          return (
            <li key={v} className="flex-1">
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setView(v)}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-600 ${
                  active ? 'text-brand-600' : 'text-ink-400 hover:text-ink-600'
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.4 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={ICONS[v]} />
                </svg>
                {LABELS[v]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
