import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'

export function Settings() {
  return (
    <ScreenShell title="Ajustes" subtitle="Informações e segurança">
      <EmptyState
        icon="⚙️"
        title="Ajustes em construção"
        description="Resumo do baseline, avisos de segurança completos e info do app chegam numa fase posterior."
      />
    </ScreenShell>
  )
}
