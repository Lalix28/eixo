import { Button } from './Button'

interface SaveBarProps {
  onSave: () => void
  saving: boolean
  error: string | null
  label?: string
}

/** Barra inferior fixa de salvamento com feedback visual e erro amigável. */
export function SaveBar({ onSave, saving, error, label = 'Salvar registro' }: SaveBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-100 bg-white/95 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="mx-auto max-w-md">
        {error && (
          <p className="mb-2 text-sm font-medium text-danger-500">{error}</p>
        )}
        <Button className="w-full" onClick={onSave} disabled={saving}>
          {saving ? 'Salvando…' : label}
        </Button>
      </div>
    </div>
  )
}
