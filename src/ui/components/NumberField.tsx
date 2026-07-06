interface NumberFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  suffix?: string
  placeholder?: string
}

/** Campo numérico opcional (segundos, cm). Valor vazio = não informado. */
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block font-medium text-ink-800">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        {suffix && <span className="text-sm text-ink-500">{suffix}</span>}
      </div>
    </label>
  )
}
