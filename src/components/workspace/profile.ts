import type { Data, Layout } from 'plotly.js'
import { baseLayout, chartColors, MONO_FONT } from '../charts/plotTheme'

/** Cycled body/trace colours for the anomaly workspaces. */
export const BODY_COLORS = ['#3664F4', '#60CBFF', '#E85353', '#2E9FBF', '#252525', '#B23A3A']

export const SEISMIC_COLORSCALE: Array<[number, string]> = [
  [0, '#E85353'],
  [0.34, '#F3B9B9'],
  [0.5, '#FFFFFF'],
  [0.66, '#B9C8F8'],
  [1, '#3664F4'],
]

/** Diverging map colorscales (low → neutral → high). */
export const MAG_MAP_COLORSCALE: Array<[number, string]> = [
  [0, '#1F3E9E'],
  [0.28, '#6C8CF3'],
  [0.5, '#FFFFFF'],
  [0.72, '#EE8B8B'],
  [1, '#B32727'],
]

export const GRV_MAP_COLORSCALE: Array<[number, string]> = [
  [0, '#1F3E9E'],
  [0.28, '#6C8CF3'],
  [0.5, '#FFFFFF'],
  [0.72, '#EE8B8B'],
  [1, '#B32727'],
]

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export interface LineSeriesSpec {
  name: string
  y: number[]
  color: string
  width?: number
  dash?: 'solid' | 'dot' | 'dash' | 'longdash'
  opacity?: number
  fillToZero?: boolean
}

