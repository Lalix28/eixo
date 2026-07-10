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
import { motion } from 'framer-motion'
import { EASE_OUT, QUICK_TRANSITION } from '../motion'

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
  const remainingLabel = fmtRemaining(timer.snapshot.remainingMs)
  const controlState = !isTimed
    ? 'manual'
    : !hasStarted
      ? 'idle'
      : timer.isRunning
        ? 'running'
        : 'paused'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 sm:px-6 sm:pt-[max(2rem,env(safe-area-inset-top))] lg:px-8">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between gap-4 border-b border-ink-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-brand-700">
            Dia {dayIndex} · {day.focus}
          </p>
          {!finished && (
            <p className="text-sm text-ink-500">
              Exercício {index + 1} de {exercises.length}
            </p>
          )}
        </div>
        {!finished && (
          <motion.button
            type="button"
            onClick={() => void finishWorkout('partial')}
            whileTap={{ scale: 0.98 }}
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Finalizar
          </motion.button>
        )}
      </header>

      {finished ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.82, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.34, ease: EASE_OUT }}
            className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-700 ring-1 ring-brand-100"
            aria-hidden="true"
          >
            ✓
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Treino concluído</h1>
            <p className="mt-1 text-ink-500">Vamos registrar como foi.</p>
          </div>
          <Button className="w-full" onClick={() => void finishWorkout('completed')}>
            Ir para o registro
          </Button>
        </motion.div>
      ) : (
        <div className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 lg:py-8">
          <section className="flex min-w-0 flex-col items-center gap-6 text-center">
            {/* Exercício atual */}
            <motion.div
              key={current.exercise.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="min-h-28 max-w-xl"
            >
              <p className="text-sm font-medium text-ink-500">Exercício atual</p>
              <h1 className="mt-1 text-2xl leading-tight font-bold text-ink-900 sm:text-[1.75rem]">
                {current.exercise.name}
              </h1>
              <p className="mt-2 leading-relaxed text-ink-600">
                {current.exercise.cue}
              </p>
              {current.note && (
                <p className="mt-1 text-sm text-ink-500">{current.note}</p>
              )}
            </motion.div>

            {/* Timer ou passo manual */}
            {isTimed ? (
              <div className="flex flex-col items-center gap-3">
                <RingProgress
                  progress={timer.snapshot.progress}
                  tone={tone === 'done' ? 'done' : tone}
                  size={280}
                >
                  <motion.span
                    key={remainingLabel}
                    initial={{ opacity: 0.72, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.12, ease: EASE_OUT }}
                    className="text-6xl font-bold tabular-nums text-ink-900 sm:text-7xl"
                    aria-live="off"
                  >
                    {remainingLabel}
                  </motion.span>
                  <motion.span
                    key={`${tone}-${timer.snapshot.phaseIndex}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={QUICK_TRANSITION}
                    className={`mt-1 text-sm font-semibold ${
                      tone === 'rest' ? 'text-warn-700' : 'text-brand-700'
                    }`}
                  >
                    {PHASE_LABEL[tone]}
                  </motion.span>
                </RingProgress>
                <p className="text-[0.8125rem] font-medium text-ink-600">
                  Fase {timer.snapshot.phaseIndex + 1} de {phases.length}
                </p>
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center gap-2">
                <span className="text-6xl font-bold tabular-nums text-ink-900">
                  {current.reps ? `${current.reps}` : '—'}
                </span>
                <span className="text-sm font-semibold text-brand-700">
                  {current.reps
                    ? 'repetições'
                    : formatPrescription(current, progression) || 'no seu ritmo'}
                </span>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            {/* Controles */}
            <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink-900">Controles</h2>
              <motion.div
                key={controlState}
                initial={{ opacity: 0.65, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={QUICK_TRANSITION}
                className="space-y-3"
              >
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
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" className="flex-1" onClick={timer.pause}>
                      Pausar
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={timer.skipPhase}>
                      Pular fase
                    </Button>
                  </div>
                )}
                {hasStarted && !timer.isRunning && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="flex-1" onClick={timer.resume}>
                      Retomar
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={timer.skipPhase}>
                      Pular fase
                    </Button>
                  </div>
                )}
                <motion.button
                  type="button"
                  onClick={advance}
                  whileTap={{ scale: 0.98 }}
                  className="min-h-11 w-full rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  Pular exercício
                </motion.button>
              </>
            ) : (
              <Button className="w-full" onClick={advance}>
                Concluir
              </Button>
            )}
              </motion.div>
            </div>
            <SafetyCallout />
          </aside>
        </div>
      )}

      {finished && (
        <div className="mt-4">
          <SafetyCallout />
        </div>
      )}
    </div>
  )
}
