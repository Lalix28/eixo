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
        placeholder="Sensações ou ajustes para o próximo treino"
        className="w-full resize-y rounded-lg border border-ink-300 bg-white px-3 py-3 text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  )
}
