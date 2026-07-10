import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padded?: boolean
}

/** Superfície base do produto, com borda e elevação discretas. */
export function Card({
  className = '',
  children,
  padded = true,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-ink-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.035)] ${
        padded ? 'p-5 sm:p-6' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
