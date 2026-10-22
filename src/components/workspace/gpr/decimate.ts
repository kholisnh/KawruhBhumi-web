import type { GprResult } from '../../../sim/gpr/types'

export interface RadargramPlotData {
  /** Trace positions [m] (decimated). */
  x: number[]
  /** Travel times [ns] (decimated). */
  t: number[]
  /** Amplitude matrix z[timeIdx][traceIdx] for Plotly heatmap. */
  z: number[][]
  traceStride: number
  sampleStride: number
}

/**
 * Bounds the amount of data sent to the renderer for large models.
 * The underlying solver result is never modified — only the plot view.
 */
export function decimateRadargram(result: GprResult, maxTraces = 800, maxSamples = 1200): RadargramPlotData {
  const nTraces = result.x.length
  const nSamples = result.tNs.length
  const traceStride = Math.max(1, Math.ceil(nTraces / maxTraces))
  const sampleStride = Math.max(1, Math.ceil(nSamples / maxSamples))

  const x: number[] = []
  for (let i = 0; i < nTraces; i += traceStride) x.push(result.x[i])
  const t: number[] = []
  for (let s = 0; s < nSamples; s += sampleStride) t.push(result.tNs[s])

  const z: number[][] = []
  for (let s = 0; s < nSamples; s += sampleStride) {
    const row: number[] = []
    for (let i = 0; i < nTraces; i += traceStride) row.push(result.radargram[i][s])
    z.push(row)
  }

  return { x, t, z, traceStride, sampleStride }
}
