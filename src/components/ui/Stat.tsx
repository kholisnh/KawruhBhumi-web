import type { ReactNode } from 'react'

interface StatProps {
  label: ReactNode
  value: ReactNode
  unit?: string
  hint?: ReactNode
  accent?: string
}

export function Stat({ label, value, unit, hint, accent }: StatProps) {
  return (
    <div className="rounded-xl border border-black/8 bg-gs-deep/70 px-3 py-2.5">
      <div className="text-xs font-semibold tracking-wider text-gs-mist uppercase">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="gs-number text-base font-medium" style={{ color: accent ? `color-mix(in srgb, ${accent} 45%, #252525)` : '#252525' }}>
          {value}
        </span>
        {unit && <span className="gs-number text-xs text-gs-mist">{unit}</span>}
      </div>
      {hint && <div className="mt-0.5 text-xs leading-snug text-gs-mist">{hint}</div>}
    </div>
  )
}
