import { Slider } from './Slider'

interface PainSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  /** RPE usa 1..10; dor usa 0..10. */
  min?: number
  minLabel?: string
  maxLabel?: string
}

/** Slider de dor/esforço 0–10 com rótulos de extremo. */
export function PainSlider({
  label,
  value,
  onChange,
  min = 0,
  minLabel = 'Sem dor',
  maxLabel = 'Dor máxima',
}: PainSliderProps) {
  return (
    <Slider
      label={label}
      value={value}
      onChange={onChange}
      min={min}
      max={10}
      minLabel={minLabel}
      maxLabel={maxLabel}
    />
  )
}
