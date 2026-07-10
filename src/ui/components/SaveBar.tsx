import { Button } from './Button'

interface SaveBarProps {
  onSave: () => void
  saving: boolean
  error: string | null
  label?: string
}

/** Barra inferior fixa de salvamento com feedback visual e erro amigável. */
export function SaveBar({
  onSave,
  saving,
  error,
  label = 'Salvar registro',
}: SaveBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.05)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        {error && (
          <p className="mb-2 text-sm font-medium text-danger-700" role="alert">
            {error}
          </p>
        )}
        <Button
          className="w-full"
          onClick={onSave}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? 'Salvando…' : label}
        </Button>
        <span className="sr-only" role="status" aria-live="polite">
          {saving ? 'Salvando registro' : ''}
        </span>
      </div>
    </div>
  )
}
