import type { PlanItem, Side, Weekday, WeekProgression } from '../../domain/types'

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
  sun: 'Domingo',
}

export const SIDE_LABEL: Record<Side, string> = {
  left: 'Esquerda',
  right: 'Direita',
  both: 'Ambas',
  not_applicable: 'Não definido',
}

function formatSeconds(sec: number): string {
  return sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec}s`
}

/** Descrição de dose de um item do plano (apresentação, não domínio). */
export function formatPrescription(
  item: PlanItem,
  progression: WeekProgression,
): string {
  if (item.useProgression === 'sprints') {
    const s = progression.sprints
    const dur = s.workSecMax ? `${s.workSec}–${s.workSecMax}s` : `${s.workSec}s`
    return `${s.reps} tiros de ${dur}`
  }
  if (item.useProgression === 'hip_core') {
    const h = progression.hipCore
    const rest =
      h.restSecMin === h.restSecMax
        ? `${h.restSecMin}s`
        : `${h.restSecMin}–${h.restSecMax}s`
    return `${h.workSec}s de esforço · ${rest} de descanso`
  }
  if (item.timeSec != null) {
    const t = formatSeconds(item.timeSec)
    return item.sets ? `${item.sets}× ${t}` : t
  }
  if (item.reps != null) {
    return item.sets ? `${item.sets}× ${item.reps}` : `${item.reps} reps`
  }
  return ''
}
