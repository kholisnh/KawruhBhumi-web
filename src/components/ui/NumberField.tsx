import { useEffect, useRef, useState } from 'react'
import { InfoTip } from './InfoTip'

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  unit?: string
  /** Localized validation message; renders the error state when present. */
  error?: string
  step?: number
  disabled?: boolean
  compact?: boolean
  className?: string
  help?: string
}

function toDraft(value: number): string {
  if (!Number.isFinite(value)) return ''
  return String(Number(value.toPrecision(12)))
}

/**
 * Numeric input with free-text draft state: invalid text is propagated as NaN
 * so the validator surfaces a proper error instead of silently coercing.
 */
export function NumberField({ label, value, onChange, unit, error, step, disabled, compact, className = '', help }: NumberFieldProps) {
  const [draft, setDraft] = useState(() => toDraft(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) setDraft(toDraft(value))
  }, [value])

  const commit = () => {
    const n = Number.parseFloat(draft.replace(',', '.'))
    onChange(Number.isNaN(n) ? NaN : n)
  }

  return (
    <label className={`block ${className}`}>
      <span className={`mb-1 flex items-center gap-1 text-xs font-medium text-gs-mist ${compact ? 'sr-only' : ''}`}>
        {label}
        {help && <InfoTip label={label}>{help}</InfoTip>}
      </span>
      <span className="relative block">
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          disabled={disabled}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={() => {
            focusedRef.current = false
            commit()
          }}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
          }}
          step={step}
          className={`gs-number w-full rounded-lg border bg-gs-deep/80 px-2.5 py-1.5 text-xs text-gs-ice transition-colors outline-none placeholder:text-gs-mist/50 ${
            error ? 'border-gs-danger/70 focus:border-gs-danger' : 'border-black/10 focus:border-gs-cyan/60'
          } disabled:opacity-50 ${unit ? 'pr-14' : ''}`}
        />
        {unit && (
          <span className="gs-number pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gs-mist">
            {unit}
          </span>
        )}
      </span>
      <span className="mt-0.5 block min-h-[12px] text-xs leading-tight text-gs-danger">{error ?? ''}</span>
    </label>
  )
}
