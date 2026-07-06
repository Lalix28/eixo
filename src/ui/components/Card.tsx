import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Superfície espaçosa com respiro visual — bloco base do layout. */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-ink-100 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
