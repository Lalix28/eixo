import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'

export function Settings() {
  return (
    <ScreenShell title="Ajustes" subtitle="Informações e segurança">
      <EmptyState
        icon="⚙️"
        title="Ajustes em construção"
        description="Baseline, avisos de segurança e info do app chegam na Fase 4."
      />
    </ScreenShell>
  )
}
