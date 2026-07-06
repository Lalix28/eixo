import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useAppStore } from '../../store/useAppStore'

export function Onboarding() {
  const setView = useAppStore((s) => s.setView)
  return (
    <ScreenShell title="Bem-vindo ao Eixo" subtitle="Vamos calibrar seu ponto de partida" withNav={false}>
      <EmptyState
        icon="👋"
        title="Onboarding em construção"
        description="O questionário de baseline será implementado na Fase 4."
        action={
          <Button onClick={() => setView('today')}>Ir para Hoje</Button>
        }
      />
    </ScreenShell>
  )
}
