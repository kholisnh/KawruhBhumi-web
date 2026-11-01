import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Config, Data, Layout } from 'plotly.js'
import { useI18n } from '../../i18n'

export type PlotlyModule = {
  react: (el: HTMLElement, data: Data[], layout: Partial<Layout>, config?: Partial<Config>) => Promise<unknown>
  purge: (el: HTMLElement) => void
  Plots: { resize: (el: HTMLElement) => void }
  relayout: (el: HTMLElement, update: Record<string, unknown>) => Promise<unknown>
  downloadImage: (el: HTMLElement, opts: { format: string; filename: string; scale?: number }) => Promise<string>
  toImage: (el: HTMLElement, opts: { format: string; scale?: number; width?: number; height?: number }) => Promise<string>
}

/** A Plotly graph div: gains an `.on(event, handler)` method after the first plot. */
export type PlotlyGraphDiv = HTMLDivElement & {
  on?: (event: string, handler: (ev: { points?: Array<{ x?: unknown; y?: unknown }> }) => void) => void
}

let plotlyPromise: Promise<PlotlyModule> | null = null

/** Lazy-load the (large) Plotly bundle once; subsequent calls reuse the instance. */
export function loadPlotly(): Promise<PlotlyModule> {
  if (!plotlyPromise) {
    plotlyPromise = import('plotly.js-dist-min').then((mod) => {
      const m = (mod as unknown as { default?: unknown }).default ?? mod
      return m as PlotlyModule
    })
  }
  return plotlyPromise
}

export interface PlotProps {
  data: Data[]
  layout?: Partial<Layout>
  config?: Partial<Config>
  className?: string
  style?: CSSProperties
  /** Accessible name announced by screen readers. */
  ariaLabel?: string
  /** Called once after the first successful render (graph div is interactive). */
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
}

function axisTitle(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'text' in value) {
    const text = (value as { text?: unknown }).text
    if (typeof text === 'string') return text
  }
  return ''
}

interface NumericStats {
  count: number
  min: number
  max: number
}

function collectStats(value: unknown, stats?: NumericStats | null): NumericStats | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (!stats) return { count: 1, min: value, max: value }
    stats.count += 1
    stats.min = Math.min(stats.min, value)
    stats.max = Math.max(stats.max, value)
    return stats
  }
  if (Array.isArray(value)) {
    let result = stats ?? null
    for (const item of value) result = collectStats(item, result)
    return result
  }
  return stats ?? null
}

function summarizePlot(data: Data[], label: string, d: ReturnType<typeof useI18n>['d'], lang: string): string {
  if (data.length === 0) return `${d.common.chartSummary}: ${label}`
  const nf = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { maximumFractionDigits: 3 })
  const fmt = (value: number) => nf.format(value)
  const parts = data.slice(0, 4).map((raw, index) => {
    const trace = raw as { name?: string; x?: unknown; y?: unknown; z?: unknown; type?: string }
    const name = trace.name?.trim() || `${d.common.chartSeries} ${index + 1}`
    const x = collectStats(trace.x)
    const y = collectStats(trace.y)
    const z = collectStats(trace.z)
    if (z) {
      return `${name}: ${z.count} ${d.common.chartCells}, ${d.common.chartRange} ${fmt(z.min)}–${fmt(z.max)}`
    }
    if (y) {
      const xPart = x ? `x ${fmt(x.min)}–${fmt(x.max)}, ` : ''
      return `${name}: ${y.count} ${d.common.chartPoints}, ${xPart}y ${fmt(y.min)}–${fmt(y.max)}`
    }
    if (x) {
      return `${name}: ${x.count} ${d.common.chartPoints}, ${d.common.chartRange} ${fmt(x.min)}–${fmt(x.max)}`
    }
    return `${name}: ${trace.type ?? d.common.chartSeries}`
  })
  const remaining = data.length > 4 ? ` (+${data.length - 4})` : ''
  return `${d.common.chartSummary}: ${parts.join('; ')}${remaining}. ${label}`
}

