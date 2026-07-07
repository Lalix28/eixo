import type { ResolvedExercise } from '../../domain/types'

interface BotheredExercisePickerProps {
  exercises: ResolvedExercise[]
  value: string | null
  onChange: (exerciseId: string | null) => void
}

/** Seleciona o exercício que incomodou (opcional), entre os do dia. */
export function BotheredExercisePicker({
  exercises,
  value,
  onChange,
}: BotheredExercisePickerProps) {
  // Exercícios únicos por id (o mesmo pode aparecer em blocos diferentes).
  const seen = new Set<string>()
  const unique = exercises.filter((r) => {
    if (seen.has(r.exercise.id)) return false
    seen.add(r.exercise.id)
    return true
  })

  return (
    <label className="block">
      <span className="mb-1 block font-medium text-ink-800">
        Algum exercício incomodou?
      </span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="min-h-11 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="">Nenhum</option>
        {unique.map((r) => (
          <option key={r.exercise.id} value={r.exercise.id}>
            {r.exercise.name}
          </option>
        ))}
      </select>
    </label>
  )
}
