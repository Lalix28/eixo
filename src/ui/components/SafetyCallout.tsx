import { PAIN_REFERENCE, SAFETY_DISCLAIMER } from '../../data/safety'

/**
 * Aviso de segurança curto para o dashboard e o início do treino.
 * A versão completa (sinais de parada) fica em Ajustes/execução.
 */
export function SafetyCallout() {
  return (
    <aside className="rounded-[var(--radius-card)] border border-warn-500/30 bg-[#fffbeb] p-4">
      <p className="text-sm font-semibold text-ink-800">Atenção ao movimento</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
        {SAFETY_DISCLAIMER}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-600">
        {PAIN_REFERENCE}
      </p>
    </aside>
  )
}
