import { gaussian, mulberry32 } from '../core/rng'
import { SAMPLES_PER_PERIOD, rickerAt } from '../core/wavelet'
import type { RefrBranch, RefrInput, RefrResult, RefrSeismogram } from './types'

export const MAX_RECEIVERS = 4000
export const MAX_TRACE_SAMPLES = 1200

/**
 * Schematic synthetic shot record: one Ricker-waved trace per receiver.
 *
 * Amplitudes use a display-realistic geometric-spreading model only
 * (relative amplitudes, chosen so head waves grow relatively stronger with
 * offset, crossing near the analytic crossover):
 *   - direct wave ≈ (x + 1)^−1.0
 *   - head wave  ≈ 0.35·0.85^(index−1)·(x + 1)^−0.55
 * Exact head-wave arrival times are used; no radiation pattern, attenuation,
 * surface waves, or elastic amplitude effects are modelled.
 */
function synthesizeSeismogram(
  x: number[],
  branches: RefrBranch[],
  survey: RefrInput['survey'],
  pickRng: () => number,
): RefrSeismogram {
  const f0 = survey.waveletFreqHz
  const periodMs = 1000 / f0
  const maxTime = branches.reduce((acc, b) => {
    const last = b.timesMs.length > 0 ? b.timesMs[b.timesMs.length - 1] : 0
    return Math.max(acc, last)
  }, 0)
  const windowMs = Math.max(maxTime, 10) * 1.12 + 3 * periodMs

  let dtMs = periodMs / SAMPLES_PER_PERIOD
  let samples = Math.floor(windowMs / dtMs) + 1
  if (samples > MAX_TRACE_SAMPLES) {
    dtMs = windowMs / (MAX_TRACE_SAMPLES - 1)
    samples = MAX_TRACE_SAMPLES
  }

  const tMs: number[] = []
  for (let s = 0; s < samples; s++) tMs.push(s * dtMs)

  const traces: number[][] = []
  for (let i = 0; i < x.length; i++) {
    const xi = x[i]
    const tr = new Array<number>(samples).fill(0)
    const directAmp = 1 / (xi + 1)
    const headAmp = 0.35 / Math.pow(xi + 1, 0.55)
    for (const b of branches) {
      if (b.timesMs.length === 0 || !Number.isFinite(b.interceptMs)) continue
      const arrival = b.timesMs[Math.min(i, b.timesMs.length - 1)]
      if (!Number.isFinite(arrival)) continue
      const amp = b.index === 0 ? directAmp : headAmp * Math.pow(0.85, b.index - 1)
      for (let s = 0; s < samples; s++) {
        tr[s] += amp * rickerAt(tMs[s] - arrival, f0)
      }
    }
    traces.push(tr)
  }

  let maxAbs = 0
  for (const tr of traces) for (const v of tr) maxAbs = Math.max(maxAbs, Math.abs(v))
  const scale = maxAbs > 0 ? 1 / maxAbs : 1
  const noiseSigma = survey.traceNoisePercent > 0 ? survey.traceNoisePercent / 100 : 0
  const norm = traces.map((tr) => tr.map((v) => v * scale + (noiseSigma > 0 ? gaussian(pickRng) * noiseSigma : 0)))

  return { tMs, traces: norm, f0Hz: f0, dtMs }
}

/**
 * Seismic-refraction forward model — classification: ANALYTICAL
 * (flat-layered critical-refraction / head-wave model).
 *
 * - Direct wave: t(x) = x / V₁.
 * - Head wave along the base of layer i (refractor velocity V): travels down
 *   through the overlying stack with sinθₖ = vₖ/V, along the interface at V,
 *   and back up: t(x) = Σ 2hₖ·cosθₖ / vₖ + x / V.
 * - The first arrival is the minimum over all generated branches.
 * - Intercept-time depth conversion for the first refractor is offered as an
 *   interpretation aid (valid strictly for the two-layer case).
 * - The synthetic shot record uses the exact branch arrival times with a
 *   schematic geometric-spreading amplitude model (see `synthesizeSeismogram`).
 *
 * Assumptions: flat horizontal layers, laterally homogeneous velocities,
 * head waves exist only where velocity increases with depth (branch skipped and
 * flagged otherwise), no diving rays in a gradient, no attenuation or
 * dispersion, single forward shot at x = 0, vertical geophones on the surface.
 */
