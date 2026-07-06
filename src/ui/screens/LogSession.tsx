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
import { SideMetricInput } from '../components/SideMetricInput'
import { NumberField } from '../components/NumberField'
import { StatusChoice } from '../components/StatusChoice'
import { BotheredExercisePicker } from '../components/BotheredExercisePicker'
import { NotesField } from '../components/NotesField'
import { SaveBar } from '../components/SaveBar'
import {
  adductorPainInputs,
  parseOptionalNumber,
  sideTimeInputs,
  type SidePainValue,
  type SideTimeValue,
} from './logForm'

function worstToScope(worst: WorstSide | undefined): Side {
  if (worst === 'left' || worst === 'right' || worst === 'both') return worst
  return 'both' // 'varies' ou indefinido
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
  const [frontPlank, setFrontPlank] = useState('')
  const [sidePlank, setSidePlank] = useState<SideTimeValue>({
    side: 'not_applicable',
    left: '',
    right: '',
  })
  const [hipCore, setHipCore] = useState<SideTimeValue>({
    side: 'not_applicable',
    left: '',
    right: '',
  })
  const [reach, setReach] = useState('')
  const [botheredId, setBotheredId] = useState<string | null>(null)
  const [botheredSide, setBotheredSide] = useState<Side>('not_applicable')
  const [notes, setNotes] = useState('')

  // Estado honesto quando não há treino em registro.
  if (!activeSessionId || !session) {
    return (
      <div className="mx-auto w-full max-w-md px-5 pt-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink-900">
          Registro
        </h1>
        <EmptyState
          icon="📝"
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
      frontPlankSec: parseOptionalNumber(frontPlank),
      reachToFloorCm: parseOptionalNumber(reach),
      botheredExerciseId: botheredId,
      botheredSide,
      notes: notes.trim() === '' ? null : notes.trim(),
    }
    const sideInputs = [
      ...adductorPainInputs(adductor),
      ...sideTimeInputs('side_plank_sec', sidePlank),
      ...sideTimeInputs('hip_core_hold_sec', hipCore),
    ]
    void saveSessionLog({ status, globals, sideInputs })
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-40 pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Registro do treino
        </h1>
        <p className="mt-1 text-ink-500">Registro rápido — a maioria é opcional.</p>
      </header>

      <div className="space-y-5">
        <StatusChoice value={status} onChange={setStatus} />

        <Card>
          <h3 className="mb-4 font-semibold text-ink-900">Dor lombar</h3>
          <div className="space-y-5">
            <PainSlider label="Antes" value={lowBackBefore} onChange={setLowBackBefore} />
            <PainSlider label="Depois" value={lowBackAfter} onChange={setLowBackAfter} />
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-ink-900">Dor de quadril/adutores</h3>
            <SideToggle
              value={adductor.side}
              onChange={(side) => setAdductor({ ...adductor, side })}
            />
          </div>
          {adductor.side !== 'not_applicable' && (
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
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-ink-900">Medidas (opcional)</h3>
          <div className="space-y-6">
            <div>
              <Slider
                label="Esforço percebido (RPE)"
                value={rpe}
                onChange={setRpe}
                min={0}
                max={10}
                minLabel="—"
                maxLabel="Máximo"
              />
              <p className="mt-1 text-xs text-ink-400">0 = não informado</p>
            </div>
            <NumberField
              label="Prancha frontal"
              value={frontPlank}
              onChange={setFrontPlank}
              suffix="s"
              placeholder="ex.: 40"
            />
            <SideMetricInput
              label="Prancha lateral (tempo)"
              value={sidePlank}
              onChange={setSidePlank}
            />
            <SideMetricInput
              label="Controle de quadril/core (tempo sustentado)"
              value={hipCore}
              onChange={setHipCore}
            />
            <NumberField
              label="Distância mão-chão"
              value={reach}
              onChange={setReach}
              suffix="cm"
              placeholder="ex.: 8"
            />
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <BotheredExercisePicker
              exercises={exercises}
              value={botheredId}
              onChange={setBotheredId}
            />
            {botheredId && (
              <div>
                <span className="mb-2 block font-medium text-ink-800">
                  Lado incomodado
                </span>
                <SideToggle value={botheredSide} onChange={setBotheredSide} />
              </div>
            )}
            <NotesField value={notes} onChange={setNotes} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} saving={saving} error={error} />
    </div>
  )
}
