import type { Transition, Variants } from 'framer-motion'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

export const QUICK_TRANSITION: Transition = {
  duration: 0.16,
  ease: EASE_OUT,
}

export const SCREEN_TRANSITION: Transition = {
  duration: 0.24,
  ease: EASE_OUT,
}

export const screenVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
}

export const staggerContainer: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: SCREEN_TRANSITION },
}

export const TAP_SCALE = 0.98
