import { C0, EPS0, MU0 } from '../core/constants'
import { gaussian, mulberry32 } from '../core/rng'
import type {
  GprInput,
  GprModel,
  GprResult,
  GprSurvey,
  GprTarget,
  InterfacePick,
  LayerDiagnostics,
  SolverWarning,
  TargetPick,
} from './types'

/**
 * GPR forward solver — APPROXIMATE, ray-based layered model.
 *
 * Physics implemented (see workspace assumptions panel):
 *  - v = c / sqrt(εr)                        (low-loss, non-magnetic medium)
 *  - R = (√εr1 − √εr2)/(√εr1 + √εr2)         (normal incidence)
 *  - t_TWT = Σ 2·dᵢ/vᵢ                       (layered two-way travel time)
 *  - α = (σ/2)·√(μ₀/ε₀·εr)                   (low-loss attenuation, Np/m)
 *  - Ricker wavelet w(t) = (1−2a²)e^{−a²}, a = πf t
 *  - point/cylinder targets → hyperbolic events t(x) = √(t₀² + (2Δx/v_rms)²)
 *
 * Deterministic: identical inputs always yield identical outputs.
 */

/** εr used for the metallic (PEC) approximation — makes R → −1. */
export const PEC_EPS_R = 1e6

const MAX_TRACES = 3000
const MAX_SAMPLES = 6000
/** Samples per antenna period (Nyquist-safe for a Ricker wavelet). */
export const SAMPLES_PER_PERIOD = 8

/** Displayed model depth: base of finite layers plus a portion of the half-space. */
export function modelDisplayDepth(model: GprModel): number {
  const totalDepth = model.layers.slice(0, -1).reduce((acc, l) => acc + (Number.isFinite(l.thickness) ? l.thickness : 0), 0)
  return totalDepth + Math.max(3, 0.3 * totalDepth)
}

interface PathStats {
  twt0Ns: number
  vRms: number
  alphaAvg: number
}

/** Vertical two-way travel time, RMS velocity and average attenuation to depth z. */
function pathStats(z: number, layers: GprModel['layers'], velocity: number[], alpha: number[]): PathStats {
  let twtS = 0
  let sumV2d = 0
  let sumD = 0
  let intAlpha = 0
  let remaining = Math.max(z, 0)
  for (let i = 0; i < layers.length && remaining > 1e-12; i++) {
    const isHalfSpace = i === layers.length - 1
    const d = isHalfSpace ? remaining : Math.min(remaining, Math.max(layers[i].thickness, 0))
    twtS += (2 * d) / velocity[i]
    sumV2d += d * velocity[i] * velocity[i]
    sumD += d
    intAlpha += alpha[i] * d
    remaining -= d
  }
  const vRms = sumD > 0 ? Math.sqrt(sumV2d / sumD) : velocity[0]
  const alphaAvg = z > 0 ? intAlpha / z : 0
  return { twt0Ns: twtS * 1e9, vRms, alphaAvg }
}

/**
 * Ricker wavelet w(t) = (1 − 2a²)·e^{−a²} with a = π·f·t,
 * sampled at interval dtS over ±2 periods (zero-mean, symmetric).
 */
export function rickerWavelet(f: number, dtS: number): number[] {
  const halfLen = Math.round(2 / (f * dtS))
  const wavelet: number[] = []
  for (let k = -halfLen; k <= halfLen; k++) {
    const a = Math.PI * f * k * dtS
    wavelet.push((1 - 2 * a * a) * Math.exp(-a * a))
  }
  return wavelet
}

/** Truncated discrete convolution (out[i] = Σ w[j]·sig[i − (j−h)]). */
function convolve(sig: Float64Array, w: number[], outLen: number): Float64Array {
  const out = new Float64Array(outLen)
  const h = (w.length - 1) / 2
  for (let i = 0; i < outLen; i++) {
    let acc = 0
    for (let j = 0; j < w.length; j++) {
      const idx = i - j + h
      if (idx >= 0 && idx < sig.length) acc += sig[idx] * w[j]
    }
    out[i] = acc
  }
  return out
}

