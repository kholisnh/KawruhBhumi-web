import type { ReactNode } from 'react'

export function AdvancedSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <details className="group mt-3 rounded-xl border border-black/10 bg-gs-deep/40">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-gs-mist transition-colors hover:text-gs-ice [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </summary>
      <div className="border-t border-black/8 px-3 py-3">
        {hint && <p className="text-xs leading-relaxed text-gs-mist">{hint}</p>}
        <div className={hint ? 'mt-3' : ''}>{children}</div>
      </div>
    </details>
  )
}
