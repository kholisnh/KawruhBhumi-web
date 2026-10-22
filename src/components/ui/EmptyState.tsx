import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: ReactNode
  body?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, body, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/12 bg-gs-deep/40 px-6 py-10 text-center">
      {icon && <div className="text-gs-mist/70">{icon}</div>}
      <p className="text-sm font-medium text-gs-ice">{title}</p>
      {body && <p className="max-w-md text-xs leading-relaxed text-gs-mist">{body}</p>}
    </div>
  )
}