export function runRefractionForward(input: RefrInput): RefrResult {
  const { layers, survey } = input
  const n = layers.length

  const nReceivers = Math.min(Math.floor(survey.spreadLength / survey.geophoneSpacing) + 1, MAX_RECEIVERS)
  const x: number[] = []
  for (let i = 0; i < nReceivers; i++) x.push(i * survey.geophoneSpacing)

  const ms = (v: number) => 1000 / v
  const direct: number[] = x.map((xi) => xi * ms(layers[0].vp))

  const branches: RefrBranch[] = [
    {
      index: 0,
      interfaceIndex: null,
      velocity: layers[0].vp,
      interceptMs: 0,
      criticalAngleDeg: 90,
      crossoverM: null,
      timesMs: direct,
    },
  ]

  const branchTimesMs: Array<number[] | null> = [direct]
  const warnings: RefrResult['diagnostics']['warnings'] = []

  for (let i = 0; i < n - 1; i++) {
    const refractorV = layers[i + 1].vp
    let valid = true
    for (let k = 0; k <= i; k++) {
      if (!(refractorV > layers[k].vp)) {
        valid = false
        break
      }
    }
    if (!valid) {
      branches.push({
        index: i + 1,
        interfaceIndex: i,
        velocity: refractorV,
        interceptMs: NaN,
        criticalAngleDeg: NaN,
        crossoverM: null,
        timesMs: [],
      })
      branchTimesMs.push(null)
      warnings.push({ key: 'velocityInversion', params: { n: i + 1 } })
      continue
    }

    let intercept = 0
    let critical = 90
    for (let k = 0; k <= i; k++) {
      const sinT = layers[k].vp / refractorV
      const cosT = Math.sqrt(1 - sinT * sinT)
      intercept += (2 * layers[k].thickness * cosT * 1000) / layers[k].vp
      if (k === i) critical = (Math.asin(sinT) * 180) / Math.PI
    }

    const times = x.map((xi) => intercept + xi * ms(refractorV))

    let crossover: number | null = null
    for (let b = branches.length - 1; b >= 0; b--) {
      const prev = branches[b]
      if (!Number.isFinite(prev.interceptMs) || prev.timesMs.length === 0) continue
      const slopeA = ms(prev.velocity)
      const slopeB = ms(refractorV)
      if (slopeA === slopeB) break
      const xc = (intercept - prev.interceptMs) / (slopeA - slopeB)
      if (xc > 0) crossover = xc
      break
    }

    branches.push({
      index: i + 1,
      interfaceIndex: i,
      velocity: refractorV,
      interceptMs: intercept,
      criticalAngleDeg: critical,
      crossoverM: crossover,
      timesMs: times,
    })
    branchTimesMs.push(times)
  }

  const firstArrivalCleanMs: number[] = []
  const firstArrivalBranch: number[] = []
  for (let r = 0; r < nReceivers; r++) {
    let best = Infinity
    let bestB = -1
    for (let b = 0; b < branches.length; b++) {
      const t = branches[b].timesMs[r]
      if (t === undefined || !Number.isFinite(t)) continue
      if (t < best) {
        best = t
        bestB = b
      }
    }
    firstArrivalCleanMs.push(best)
    firstArrivalBranch.push(bestB)
  }

  const rng = mulberry32(survey.seed)
  const firstArrivalMs = firstArrivalCleanMs.map((t) => t + (survey.noiseMs > 0 ? gaussian(rng) * survey.noiseMs : 0))
  const seismogram = synthesizeSeismogram(x, branches, survey, rng)

  const nRefractedFirstArrivals = firstArrivalBranch.filter((b) => b > 0).length

  let firstRefractorDepthM: number | null = null
  if (branches.length > 1 && Number.isFinite(branches[1].interceptMs) && layers.length >= 2) {
    const v1 = layers[0].vp
    const v2 = layers[1].vp
    if (v2 > v1) {
      const t0 = branches[1].interceptMs / 1000
      firstRefractorDepthM = (t0 * v1 * v2) / (2 * Math.sqrt(v2 * v2 - v1 * v1))
    }
  }

  if (nRefractedFirstArrivals === 0) {
    const hasValidRefractor = branches.some((b) => b.index > 0 && Number.isFinite(b.interceptMs))
    if (!hasValidRefractor) {
      warnings.push({ key: 'noRefractor', params: {} })
    } else {
      warnings.push({ key: 'spreadTooShort', params: { xc: branches.find((b) => b.crossoverM !== null)?.crossoverM?.toFixed(1) ?? '?' } })
    }
  }

  return {
    x,
    branchTimesMs,
    firstArrivalMs,
    firstArrivalCleanMs,
    firstArrivalBranch,
    branches,
    seismogram,
    diagnostics: {
      nReceivers,
      nRefractedFirstArrivals,
      firstRefractorDepthM,
      vDirectMps: layers[0].vp,
      maxFirstArrivalMs: firstArrivalCleanMs[nReceivers - 1] ?? 0,
      warnings,
    },
    survey,
  }
}
