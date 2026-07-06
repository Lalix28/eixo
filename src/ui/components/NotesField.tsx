interface NotesFieldProps {
  value: string
  onChange: (value: string) => void
}

/** Observações livres (opcional). */
export function NotesField({ value, onChange }: NotesFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block font-medium text-ink-800">Observações</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Como você se sentiu, o que ajustar…"
        className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  )
}
