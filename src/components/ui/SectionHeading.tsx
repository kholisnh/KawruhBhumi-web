import type { ReactNode } from 'react'

interface SectionHeadingProps {
  label?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ label, title, subtitle, align = 'left', className = '' }: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}>
      {label && <p className="gs-label mb-3 text-gs-cyan">{label}</p>}
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-gs-ice sm:text-3xl md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-pretty text-sm leading-relaxed text-gs-mist sm:text-base">{subtitle}</p>}
    </div>
  )
}
