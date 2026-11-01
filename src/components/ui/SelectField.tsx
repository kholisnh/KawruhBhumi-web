import type { ReactNode } from 'react'
import { InfoTip } from './InfoTip'

interface SelectFieldProps<T extends string> {
  label: string
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; disabled?: boolean }>
  compact?: boolean
  className?: string
  icon?: ReactNode
  help?: string
}

export function SelectField<T extends string>({ label, value, onChange, options, compact, className = '', icon, help }: SelectFieldProps<T>) {
  return (
    <label className={`block ${className}`}>
      <span className={`mb-1 items-center gap-1.5 text-xs font-medium text-gs-mist ${compact ? 'sr-only' : 'flex'}`}>
        {icon}
        {label}
        {help && <InfoTip label={label}>{help}</InfoTip>}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-h-11 w-full cursor-pointer rounded-lg border border-black/10 bg-gs-deep/80 px-2.5 py-1.5 text-xs text-gs-ice transition-colors outline-none focus:border-gs-cyan/60 focus-visible:ring-2 focus-visible:ring-gs-cyan/60"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
