import { ScreenShell } from '../components/ScreenShell'
import { EmptyState } from '../components/EmptyState'

export function Progress() {
  return (
    <ScreenShell title="Progresso" subtitle="Sua evolução ao longo dos dias">
      <EmptyState
        icon="📈"
        title="Sem dados ainda"
        description="Os gráficos aparecem aqui a partir dos seus registros (Fase 7)."
      />
    </ScreenShell>
  )
}