export function runGprForward(input: GprInput): GprResult {
  const { model, survey } = input
  const layers = model.layers
  const nLayers = layers.length
  const f = survey.frequencyMHz * 1e6

  // --- 1. Geological model → electromagnetic property model -----------------
  const velocity = layers.map((l) => C0 / Math.sqrt(l.epsR))
  const alpha = layers.map((l) => (l.sigma / 1000 / 2) * Math.sqrt(MU0 / (EPS0 * l.epsR)))
  const layerTop: number[] = [0]
  for (let i = 0; i < nLayers - 1; i++) {
    layerTop.push(layerTop[i] + Math.max(layers[i].thickness, 0))
  }
  const totalDepth = layerTop[nLayers - 1]
  const displayDepth = modelDisplayDepth(model)

  // Cumulative two-way travel time at the base of each finite layer.
  let cumTWT = 0
  const twtBottomNs: (number | null)[] = []
  for (let i = 0; i < nLayers; i++) {
    if (i < nLayers - 1) {
      cumTWT += (2 * layers[i].thickness) / velocity[i]
      twtBottomNs.push(cumTWT * 1e9)
    } else {
      twtBottomNs.push(null)
    }
  }

  // --- 2. Acquisition geometry and sampling ---------------------------------
  const dtNs = 1e9 / (SAMPLES_PER_PERIOD * f)
  const vHalf = velocity[nLayers - 1]
  const autoWindowNs = (cumTWT + (2 * Math.max(0, displayDepth - totalDepth)) / vHalf) * 1.15 * 1e9
  const windowNs = survey.timeWindowNs ?? Math.min(2000, Math.max(2, autoWindowNs))
  const dtS = dtNs * 1e-9
  const samples = Math.min(MAX_SAMPLES, Math.floor((windowNs * 1e-9) / dtS) + 1)
  const requestedTraces = Math.floor(survey.lineLength / Math.max(survey.traceSpacing, 1e-9)) + 1
  const nTraces = Math.min(MAX_TRACES, Math.max(2, requestedTraces))
  const x: number[] = []
  for (let i = 0; i < nTraces; i++) {
    x.push((survey.lineLength * i) / (nTraces - 1))
  }

  // --- 3. Source wavelet -----------------------------------------------------
  const wavelet = rickerWavelet(f, dtS)
  const halfLen = (wavelet.length - 1) / 2

  // --- 4. Layered reflectivity (normal incidence, 1D) ------------------------
  const interfaces: InterfacePick[] = []
  const impulse = new Float64Array(samples)
  let transmission = 1 // cumulative two-way amplitude transmission across earlier interfaces
  let twtS = 0
  let attNp = 0 // one-way attenuation integral above the interface
  for (let k = 1; k < nLayers; k++) {
    const d = Math.max(layers[k - 1].thickness, 0)
    twtS += (2 * d) / velocity[k - 1]
    attNp += alpha[k - 1] * d
    const s1 = Math.sqrt(layers[k - 1].epsR)
    const s2 = Math.sqrt(layers[k].epsR)
    const R = (s1 - s2) / (s1 + s2)
    const z = layerTop[k]
    const spreading = 1 / (2 * Math.max(z, 0.05))
    const amplitude = R * transmission * spreading * Math.exp(-2 * attNp)
    const pick: InterfacePick = {
      index: k,
      depthM: z,
      twtNs: twtS * 1e9,
      reflectionCoef: R,
      vAbove: velocity[k - 1],
      vBelow: velocity[k],
      amplitude,
    }
    interfaces.push(pick)
    const sampleIdx = Math.round((twtS * 1e9) / dtNs)
    if (sampleIdx >= 0 && sampleIdx < samples) impulse[sampleIdx] += amplitude
    transmission *= 1 - R * R
  }

  // Ricker convolution of the layered response (shared by all traces).
  const layeredTrace = convolve(impulse, wavelet, samples)

  // --- 5. Buried targets (hyperbolic events) ---------------------------------
  const targetPicks: TargetPick[] = []
  for (const target of model.targets) {
    const host = hostLayerIndex(target, layers, layerTop)
    const hostEpsR = layers[host].epsR
    const sHost = Math.sqrt(hostEpsR)
    const sTgt = Math.sqrt(target.epsR)
    const reflectionCoef = (sHost - sTgt) / (sHost + sTgt)
    const stats = pathStats(target.z, layers, velocity, alpha)
    targetPicks.push({
      id: target.id,
      kind: target.kind,
      x: target.x,
      z: target.z,
      apexTNs: stats.twt0Ns,
      reflectionCoef,
      vRms: stats.vRms,
      hostLayer: host,
    })
  }

  // --- 6. Synthetic radargram -------------------------------------------------
  const radargram: number[][] = []
  let maxAbs = 0
  for (let i = 0; i < nTraces; i++) {
    const trace = new Float64Array(layeredTrace)
    for (let ti = 0; ti < model.targets.length; ti++) {
      const target = model.targets[ti]
      const pick = targetPicks[ti]
      const dx = x[i] - target.x
      const r = Math.hypot(dx, target.z)
      const r0 = Math.max(target.z, 1e-6)
      const spreading =
        target.kind === 'cylinder' ? (1 / (2 * r0)) * Math.sqrt(r0 / Math.max(r, 1e-6)) : 1 / (2 * Math.max(r, 0.05))
      const stats = pathStats(target.z, layers, velocity, alpha)
      const amp = pick.reflectionCoef * spreading * Math.exp(-2 * stats.alphaAvg * r)
      const tNs = Math.sqrt(pick.apexTNs ** 2 + ((2 * dx * 1e9) / pick.vRms) ** 2)
      const centerIdx = Math.round(tNs / dtNs)
      for (let j = 0; j < wavelet.length; j++) {
        const idx = centerIdx + j - halfLen
        if (idx >= 0 && idx < samples) trace[idx] += amp * wavelet[j]
      }
    }
    for (let s = 0; s < samples; s++) maxAbs = Math.max(maxAbs, Math.abs(trace[s]))
    radargram.push(Array.from(trace))
  }

  // Optional deterministic noise (relative to the raw maximum amplitude).
  if (survey.noisePercent > 0 && maxAbs > 0) {
    const rng = mulberry32(survey.seed)
    const sigma = (survey.noisePercent / 100) * maxAbs
    for (let i = 0; i < nTraces; i++) {
      for (let s = 0; s < samples; s++) {
        radargram[i][s] += gaussian(rng) * sigma
      }
    }
    // Re-scan for the true maximum so normalization reflects the noisy data.
    maxAbs = 0
    for (let i = 0; i < nTraces; i++) {
      for (let s = 0; s < samples; s++) maxAbs = Math.max(maxAbs, Math.abs(radargram[i][s]))
    }
  }

  // Normalize to [-1, 1] relative amplitude.
  if (maxAbs > 1e-30) {
    for (let i = 0; i < nTraces; i++) {
      const trace = radargram[i]
      for (let s = 0; s < samples; s++) trace[s] /= maxAbs
    }
  }

  // --- 7. Diagnostics ----------------------------------------------------------
  const layerDiag: LayerDiagnostics[] = layers.map((l, i) => ({
    index: i,
    thickness: i === nLayers - 1 ? Infinity : l.thickness,
    epsR: l.epsR,
    sigma: l.sigma,
    velocity: velocity[i],
    alpha: alpha[i],
    skinDepth: alpha[i] > 0 ? 1 / alpha[i] : Infinity,
    twtBottomNs: twtBottomNs[i],
  }))

  // Thickness-weighted averages over the finite layers (fallback: half-space).
  let wSum = 0
  let vSum = 0
  let alphaSum = 0
  for (let i = 0; i < nLayers - 1; i++) {
    const d = Math.max(layers[i].thickness, 0)
    wSum += d
    vSum += d * velocity[i]
    alphaSum += d * alpha[i]
  }
  if (wSum === 0) {
    vSum = velocity[nLayers - 1]
    alphaSum = alpha[nLayers - 1]
    wSum = 1
  }
  const vAvg = vSum / wSum
  const alphaAvg = alphaSum / wSum
  const wavelengthM = vAvg / f
  const verticalResolutionM = wavelengthM / 4
  const avgSkinDepthM = alphaAvg > 0 ? 1 / alphaAvg : Infinity

  const warnings: SolverWarning[] = []
  if (Number.isFinite(avgSkinDepthM) && avgSkinDepthM < 0.5 * displayDepth) {
    warnings.push({ key: 'highAttenuation', params: { sd: avgSkinDepthM.toFixed(2) } })
  }
  for (let i = 0; i < nLayers - 1; i++) {
    const layerWavelength = velocity[i] / f
    if (layers[i].thickness < layerWavelength / 4) {
      warnings.push({ key: 'thinLayer', params: { n: i + 1, res: (layerWavelength / 4).toFixed(2) } })
    }
  }
  for (const itf of interfaces) {
    if (Math.abs(itf.reflectionCoef) < 0.05) {
      warnings.push({ key: 'weakContrast', params: { n: itf.index, r: itf.reflectionCoef.toFixed(3) } })
    }
  }
  for (const pick of targetPicks) {
    const target = model.targets.find((t) => t.id === pick.id) ?? model.targets[0]
    if (Math.abs(pick.reflectionCoef) < 0.05) {
      warnings.push({ key: 'targetWeak', params: { id: pick.id, r: pick.reflectionCoef.toFixed(3) } })
    }
    if (target && target.epsR >= PEC_EPS_R / 10) {
      warnings.push({ key: 'metalTarget', params: { id: pick.id } })
    }
    if (pick.z > displayDepth) {
      warnings.push({ key: 'depthBelowHalfSpace', params: { id: pick.id } })
    }
  }

  const tNs: number[] = []
  for (let s = 0; s < samples; s++) tNs.push(s * dtNs)

  const aScanIndex = targetPicks.length > 0
    ? x.reduce((best, xi, i) => (Math.abs(xi - targetPicks[0].x) < Math.abs(x[best] - targetPicks[0].x) ? i : best), 0)
    : Math.floor(nTraces / 2)

  return {
    x,
    tNs,
    radargram,
    aScanIndex,
    layers: layerDiag,
    interfaces,
    targets: targetPicks,
    diagnostics: {
      dtNs,
      samples,
      nTraces,
      timeWindowNs: windowNs,
      totalDepthM: totalDepth,
      displayDepthM: displayDepth,
      vAvg,
      wavelengthM,
      verticalResolutionM,
      avgSkinDepthM,
      maxAbsAmplitude: maxAbs,
      samplesPerPeriod: SAMPLES_PER_PERIOD,
      warnings,
    },
    survey,
  }
}

function hostLayerIndex(target: GprTarget, layers: GprModel['layers'], layerTop: number[]): number {
  let host = layers.length - 1
  for (let i = 0; i <= layers.length - 1; i++) {
    const top = layerTop[i]
    const bottom = i === layers.length - 1 ? Infinity : layerTop[i + 1]
    if (target.z >= top && target.z < bottom) {
      host = i
      break
    }
  }
  return host
}

/** Human-readable summary of the active survey (for exports). */
export function surveySummaryRows(survey: GprSurvey): Array<[string, string]> {
  return [
    ['frequency_MHz', String(survey.frequencyMHz)],
    ['trace_spacing_m', String(survey.traceSpacing)],
    ['line_length_m', String(survey.lineLength)],
    ['time_window_ns', survey.timeWindowNs === null ? 'auto' : String(survey.timeWindowNs)],
    ['noise_percent', String(survey.noisePercent)],
    ['noise_seed', String(survey.seed)],
  ]
}
