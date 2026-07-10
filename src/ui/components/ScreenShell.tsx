import type { ReactNode } from 'react'

interface ScreenShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Reserva espaço inferior para a barra de navegação quando visível. */
  withNav?: boolean
  /** Fluxos guiados mantêm uma medida de leitura mais concentrada. */
  width?: 'wide' | 'focused'
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
  width = 'wide',
}: ScreenShellProps) {
  const widthClass = width === 'focused' ? 'max-w-3xl' : 'max-w-[70rem]'

  return (
    <div
      className={`mx-auto w-full ${widthClass} px-4 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:pt-[max(2.25rem,env(safe-area-inset-top))] lg:px-8`}
    >
      <header className="mb-6 sm:mb-8">
        <h1 className="text-[1.75rem] leading-tight font-bold text-ink-900 sm:text-[2rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl leading-relaxed text-ink-600">
            {subtitle}
          </p>
        )}
      </header>
      <main className={withNav ? 'pb-32 sm:pb-28' : 'pb-10'}>{children}</main>
    </div>
  )
}
