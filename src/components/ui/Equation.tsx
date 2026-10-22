import katex from 'katex'
import { useMemo } from 'react'

interface EquationProps {
  latex: string
  block?: boolean
  className?: string
  /** Optional short caption shown under the equation. */
  caption?: string
}

/** KaTeX renderer. Errors fall back to the raw TeX string (never crashes the UI). */
export function Equation({ latex, block = true, className = '', caption }: EquationProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { displayMode: block, throwOnError: false, strict: false, output: 'html' })
    } catch {
      return latex
    }
  }, [latex, block])

  const eq = <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  if (!caption) return eq
  return (
    <figure className="my-2">
      {eq}
      <figcaption className="mt-1 text-center text-[11px] text-gs-mist">{caption}</figcaption>
    </figure>
  )
}

/** Inline equation for use inside prose. */
export function EqInline({ latex }: { latex: string }) {
  return <Equation latex={latex} block={false} />
}
