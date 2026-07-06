import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useAppStore } from '../../store/useAppStore'

export function Workout() {
  const setView = useAppStore((s) => s.setView)
  return (
    <ScreenShell title="Treino" subtitle="Execução com timer" withNav={false}>
      <EmptyState
        icon="⏱️"
        title="Timer em construção"
        description="A tela-herói com countdown e anel de progresso chega na Fase 5."
        action={
          <Button variant="ghost" onClick={() => setView('today')}>
            Voltar
          </Button>
        }
      />
    </ScreenShell>
  )
}
