import type {
  IntervalSpec,
  ResolvedExercise,
  TimerPhase,
  TimerSnapshot,
  WeekProgression,
} from './types'

/**
 * Descanso padrão entre séries de exercícios por tempo (ex.: pranchas).
 * É um parâmetro do timer, não um dado de progresso do usuário.
 */
export const DEFAULT_SET_REST_MS = 30_000

/** Monta as fases de um bloco intervalado: `rounds`× [work, rest], sem rest final. */
export function buildIntervalPhases(spec: IntervalSpec): TimerPhase[] {
  const phases: TimerPhase[] = []
  for (let i = 0; i < spec.rounds; i++) {
    phases.push({
      kind: 'work',
      durationMs: spec.workMs,
      label: spec.label,
      exerciseId: spec.exerciseId,
    })
    if (i < spec.rounds - 1) {
      phases.push({
        kind: 'rest',
        durationMs: spec.restMs,
        label: 'Descanso',
        exerciseId: spec.exerciseId,
      })
    }
  }
  return phases
}

/**
 * Fases de um exercício do plano.
 * - tiros: `reps` rounds com work/rest da progressão;
 * - quadril/core: 1 dose (work/rest) — a dose prescrita, sem inventar rounds;
 * - por tempo com séries: N esforços separados por descanso padrão;
 * - reps/distância: sem fases (passo manual, tratado pela UI).
 */
export function buildExercisePhases(
  item: ResolvedExercise,
  progression: WeekProgression,
): TimerPhase[] {
  const label = item.exercise.name
  const exerciseId = item.exercise.id

  if (item.useProgression === 'sprints') {
    const s = progression.sprints
    return buildIntervalPhases({
      rounds: s.reps,
      workMs: s.workSec * 1000,
      restMs: s.restSecMin * 1000,
      label,
      exerciseId,
    })
  }

  if (item.useProgression === 'hip_core') {
    const h = progression.hipCore
    return buildIntervalPhases({
      rounds: 1,
      workMs: h.workSec * 1000,
      restMs: h.restSecMin * 1000,
      label,
      exerciseId,
    })
  }

  if (item.timeSec != null) {
    const sets = item.sets ?? 1
    const phases: TimerPhase[] = []
    for (let i = 0; i < sets; i++) {
      phases.push({
        kind: 'work',
        durationMs: item.timeSec * 1000,
        label,
        exerciseId,
      })
      if (i < sets - 1) {
        phases.push({
          kind: 'rest',
          durationMs: DEFAULT_SET_REST_MS,
          label: 'Descanso',
          exerciseId,
        })
      }
    }
    return phases
  }

  return []
}

function doneSnapshot(phases: TimerPhase[]): TimerSnapshot {
  const last = phases[phases.length - 1]
  return {
    phaseIndex: Math.max(phases.length - 1, 0),
    phaseKind: 'done',
    remainingMs: 0,
    phaseDurationMs: last?.durationMs ?? 0,
    progress: 1,
    totalRemainingMs: 0,
    done: true,
  }
}

/**
 * Estado do timer derivado exclusivamente de timestamps.
 * `elapsed = now - startedAt - pausedMs` — nunca uma soma acumulada de ticks,
 * então um `now` que avança muito (aba em background) cai na fase correta.
 */
export function computeTimerState(
  phases: TimerPhase[],
  startedAt: number,
  now: number,
  pausedMs: number,
): TimerSnapshot {
  if (phases.length === 0) return doneSnapshot(phases)

  const total = phases.reduce((n, p) => n + p.durationMs, 0)
  let elapsed = now - startedAt - pausedMs
  if (elapsed < 0) elapsed = 0
  if (elapsed >= total) return doneSnapshot(phases)

  let acc = 0
  for (let i = 0; i < phases.length; i++) {
    const d = phases[i].durationMs
    if (elapsed < acc + d) {
      const within = elapsed - acc
      return {
        phaseIndex: i,
        phaseKind: phases[i].kind,
        remainingMs: d - within,
        phaseDurationMs: d,
        progress: d > 0 ? within / d : 1,
        totalRemainingMs: total - elapsed,
        done: false,
      }
    }
    acc += d
  }

  return doneSnapshot(phases)
}

/** Snapshot inicial (antes de iniciar): começo da primeira fase. */
export function initialSnapshot(phases: TimerPhase[]): TimerSnapshot {
  return computeTimerState(phases, 0, 0, 0)
}
