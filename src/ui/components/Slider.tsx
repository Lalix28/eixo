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
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium text-ink-800">{label}</span>
        <span className="text-lg font-bold tabular-nums text-brand-600">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600"
      />
      {(minLabel || maxLabel) && (
        <div className="mt-1 flex justify-between text-xs text-ink-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
