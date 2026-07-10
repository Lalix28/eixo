import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg font-semibold ' +
  'px-5 py-3 text-base transition-[background-color,color,box-shadow,transform] select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:bg-ink-100 ' +
  'disabled:text-ink-400 disabled:shadow-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 hover:shadow active:bg-brand-900',
  secondary:
    'bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200 hover:bg-brand-100 active:bg-brand-200',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
