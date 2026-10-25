import type { Data, Layout } from 'plotly.js'
import type { HvsrInversionResult, HvsrModel, HvsrResult } from '../../../sim/hvsr/types'
import { totalDepth } from '../../../sim/hvsr/model'
import { Plot } from '../../charts/Plot'
import { baseLayout, chartColors, MONO_FONT, SANS_FONT } from '../../charts/plotTheme'

const ACCENT = '#7A5AF8'
const OBSERVED = '#3664F4'
const BEST = '#E85353'
const BAND = 'rgba(122,90,248,0.16)'

function logTicks(min: number, max: number): number[] {
  return [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50].filter((v) => v >= min * 0.99 && v <= max * 1.01)
}

function curveLayout(xTitle: string, yTitle: string, ticks: number[]): Partial<Layout> {
  const base = baseLayout()
  return {
    ...base,
    margin: { l: 58, r: 18, t: 34, b: 46 },
    xaxis: {
      ...(base.xaxis as object),
      type: 'log',
      tickmode: 'array',
      tickvals: ticks,
      ticktext: ticks.map((v) => (v < 1 ? v.toFixed(1) : String(v))),
      minor: { ticks: '' },
      title: { text: xTitle, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
    },
    yaxis: {
      ...(base.yaxis as object),
      title: { text: yTitle, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
      rangemode: 'tozero',
    },
    hovermode: 'x unified',
  }
}

function profileLayout(xTitle: string, yTitle: string): Partial<Layout> {
  const base = baseLayout()
  return {
    ...base,
    margin: { l: 58, r: 18, t: 34, b: 46 },
    xaxis: {
      ...(base.xaxis as object),
      title: { text: xTitle, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
      rangemode: 'tozero',
    },
    yaxis: {
      ...(base.yaxis as object),
      title: { text: yTitle, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
      autorange: 'reversed',
    },
  }
}

function stepProfile(model: HvsrModel, maxDepth: number): { x: number[]; y: number[] } {
  const x: number[] = []
  const y: number[] = []
  let top = 0
  model.layers.forEach((layer, i) => {
    const isHalf = i === model.layers.length - 1
    const bottom = isHalf ? maxDepth : top + Math.max(layer.thickness, 0.001)
    x.push(layer.vs, layer.vs)
    y.push(top, bottom)
    top = bottom
  })
  return { x, y }
}

export function HvsrCurvePlot({ result, title, xTitle, yTitle, f0Label }: { result: HvsrResult; title: string; xTitle: string; yTitle: string; f0Label: string }) {
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      name: title,
      x: result.frequencies,
      y: result.hvsr,
      line: { color: ACCENT, width: 2.4 },
      hovertemplate: '%{x:.2f} Hz<br>H/V = %{y:.2f}<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: f0Label,
      x: [result.diagnostics.f0, result.diagnostics.f0],
      y: [0, Math.max(result.diagnostics.a0 * 1.06, 1)],
      line: { color: BEST, width: 1.5, dash: 'dash' },
      hoverinfo: 'skip',
    },
    {
      type: 'scatter',
      mode: 'markers',
      name: f0Label,
      x: [result.diagnostics.f0],
      y: [result.diagnostics.a0],
      marker: { color: BEST, size: 9, line: { color: '#FFFFFF', width: 1.5 } },
      hovertemplate: `f0 = %{x:.2f} Hz<br>A0 = %{y:.2f}<extra></extra>`,
      showlegend: false,
    },
  ]
  return <Plot data={data} layout={curveLayout(xTitle, yTitle, logTicks(result.frequencies[0], result.frequencies[result.frequencies.length - 1]))} className="w-full" style={{ minHeight: 320 }} />
}

export function HvsrProfilePlot({ model, title, xTitle, yTitle }: { model: HvsrModel; title: string; xTitle: string; yTitle: string }) {
  const maxDepth = Math.max(10, totalDepth(model) * 1.12)
  const { x, y } = stepProfile(model, maxDepth)
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      name: title,
      x,
      y,
      line: { color: ACCENT, width: 2.5, shape: 'hv' },
      hovertemplate: '%{x:.0f} m/s<br>%{y:.1f} m<extra></extra>',
    },
  ]
  return <Plot data={data} layout={profileLayout(xTitle, yTitle)} className="w-full" style={{ minHeight: 300 }} />
}

