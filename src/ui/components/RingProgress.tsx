import type { ReactNode } from 'react'

interface RingProgressProps {
  /** Progresso 0..1. */
  progress: number
  /** Cor do traço (classe de stroke via currentColor). */
  tone?: 'work' | 'rest' | 'done'
  size?: number
  children?: ReactNode
}

const TONE_CLASS: Record<NonNullable<RingProgressProps['tone']>, string> = {
  work: 'text-brand-600',
  rest: 'text-warn-500',
  done: 'text-brand-500',
}

/** Anel de progresso com conteúdo central (countdown). */
export function RingProgress({
  progress,
  tone = 'work',
  size = 260,
  children,
}: RingProgressProps) {
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(progress, 0), 1)
  const offset = circumference * (1 - clamped)

  return (
    <div
      className="relative aspect-square max-w-full"
      style={{ width: `min(${size}px, 76vw)` }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={`h-full w-full ${TONE_CLASS[tone]}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
