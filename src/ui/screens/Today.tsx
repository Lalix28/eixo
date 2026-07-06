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

type TodayStatus = 'completed' | 'partial' | 'not_completed' | 'none'

const STATUS_CHIP: Record<TodayStatus, { text: string; cls: string }> = {
  completed: { text: 'Treino registrado', cls: 'bg-brand-50 text-brand-700' },
  partial: { text: 'Treino parcial', cls: 'bg-warn-500/15 text-warn-500' },
  not_completed: {
    text: 'Treino não concluído',
    cls: 'bg-ink-100 text-ink-600',
  },
  none: { text: 'Treino ainda não iniciado', cls: 'bg-ink-100 text-ink-600' },
}

export function Today() {
  const baseline = useAppStore((s) => s.baseline)
  const sessions = useAppStore((s) => s.sessions)
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

  return (
    <ScreenShell title="Eixo" subtitle={`Dia ${dayIndex} de ${PLAN_DAYS.length}`}>
      <div className="space-y-5">
        {/* Foco do dia + status honesto */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {WEEKDAY_LABEL[day.weekday]} · Semana {day.week}
              </p>
              <h2 className="mt-1 text-xl font-bold text-ink-900">{day.focus}</h2>
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${chip.cls}`}
            >
              {chip.text}
            </span>
            {programComplete && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                Programa de 30 dias concluído
              </span>
            )}
          </div>
        </Card>

        {/* Resumo do baseline */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-800">Seu ponto de partida</h3>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs text-ink-500">Dor lombar</dt>
              <dd className="mt-1 text-lg font-bold text-ink-900">{baseline.lowBackPain}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Dor adutores</dt>
              <dd className="mt-1 text-lg font-bold text-ink-900">{baseline.adductorPain}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Maior limitação</dt>
              <dd className="mt-1 text-sm font-semibold text-ink-900">
                {SIDE_LABEL[baseline.atrophySide]}
              </dd>
            </div>
          </dl>
        </Card>

        <SafetyCallout />

        {/* Blocos previstos para hoje */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-ink-800">Previsto para hoje</h3>
          {day.blocks.map((block) => (
            <Card key={block.title}>
              <h4 className="mb-3 font-semibold text-ink-900">{block.title}</h4>
              <ul className="space-y-3">
                {block.items.map((item, i) => {
                  const exercise = EXERCISES_BY_ID[item.exerciseId]
                  if (!exercise) return null
                  const dose = formatPrescription(item, progression)
                  return (
                    <li key={`${item.exerciseId}-${i}`} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-900">{exercise.name}</p>
                        <p className="text-sm text-ink-500">{exercise.cue}</p>
                        {item.note && (
                          <p className="text-xs text-ink-400">{item.note}</p>
                        )}
                      </div>
                      {dose && (
                        <span className="shrink-0 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
                          {dose}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </section>

        <Button
          className="w-full"
          onClick={() => void startWorkout()}
          disabled={starting}
        >
          {starting ? 'Iniciando…' : 'Começar treino'}
        </Button>
      </div>
    </ScreenShell>
  )
}
