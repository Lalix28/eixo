import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useAppStore } from '../../store/useAppStore'

export function LogSession() {
  const setView = useAppStore((s) => s.setView)
  return (
    <ScreenShell title="Registro" subtitle="Como foi o treino?" withNav={false}>
      <EmptyState
        icon="📝"
        title="Registro em construção"
        description="O formulário pós-treino (dores, RPE, por lado) chega na Fase 6."
        action={
          <Button variant="ghost" onClick={() => setView('today')}>
            Voltar
          </Button>
        }
      />
    </ScreenShell>
  )
}
