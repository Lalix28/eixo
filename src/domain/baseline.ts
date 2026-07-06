import type { BaselineInput, OnboardingAnswers, Side } from './types'

function clampInt(n: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(n), min), max)
}

/**
 * Normaliza as respostas do onboarding em campos de baseline.
 * Função pura e determinística: `id` e `createdAt` são carimbados na
 * fronteira de persistência (Fase 3+), não aqui.
 *
 * Regra de lado: 'não sei' (unknown) → 'not_applicable'.
 */
export function normalizeOnboarding(
  answers: OnboardingAnswers,
): BaselineInput {
  const atrophySide: Side =
    answers.atrophySide === 'unknown' ? 'not_applicable' : answers.atrophySide

  return {
    level: answers.level,
    lowBackPain: clampInt(answers.lowBackPain, 0, 10),
    adductorPain: clampInt(answers.adductorPain, 0, 10),
    atrophySide,
    worstSide: answers.worstSide,
    canSprint: answers.canSprint,
    hasBike: answers.hasBike,
    dailyMinutes: answers.dailyMinutes,
    goal: answers.goal,
  }
}
