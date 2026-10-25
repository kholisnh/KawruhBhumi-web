import type { ReactNode } from 'react'

interface AssumptionPanelProps {
  title: string
  items: string[]
  footer?: ReactNode
  className?: string
}

/** Visible "Model assumptions" panel — mandatory transparency element (spec §6). */
export function AssumptionPanel({ title, items, footer, className = '' }: AssumptionPanelProps) {
  return (
    <div className={`rounded-2xl border border-gs-amber/25 bg-gs-amber/5 p-4 ${className}`}>
      <h3 className="gs-label flex items-center gap-2 text-gs-amber">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-amber" />
        {title}
      </h3>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-relaxed text-gs-mist">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gs-amber/60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-3 border-t border-gs-amber/20 pt-2.5 text-xs leading-relaxed text-gs-mist/90">{footer}</div>}
    </div>
  )
}
