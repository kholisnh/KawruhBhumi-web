import { mulberry32 } from '../core/rng'
import { totalDepth } from './model'
import type { HvsrDiagnostics, HvsrInput, HvsrLayer, HvsrResult } from './types'

interface Complex {
  re: number
  im: number
}

const c = (re: number, im = 0): Complex => ({ re, im })
const add = (a: Complex, b: Complex): Complex => c(a.re + b.re, a.im + b.im)
const sub = (a: Complex, b: Complex): Complex => c(a.re - b.re, a.im - b.im)
const mul = (a: Complex, b: Complex): Complex => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im || 1e-30
  return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}
const abs = (a: Complex): number => Math.hypot(a.re, a.im)
const scale = (a: Complex, k: number): Complex => c(a.re * k, a.im * k)

interface Mat2 {
  a: Complex
  b: Complex
  c: Complex
  d: Complex
}

const identity = (): Mat2 => ({ a: c(1), b: c(0), c: c(0), d: c(1) })

function matMul(m: Mat2, n: Mat2): Mat2 {
  return {
    a: add(mul(m.a, n.a), mul(m.b, n.c)),
    b: add(mul(m.a, n.b), mul(m.b, n.d)),
    c: add(mul(m.c, n.a), mul(m.d, n.c)),
    d: add(mul(m.c, n.b), mul(m.d, n.d)),
  }
}

const DENSITY = 2000
const VP_VS = 1.8

function layerVelocity(vs: number, q: number, isP: boolean): Complex {
  const v = isP ? vs * VP_VS : vs
  const qq = isP ? q * 2 : q
  return c(v, -v / (2 * Math.max(qq, 1)))
}

/**
 * Surface response relative to the incident-wave amplitude in the half-space.
 * The stack matrix propagates displacement and stress from the free surface
 * (zero traction) to the base of the last finite layer.
 */
function surfaceResponse(layers: HvsrLayer[], frequency: number, isP: boolean, qs: number): number {
  const omega = 2 * Math.PI * frequency
  let m = identity()
  for (let i = 0; i < layers.length - 1; i++) {
    const layer = layers[i]
    const v = layerVelocity(layer.vs, qs, isP)
    const kk = div(c(omega), v)
    const h = Math.max(layer.thickness, 0.001)
    const kh = mul(kk, c(h))
    const cos = c(Math.cos(kh.re) * Math.cosh(kh.im), -Math.sin(kh.re) * Math.sinh(kh.im))
    const sin = c(Math.sin(kh.re) * Math.cosh(kh.im), Math.cos(kh.re) * Math.sinh(kh.im))
    const zom = mul(c(DENSITY), mul(v, c(omega)))
    const local: Mat2 = {
      a: cos,
      b: div(sin, zom),
      c: scale(mul(zom, sin), -1),
      d: cos,
    }
    m = matMul(local, m)
  }

  const base = layers[layers.length - 1]
  const vBase = layerVelocity(base.vs, qs, isP)
  const zomBase = mul(c(DENSITY), mul(vBase, c(omega)))
  const tractionTerm = div(m.c, mul(c(0, 1), zomBase))
  return abs(div(c(1), sub(m.a, tractionTerm)))
}

export function hvsrForwardCurve(model: HvsrInput['model'], frequency: number, qs: number): { h: number; v: number; ratio: number } {
  const h = surfaceResponse(model.layers, frequency, false, qs)
  const v = surfaceResponse(model.layers, frequency, true, qs)
  return { h, v, ratio: h }
}

export function logFrequencies(fMin: number, fMax: number, n: number): number[] {
  const lo = Math.log(fMin)
  const hi = Math.log(fMax)
  return Array.from({ length: n }, (_, i) => Math.exp(lo + ((hi - lo) * i) / Math.max(1, n - 1)))
}

export function runHvsrForward(input: HvsrInput): HvsrResult {
  const frequencies = logFrequencies(input.survey.fMin, input.survey.fMax, input.survey.nFreq)
  const hHorizontal: number[] = []
  const hVertical: number[] = []
  const hvsr: number[] = []
  for (const f of frequencies) {
    const { h, v } = hvsrForwardCurve(input.model, f, input.survey.qs)
    hHorizontal.push(h)
    hVertical.push(v)
    // Nakamura-style proxy: the vertical component is assumed to carry the
    // incident field, so the H/V curve follows the horizontal SH transfer.
    hvsr.push(h)
  }

  if (input.survey.noisePercent > 0) {
    const rng = mulberry32(input.survey.seed)
    const sigma = input.survey.noisePercent / 100
    for (let i = 0; i < hvsr.length; i++) {
      const noise = Math.exp((rng() * 2 - 1) * sigma * 1.7)
      hvsr[i] = Math.max(0.05, hvsr[i] * noise)
    }
  }

  const depth = totalDepth(input.model)
  const vsWeighted = depth > 0 ? input.model.layers.slice(0, -1).reduce((sum, l) => sum + l.vs * l.thickness, 0) / depth : input.model.layers[0].vs
  const quarterWaveEstimate = depth > 0 ? vsWeighted / (4 * depth) : 0

  let globalPeak = 0
  for (let i = 1; i < hvsr.length; i++) {
    if (hvsr[i] > hvsr[globalPeak]) globalPeak = i
  }

  const localPeaks: number[] = []
  for (let i = 1; i < hvsr.length - 1; i++) {
    if (hvsr[i] >= hvsr[i - 1] && hvsr[i] > hvsr[i + 1] && hvsr[i] > 1.15) localPeaks.push(i)
  }

  let peak = globalPeak
  if (localPeaks.length > 0 && quarterWaveEstimate >= input.survey.fMin && quarterWaveEstimate <= input.survey.fMax) {
    const target = Math.log(quarterWaveEstimate)
    peak = localPeaks.reduce((best, index) =>
      Math.abs(Math.log(frequencies[index]) - target) < Math.abs(Math.log(frequencies[best]) - target) ? index : best,
    )
  } else if (localPeaks.length > 0) {
    peak = localPeaks[0]
  }

  const f0 = frequencies[peak]
  const a0 = hvsr[peak]
  const peakAtEdge = peak === 0 || peak === hvsr.length - 1
  const largestPeakF0 = frequencies[globalPeak]

  const warnings: HvsrDiagnostics['warnings'] = []
  if (peakAtEdge) warnings.push({ key: 'edgePeak', params: { f: frequencies[peak] } })
  if (a0 < 1.5) warnings.push({ key: 'lowContrast', params: { a0 } })
  if (depth <= 0) warnings.push({ key: 'noThickness', params: {} })
  if (globalPeak !== peak && largestPeakF0 > f0 * 1.35) {
    warnings.push({ key: 'higherMode', params: { f0: f0.toFixed(2), fMaxPeak: largestPeakF0.toFixed(2) } })
  }

  return {
    frequencies,
    hvsr,
    hHorizontal,
    hVertical,
    model: input.model,
    survey: input.survey,
    diagnostics: {
      nLayers: input.model.layers.length,
      maxDepthM: depth,
      f0,
      a0,
      quarterWaveEstimate,
      peakAtEdge,
      lowContrast: a0 < 1.5,
      warnings,
    },
  }
}

/** Exposed for inversion: evaluate a model at the observed frequencies. */
export function modelCurve(model: HvsrInput['model'], frequencies: number[], qs: number): number[] {
  return frequencies.map((f) => hvsrForwardCurve(model, f, qs).ratio)
}
