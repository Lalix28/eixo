import { useEffect } from 'react'
import { useAppStore, type View } from './store/useAppStore'
import { AppNav } from './ui/components/AppNav'
import { Button } from './ui/components/Button'
import { Onboarding } from './ui/screens/Onboarding'
import { Today } from './ui/screens/Today'
import { Workout } from './ui/screens/Workout'
import { LogSession } from './ui/screens/LogSession'
import { Progress } from './ui/screens/Progress'
import { Settings } from './ui/screens/Settings'

const SCREENS: Record<View, () => React.ReactElement | null> = {
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
    <div className="flex min-h-dvh items-center justify-center text-ink-400">
      <p>Carregando…</p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string | null }) {
  const retry = () => {
    useAppStore.setState({ initialized: false })
    void useAppStore.getState().init()
  }
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-ink-900">Algo deu errado</h1>
      <p className="text-ink-500">{message}</p>
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

  let content: React.ReactElement | null
  if (status === 'loading') {
    content = <LoadingScreen />
  } else if (status === 'error') {
    content = <ErrorScreen message={error} />
  } else if (!baseline) {
    content = <Onboarding />
  } else {
    const Screen = SCREENS[view]
    content = <Screen />
  }

  const showNav =
    status === 'ready' && !!baseline && !FULLSCREEN_VIEWS.includes(view)

  return (
    <div className="min-h-dvh bg-ink-50">
      {content}
      {showNav && <AppNav />}
    </div>
  )
}

export default App
