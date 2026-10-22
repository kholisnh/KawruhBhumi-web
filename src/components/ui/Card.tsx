import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  accent?: string
}

export function Card({ children, className = '', hover = false, accent, ...rest }: CardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-black/10 bg-gs-panel shadow-panel ${
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20' : ''
      } ${className}`}
      style={accent ? { borderTopColor: accent, borderTopWidth: 2 } : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode
  title?: ReactNode
  actions?: ReactNode
  compact?: boolean
}

/** Standard section panel used across all workspaces. */
export function Panel({ children, title, actions, compact = false, className = '', ...rest }: PanelProps) {
  return (
    <section className={`rounded-2xl border border-black/10 bg-gs-panel/80 ${className}`} {...rest}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-black/8 px-4 py-2.5">
          <h3 className="gs-label">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
      )}
      <div className={compact ? 'p-3' : 'p-4'}>{children}</div>
    </section>
  )
}
