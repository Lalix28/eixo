import type { ReactNode } from 'react'

interface ScreenShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Reserva espaço inferior para a barra de navegação quando visível. */
  withNav?: boolean
}

/**
 * Contêiner mobile-first: largura confortável, respiro e área segura.
 * Todo o conteúdo das telas vive dentro de um ScreenShell.
 */
export function ScreenShell({
  title,
  subtitle,
  children,
  withNav = true,
}: ScreenShellProps) {
  return (
    <div className="mx-auto w-full max-w-md px-5 pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
      </header>
      <main className={withNav ? 'pb-28' : 'pb-8'}>{children}</main>
    </div>
  )
}
