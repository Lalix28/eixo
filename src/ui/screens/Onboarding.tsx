import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScreenShell } from '../components/ScreenShell'
import { Slider } from '../components/Slider'
import { ChoiceGroup, type Choice } from '../components/ChoiceGroup'
import { Button } from '../components/Button'
import { useAppStore } from '../../store/useAppStore'
import type {
  DailyMinutes,
  Goal,
  Level,
  OnboardingAnswers,
  OnboardingAtrophySide,
  WorstSide,
} from '../../domain/types'

const LEVELS: Choice<Level>[] = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

const ATROPHY_SIDES: Choice<OnboardingAtrophySide>[] = [
  { value: 'left', label: 'Esquerda' },
  { value: 'right', label: 'Direita' },
  { value: 'both', label: 'Ambas' },
  { value: 'unknown', label: 'Não sei' },
]

const WORST_SIDES: Choice<WorstSide>[] = [
  { value: 'left', label: 'Esquerdo' },
  { value: 'right', label: 'Direito' },
  { value: 'both', label: 'Ambos' },
  { value: 'varies', label: 'Varia' },
]

const YES_NO: Choice<'yes' | 'no'>[] = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
]

const MINUTES: Choice<`${DailyMinutes}`>[] = [
  { value: '10', label: '10 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
]

const GOALS: Choice<Goal>[] = [
  { value: 'mobility', label: 'Mobilidade' },
  { value: 'hip_core', label: 'Resistência de quadril/core' },
  { value: 'calisthenics', label: 'Calistenia' },
  { value: 'low_back', label: 'Dor/controle lombar' },
  { value: 'all', label: 'Tudo junto' },
]

export function Onboarding() {
  const submitOnboarding = useAppStore((s) => s.submitOnboarding)

  const [level, setLevel] = useState<Level>('beginner')
  const [lowBackPain, setLowBackPain] = useState(0)
  const [adductorPain, setAdductorPain] = useState(0)
  const [atrophySide, setAtrophySide] = useState<OnboardingAtrophySide>('unknown')
  const [worstSide, setWorstSide] = useState<WorstSide>('varies')
  const [canSprint, setCanSprint] = useState<'yes' | 'no'>('yes')
  const [hasBike, setHasBike] = useState<'yes' | 'no'>('no')
  const [dailyMinutes, setDailyMinutes] = useState<`${DailyMinutes}`>('20')
  const [goal, setGoal] = useState<Goal>('all')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const answers: OnboardingAnswers = {
      level,
      lowBackPain,
      adductorPain,
      atrophySide,
      worstSide,
      canSprint: canSprint === 'yes',
      hasBike: hasBike === 'yes',
      dailyMinutes: Number(dailyMinutes) as DailyMinutes,
      goal,
    }
    setSaving(true)
    await submitOnboarding(answers)
    setSaving(false)
  }

  return (
    <ScreenShell
      title="Vamos calibrar o Eixo"
      subtitle="Algumas perguntas rápidas para adaptar o programa a você."
      withNav={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <ChoiceGroup label="Nível atual" options={LEVELS} value={level} onChange={setLevel} />

        <div className="space-y-5 rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <Slider
            label="Dor lombar média"
            value={lowBackPain}
            onChange={setLowBackPain}
            minLabel="Sem dor"
            maxLabel="Dor máxima"
          />
          <Slider
            label="Dor ao abrir pernas/adutores"
            value={adductorPain}
            onChange={setAdductorPain}
            minLabel="Sem dor"
            maxLabel="Dor máxima"
          />
        </div>

        <ChoiceGroup
          label="Qual perna tem atrofia ou maior limitação?"
          options={ATROPHY_SIDES}
          value={atrophySide}
          onChange={setAtrophySide}
        />
        <ChoiceGroup
          label="Qual lado costuma doer/travar mais?"
          options={WORST_SIDES}
          value={worstSide}
          onChange={setWorstSide}
        />
        <ChoiceGroup
          label="Consigo correr tiros?"
          options={YES_NO}
          value={canSprint}
          onChange={setCanSprint}
        />
        <ChoiceGroup
          label="Tenho bike ergométrica?"
          options={YES_NO}
          value={hasBike}
          onChange={setHasBike}
        />
        <ChoiceGroup
          label="Tempo disponível por dia"
          options={MINUTES}
          value={dailyMinutes}
          onChange={setDailyMinutes}
        />
        <ChoiceGroup label="Meta principal" options={GOALS} value={goal} onChange={setGoal} />

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Começar'}
        </Button>
      </motion.div>
    </ScreenShell>
  )
}
