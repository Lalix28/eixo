import type { Side } from '../../domain/types'

interface SideToggleProps {
  value: Side
  onChange: (side: Side) => void
  includeBoth?: boolean
  includeNotApplicable?: boolean
}

const LABEL: Record<Side, string> = {
  left: 'Esquerdo',
  right: 'Direito',
  both: 'Ambos',
  not_applicable: 'N/A',
}

/** Alterna o lado de uma métrica (esquerdo/direito/ambos/n.a.). */
export function SideToggle({
  value,
  onChange,
  includeBoth = true,
  includeNotApplicable = true,
}: SideToggleProps) {
  const options: Side[] = ['left', 'right']
  if (includeBoth) options.push('both')
  if (includeNotApplicable) options.push('not_applicable')

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((side) => {
        const active = side === value
        return (
          <button
            key={side}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(side)}
            className={`min-h-11 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              active
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            {LABEL[side]}
          </button>
        )
      })}
    </div>
  )
}
