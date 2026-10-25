import { fmt } from '../../sim/core/format'
import { InfoTip } from './InfoTip'

interface RangeFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit?: string
  /** Custom display formatting for the live readout. */
  format?: (value: number) => string
  error?: string
  disabled?: boolean
  help?: string
}

/** Slider with a live numeric readout (continuous updates are cheap here). */
export function RangeField({ label, value, onChange, min, max, step, unit, format, error, disabled, help }: RangeFieldProps) {
  const display = format ? format(value) : fmt(value, 4)
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-gs-mist">
          {label}
          {help && <InfoTip label={label}>{help}</InfoTip>}
        </span>
        <span className="gs-number text-xs text-gs-ice">
          {display}
          {unit ? <span className="ml-1 text-gs-mist">{unit}</span> : null}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/5 disabled:opacity-50"
      />
      {error && <p className="mt-0.5 text-xs text-gs-danger">{error}</p>}
    </div>
  )
}
