import { ScreenShell } from '../components/ScreenShell'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { SafetyCallout } from '../components/SafetyCallout'
import { useAppStore } from '../../store/useAppStore'
import { PLAN_DAYS } from '../../data/plan'
import { EXERCISES_BY_ID } from '../../data/exercises'
import {
  getPlanDay,
  getWeekProgression,
  resolveTodayDay,
} from '../../domain/plan'
import { toDayKey } from '../../domain/progress'
import { SIDE_LABEL, WEEKDAY_LABEL, formatPrescription } from './todayFormat'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT, staggerContainer, staggerItem } from '../motion'

type TodayStatus = 'completed' | 'partial' | 'not_completed' | 'none'

const STATUS_CHIP: Record<TodayStatus, { text: string; cls: string }> = {
  completed: { text: 'Treino registrado', cls: 'bg-brand-50 text-brand-700' },
  partial: { text: 'Treino parcial', cls: 'bg-warn-500/15 text-warn-700' },
  not_completed: {
    text: 'Treino não concluído',
    cls: 'bg-ink-100 text-ink-600',
  },
  none: { text: 'Treino ainda não iniciado', cls: 'bg-ink-100 text-ink-600' },
}

export function Today() {
  const reduceMotion = useReducedMotion()
  const baseline = useAppStore((s) => s.baseline)
  const sessions = useAppStore((s) => s.sessions)
  const activeSessionId = useAppStore((s) => s.activeSessionId)
  const startWorkout = useAppStore((s) => s.startWorkout)
  const starting = useAppStore((s) => s.starting)

  // O gate do App garante baseline presente aqui; guarda defensiva.
  if (!baseline) return null

  const todayKey = toDayKey(new Date())
  const resolved = resolveTodayDay(PLAN_DAYS, sessions, todayKey)
  const programComplete = resolved.programComplete

  // Reconhece o treino do dia (calendário) para status honesto.
  const doneToday = sessions
    .filter(
      (s) =>
        s.dayKey === todayKey &&
        (s.status === 'completed' || s.status === 'partial'),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0]
  const inProgressToday = sessions.find(
    (s) => s.dayKey === todayKey && s.status === 'not_completed',
  )

  const day =
    (doneToday && getPlanDay(PLAN_DAYS, doneToday.dayIndex)) ?? resolved.day
  const dayIndex = day.dayIndex
  const statusKind: TodayStatus = doneToday
    ? doneToday.status
    : inProgressToday
      ? 'not_completed'
      : 'none'
  const chip = STATUS_CHIP[statusKind]
  const progression = getWeekProgression(dayIndex)
  const programProgress = Math.min((dayIndex / PLAN_DAYS.length) * 100, 100)
  const ctaLabel =
    statusKind === 'none'
      ? 'Começar treino'
      : statusKind === 'not_completed'
        ? activeSessionId
          ? 'Retomar treino'
          : 'Recomeçar treino'
        : null

  return (
    <ScreenShell
      title="Eixo"
      subtitle={`Dia ${dayIndex} de ${PLAN_DAYS.length} · Seu treino de hoje`}
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="space-y-6"
      >
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
          {/* O treino do dia concentra contexto, status e ação principal. */}
          <motion.div variants={staggerItem} className="min-w-0">
            <Card className="overflow-hidden border-brand-200/80" padded={false}>
            <div className="border-b border-brand-100 bg-brand-50/70 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-brand-800">
                  {WEEKDAY_LABEL[day.weekday]} · Semana {day.week}
                </p>
                <motion.span
                  key={statusKind}
                  initial={{ opacity: 0.65, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  role="status"
                  aria-live="polite"
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${chip.cls}`}
                >
                  {chip.text}
                </motion.span>
              </div>
            </div>
            <div className="px-5 py-6 sm:px-6 sm:py-7">
              <p className="text-sm font-medium text-ink-600">Foco do treino</p>
              <h2 className="mt-1 max-w-2xl text-2xl leading-tight font-bold text-ink-900 sm:text-[1.75rem]">
                {day.focus}
              </h2>
              <p className="mt-3 text-sm text-ink-600">
                {day.blocks.length} blocos · Plano ajustado ao seu ponto de partida
              </p>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-ink-600">
                  <span>Progresso do programa</span>
                  <span className="tabular-nums">
                    {dayIndex}/{PLAN_DAYS.length}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-brand-100"
                  role="progressbar"
                  aria-label="Progresso do programa"
                  aria-valuemin={1}
                  aria-valuemax={PLAN_DAYS.length}
                  aria-valuenow={dayIndex}
                >
                  <motion.div
                    className="h-full rounded-full bg-brand-600"
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${programProgress}%` }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.3,
                      ease: EASE_OUT,
                    }}
                  />
                </div>
              </div>
              {programComplete && (
                <p className="mt-3 text-sm font-medium text-brand-700">
                  Programa de 30 dias concluído
                </p>
              )}
              {ctaLabel ? (
                <Button
                  className="mt-6 w-full sm:w-auto sm:min-w-56"
                  onClick={() => void startWorkout()}
                  disabled={starting}
                >
                  {starting ? 'Preparando treino…' : ctaLabel}
                </Button>
              ) : (
                <p className="mt-6 text-sm font-semibold text-brand-800">
                  {statusKind === 'completed'
                    ? 'Treino de hoje concluído.'
                    : 'Registro parcial salvo.'}
                </p>
              )}
            </div>
            </Card>
          </motion.div>

          <motion.aside variants={staggerItem} className="space-y-4">
            <Card>
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
                <h3 className="text-sm font-semibold text-ink-900">
                  Seu ponto de partida
                </h3>
                <span className="text-xs text-ink-500">Escala 0–10</span>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-[0.8125rem] leading-tight text-ink-600">Dor lombar</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                    {baseline.lowBackPain}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.8125rem] leading-tight text-ink-600">Dor adutores</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                    {baseline.adductorPain}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.8125rem] leading-tight text-ink-600">Maior limitação</dt>
                  <dd className="mt-2 text-sm font-semibold text-ink-900">
                    {SIDE_LABEL[baseline.atrophySide]}
                  </dd>
                </div>
              </dl>
            </Card>

            <SafetyCallout />
          </motion.aside>
        </div>

        {/* Blocos previstos para hoje */}
        <motion.section variants={staggerItem}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">Estrutura do treino</h3>
              <p className="mt-1 text-sm text-ink-600">
                Revise os movimentos antes de começar.
              </p>
            </div>
          </div>
          <motion.div
            variants={staggerContainer}
            className="grid gap-4 md:grid-cols-2"
          >
            {day.blocks.map((block) => (
              <motion.div key={block.title} variants={staggerItem}>
                <Card>
                <h4 className="mb-4 font-semibold text-ink-900">{block.title}</h4>
                <ul className="divide-y divide-ink-100">
                {block.items.map((item, i) => {
                  const exercise = EXERCISES_BY_ID[item.exerciseId]
                  if (!exercise) return null
                  const dose = formatPrescription(item, progression)
                  return (
                    <li
                      key={`${item.exerciseId}-${i}`}
                      className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900">{exercise.name}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-600">
                          {exercise.cue}
                        </p>
                        {item.note && (
                          <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{item.note}</p>
                        )}
                      </div>
                      {dose && (
                        <span className="shrink-0 rounded-md bg-ink-100 px-2.5 py-1 text-[0.8125rem] font-medium text-ink-700">
                          {dose}
                        </span>
                      )}
                    </li>
                  )
                })}
                </ul>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.div>
    </ScreenShell>
  )
}
