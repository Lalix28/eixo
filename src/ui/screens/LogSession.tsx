import { useMemo, useState } from 'react'
import { useAppStore, type LogGlobals } from '../../store/useAppStore'
import { PLAN_DAYS } from '../../data/plan'
import { EXERCISES } from '../../data/exercises'
import { getExercisesForDay, getPlanDay } from '../../domain/plan'
import type { Side, SessionStatus, WorstSide } from '../../domain/types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Slider } from '../components/Slider'
import { PainSlider } from '../components/PainSlider'
import { SideToggle } from '../components/SideToggle'
import { StatusChoice } from '../components/StatusChoice'
import { BotheredExercisePicker } from '../components/BotheredExercisePicker'
import { NotesField } from '../components/NotesField'
import { SaveBar } from '../components/SaveBar'
import { adductorPainInputs, type SidePainValue } from './logForm'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../motion'

function worstToScope(worst: WorstSide | undefined): Side {
  if (worst === 'left' || worst === 'right' || worst === 'both') return worst
  return 'both' // 'varies' ou indefinido
}

function SectionHeading({
  step,
  title,
  description,
  optional = false,
}: {
  step: number
  title: string
  description: string
  optional?: boolean
}) {
  return (
    <div className="mb-5 border-b border-ink-100 pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-brand-50 text-xs font-bold text-brand-700">
          {step}
        </span>
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {optional && (
          <span className="text-xs font-medium text-ink-500">Opcional</span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
    </div>
  )
}

export function LogSession() {
  const baseline = useAppStore((s) => s.baseline)
  const sessions = useAppStore((s) => s.sessions)
  const activeSessionId = useAppStore((s) => s.activeSessionId)
  const suggestedStatus = useAppStore((s) => s.suggestedStatus)
  const saving = useAppStore((s) => s.saving)
  const error = useAppStore((s) => s.error)
  const saveSessionLog = useAppStore((s) => s.saveSessionLog)
  const setView = useAppStore((s) => s.setView)

  const session = sessions.find((s) => s.id === activeSessionId)
  const day = session ? getPlanDay(PLAN_DAYS, session.dayIndex) : undefined
  const exercises = useMemo(
    () => (day ? getExercisesForDay(day, EXERCISES) : []),
    [day],
  )

  const lb = baseline?.lowBackPain ?? 0
  const ad = baseline?.adductorPain ?? 0

  const [status, setStatus] = useState<SessionStatus>(suggestedStatus)
  const [lowBackBefore, setLowBackBefore] = useState(lb)
  const [lowBackAfter, setLowBackAfter] = useState(lb)
  const [adductor, setAdductor] = useState<SidePainValue>({
    side: worstToScope(baseline?.worstSide),
    before: ad,
    after: ad,
  })
  const [rpe, setRpe] = useState(0)
  const [botheredId, setBotheredId] = useState<string | null>(null)
  const [botheredSide, setBotheredSide] = useState<Side>('not_applicable')
  const [notes, setNotes] = useState('')

  // Estado honesto quando não há treino em registro.
  if (!activeSessionId || !session) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-[max(2rem,env(safe-area-inset-top))] sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-ink-900">
          Registro
        </h1>
        <EmptyState
          title="Nenhum treino para registrar"
          description="Inicie um treino no Hoje para poder registrar como foi."
          action={<Button onClick={() => setView('today')}>Voltar ao início</Button>}
        />
      </div>
    )
  }

  function handleSave() {
    const globals: LogGlobals = {
      lowBackPainBefore: lowBackBefore,
      lowBackPainAfter: lowBackAfter,
      rpe: rpe > 0 ? rpe : null,
      botheredExerciseId: botheredId,
      botheredSide,
      notes: notes.trim() === '' ? null : notes.trim(),
    }
    const sideInputs = adductorPainInputs(adductor)
    void saveSessionLog({ status, globals, sideInputs })
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-40 sm:px-6 sm:pt-[max(2.25rem,env(safe-area-inset-top))] lg:px-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-[1.75rem] leading-tight font-bold text-ink-900 sm:text-[2rem]">
          Registro do treino
        </h1>
        <p className="mt-1.5 max-w-2xl leading-relaxed text-ink-600">
          Registre como seu corpo respondeu à sessão.
        </p>
      </header>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="space-y-5"
      >
        <motion.div variants={staggerItem}>
          <Card>
            <SectionHeading
              step={1}
              title="Como foi o treino"
              description="Registre o resultado e o esforço percebido."
            />
            <StatusChoice label="Resultado" value={status} onChange={setStatus} />
            <div className="mt-6 max-w-lg border-t border-ink-100 pt-5">
              <Slider
                label="Esforço percebido (RPE)"
                value={rpe}
                onChange={setRpe}
                min={0}
                max={10}
                minLabel="Não informado"
                maxLabel="Máximo"
              />
              <p className="mt-1 text-xs text-ink-500">O valor 0 não é salvo.</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <SectionHeading
              step={2}
              title="Dor antes e depois"
              description="Use a mesma referência de 0 a 10 nas duas medidas."
            />
          <div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
            <section>
              <h3 className="mb-4 font-semibold text-ink-900">Dor lombar</h3>
              <div className="space-y-5">
                <PainSlider
                  label="Antes"
                  value={lowBackBefore}
                  onChange={setLowBackBefore}
                />
                <PainSlider
                  label="Depois"
                  value={lowBackAfter}
                  onChange={setLowBackAfter}
                />
              </div>
            </section>

            <section className="border-t border-ink-100 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-ink-900">
                  Dor de quadril/adutores
                </h3>
                <SideToggle
                  value={adductor.side}
                  onChange={(side) => setAdductor({ ...adductor, side })}
                />
              </div>
              {adductor.side !== 'not_applicable' ? (
                <div className="space-y-5">
                  <PainSlider
                    label="Antes"
                    value={adductor.before}
                    onChange={(before) => setAdductor({ ...adductor, before })}
                  />
                  <PainSlider
                    label="Depois"
                    value={adductor.after}
                    onChange={(after) => setAdductor({ ...adductor, after })}
                  />
                </div>
              ) : (
                <p className="text-sm text-ink-500">Sem medida por lado nesta sessão.</p>
              )}
            </section>
          </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <SectionHeading
              step={3}
              title="Desconforto durante o treino"
              description="Informe somente se algum movimento incomodou."
              optional
            />
            <BotheredExercisePicker
              exercises={exercises}
              value={botheredId}
              onChange={setBotheredId}
            />
            {botheredId && (
              <div className="mt-4">
                <span className="mb-2 block font-medium text-ink-800">
                  Lado incomodado
                </span>
                <SideToggle value={botheredSide} onChange={setBotheredSide} />
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <SectionHeading
              step={4}
              title="Observações"
              description="Registre apenas o que pode ajudar no próximo treino."
              optional
            />
            <NotesField value={notes} onChange={setNotes} />
          </Card>
        </motion.div>
      </motion.div>

      <SaveBar onSave={handleSave} saving={saving} error={error} />
    </div>
  )
}
