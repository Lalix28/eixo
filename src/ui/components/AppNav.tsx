import { NAV_VIEWS, useAppStore, type NavView } from '../../store/useAppStore'
import { motion } from 'framer-motion'
import { TAP_SCALE } from '../motion'

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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.05)] sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-2xl sm:rounded-lg sm:border"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] sm:pb-0">
        {NAV_VIEWS.map((v) => {
          const active = view === v
          return (
            <li key={v} className="flex-1">
              <motion.button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setView(v)}
                whileTap={{ scale: TAP_SCALE }}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand-600 ${
                  active
                    ? 'text-brand-700'
                    : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="active-nav-item"
                    className="absolute inset-1 rounded-md bg-brand-50"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 36,
                      mass: 0.6,
                    }}
                    aria-hidden="true"
                  />
                )}
                <motion.svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.4 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  animate={{ scale: active ? 1.04 : 1 }}
                  transition={{ duration: 0.16 }}
                  className="relative z-10"
                >
                  <path d={ICONS[v]} />
                </motion.svg>
                <span className="relative z-10">{LABELS[v]}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