export function HvsrInversionCurvePlot({
  inversion,
  observedLabel,
  predictedLabel,
  xTitle,
  yTitle,
}: {
  inversion: HvsrInversionResult
  observedLabel: string
  predictedLabel: string
  xTitle: string
  yTitle: string
}) {
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: observedLabel,
      x: inversion.frequencies,
      y: inversion.observed,
      line: { color: OBSERVED, width: 1.4 },
      marker: { size: 3, color: OBSERVED },
      hovertemplate: '%{x:.2f} Hz<br>%{y:.2f}<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: predictedLabel,
      x: inversion.frequencies,
      y: inversion.predicted,
      line: { color: BEST, width: 2.4 },
      hovertemplate: '%{x:.2f} Hz<br>%{y:.2f}<extra></extra>',
    },
  ]
  return <Plot data={data} layout={curveLayout(xTitle, yTitle, logTicks(inversion.frequencies[0], inversion.frequencies[inversion.frequencies.length - 1]))} className="w-full" style={{ minHeight: 300 }} />
}

export function HvsrInversionProfilePlot({
  inversion,
  bandLabel,
  medianLabel,
  bestLabel,
  xTitle,
  yTitle,
}: {
  inversion: HvsrInversionResult
  bandLabel: string
  medianLabel: string
  bestLabel: string
  xTitle: string
  yTitle: string
}) {
  const maxDepth = Math.max(...inversion.depth, 10)
  const best = stepProfile(inversion.best, maxDepth)
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      name: bandLabel,
      x: inversion.vsP05,
      y: inversion.depth,
      line: { color: 'rgba(122,90,248,0)', width: 0 },
      hoverinfo: 'skip',
      showlegend: false,
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: bandLabel,
      x: inversion.vsP95,
      y: inversion.depth,
      fill: 'tonexty',
      fillcolor: BAND,
      line: { color: 'rgba(122,90,248,0)', width: 0 },
      hoverinfo: 'skip',
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: medianLabel,
      x: inversion.vsP50,
      y: inversion.depth,
      line: { color: ACCENT, width: 2 },
      hovertemplate: '%{x:.0f} m/s<br>%{y:.1f} m<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: bestLabel,
      x: best.x,
      y: best.y,
      line: { color: BEST, width: 2.2, dash: 'dot', shape: 'hv' },
      hovertemplate: '%{x:.0f} m/s<br>%{y:.1f} m<extra></extra>',
    },
  ]
  return <Plot data={data} layout={profileLayout(xTitle, yTitle)} className="w-full" style={{ minHeight: 340 }} />
}

export function csvHvsr(result: HvsrResult): string {
  const lines = ['frequency_hz,hvsr,sh_horizontal']
  result.frequencies.forEach((f, i) => lines.push(`${f.toFixed(5)},${result.hvsr[i].toFixed(6)},${result.hHorizontal[i].toFixed(6)}`))
  return lines.join('\n')
}

export function csvModel(model: HvsrModel): string {
  const lines = ['layer,thickness_m,vs_m_s']
  model.layers.forEach((layer, i) => lines.push(`${i + 1},${layer.thickness},${layer.vs}`))
  return lines.join('\n')
}

export const hvsrChartFont = MONO_FONT

export interface HvsrPinnedCurve {
  frequencies: number[]
  hvsr: number[]
  f0: number
  a0: number
}

export interface HvsrSweepPoint {
  value: number
  f0: number
  a0: number
}

