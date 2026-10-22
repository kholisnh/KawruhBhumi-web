import type { Config, Layout } from 'plotly.js'

export const chartColors = {
  navy: '#FFFFFF',
  panel: '#F6F8FC',
  deep: '#EEF2F9',
  raised: '#E6EBF5',
  ice: '#252525',
  mist: '#5C6470',
  cyan: '#3664F4',
  teal: '#2E9FBF',
  amber: '#E85353',
  violet: '#60CBFF',
  blue: '#252525',
  danger: '#C93232',
  grid: 'rgba(37,37,37,0.10)',
  gridSoft: 'rgba(37,37,37,0.06)',
  zero: 'rgba(37,37,37,0.24)',
  line: 'rgba(37,37,37,0.30)',
} as const

export const MONO_FONT = 'JetBrains Mono, ui-monospace, monospace'
export const SANS_FONT = 'Cabin, ui-sans-serif, system-ui, sans-serif'

/** Diverging colorscale for signed seismic/GPR amplitudes (red negative → white zero → blue positive). */
export const RADARGRAM_COLORSCALE: Array<[number, string]> = [
  [0, '#E85353'],
  [0.32, '#F3B9B9'],
  [0.5, '#FFFFFF'],
  [0.68, '#B9C8F8'],
  [1, '#3664F4'],
]

/** Diverging colorscale for anomaly maps (blue low → white zero → red high). */
export const ANOMALY_COLORSCALE: Array<[number, string]> = [
  [0, '#1F3E9E'],
  [0.25, '#6C8CF3'],
  [0.5, '#FFFFFF'],
  [0.75, '#EE8B8B'],
  [1, '#B32727'],
]

export const defaultConfig: Partial<Config> = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
}

export function baseLayout(overrides: Partial<Layout> = {}): Partial<Layout> {
  const axisBase = {
    gridcolor: chartColors.grid,
    zerolinecolor: chartColors.zero,
    linecolor: chartColors.line,
    tickcolor: chartColors.line,
    tickfont: { family: MONO_FONT, size: 10.5, color: chartColors.mist },
    titlefont: { family: SANS_FONT, size: 12, color: chartColors.mist },
    automargin: true,
  }
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: SANS_FONT, color: chartColors.mist, size: 12 },
    margin: { l: 58, r: 18, t: 28, b: 46 },
    colorway: [chartColors.cyan, chartColors.amber, chartColors.violet, chartColors.teal, chartColors.blue],
    xaxis: { ...axisBase },
    yaxis: { ...axisBase },
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.02,
      x: 0,
      font: { size: 11, color: chartColors.mist },
      bgcolor: 'rgba(0,0,0,0)',
    },
    hoverlabel: {
      bgcolor: '#FFFFFF',
      bordercolor: 'rgba(54,100,244,0.35)',
      font: { family: MONO_FONT, size: 11, color: chartColors.ice },
    },
    ...overrides,
  }
}
