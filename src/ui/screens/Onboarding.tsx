import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScreenShell } from '../components/ScreenShell'
import { Slider } from '../components/Slider'
import { ChoiceGroup, type Choice } from '../components/ChoiceGroup'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
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
      title="Configure seu Eixo"
      subtitle="Leva cerca de dois minutos. Suas respostas ajustam o programa e ficam somente neste dispositivo."
      withNav={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <Card>
          <h2 className="mb-5 text-sm font-semibold tracking-wide text-brand-700 uppercase">
            Ponto de partida
          </h2>
          <div className="space-y-6">
            <ChoiceGroup
              label="Nível atual"
              options={LEVELS}
              value={level}
              onChange={setLevel}
            />
            <Slider
              label="Dor lombar média"
              value={lowBackPain}
              onChange={setLowBackPain}
              minLabel="Sem dor"
              maxLabel="Dor máxima"
            />
            <Slider
              label="Desconforto em quadril/adutores"
              value={adductorPain}
              onChange={setAdductorPain}
              minLabel="Sem dor"
              maxLabel="Dor máxima"
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-sm font-semibold tracking-wide text-brand-700 uppercase">
            Movimento
          </h2>
          <div className="space-y-6">
            <ChoiceGroup
              label="Qual perna tem menos força ou maior limitação?"
              options={ATROPHY_SIDES}
              value={atrophySide}
              onChange={setAtrophySide}
            />
            <ChoiceGroup
              label="Qual lado costuma incomodar ou travar mais?"
              options={WORST_SIDES}
              value={worstSide}
              onChange={setWorstSide}
            />
            <ChoiceGroup
              label="Consigo fazer tiros de corrida com conforto?"
              options={YES_NO}
              value={canSprint}
              onChange={setCanSprint}
            />
            <ChoiceGroup
              label="Tenho bicicleta ergométrica disponível?"
              options={YES_NO}
              value={hasBike}
              onChange={setHasBike}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-sm font-semibold tracking-wide text-brand-700 uppercase">
            Rotina
          </h2>
          <div className="space-y-6">
            <ChoiceGroup
              label="Tempo disponível por dia"
              options={MINUTES}
              value={dailyMinutes}
              onChange={setDailyMinutes}
            />
            <ChoiceGroup
              label="Foco principal"
              options={GOALS}
              value={goal}
              onChange={setGoal}
            />
          </div>
        </Card>

        <div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar e ver meu plano'}
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-400">
            Ajuste ou interrompa qualquer exercício se houver dor aguda.
          </p>
        </div>
      </motion.div>
    </ScreenShell>
  )
}
