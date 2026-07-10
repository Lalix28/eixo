import type { Side } from '../../domain/types'
import { motion } from 'framer-motion'
import { QUICK_TRANSITION, TAP_SCALE } from '../motion'

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
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-ink-100 p-1">
      {options.map((side) => {
        const active = side === value
        return (
          <motion.button
            key={side}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(side)}
            animate={{ scale: active ? 1.01 : 1 }}
            whileTap={{ scale: TAP_SCALE }}
            transition={QUICK_TRANSITION}
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              active
                ? 'bg-white text-brand-800 shadow-sm ring-1 ring-ink-200'
                : 'text-ink-600 hover:bg-white/70 hover:text-ink-800'
            }`}
          >
            {LABEL[side]}
          </motion.button>
        )
      })}
    </div>
  )
}
