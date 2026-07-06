import type { Exercise } from '../domain/types'

/**
 * Biblioteca básica de exercícios (dado estático versionado).
 * Foco em variantes seguras/assistidas: atrofia em uma perna, escoliose leve,
 * ombros tensos, dor lombar leve, dor ao abrir adutores/quadril.
 * Sem vídeo, gif ou descrição longa — apenas uma cue curta por exercício.
 */
export const EXERCISES: Exercise[] = [
  // --- Empurrar ---
  {
    id: 'wall-pushup',
    name: 'Flexão na parede',
    category: 'push',
    cue: 'Corpo em linha, cotovelos a ~45°.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'incline-pushup',
    name: 'Flexão inclinada',
    category: 'push',
    cue: 'Apoie em superfície firme; desça controlado.',
    kind: 'reps',
    requiresSide: false,
    substitutionId: 'wall-pushup',
  },
  {
    id: 'pushup',
    name: 'Flexão',
    category: 'push',
    cue: 'Core firme; não deixe a lombar cair.',
    kind: 'reps',
    requiresSide: false,
    substitutionId: 'incline-pushup',
  },

  // --- Puxar ---
  {
    id: 'band-row',
    name: 'Remada com elástico',
    category: 'pull',
    cue: 'Puxe pelos cotovelos, junte as escápulas.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'inverted-row',
    name: 'Remada invertida',
    category: 'pull',
    cue: 'Corpo reto; peito em direção à barra.',
    kind: 'reps',
    requiresSide: false,
    substitutionId: 'band-row',
  },
  {
    id: 'assisted-pullup',
    name: 'Barra assistida',
    category: 'pull',
    cue: 'Use elástico/apoio; desça sob controle.',
    kind: 'reps',
    requiresSide: false,
    substitutionId: 'inverted-row',
  },
  {
    id: 'scapular-pull',
    name: 'Retração escapular na barra',
    category: 'pull',
    cue: 'Sem dobrar cotovelo; só abaixe as escápulas.',
    kind: 'reps',
    requiresSide: false,
  },

  // --- Pernas ---
  {
    id: 'assisted-squat',
    name: 'Agachamento assistido',
    category: 'legs',
    cue: 'Segure em apoio; joelhos alinhados aos pés.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'bodyweight-squat',
    name: 'Agachamento livre',
    category: 'legs',
    cue: 'Peso nos calcanhares; desça até onde for confortável.',
    kind: 'reps',
    requiresSide: false,
    substitutionId: 'assisted-squat',
  },
  {
    id: 'split-squat',
    name: 'Agachamento unilateral leve',
    category: 'legs',
    cue: 'Trabalhe cada perna; foque na perna mais fraca.',
    kind: 'reps',
    requiresSide: true,
    substitutionId: 'assisted-squat',
  },
  {
    id: 'glute-bridge',
    name: 'Ponte de glúteo',
    category: 'legs',
    cue: 'Empurre pelos calcanhares; aperte o glúteo no topo.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'calf-raise',
    name: 'Elevação de panturrilha',
    category: 'legs',
    cue: 'Suba devagar; pausa curta no topo.',
    kind: 'reps',
    requiresSide: false,
  },

  // --- Core ---
  {
    id: 'front-plank',
    name: 'Prancha frontal',
    category: 'core',
    cue: 'Glúteo e core firmes; quadril neutro.',
    kind: 'time',
    requiresSide: false,
  },
  {
    id: 'side-plank',
    name: 'Prancha lateral',
    category: 'core',
    cue: 'Quadril alto; ombro sobre o cotovelo.',
    kind: 'time',
    requiresSide: true,
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    category: 'core',
    cue: 'Lombar colada no chão o tempo todo.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    category: 'core',
    cue: 'Estenda braço e perna opostos sem girar o quadril.',
    kind: 'reps',
    requiresSide: true,
  },
  {
    id: 'hollow-hold',
    name: 'Hollow hold',
    category: 'core',
    cue: 'Lombar no chão; ajuste altura das pernas conforme dor.',
    kind: 'time',
    requiresSide: false,
    substitutionId: 'dead-bug',
  },

  // --- Quadril ---
  {
    id: 'clamshell',
    name: 'Concha (clamshell)',
    category: 'hip',
    cue: 'Abra o joelho sem rolar o quadril para trás.',
    kind: 'reps',
    requiresSide: true,
  },
  {
    id: 'side-lying-leg-raise',
    name: 'Elevação lateral de perna',
    category: 'hip',
    cue: 'Suba a perna reta; movimento pequeno e controlado.',
    kind: 'reps',
    requiresSide: true,
  },
  {
    id: 'fire-hydrant',
    name: 'Hidrante',
    category: 'hip',
    cue: 'Abra o quadril; mantenha o core estável.',
    kind: 'reps',
    requiresSide: true,
  },
  {
    id: 'hip-hinge',
    name: 'Dobradiça de quadril',
    category: 'hip',
    cue: 'Empurre o quadril para trás; coluna longa.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'marching-bridge',
    name: 'Ponte com marcha',
    category: 'hip',
    cue: 'Quadril alto e estável ao alternar as pernas.',
    kind: 'interval',
    requiresSide: false,
    substitutionId: 'glute-bridge',
  },

  // --- Mobilidade ---
  {
    id: 'cat-cow',
    name: 'Gato-camelo',
    category: 'mobility',
    cue: 'Movimento lento, seguindo a respiração.',
    kind: 'reps',
    requiresSide: false,
  },
  {
    id: 'adductor-rock',
    name: 'Mobilização de adutores',
    category: 'mobility',
    cue: 'Abra só até um leve incômodo; nunca force.',
    kind: 'time',
    requiresSide: false,
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Alongamento de flexor de quadril',
    category: 'mobility',
    cue: 'Encaixe o quadril; sem estufar a lombar.',
    kind: 'time',
    requiresSide: true,
  },
  {
    id: 'thoracic-rotation',
    name: 'Rotação torácica',
    category: 'mobility',
    cue: 'Gire pela coluna torácica; quadril quieto.',
    kind: 'reps',
    requiresSide: true,
  },
  {
    id: 'forward-fold',
    name: 'Flexão de tronco à frente',
    category: 'mobility',
    cue: 'Joelhos leves; desça sem dor — referência mão-chão.',
    kind: 'time',
    requiresSide: false,
  },
  {
    id: 'shoulder-cars',
    name: 'CARs de ombro',
    category: 'mobility',
    cue: 'Círculos amplos e lentos; sem encolher o ombro.',
    kind: 'reps',
    requiresSide: true,
  },
  {
    id: 'doorway-pec-stretch',
    name: 'Alongamento de peitoral na porta',
    category: 'mobility',
    cue: 'Abra o peito; respire fundo.',
    kind: 'time',
    requiresSide: false,
  },

  // --- Condicionamento ---
  {
    id: 'incline-walk',
    name: 'Caminhada inclinada',
    category: 'conditioning',
    cue: 'Passo firme em subida; ritmo sustentável.',
    kind: 'time',
    requiresSide: false,
  },
  {
    id: 'bike-intervals',
    name: 'Bike intervalada',
    category: 'conditioning',
    cue: 'Alterne esforço forte e leve conforme o bloco.',
    kind: 'interval',
    requiresSide: false,
    substitutionId: 'incline-walk',
  },
  {
    id: 'sprints',
    name: 'Tiros',
    category: 'conditioning',
    cue: 'Acelere progressivo; pare antes de perder a técnica.',
    kind: 'interval',
    requiresSide: false,
    substitutionId: 'bike-intervals',
  },

  // --- Recuperação ---
  {
    id: 'easy-walk',
    name: 'Caminhada leve',
    category: 'recovery',
    cue: 'Ritmo de conversa; solte os ombros.',
    kind: 'time',
    requiresSide: false,
  },
  {
    id: 'breathing',
    name: 'Respiração diafragmática',
    category: 'recovery',
    cue: 'Inspire pela barriga; expire longo e lento.',
    kind: 'time',
    requiresSide: false,
  },
  {
    id: 'child-pose',
    name: 'Postura da criança',
    category: 'recovery',
    cue: 'Relaxe a lombar; respire nas costas.',
    kind: 'time',
    requiresSide: false,
  },
]

/** Índice por id para lookup O(1) na camada de domínio. */
export const EXERCISES_BY_ID: Readonly<Record<string, Exercise>> =
  Object.fromEntries(EXERCISES.map((e) => [e.id, e]))
