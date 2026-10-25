import { mulberry32 } from '../core/rng'
import { hvsrUid } from './model'
import { modelCurve } from './solver'
import type { HvsrInversionResult, HvsrInversionSettings, HvsrLayer, HvsrModel } from './types'

interface Bounds {
  vsMin: number
  vsMax: number
  hMin: number
  hMax: number
  halfVsMin: number
  halfVsMax: number
}

const DEFAULT_BOUNDS: Bounds = {
  vsMin: 60,
  vsMax: 1800,
  hMin: 1,
  hMax: 120,
  halfVsMin: 250,
  halfVsMax: 3200,
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function gaussian(rng: () => number): number {
  const u = Math.max(rng(), 1e-12)
  const v = Math.max(rng(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function modelFromVector(x: number[], layerCount: number): HvsrModel {
  const layers: HvsrLayer[] = []
  for (let i = 0; i < layerCount - 1; i++) {
    layers.push({ id: hvsrUid('inv'), thickness: x[i * 2 + 1], vs: x[i * 2] })
  }
  layers.push({ id: hvsrUid('inv'), thickness: 0, vs: x[(layerCount - 1) * 2] })
  return { layers }
}

function vectorFromModel(model: HvsrModel): number[] {
  const x: number[] = []
  for (const layer of model.layers.slice(0, -1)) x.push(layer.vs, layer.thickness)
  x.push(model.layers[model.layers.length - 1].vs)
  return x
}

function randomVector(layerCount: number, rng: () => number, bounds: Bounds): number[] {
  const x: number[] = []
  for (let i = 0; i < layerCount - 1; i++) {
    x.push(bounds.vsMin + rng() * (bounds.vsMax - bounds.vsMin), bounds.hMin + rng() * (bounds.hMax - bounds.hMin))
  }
  x.push(bounds.halfVsMin + rng() * (bounds.halfVsMax - bounds.halfVsMin))
  return x
}

function perturb(x: number[], layerCount: number, rng: () => number, scale: number, bounds: Bounds): number[] {
  const out = x.slice()
  for (let i = 0; i < layerCount - 1; i++) {
    if (rng() < 0.12) out[i * 2] = bounds.vsMin + rng() * (bounds.vsMax - bounds.vsMin)
    else out[i * 2] = clamp(out[i * 2] * Math.exp(gaussian(rng) * scale), bounds.vsMin, bounds.vsMax)
    if (rng() < 0.12) out[i * 2 + 1] = bounds.hMin + rng() * (bounds.hMax - bounds.hMin)
    else out[i * 2 + 1] = clamp(out[i * 2 + 1] + gaussian(rng) * scale * 25, bounds.hMin, bounds.hMax)
  }
  out[(layerCount - 1) * 2] = clamp(
    out[(layerCount - 1) * 2] * Math.exp(gaussian(rng) * scale),
    bounds.halfVsMin,
    bounds.halfVsMax,
  )
  return out
}

function misfit(curve: number[], observed: number[]): number {
  let sum = 0
  for (let i = 0; i < observed.length; i++) {
    const d = Math.log(Math.max(curve[i], 1e-6)) - Math.log(Math.max(observed[i], 1e-6))
    sum += d * d
  }
  return 100 * Math.sqrt(sum / Math.max(1, observed.length))
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function vsAtDepth(model: HvsrModel, depth: number): number {
  let top = 0
  for (let i = 0; i < model.layers.length; i++) {
    const layer = model.layers[i]
    if (i === model.layers.length - 1) return layer.vs
    const bottom = top + layer.thickness
    if (depth <= bottom) return layer.vs
    top = bottom
  }
  return model.layers[model.layers.length - 1].vs
}

export interface InversionOptions extends Partial<HvsrInversionSettings> {
  observed: number[]
  frequencies: number[]
  qs: number
  onProgress?: (fraction: number) => void
  initialModel?: HvsrModel
}

/**
 * A transparent neighborhood-algorithm-style search. It samples the parameter
 * space, keeps the best models, and refines around them with a shrinking
 * perturbation. It is inspired by Wathelet et al. (2004) but is not a
 * reimplementation of Geopsy.
 */
export function runHvsrInversion(options: InversionOptions): HvsrInversionResult {
  const layerCount = Math.min(6, Math.max(2, Math.round(options.layerCount ?? 4)))
  const settings: HvsrInversionSettings = {
    layerCount,
    initialSamples: Math.max(200, Math.round(options.initialSamples ?? 1200)),
    bestCount: Math.max(10, Math.round(options.bestCount ?? 60)),
    newSamples: Math.max(40, Math.round(options.newSamples ?? 220)),
    iterations: Math.max(1, Math.round(options.iterations ?? 5)),
    seed: Math.round(options.seed ?? 41),
  }
  const rng = mulberry32(settings.seed)
  const bounds = DEFAULT_BOUNDS
  let evaluations = 0

  const evaluate = (x: number[]) => {
    const model = modelFromVector(x, layerCount)
    const curve = modelCurve(model, options.frequencies, options.qs)
    evaluations++
    return { x, model, curve, misfit: misfit(curve, options.observed) }
  }

  let population: Array<{ x: number[]; model: HvsrModel; curve: number[]; misfit: number }> = []
  if (options.initialModel && options.initialModel.layers.length === layerCount) {
    const x = vectorFromModel(options.initialModel)
    // Perturb the user model to create a diverse starting cloud without
    // discarding its broad structure.
    population.push(evaluate(x))
    for (let i = 1; i < settings.initialSamples; i++) population.push(evaluate(perturb(x, layerCount, rng, 0.35, bounds)))
  } else {
    for (let i = 0; i < settings.initialSamples; i++) population.push(evaluate(randomVector(layerCount, rng, bounds)))
  }
  options.onProgress?.(0.2)

  for (let it = 0; it < settings.iterations; it++) {
    population.sort((a, b) => a.misfit - b.misfit)
    const best = population.slice(0, settings.bestCount)
    const scale = 0.28 * Math.pow(0.72, it)
    const children: typeof population = []
    const perBest = Math.ceil(settings.newSamples / best.length)
    for (const candidate of best) {
      for (let k = 0; k < perBest; k++) {
        children.push(evaluate(perturb(candidate.x, layerCount, rng, scale, bounds)))
      }
    }
    population = population.concat(children)
    population.sort((a, b) => a.misfit - b.misfit)
    population = population.slice(0, Math.max(settings.initialSamples, settings.bestCount))
    options.onProgress?.(0.2 + (0.8 * (it + 1)) / settings.iterations)
  }

  population.sort((a, b) => a.misfit - b.misfit)
  const best = population[0]
  const ensemble = population.slice(0, Math.min(120, population.length)).map((p) => ({ layers: p.model.layers, misfit: p.misfit }))

  const maxDepth = Math.max(10, best.model.layers.slice(0, -1).reduce((sum, l) => sum + l.thickness, 0) * 1.25)
  const depth = Array.from({ length: 81 }, (_, i) => (maxDepth * i) / 80)
  const vsP05 = depth.map((d) => percentile(ensemble.map((m) => vsAtDepth(m, d)), 0.05))
  const vsP50 = depth.map((d) => percentile(ensemble.map((m) => vsAtDepth(m, d)), 0.5))
  const vsP95 = depth.map((d) => percentile(ensemble.map((m) => vsAtDepth(m, d)), 0.95))

  return {
    best: { layers: best.model.layers, misfit: best.misfit },
    ensemble,
    frequencies: options.frequencies,
    observed: options.observed,
    predicted: best.curve,
    depth,
    vsP05,
    vsP50,
    vsP95,
    misfit: best.misfit,
    settings,
    evaluations,
  }
}
