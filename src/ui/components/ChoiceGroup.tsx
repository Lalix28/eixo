import { motion } from 'framer-motion'
import { QUICK_TRANSITION, TAP_SCALE } from '../motion'

export interface Choice<T extends string> {
  value: T
  label: string
}

interface ChoiceGroupProps<T extends string> {
  label: string
  options: Choice<T>[]
  value: T
  onChange: (value: T) => void
}

/**
 * Seleção única em pílulas. Escolhas com toque confortável, verde na ativa.
 * Usado para nível, lado, tempo disponível, meta, etc.
 */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-semibold text-ink-800">{label}</legend>
      <div className="flex flex-wrap gap-2" role="group">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <motion.button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              animate={{ scale: active ? 1.01 : 1 }}
              whileTap={{ scale: TAP_SCALE }}
              transition={QUICK_TRANSITION}
              className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                active
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
              }`}
            >
              {active && (
                <span className="mr-1.5" aria-hidden="true">
                  ✓
                </span>
              )}
              {opt.label}
            </motion.button>
          )
        })}
      </div>
    </fieldset>
  )
}
