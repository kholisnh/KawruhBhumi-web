import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Config, Data, Layout } from 'plotly.js'

export type PlotlyModule = {
  react: (el: HTMLElement, data: Data[], layout: Partial<Layout>, config?: Partial<Config>) => Promise<unknown>
  purge: (el: HTMLElement) => void
  Plots: { resize: (el: HTMLElement) => void }
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

/**
 * Thin React wrapper around plotly.js-dist-min.
 * - Plotly.react() for efficient in-place updates (no re-mount on data change)
 * - ResizeObserver keeps charts responsive inside flex/grid layouts
 * - purge() on unmount only
 */
export function Plot({ data, layout, config, className, style, ariaLabel, onReady }: PlotProps) {
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
  const label = ariaLabel ?? (axisLabel || 'Interactive scientific chart')

  return (
    <div ref={wrapRef} className="gs-plot group relative">
      <div ref={ref} role="img" aria-label={label} tabIndex={0} className={className} style={{ minHeight: 200, ...style }} />
      <button
        type="button"
        onClick={toggleFullscreen}
        className="gs-plot-fullscreen no-print absolute right-2 bottom-2 z-10 rounded-lg border border-black/10 bg-gs-panel/90 p-1.5 text-gs-mist shadow-sm transition-opacity hover:text-gs-cyan focus-visible:text-gs-cyan sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        aria-label={fullscreen ? 'Exit chart fullscreen' : 'Open chart fullscreen'}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen chart'}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          {fullscreen ? <path d="M6 2v4H2M10 14v-4h4" /> : <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />}
        </svg>
      </button>
    </div>
  )
}
