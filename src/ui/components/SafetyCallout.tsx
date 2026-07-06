import { PAIN_REFERENCE, SAFETY_DISCLAIMER } from '../../data/safety'

/**
 * Aviso de segurança curto para o dashboard e o início do treino.
 * A versão completa (sinais de parada) fica em Ajustes/execução.
 */
export function SafetyCallout() {
  return (
    <div className="rounded-2xl border border-warn-500/30 bg-warn-500/10 p-4">
      <p className="text-sm font-medium text-ink-800">{SAFETY_DISCLAIMER}</p>
      <p className="mt-1 text-sm text-ink-600">{PAIN_REFERENCE}</p>
    </div>
  )
}
