import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { PLAN_DAYS } from '../../data/plan'
import { EXERCISES } from '../../data/exercises'
import {
  getExercisesForDay,
  getWeekProgression,
  resolveTodayDay,
} from '../../domain/plan'
import { toDayKey } from '../../domain/progress'
import { buildExercisePhases } from '../../domain/timer'
import { useIntervalTimer } from '../../hooks/useIntervalTimer'
import { RingProgress } from '../components/RingProgress'
import { Button } from '../components/Button'
import { SafetyCallout } from '../components/SafetyCallout'
import { formatPrescription } from './todayFormat'

function fmtRemaining(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  if (s >= 60) {
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2, '0')}`
  }
  return String(s)
}

const PHASE_LABEL = {
  work: 'Esforço',
  rest: 'Descanso',
  done: 'Concluído',
} as const

export function Workout() {
  const baseline = useAppStore((s) => s.baseline)
  const sessions = useAppStore((s) => s.sessions)
  const finishWorkout = useAppStore((s) => s.finishWorkout)

  const todayKey = toDayKey(new Date())
  const { day, dayIndex } = useMemo(
    () => resolveTodayDay(PLAN_DAYS, sessions, todayKey),
    [sessions, todayKey],
  )
  const progression = useMemo(() => getWeekProgression(dayIndex), [dayIndex])
  const exercises = useMemo(() => getExercisesForDay(day, EXERCISES), [day])

  const [index, setIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  const current = exercises[index]
  const phases = useMemo(
    () => (current ? buildExercisePhases(current, progression) : []),
    [current, progression],
  )
  const isTimed = phases.length > 0

  const advance = useCallback(() => setIndex((i) => i + 1), [])
  const timer = useIntervalTimer({ phases, onComplete: advance })

  // Reset do controle de início ao trocar de exercício.
  useEffect(() => {
    setHasStarted(false)
  }, [index])

  if (!baseline) return null

  const finished = index >= exercises.length
  const tone = timer.snapshot.phaseKind

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8 sm:px-5">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Dia {dayIndex} · {day.focus}
          </p>
          {!finished && (
            <p className="text-sm text-ink-500">
              Exercício {index + 1} de {exercises.length}
            </p>
          )}
        </div>
        {!finished && (
          <button
            type="button"
            onClick={() => void finishWorkout('partial')}
            className="min-h-11 rounded-full px-3 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            Finalizar
          </button>
        )}
      </header>

      {finished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div
            className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-700"
            aria-hidden="true"
          >
            ✓
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Treino concluído</h1>
            <p className="mt-1 text-ink-500">Vamos registrar como foi.</p>
          </div>
          <Button className="w-full" onClick={() => void finishWorkout('completed')}>
            Ir para o registro
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-between gap-6 py-6">
          {/* Exercício atual */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink-900">
              {current.exercise.name}
            </h1>
            <p className="mt-1 text-ink-500">{current.exercise.cue}</p>
            {current.note && (
              <p className="mt-1 text-sm text-ink-400">{current.note}</p>
            )}
          </div>

          {/* Timer ou passo manual */}
          {isTimed ? (
            <RingProgress
              progress={timer.snapshot.progress}
              tone={tone === 'done' ? 'done' : tone}
            >
              <span className="text-6xl font-bold tabular-nums text-ink-900">
                {fmtRemaining(timer.snapshot.remainingMs)}
              </span>
              <span
                className={`mt-1 text-sm font-semibold uppercase tracking-wide ${
                  tone === 'rest' ? 'text-warn-500' : 'text-brand-600'
                }`}
              >
                {PHASE_LABEL[tone]}
              </span>
            </RingProgress>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl font-bold text-ink-900">
                {current.reps ? `${current.reps}` : '—'}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                {current.reps ? 'repetições' : formatPrescription(current, progression) || 'no seu ritmo'}
              </span>
            </div>
          )}

          {/* Controles */}
          <div className="w-full space-y-3">
            {isTimed ? (
              <>
                {!hasStarted && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      timer.start()
                      setHasStarted(true)
                    }}
                  >
                    Iniciar
                  </Button>
                )}
                {hasStarted && timer.isRunning && (
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={timer.pause}>
                      Pausar
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={timer.skipPhase}>
                      Pular fase
                    </Button>
                  </div>
                )}
                {hasStarted && !timer.isRunning && (
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={timer.resume}>
                      Retomar
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={timer.skipPhase}>
                      Pular fase
                    </Button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={advance}
                  className="min-h-11 w-full rounded-full px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  Pular exercício
                </button>
              </>
            ) : (
              <Button className="w-full" onClick={advance}>
                Concluir
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <SafetyCallout />
      </div>
    </div>
  )
}
