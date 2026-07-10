import { motion } from 'framer-motion'
import { QUICK_TRANSITION } from '../motion'

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  minLabel?: string
  maxLabel?: string
}

/**
 * Slider acessível para dor/RPE. Verde como cor de ação.
 * Reutilizado no onboarding e (mais tarde) no registro pós-treino.
 */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  minLabel,
  maxLabel,
}: SliderProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium text-ink-800">{label}</span>
        <motion.span
          key={value}
          initial={{ opacity: 0.65, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={QUICK_TRANSITION}
          className="flex min-h-8 min-w-10 items-center justify-center rounded-md bg-brand-50 px-2 text-lg font-bold tabular-nums text-brand-700"
        >
          {value}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1 h-11 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between gap-4 text-xs text-ink-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
