import type { Side } from '../../domain/types'
import type { SideTimeValue } from '../screens/logForm'
import { SideToggle } from './SideToggle'
import { NumberField } from './NumberField'

interface SideMetricInputProps {
  label: string
  value: SideTimeValue
  onChange: (value: SideTimeValue) => void
  suffix?: string
}

/**
 * Métrica de tempo por lado: toggle de lado + campo(s) numérico(s).
 * 'Ambos' mostra dois campos independentes (esquerdo e direito).
 */
export function SideMetricInput({
  label,
  value,
  onChange,
  suffix = 's',
}: SideMetricInputProps) {
  const setSide = (side: Side) => onChange({ ...value, side })
  const setLeft = (left: string) => onChange({ ...value, left })
  const setRight = (right: string) => onChange({ ...value, right })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-ink-800">{label}</span>
        <SideToggle value={value.side} onChange={setSide} />
      </div>
      {value.side === 'left' && (
        <NumberField label="Esquerdo" value={value.left} onChange={setLeft} suffix={suffix} />
      )}
      {value.side === 'right' && (
        <NumberField label="Direito" value={value.right} onChange={setRight} suffix={suffix} />
      )}
      {value.side === 'both' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Esquerdo" value={value.left} onChange={setLeft} suffix={suffix} />
          <NumberField label="Direito" value={value.right} onChange={setRight} suffix={suffix} />
        </div>
      )}
    </div>
  )
}
