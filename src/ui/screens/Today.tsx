import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useAppStore } from '../../store/useAppStore'

export function Today() {
  const setView = useAppStore((s) => s.setView)
  return (
    <ScreenShell title="Hoje" subtitle="Seu treino do dia">
      <EmptyState
        icon="🌱"
        title="Dashboard em construção"
        description="A tela Hoje ganha o card do treino e a semana na Fase 4."
        action={
          <Button variant="secondary" onClick={() => setView('progress')}>
            Ver progresso
          </Button>
        }
      />
    </ScreenShell>
  )
}