export function lineFigure(
  x: number[],
  series: LineSeriesSpec[],
  opts: { xTitle: string; yTitle: string; showGrid: boolean; hoverX?: string; hoverY?: string; showLegend?: boolean },
): { data: Data[]; layout: Partial<Layout> } {
  const data: Data[] = series.map((s) => ({
    x,
    y: s.y,
    type: 'scatter',
    mode: 'lines',
    name: s.name,
    line: { color: s.color, width: s.width ?? 2, dash: s.dash ?? 'solid' },
    opacity: s.opacity ?? 1,
    fill: s.fillToZero ? 'tozeroy' : 'none',
    fillcolor: s.fillToZero ? hexToRgba(s.color, 0.1) : undefined,
    hovertemplate: `%{x:.4g}${opts.hoverX ?? ''} · %{y:.4g}${opts.hoverY ?? ''}<extra>${s.name}</extra>`,
  }))
  const layout = baseLayout({
    margin: { l: 60, r: 16, t: 10, b: 44 },
    showlegend: opts.showLegend ?? series.length > 1,
    legend: { orientation: 'h', x: 0, y: 1.12, font: { size: 10.5 } },
    xaxis: { title: { text: opts.xTitle }, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
    yaxis: { title: { text: opts.yTitle }, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: true, zerolinecolor: chartColors.gridSoft },
    hovermode: 'x unified',
  }) as Partial<Layout>
  return { data, layout }
}

export function traceFigure(
  tMs: number[],
  trace: number[],
  opts: { xTitle: string; yTitle: string; showGrid: boolean; color: string },
): { data: Data[]; layout: Partial<Layout> } {
  const data: Data[] = [
    {
      x: trace,
      y: tMs,
      type: 'scatter',
      mode: 'lines',
      name: opts.yTitle,
      line: { color: opts.color, width: 1.6 },
      fill: 'tozerox',
      fillcolor: hexToRgba(opts.color, 0.14),
      hovertemplate: `amp %{x:.3f} · t %{y:.1f} ms<extra></extra>`,
    },
  ]
  const layout = baseLayout({
    margin: { l: 56, r: 16, t: 10, b: 44 },
    showlegend: false,
    xaxis: { title: { text: opts.xTitle }, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: true, zerolinecolor: chartColors.gridSoft },
    yaxis: { title: { text: opts.yTitle }, autorange: 'reversed' as const, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
  }) as Partial<Layout>
  return { data, layout }
}

export interface AnomalyMapOpts {
  /** Survey-grid stations along the profile [m]. */
  x: number[]
  /** Survey lines across the profile [m] (centred on 0). */
  y: number[]
  /** Matrix [line][station] of the noise-free anomaly. */
  values: number[][]
  colorscale: Array<[number, string]>
  xTitle: string
  yTitle: string
  showGrid: boolean
  showStations: boolean
  /** Maximum-|anomaly| node of the grid (star marker + annotation). */
  peak: { x: number; y: number; value: number } | null
  peakLabel: string
}

/** Filled-contour + labelled-contour anomaly map on the survey grid. */
export function anomalyMapFigure(opts: AnomalyMapOpts): { data: Data[]; layout: Partial<Layout> } {
  const { x, y, values } = opts
  let minV = Infinity
  let maxV = -Infinity
  for (const row of values) {
    for (const v of row) {
      if (v < minV) minV = v
      if (v > maxV) maxV = v
    }
  }
  const lim = Math.max(Math.abs(minV), Math.abs(maxV), 1e-12)

  const data: Data[] = [
    {
      x,
      y,
      z: values,
      type: 'contour',
      contours: { coloring: 'heatmap', showlines: false },
      colorscale: opts.colorscale,
      zmin: -1.35 * lim,
      zmax: 1.35 * lim,
      colorbar: {
        thickness: 10,
        len: 0.9,
        tickfont: { family: MONO_FONT, size: 9.5, color: chartColors.mist },
        outlinewidth: 0,
      },
      hovertemplate: `x %{x:.3g} m · y %{y:.3g} m · %{z:.4g}<extra></extra>`,
      name: 'map',
    },
    {
      x,
      y,
      z: values,
      type: 'contour',
      contours: { coloring: 'lines', showlabels: true, labelfont: { family: MONO_FONT, size: 9 } },
      line: { color: 'rgba(244,247,251,0.30)', width: 0.8 },
      showscale: false,
      hoverinfo: 'skip',
    },
  ]

  if (minV < 0 && maxV > 0) {
    data.push({
      x,
      y,
      z: values,
      type: 'contour',
      contours: { coloring: 'lines', start: 0, end: 0, size: 1 },
      line: { color: 'rgba(244,247,251,0.85)', width: 1.6 },
      showscale: false,
      hoverinfo: 'skip',
    })
  }

  if (opts.showStations && x.length * y.length <= 20000) {
    const sampleStep = Math.max(1, Math.ceil(Math.sqrt((x.length * y.length) / 2500)))
    const sx: number[] = []
    const sy: number[] = []
    for (let j = 0; j < y.length; j += sampleStep) {
      for (let i = 0; i < x.length; i += sampleStep) {
        sx.push(x[i])
        sy.push(y[j])
      }
    }
    data.push({
      x: sx,
      y: sy,
      type: 'scatter',
      mode: 'markers',
      marker: { size: 2.4, color: 'rgba(244,247,251,0.28)' },
      hoverinfo: 'skip',
      showlegend: false,
    })
  }

  data.push({
    x: [x[0], x[x.length - 1]],
    y: [0, 0],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'rgba(244,247,251,0.55)', width: 1.2, dash: 'dash' },
    hoverinfo: 'skip',
    showlegend: false,
  })

  const annotations: Partial<Layout>['annotations'] = []
  if (opts.peak) {
    data.push({
      x: [opts.peak.x],
      y: [opts.peak.y],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 12, symbol: 'star', color: chartColors.ice, line: { color: '#FFFFFF', width: 1.5 } },
      hovertemplate: `peak %{x:.3g} m · %{y:.3g} m<extra></extra>`,
      showlegend: false,
    })
    annotations.push({
      x: opts.peak.x,
      y: opts.peak.y,
      text: opts.peakLabel,
      showarrow: true,
      arrowhead: 2,
      arrowcolor: chartColors.mist,
      ax: 40,
      ay: -28,
      font: { family: MONO_FONT, size: 10.5, color: chartColors.ice },
      bgcolor: '#FFFFFF',
      bordercolor: 'rgba(37,37,37,0.18)',
      borderwidth: 1,
    })
  }

  const layout = baseLayout({
    margin: { l: 56, r: 16, t: 10, b: 44 },
    showlegend: false,
    xaxis: { title: { text: opts.xTitle }, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
    yaxis: { title: { text: opts.yTitle }, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
    annotations,
  }) as Partial<Layout>
  return { data, layout }
}

export interface NmoCurve {
  t0Ms: number
  vrms: number
  color: string
  name: string
}

export function gatherFigure(
  tMs: number[],
  offsetsM: number[],
  gather: number[][],
  curves: NmoCurve[],
  opts: { xTitle: string; yTitle: string; showGrid: boolean; showUnits: boolean },
): { data: Data[]; layout: Partial<Layout> } {
  const zT = tMs.map((_, s) => offsetsM.map((_, o) => gather[o][s]))
  const heat: Data = {
    x: offsetsM,
    y: tMs,
    z: zT,
    type: 'heatmap',
    colorscale: SEISMIC_COLORSCALE,
    zmin: -1,
    zmax: 1,
    colorbar: {
      thickness: 10,
      len: 0.9,
      tickfont: { family: MONO_FONT, size: 9.5, color: chartColors.mist },
      outlinewidth: 0,
    },
    hovertemplate: `offset %{x:.0f} m · t %{y:.1f} ms · amp %{z:.3f}<extra></extra>`,
    name: opts.yTitle,
  }
  const curveData: Data[] = curves.map((c) => ({
    x: offsetsM,
    y: offsetsM.map((x) => Math.sqrt(c.t0Ms ** 2 + ((x * 1000) / c.vrms) ** 2)),
    type: 'scatter',
    mode: 'lines',
    name: c.name,
    line: { color: c.color, width: 1.4, dash: 'dot' },
    hoverinfo: 'skip',
  }))
  const layout = baseLayout({
    margin: { l: 56, r: 46, t: 10, b: 44 },
    showlegend: curves.length > 0,
    legend: { orientation: 'h', x: 0, y: 1.12, font: { size: 10.5 } },
    xaxis: { title: { text: opts.xTitle }, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
    yaxis: { title: { text: opts.yTitle }, autorange: 'reversed' as const, gridcolor: opts.showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
  }) as Partial<Layout>
  return { data: [heat, ...curveData], layout }
}