export function HvsrComparePlot({
  current,
  pinned,
  currentLabel,
  pinnedLabel,
  xTitle,
  yTitle,
}: {
  current: HvsrResult
  pinned: HvsrPinnedCurve
  currentLabel: string
  pinnedLabel: string
  xTitle: string
  yTitle: string
}) {
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      name: currentLabel,
      x: current.frequencies,
      y: current.hvsr,
      line: { color: ACCENT, width: 2.4 },
      hovertemplate: '%{x:.2f} Hz<br>H/V = %{y:.2f}<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: pinnedLabel,
      x: pinned.frequencies,
      y: pinned.hvsr,
      line: { color: OBSERVED, width: 2, dash: 'dash' },
      hovertemplate: '%{x:.2f} Hz<br>H/V = %{y:.2f}<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'markers',
      name: currentLabel,
      x: [current.diagnostics.f0],
      y: [current.diagnostics.a0],
      marker: { color: ACCENT, size: 8, line: { color: '#FFFFFF', width: 1.5 } },
      hovertemplate: 'f0 = %{x:.2f} Hz<br>A0 = %{y:.2f}<extra></extra>',
      showlegend: false,
    },
    {
      type: 'scatter',
      mode: 'markers',
      name: pinnedLabel,
      x: [pinned.f0],
      y: [pinned.a0],
      marker: { color: OBSERVED, size: 8, symbol: 'diamond', line: { color: '#FFFFFF', width: 1.5 } },
      hovertemplate: 'f0 = %{x:.2f} Hz<br>A0 = %{y:.2f}<extra></extra>',
      showlegend: false,
    },
  ]
  return (
    <Plot
      data={data}
      layout={curveLayout(xTitle, yTitle, logTicks(current.frequencies[0], current.frequencies[current.frequencies.length - 1]))}
      className="w-full"
      ariaLabel={`${currentLabel} and ${pinnedLabel} H/V curves`}
      style={{ minHeight: 300 }}
    />
  )
}

export function HvsrSweepPlot({
  points,
  xTitle,
  f0Label,
  a0Label,
}: {
  points: HvsrSweepPoint[]
  xTitle: string
  f0Label: string
  a0Label: string
}) {
  const base = baseLayout()
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: f0Label,
      x: points.map((p) => p.value),
      y: points.map((p) => p.f0),
      line: { color: ACCENT, width: 2.2 },
      marker: { size: 5, color: ACCENT },
      hovertemplate: '%{x:.3g}<br>f0 = %{y:.3f} Hz<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: a0Label,
      x: points.map((p) => p.value),
      y: points.map((p) => p.a0),
      yaxis: 'y2',
      line: { color: BEST, width: 2.2, dash: 'dot' },
      marker: { size: 5, color: BEST },
      hovertemplate: '%{x:.3g}<br>A0 = %{y:.3f}<extra></extra>',
    },
  ]
  return (
    <Plot
      data={data}
      layout={{
        ...base,
        margin: { l: 58, r: 58, t: 34, b: 46 },
        xaxis: {
          ...(base.xaxis as object),
          title: { text: xTitle, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
        },
        yaxis: {
          ...(base.yaxis as object),
          title: { text: f0Label, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
          rangemode: 'tozero',
        },
        yaxis2: {
          overlaying: 'y',
          side: 'right',
          title: { text: a0Label, font: { family: SANS_FONT, size: 12, color: chartColors.mist } },
          rangemode: 'tozero',
          showgrid: false,
          tickfont: { family: MONO_FONT, size: 12, color: chartColors.mist },
        },
      }}
      className="w-full"
      ariaLabel={`${f0Label} and ${a0Label} sensitivity sweep`}
      style={{ minHeight: 300 }}
    />
  )
}

export function HvsrChallengePlot({
  target,
  current,
  targetLabel,
  currentLabel,
  xTitle,
  yTitle,
}: {
  target: HvsrResult
  current: number[] | null
  targetLabel: string
  currentLabel: string
  xTitle: string
  yTitle: string
}) {
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      name: targetLabel,
      x: target.frequencies,
      y: target.hvsr,
      line: { color: BEST, width: 2.6 },
      hovertemplate: '%{x:.2f} Hz<br>H/V = %{y:.2f}<extra></extra>',
    },
  ]
  if (current) {
    data.push({
      type: 'scatter',
      mode: 'lines',
      name: currentLabel,
      x: target.frequencies,
      y: current,
      line: { color: ACCENT, width: 2, dash: 'dash' },
      hovertemplate: '%{x:.2f} Hz<br>H/V = %{y:.2f}<extra></extra>',
    })
  }
  return (
    <Plot
      data={data}
      layout={curveLayout(xTitle, yTitle, logTicks(target.frequencies[0], target.frequencies[target.frequencies.length - 1]))}
      className="w-full"
      ariaLabel={`${targetLabel} and ${currentLabel} challenge curves`}
      style={{ minHeight: 300 }}
    />
  )
}
