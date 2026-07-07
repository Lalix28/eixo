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
      <legend className="mb-2 font-medium text-ink-800">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
