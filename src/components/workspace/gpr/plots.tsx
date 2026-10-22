import { useMemo } from 'react'
import type { Data, Layout } from 'plotly.js'
import { useI18n } from '../../../i18n'
import type { GprResult } from '../../../sim/gpr/types'
import { Plot, type PlotlyGraphDiv, type PlotlyModule } from '../../charts/Plot'
import { RADARGRAM_COLORSCALE, baseLayout, chartColors, MONO_FONT } from '../../charts/plotTheme'
import { decimateRadargram } from './decimate'

interface RadargramPlotProps {
  result: GprResult
  showGrid: boolean
  showUnits: boolean
  onSelectTrace?: (x: number) => void
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  height?: number
}

export function RadargramPlot({ result, showGrid, showUnits, onSelectTrace, onReady, height = 380 }: RadargramPlotProps) {
  const { d } = useI18n()
  const t = d.ws

  const { data, layout } = useMemo(() => {
    const dec = decimateRadargram(result)
    const heat: Data = {
      x: dec.x,
      y: dec.t,
      z: dec.z,
      type: 'heatmap',
      colorscale: RADARGRAM_COLORSCALE,
      zmin: -1,
      zmax: 1,
      colorbar: {
        title: { text: showUnits ? d.common.au : '', side: 'right', font: { size: 10, family: MONO_FONT, color: chartColors.mist } },
        thickness: 10,
        len: 0.9,
        tickfont: { family: MONO_FONT, size: 9.5, color: chartColors.mist },
        outlinewidth: 0,
      },
      hovertemplate: `x %{x:.3g} m<br>t %{y:.1f} ns<br>amp %{z:.3f}<extra></extra>`,
      name: t.radargram,
    }
    const lay = baseLayout({
      margin: { l: 56, r: 40, t: 8, b: 42 },
      showlegend: false,
      xaxis: {
        title: { text: `${t.distance}${showUnits ? ' [m]' : ''}` },
        gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)',
        zeroline: false,
      },
      yaxis: {
        title: { text: `${t.time}${showUnits ? ' [ns]' : ''}` },
        autorange: 'reversed' as const,
        gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)',
        zeroline: false,
      },
    }) as Partial<Layout>
    return { data: [heat] as Data[], layout: lay }
  }, [result, showGrid, showUnits, t, d])

  return (
    <Plot
      data={data}
      layout={layout}
      style={{ height }}
      onReady={(el, plotly) => {
        if (onSelectTrace) {
          const gd = el as PlotlyGraphDiv
          gd.on?.('plotly_click', (ev) => {
            const x = ev.points?.[0]?.x
            if (typeof x === 'number') onSelectTrace(x)
          })
        }
        onReady?.(el, plotly)
      }}
    />
  )
}

interface AScanPlotProps {
  result: GprResult
  traceIndex: number
  showGrid: boolean
  showUnits: boolean
  height?: number
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
}

export function AScanPlot({ result, traceIndex, showGrid, showUnits, height = 240, onReady }: AScanPlotProps) {
  const { d } = useI18n()
  const t = d.ws

  const { data, layout } = useMemo(() => {
    const idx = Math.min(Math.max(traceIndex, 0), result.x.length - 1)
    const trace = result.radargram[idx]
    const line: Data = {
      x: result.tNs,
      y: trace,
      type: 'scatter',
      mode: 'lines',
      line: { color: chartColors.cyan, width: 1.4 },
      name: `x = ${result.x[idx].toFixed(2)} m`,
      hovertemplate: `t %{x:.1f} ns<br>amp %{y:.3f}<extra></extra>`,
    }
    const shapes: Partial<Layout>['shapes'] = []
    for (const itf of result.interfaces) {
      if (itf.twtNs <= result.diagnostics.timeWindowNs) {
        shapes.push({
          type: 'line',
          x0: itf.twtNs,
          x1: itf.twtNs,
          y0: 0,
          y1: 1,
          yref: 'paper',
          line: { color: chartColors.ice, width: 1, dash: 'dot' },
          opacity: 0.5,
        })
      }
    }
    for (const tg of result.targets) {
      if (tg.apexTNs <= result.diagnostics.timeWindowNs) {
        shapes.push({
          type: 'line',
          x0: tg.apexTNs,
          x1: tg.apexTNs,
          y0: 0,
          y1: 1,
          yref: 'paper',
          line: { color: chartColors.amber, width: 1, dash: 'dash' },
          opacity: 0.6,
        })
      }
    }
    const lay = baseLayout({
      margin: { l: 50, r: 12, t: 6, b: 40 },
      showlegend: false,
      shapes,
      xaxis: {
        title: { text: `${t.time}${showUnits ? ' [ns]' : ''}` },
        gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: { text: showUnits ? d.common.au : '' },
        gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)',
        zeroline: true,
        range: [-1.05, 1.05],
      },
    }) as Partial<Layout>
    return { data: [line] as Data[], layout: lay }
  }, [result, traceIndex, showGrid, showUnits, t, d])

  return <Plot data={data} layout={layout} style={{ height }} onReady={onReady} />
}
