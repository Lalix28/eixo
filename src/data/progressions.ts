import type { HoldSpec, SprintSpec, WeekNumber } from '../domain/types'

/**
 * Progressões pré-carregadas (dado estático versionado), fiéis ao documento.
 * Semana 5+ (dias 29–30) reutiliza a dose da semana 4.
 */

// Tiros
export const SPRINT_PROGRESSION: Record<WeekNumber, SprintSpec> = {
  1: { reps: 6, workSec: 10, restSecMin: 80, restSecMax: 90, intensity: 8 },
  2: { reps: 8, workSec: 10, workSecMax: 12, restSecMin: 75, restSecMax: 90 },
  3: { reps: 8, workSec: 15, restSecMin: 75, restSecMax: 90 },
  4: {
    reps: 10,
    workSec: 15,
    restSecMin: 90,
    restSecMax: 90,
    alt: { reps: 6, workSec: 20 },
  },
}

// Resistência quadril/core (movimento contínuo)
export const HIP_CORE_PROGRESSION: Record<WeekNumber, HoldSpec> = {
  1: { workSec: 30, restSecMin: 60, restSecMax: 60 },
  2: { workSec: 40, restSecMin: 50, restSecMax: 50 },
  3: { workSec: 50, restSecMin: 40, restSecMax: 40 },
  4: { workSec: 60, restSecMin: 30, restSecMax: 40 },
}
