import type { PlanBlock, PlanDay, Weekday, WeekNumber } from '../domain/types'

/**
 * Plano de 30 dias (dado estático versionado).
 *
 * O conteúdo é declarado como um template semanal (Seg–Dom) fiel à estrutura
 * do documento. Os 30 dias são a mesma estrutura semanal repetida; a
 * intensidade progride pela semana via as progressões de tiros e quadril/core
 * (ver progressions.ts), consumidas nos blocos com `useProgression`.
 *
 * Dia 1 = segunda-feira.
 */

interface DayTemplate {
  focus: string
  blocks: PlanBlock[]
}

const WEEKDAY_ORDER: Weekday[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

const WEEKLY_TEMPLATE: Record<Weekday, DayTemplate> = {
  // Segunda: empurrar + core + mobilidade curta
  mon: {
    focus: 'Empurrar + core + mobilidade curta',
    blocks: [
      {
        title: 'Mobilidade curta',
        kind: 'mobility',
        items: [
          { exerciseId: 'cat-cow', reps: 8 },
          { exerciseId: 'thoracic-rotation', reps: 6, note: 'cada lado' },
        ],
      },
      {
        title: 'Empurrar',
        kind: 'push',
        items: [
          { exerciseId: 'incline-pushup', sets: 3, reps: 8 },
          { exerciseId: 'scapular-pull', sets: 2, reps: 8 },
        ],
      },
      {
        title: 'Core',
        kind: 'core',
        items: [
          { exerciseId: 'front-plank', sets: 3, timeSec: 30 },
          { exerciseId: 'dead-bug', sets: 3, reps: 10 },
        ],
      },
    ],
  },

  // Terça: tiros/bike + mobilidade
  tue: {
    focus: 'Tiros/bike + mobilidade',
    blocks: [
      {
        title: 'Mobilidade',
        kind: 'mobility',
        items: [
          { exerciseId: 'hip-flexor-stretch', timeSec: 30, note: 'cada lado' },
          { exerciseId: 'adductor-rock', timeSec: 30 },
        ],
      },
      {
        title: 'Tiros',
        kind: 'conditioning',
        items: [
          {
            exerciseId: 'sprints',
            useProgression: 'sprints',
            note: 'Bike intervalada como alternativa.',
          },
        ],
      },
      {
        title: 'Volta à calma',
        kind: 'recovery',
        items: [{ exerciseId: 'breathing', timeSec: 120 }],
      },
    ],
  },

  // Quarta: puxar + postura
  wed: {
    focus: 'Puxar + postura',
    blocks: [
      {
        title: 'Mobilidade curta',
        kind: 'mobility',
        items: [{ exerciseId: 'cat-cow', reps: 8 }],
      },
      {
        title: 'Puxar',
        kind: 'pull',
        items: [
          { exerciseId: 'inverted-row', sets: 3, reps: 8 },
          { exerciseId: 'band-row', sets: 3, reps: 12 },
        ],
      },
      {
        title: 'Postura',
        kind: 'posture',
        items: [
          { exerciseId: 'doorway-pec-stretch', timeSec: 30 },
          { exerciseId: 'bird-dog', sets: 3, reps: 8, note: 'cada lado' },
        ],
      },
    ],
  },

  // Quinta: quadril/core + mobilidade
  thu: {
    focus: 'Quadril/core + mobilidade',
    blocks: [
      {
        title: 'Mobilidade',
        kind: 'mobility',
        items: [
          { exerciseId: 'hip-flexor-stretch', timeSec: 30, note: 'cada lado' },
        ],
      },
      {
        title: 'Resistência quadril/core',
        kind: 'hip_core',
        items: [
          { exerciseId: 'marching-bridge', useProgression: 'hip_core' },
          { exerciseId: 'clamshell', sets: 3, reps: 12, note: 'cada lado' },
          { exerciseId: 'side-plank', sets: 2, timeSec: 20, note: 'cada lado' },
        ],
      },
      {
        title: 'Core',
        kind: 'core',
        items: [{ exerciseId: 'dead-bug', sets: 3, reps: 10 }],
      },
    ],
  },

  // Sexta: pernas leve + core
  fri: {
    focus: 'Pernas leve + core',
    blocks: [
      {
        title: 'Mobilidade curta',
        kind: 'mobility',
        items: [{ exerciseId: 'cat-cow', reps: 8 }],
      },
      {
        title: 'Pernas leve',
        kind: 'legs',
        items: [
          { exerciseId: 'assisted-squat', sets: 3, reps: 10 },
          { exerciseId: 'glute-bridge', sets: 3, reps: 12 },
          { exerciseId: 'calf-raise', sets: 3, reps: 12 },
        ],
      },
      {
        title: 'Core',
        kind: 'core',
        items: [
          { exerciseId: 'front-plank', sets: 3, timeSec: 30 },
          { exerciseId: 'side-plank', sets: 2, timeSec: 20, note: 'cada lado' },
        ],
      },
    ],
  },

  // Sábado: tiros + bloco quadril
  sat: {
    focus: 'Tiros + bloco quadril',
    blocks: [
      {
        title: 'Tiros',
        kind: 'conditioning',
        items: [
          {
            exerciseId: 'sprints',
            useProgression: 'sprints',
            note: 'Bike intervalada como alternativa.',
          },
        ],
      },
      {
        title: 'Bloco quadril',
        kind: 'hip_core',
        items: [
          { exerciseId: 'fire-hydrant', sets: 3, reps: 10, note: 'cada lado' },
          {
            exerciseId: 'side-lying-leg-raise',
            sets: 3,
            reps: 12,
            note: 'cada lado',
          },
          { exerciseId: 'marching-bridge', useProgression: 'hip_core' },
        ],
      },
      {
        title: 'Volta à calma',
        kind: 'recovery',
        items: [{ exerciseId: 'breathing', timeSec: 120 }],
      },
    ],
  },

  // Domingo: recuperação ativa
  sun: {
    focus: 'Recuperação ativa',
    blocks: [
      {
        title: 'Recuperação ativa',
        kind: 'recovery',
        items: [
          { exerciseId: 'easy-walk', timeSec: 1200 },
          { exerciseId: 'forward-fold', timeSec: 30 },
          { exerciseId: 'child-pose', timeSec: 60 },
          { exerciseId: 'breathing', timeSec: 120 },
        ],
      },
    ],
  },
}

function weekOf(dayIndex: number): WeekNumber {
  return Math.min(Math.ceil(dayIndex / 7), 4) as WeekNumber
}

function buildPlan(): PlanDay[] {
  return Array.from({ length: PLAN_LENGTH }, (_, i) => {
    const dayIndex = i + 1
    const weekday = WEEKDAY_ORDER[i % 7]
    const template = WEEKLY_TEMPLATE[weekday]
    return {
      id: `day-${String(dayIndex).padStart(2, '0')}`,
      dayIndex,
      week: weekOf(dayIndex),
      weekday,
      focus: template.focus,
      blocks: template.blocks,
    }
  })
}

export const PLAN_LENGTH = 30

export const PLAN_DAYS: PlanDay[] = buildPlan()
