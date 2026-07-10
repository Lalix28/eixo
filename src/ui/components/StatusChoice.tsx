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
  label?: string
}

/** Escolha do status do treino (campo obrigatório). */
export function StatusChoice({
  value,
  onChange,
  label = 'Como foi o treino?',
}: StatusChoiceProps) {
  return (
    <ChoiceGroup
      label={label}
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  )
}
