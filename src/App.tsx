import {
  lazy,
  Suspense,
  useEffect,
  type ComponentType,
  type ReactElement,
} from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { useAppStore, type View } from './store/useAppStore'
import { AppNav } from './ui/components/AppNav'
import { Button } from './ui/components/Button'
import { Onboarding } from './ui/screens/Onboarding'
import { Today } from './ui/screens/Today'
import { Workout } from './ui/screens/Workout'
import { LogSession } from './ui/screens/LogSession'
import { Settings } from './ui/screens/Settings'
import { SCREEN_TRANSITION, screenVariants } from './ui/motion'

const Progress = lazy(() =>
  import('./ui/screens/Progress').then(({ Progress: Screen }) => ({
    default: Screen,
  })),
)

const SCREENS: Record<View, ComponentType> = {
  onboarding: Onboarding,
  today: Today,
  workout: Workout,
  log: LogSession,
  progress: Progress,
  settings: Settings,
}

// Telas de fluxo dedicado não mostram a barra de navegação inferior.
const FULLSCREEN_VIEWS: View[] = ['onboarding', 'workout', 'log']

function LoadingScreen() {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-4 px-5 sm:px-8"
      role="status"
      aria-label="Carregando o Eixo"
    >
      <div className="h-3 w-16 animate-pulse rounded-full bg-brand-100" />
      <div className="h-8 w-36 animate-pulse rounded-xl bg-ink-200" />
      <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-ink-100" />
      <p className="text-sm text-ink-500">Carregando seus dados…</p>
    </div>
  )
}

function ProgressLoadingScreen() {
  return (
    <div
      className="mx-auto w-full max-w-[70rem] px-4 pt-8 pb-32 sm:px-6 lg:px-8"
      role="status"
      aria-label="Carregando progresso"
    >
      <div className="h-8 w-36 animate-pulse rounded-xl bg-ink-200" />
      <div className="mt-2 h-5 w-56 animate-pulse rounded-lg bg-ink-100" />
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-ink-100"
          />
        ))}
      </div>
      <div className="mt-5 h-64 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-ink-100" />
      <p className="mt-4 text-sm text-ink-500">Carregando seu progresso…</p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string | null }) {
  const retry = () => {
    useAppStore.setState({ initialized: false })
    void useAppStore.getState().init()
  }
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-ink-900">Algo deu errado</h1>
      <p className="text-ink-500">
        {message ?? 'Não foi possível carregar seus dados agora.'}
      </p>
      <Button onClick={retry}>Tentar novamente</Button>
    </div>
  )
}

function App() {
  const status = useAppStore((s) => s.status)
  const error = useAppStore((s) => s.error)
  const baseline = useAppStore((s) => s.baseline)
  const view = useAppStore((s) => s.view)
  const init = useAppStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  let content: ReactElement | null
  if (status === 'loading') {
    content = <LoadingScreen />
  } else if (status === 'error') {
    content = <ErrorScreen message={error} />
  } else if (!baseline) {
    content = <Onboarding />
  } else {
    const Screen = SCREENS[view]
    content = (
      <Suspense fallback={<ProgressLoadingScreen />}>
        <Screen />
      </Suspense>
    )
  }

  const showNav =
    status === 'ready' && !!baseline && !FULLSCREEN_VIEWS.includes(view)
  const contentKey =
    status !== 'ready' ? status : !baseline ? 'onboarding' : view

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[#f3f7f5]">
        <motion.div
          key={contentKey}
          variants={screenVariants}
          initial="initial"
          animate="enter"
          transition={SCREEN_TRANSITION}
        >
          {content}
        </motion.div>
        {showNav && <AppNav />}
      </div>
    </MotionConfig>
  )
}

export default App
