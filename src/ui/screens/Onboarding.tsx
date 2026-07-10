import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScreenShell } from '../components/ScreenShell'
import { Slider } from '../components/Slider'
import { ChoiceGroup, type Choice } from '../components/ChoiceGroup'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { staggerContainer, staggerItem } from '../motion'
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
      subtitle="Um ponto de partida simples para ajustar o programa. Suas respostas ficam somente neste dispositivo."
      withNav={false}
      width="focused"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="space-y-5 sm:space-y-6"
      >
        <motion.div variants={staggerItem}>
          <Card>
          <div className="mb-5 border-b border-ink-100 pb-4">
            <p className="text-xs font-semibold text-brand-700">1 de 3</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900">
              Ponto de partida
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Considere como você se sente na maior parte dos dias.
            </p>
          </div>
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
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
          <div className="mb-5 border-b border-ink-100 pb-4">
            <p className="text-xs font-semibold text-brand-700">2 de 3</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900">Movimento</h2>
            <p className="mt-1 text-sm text-ink-600">
              Isso ajuda a adaptar exercícios e condicionamento.
            </p>
          </div>
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
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
          <div className="mb-5 border-b border-ink-100 pb-4">
            <p className="text-xs font-semibold text-brand-700">3 de 3</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900">Rotina</h2>
            <p className="mt-1 text-sm text-ink-600">
              Escolha um ritmo que seja viável manter.
            </p>
          </div>
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
        </motion.div>

        <motion.div variants={staggerItem} className="border-t border-ink-200 pt-5">
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
            <span>
              <strong className="font-semibold text-ink-900">{dailyMinutes} min</strong>{' '}
              por dia
            </span>
            <span>
              Nível{' '}
              <strong className="font-semibold text-ink-900">
                {LEVELS.find((option) => option.value === level)?.label}
              </strong>
            </span>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar e ver meu plano'}
          </Button>
          <span className="sr-only" role="status" aria-live="polite">
            {saving ? 'Salvando suas escolhas' : ''}
          </span>
          <p
            className="mt-3 text-center text-xs leading-relaxed text-ink-500"
            aria-live="polite"
          >
            Ajuste ou interrompa qualquer exercício se houver dor aguda.
          </p>
        </motion.div>
      </motion.div>
    </ScreenShell>
  )
}