/**
 * Thin React wrapper around plotly.js-dist-min.
 * - Plotly.react() for efficient in-place updates (no re-mount on data change)
 * - ResizeObserver keeps charts responsive inside flex/grid layouts
 * - purge() on unmount only
 */
export function Plot({ data, layout, config, className, style, ariaLabel, onReady }: PlotProps) {
  const { d, lang } = useI18n()
  const descId = useId()
  const ref = useRef<HTMLDivElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const onReadyRef = useRef(onReady)
  const notifiedRef = useRef(false)

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const resetZoom = () => {
    const el = ref.current
    if (!el) return
    void loadPlotly()
      .then((plotly) =>
        plotly.relayout(el, {
          'xaxis.autorange': true,
          'yaxis.autorange': true,
          'xaxis2.autorange': true,
          'yaxis2.autorange': true,
        }),
      )
      .catch(() => undefined)
  }

  const toggleFullscreen = () => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      try {
        const request = el.requestFullscreen?.()
        if (request) void request.catch(() => undefined)
      } catch {
        /* fullscreen unavailable */
      }
    }
  }

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let disposed = false
    let observer: ResizeObserver | null = null
    void loadPlotly().then((plotly) => {
      if (disposed) return
      setReady(true)
      observer = new ResizeObserver(() => {
        if (!el.isConnected || el.getClientRects().length === 0) return
        try {
          const resized = plotly.Plots.resize(el) as unknown as Promise<unknown> | undefined
          if (resized && typeof resized.catch === 'function') void resized.catch(() => undefined)
        } catch {
          /* element detached or hidden */
        }
      })
      observer.observe(el)
    })
    return () => {
      disposed = true
      observer?.disconnect()
      void loadPlotly().then((plotly) => {
        try {
          plotly.purge(el)
        } catch {
          /* already removed */
        }
      })
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    void loadPlotly().then((plotly) => {
      void plotly.react(
        el,
        data,
        { autosize: true, ...layout },
        { displaylogo: false, responsive: true, modeBarButtonsToRemove: ['lasso2d', 'select2d'], ...config },
      ).then(() => {
        if (!notifiedRef.current && onReadyRef.current) {
          notifiedRef.current = true
          onReadyRef.current(el, plotly)
        }
      }).catch(() => undefined)
    })
  }, [ready, data, layout, config])

  const axisLabel = [
    axisTitle(layout?.yaxis && !Array.isArray(layout.yaxis) ? layout.yaxis.title : undefined),
    axisTitle(layout?.xaxis && !Array.isArray(layout.xaxis) ? layout.xaxis.title : undefined),
  ]
    .filter(Boolean)
    .join(' versus ')
  const label = ariaLabel ?? (axisLabel || d.common.chartAria)
  const summary = useMemo(() => summarizePlot(data, label, d, lang), [data, label, d, lang])

  return (
    <div ref={wrapRef} className="gs-plot group relative">
      <div ref={ref} role="img" aria-label={label} aria-describedby={descId} tabIndex={0} className={className} style={{ minHeight: 200, ...style }} />
      <p id={descId} className="sr-only print:not-sr-only print:mt-2 print:text-xs print:leading-relaxed print:text-gs-mist">{summary}</p>
      <button
        type="button"
        onClick={resetZoom}
        className="gs-plot-reset no-print absolute right-14 bottom-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-gs-panel/90 text-gs-mist shadow-sm transition-opacity hover:text-gs-cyan focus-visible:text-gs-cyan sm:right-11 sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        aria-label={d.common.resetZoom}
        title={d.common.resetZoom}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M3 8a5 5 0 1 0 1.5-3.6M3 3v3h3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="gs-plot-fullscreen no-print absolute right-2 bottom-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-gs-panel/90 text-gs-mist shadow-sm transition-opacity hover:text-gs-cyan focus-visible:text-gs-cyan sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        aria-label={fullscreen ? d.common.exitFullscreen : d.common.openFullscreen}
        title={fullscreen ? d.common.exitFullscreen : d.common.openFullscreen}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          {fullscreen ? <path d="M6 2v4H2M10 14v-4h4" /> : <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />}
        </svg>
      </button>
    </div>
  )
}
