import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

/**
 * Estado vazio honesto e bonito. Usado quando ainda não há dados reais
 * — nunca preencher com dados fabricados.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-ink-300 bg-white px-6 py-10 text-center sm:py-12">
      {icon && <div className="mb-4 text-3xl">{icon}</div>}
      <h3 className="text-lg font-semibold text-ink-800">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-600">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
