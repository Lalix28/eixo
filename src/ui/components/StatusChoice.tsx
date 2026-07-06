import type { SessionStatus } from '../../domain/types'
import { ChoiceGroup, type Choice } from './ChoiceGroup'

const OPTIONS: Choice<SessionStatus>[] = [
  { value: 'completed', label: 'Concluído' },
  { value: 'partial', label: 'Parcial' },
  { value: 'not_completed', label: 'Não concluído' },
]

interface StatusChoiceProps {
  value: SessionStatus
  onChange: (status: SessionStatus) => void
}

/** Escolha do status do treino (campo obrigatório). */
export function StatusChoice({ value, onChange }: StatusChoiceProps) {
  return (
    <ChoiceGroup
      label="Como foi o treino?"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  )
}
