import {
  HIP_CORE_PROGRESSION,
  SPRINT_PROGRESSION,
} from '../data/progressions'
import type {
  Exercise,
  PlanDay,
  ResolvedExercise,
  Session,
  TodayResolution,
  WeekNumber,
  WeekProgression,
} from './types'

/** Retorna o dia do plano com o `dayIndex` dado, se existir. */
export function getPlanDay(
  plan: PlanDay[],
  dayIndex: number,
): PlanDay | undefined {
  return plan.find((d) => d.dayIndex === dayIndex)
}

/** Semana (1..4) de um índice de dia; dias além da semana 4 usam a semana 4. */
export function weekOfDayIndex(dayIndex: number): WeekNumber {
  const w = Math.ceil(dayIndex / 7)
  return Math.min(Math.max(w, 1), 4) as WeekNumber
}

/** Progressão de tiros e quadril/core para o dia dado. */
export function getWeekProgression(dayIndex: number): WeekProgression {
  const week = weekOfDayIndex(dayIndex)
  return {
    sprints: SPRINT_PROGRESSION[week],
    hipCore: HIP_CORE_PROGRESSION[week],
  }
}

/**
 * Resolve o dia atual do programa a partir das sessões já registradas.
 * Avança apenas com sessões 'completed' ou 'partial' (progresso sequencial),
 * clampeado ao tamanho do plano. `today` (dayKey) indica se já houve registro hoje.
 */
export function resolveTodayDay(
  plan: PlanDay[],
  sessions: Session[],
  today: string,
): TodayResolution {
  const advanced = sessions.filter(
    (s) => s.status === 'completed' || s.status === 'partial',
  ).length

  const programComplete = advanced >= plan.length
  const index = Math.min(advanced + 1, plan.length)
  const day = plan[index - 1] ?? plan[0]
  const loggedToday = sessions.some((s) => s.dayKey === today)

  return { day, dayIndex: day.dayIndex, loggedToday, programComplete }
}

/** Achata os blocos do dia em exercícios resolvidos contra a biblioteca. */
export function getExercisesForDay(
  day: PlanDay,
  library: Exercise[],
): ResolvedExercise[] {
  const byId = new Map(library.map((e) => [e.id, e]))
  const out: ResolvedExercise[] = []

  for (const block of day.blocks) {
    for (const item of block.items) {
      const exercise = byId.get(item.exerciseId)
      // Integridade (todo item referencia um exercício real) é garantida por teste.
      if (!exercise) continue
      out.push({
        exercise,
        block: block.title,
        blockKind: block.kind,
        sets: item.sets,
        reps: item.reps,
        timeSec: item.timeSec,
        useProgression: item.useProgression,
        note: item.note,
      })
    }
  }

  return out
}

/** Substituição simples de um exercício, se houver, resolvida na biblioteca. */
export function substituteExercise(
  ex: Exercise,
  library: Exercise[],
): Exercise | undefined {
  if (!ex.substitutionId) return undefined
  return library.find((e) => e.id === ex.substitutionId)
}
