import { useAppStore, type View } from './store/useAppStore'
import { AppNav } from './ui/components/AppNav'
import { Onboarding } from './ui/screens/Onboarding'
import { Today } from './ui/screens/Today'
import { Workout } from './ui/screens/Workout'
import { LogSession } from './ui/screens/LogSession'
import { Progress } from './ui/screens/Progress'
import { Settings } from './ui/screens/Settings'

const SCREENS: Record<View, () => React.ReactElement> = {
  onboarding: Onboarding,
  today: Today,
  workout: Workout,
  log: LogSession,
  progress: Progress,
  settings: Settings,
}

// Telas de fluxo dedicado não mostram a barra de navegação inferior.
const FULLSCREEN_VIEWS: View[] = ['onboarding', 'workout', 'log']

function App() {
  const view = useAppStore((s) => s.view)
  const Screen = SCREENS[view]
  const showNav = !FULLSCREEN_VIEWS.includes(view)

  return (
    <div className="min-h-dvh bg-ink-50">
      <Screen />
      {showNav && <AppNav />}
    </div>
  )
}

export default App
