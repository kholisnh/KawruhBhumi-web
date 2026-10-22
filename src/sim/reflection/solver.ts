import { gaussian, mulberry32 } from '../core/rng'
import { SAMPLES_PER_PERIOD, rickerAt } from '../core/wavelet'
import type { ReflInput, ReflPick, ReflResult } from './types'

export { SAMPLES_PER_PERIOD, rickerAt }

interface LayerProps {
  depthTop: number
  twtTop: number
  twtBottom: number
  impedance: number
}

/**
 * Seismic-reflection forward model — classification: ANALYTICAL (primaries only).
 *
 * - Normal-incidence reflection coefficients from acoustic impedance Z = ρVp.
 * - Zero-offset synthetic trace: convolutional model with a Ricker wavelet,
 *   primaries only, cumulative two-way transmission loss ∏(1 − R²).
 * - CMP gather: kinematic NMO with RMS velocities, t²(x) = t₀² + x²/v_rms²;
 *   amplitudes are offset-independent (no AVO).
 *
 * Assumptions: no multiples, no attenuation, no dispersion, no converted
 * waves, no AVO/ray-path amplitude effects, flat horizontal layers, and a
 * constant-density source wavelet. Absolute amplitudes are relative only.
 */
export function runReflectionForward(input: ReflInput): ReflResult {
  const { layers, survey } = input
  const n = layers.length
  const f = survey.waveletFreqHz
  const dtMs = 1000 / (SAMPLES_PER_PERIOD * f)

  const props: LayerProps[] = []
  let depth = 0
  let twt = 0
  for (let i = 0; i < n; i++) {
    const h = i < n - 1 ? layers[i].thickness : 0
    const intervalTwt = h > 0 ? (2 * h) / layers[i].vp * 1000 : 0
    props.push({
      depthTop: depth,
      twtTop: twt,
      twtBottom: twt + intervalTwt,
      impedance: layers[i].rho * layers[i].vp,
    })
    depth += h
    twt += intervalTwt
  }

  const interfaceTwt: number[] = []
  const interfaceDepth: number[] = []
  const picks: ReflPick[] = []
  let transmission = 1
  const rList: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const zAbove = props[i].impedance
    const zBelow = props[i + 1].impedance
    const r = (zBelow - zAbove) / (zBelow + zAbove)
    rList.push(r)

    let sumV2dt = 0
    let sumDt = 0
    for (let k = 0; k <= i; k++) {
      const intervalTwt = props[k].twtBottom - props[k].twtTop
      sumV2dt += layers[k].vp ** 2 * intervalTwt
      sumDt += intervalTwt
    }
    const vrms = sumDt > 0 ? Math.sqrt(sumV2dt / sumDt) : layers[0].vp

    picks.push({
      index: i + 1,
      depthM: props[i + 1].depthTop,
      twtMs: props[i + 1].twtTop,
      zAbove,
      zBelow,
      reflectionCoef: r,
      transmission,
      amplitude: r * transmission,
      vrms,
    })
    interfaceTwt.push(props[i + 1].twtTop)
    interfaceDepth.push(props[i + 1].depthTop)
    transmission *= 1 - r * r
  }

  const lastTwt = interfaceTwt.length > 0 ? interfaceTwt[interfaceTwt.length - 1] : (2 * Math.max(layers[0].thickness, 10)) / layers[0].vp * 1000
  const tNmoMax = picks.reduce((acc, p) => {
    const tx = Math.sqrt(p.twtMs ** 2 + ((survey.maxOffsetM / p.vrms) * 1000) ** 2)
    return Math.max(acc, tx)
  }, 0)
  const timeWindowMs = survey.timeWindowMs ?? Math.max(lastTwt, tNmoMax) + (4 * 1000) / f
  const samples = Math.max(2, Math.floor(timeWindowMs / dtMs) + 1)
  const actualWindow = (samples - 1) * dtMs

  const tMs: number[] = []
  for (let s = 0; s < samples; s++) tMs.push(s * dtMs)

  const nOffsets = Math.max(1, Math.round(survey.nOffsets))
  const offsetsM: number[] = []
  for (let k = 0; k < nOffsets; k++) {
    offsetsM.push(nOffsets === 1 ? survey.minOffsetM : survey.minOffsetM + ((survey.maxOffsetM - survey.minOffsetM) * k) / (nOffsets - 1))
  }

  const trace = new Array<number>(samples).fill(0)
  for (let s = 0; s < samples; s++) {
    for (const pick of picks) {
      trace[s] += pick.amplitude * rickerAt(tMs[s] - pick.twtMs, f)
    }
  }

  const gather: number[][] = offsetsM.map((x) => {
    const tr = new Array<number>(samples).fill(0)
    for (let s = 0; s < samples; s++) {
      for (const pick of picks) {
        const t0 = pick.twtMs
        const tx = Math.sqrt(t0 * t0 + ((x / pick.vrms) * 1000) ** 2)
        tr[s] += pick.amplitude * rickerAt(tMs[s] - tx, f)
      }
    }
    return tr
  })

  let maxAbs = 0
  for (const v of trace) maxAbs = Math.max(maxAbs, Math.abs(v))
  const scale = maxAbs > 0 ? 1 / maxAbs : 1

  const rng = mulberry32(survey.seed)
  const noiseSigma = survey.noisePercent > 0 ? survey.noisePercent / 100 : 0
  const traceNorm = trace.map((v) => v * scale + (noiseSigma > 0 ? gaussian(rng) * noiseSigma : 0))
  const gatherNorm = gather.map((tr) => tr.map((v) => v * scale + (noiseSigma > 0 ? gaussian(rng) * noiseSigma : 0)))

  const warnings: ReflResult['diagnostics']['warnings'] = []
  for (let i = 0; i < picks.length; i++) {
    if (Math.abs(picks[i].reflectionCoef) < 0.05) {
      warnings.push({ key: 'weakContrast', params: { n: i + 1, r: picks[i].reflectionCoef.toFixed(3) } })
    }
  }
  for (let i = 0; i < n - 1; i++) {
    const lambda = layers[i].vp / f
    if (layers[i].thickness < lambda / 4) {
      warnings.push({ key: 'thinLayer', params: { n: i + 1, res: (lambda / 4).toFixed(1) } })
    }
  }
  if (survey.maxOffsetM > props[props.length - 1].depthTop && picks.length > 0)
    warnings.push({ key: 'wideAngle', params: { x: survey.maxOffsetM } })

  let vSumWeighted = 0
  let wSum = 0
  for (let i = 0; i < n; i++) {
    const w = Math.max(layers[i].thickness, 0)
    vSumWeighted += layers[i].vp * w
    wSum += w
  }
  const vAvg = wSum > 0 ? vSumWeighted / wSum : layers[n - 1].vp
  const wavelengthM = vAvg / f

  return {
    tMs,
    trace: traceNorm,
    gather: gatherNorm,
    offsetsM,
    picks,
    diagnostics: {
      dtMs,
      samples,
      timeWindowMs: actualWindow,
      vAvg,
      wavelengthM,
      verticalResolutionM: wavelengthM / 4,
      maxAbsAmplitude: maxAbs,
      warnings,
    },
    survey,
  }
}
