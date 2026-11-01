import { mulberry32 } from '../../../sim/core/rng'
import { modelDisplayDepth } from '../../../sim/gpr/solver'
import type { GprInput, GprResult } from '../../../sim/gpr/types'
import type { GrvBody, GrvInput, GrvResult } from '../../../sim/gravity/types'
import type { MagBody, MagInput, MagResult } from '../../../sim/magnetic/types'
import type { ReflInput, ReflResult } from '../../../sim/reflection/types'
import type { RefrInput, RefrResult } from '../../../sim/refraction/types'
import type { VesInput, VesResult } from '../../../sim/resistivity/model'
import type { ChallengeCurve } from './types'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function factor(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function cleanGravityInput(input: GrvInput): GrvInput {
  const next = structuredClone(input)
  next.survey.noiseMGal = 0
  return next
}

export function cleanMagneticInput(input: MagInput): MagInput {
  const next = structuredClone(input)
  next.survey.noiseNT = 0
  return next
}

export function cleanGprInput(input: GprInput): GprInput {
  const next = structuredClone(input)
  next.survey.noisePercent = 0
  return next
}

export function cleanReflectionInput(input: ReflInput): ReflInput {
  const next = structuredClone(input)
  next.survey.noisePercent = 0
  return next
}

export function cleanRefractionInput(input: RefrInput): RefrInput {
  const next = structuredClone(input)
  next.survey.noiseMs = 0
  next.survey.traceNoisePercent = 0
  return next
}

export function cleanResistivityInput(input: VesInput): VesInput {
  const next = structuredClone(input)
  next.survey.noisePercent = 0
  return next
}

export function perturbGravityInput(input: GrvInput, seed: number): GrvInput {
  const rng = mulberry32(seed)
  const next = cleanGravityInput(input)
  next.bodies = next.bodies.map((body): GrvBody => {
    if (body.kind === 'sphere') {
      return {
        ...body,
        z: clamp(body.z * factor(rng, 0.78, 1.28), 0.5, 1000),
        radius: clamp(body.radius * factor(rng, 0.8, 1.25), 0.2, 500),
        deltaRho: clamp(body.deltaRho * factor(rng, 0.72, 1.28), -5000, 5000),
      }
    }
    const z1 = clamp(body.z1 * factor(rng, 0.78, 1.28), 0.5, 4999)
    const z2 = clamp(body.z2 * factor(rng, 0.78, 1.28), z1 + 0.5, 5000)
    return {
      ...body,
      z1,
      z2,
      deltaRho: clamp(body.deltaRho * factor(rng, 0.72, 1.28), -5000, 5000),
    }
  })
  return next
}

export function perturbMagneticInput(input: MagInput, seed: number): MagInput {
  const rng = mulberry32(seed)
  const next = cleanMagneticInput(input)
  next.bodies = next.bodies.map((body): MagBody => {
    if (body.kind === 'dipole') {
      return {
        ...body,
        z: clamp(body.z * factor(rng, 0.78, 1.28), 0.2, 200),
        radius: clamp(body.radius * factor(rng, 0.8, 1.25), 0.1, 500),
        chi: clamp(body.chi * factor(rng, 0.72, 1.28), -0.9, 1),
      }
    }
    const z1 = clamp(body.z1 * factor(rng, 0.78, 1.28), 0.5, 1999)
    const z2 = clamp(body.z2 * factor(rng, 0.78, 1.28), z1 + 0.5, 2000)
    return {
      ...body,
      z1,
      z2,
      chi: clamp(body.chi * factor(rng, 0.72, 1.28), -0.9, 1),
    }
  })
  return next
}

export function perturbGprInput(input: GprInput, seed: number): GprInput {
  const rng = mulberry32(seed)
  const next = cleanGprInput(input)
  const lastIndex = next.model.layers.length - 1
  next.model.layers = next.model.layers.map((layer, index) => ({
    ...layer,
    thickness: index === lastIndex ? layer.thickness : clamp(layer.thickness * factor(rng, 0.8, 1.25), 0.05, 500),
    epsR: clamp(layer.epsR * factor(rng, 0.85, 1.2), 1, 100),
    sigma: clamp(layer.sigma * factor(rng, 0.7, 1.4), 0, 1e6),
  }))
  const displayDepth = modelDisplayDepth(next.model)
  next.model.targets = next.model.targets.map((target) => ({
    ...target,
    z: clamp(target.z * factor(rng, 0.85, 1.15), 0.01, Math.max(0.02, displayDepth - 0.01)),
    radius: clamp(target.radius * factor(rng, 0.8, 1.25), 0.005, 500),
  }))
  return next
}

export function perturbReflectionInput(input: ReflInput, seed: number): ReflInput {
  const rng = mulberry32(seed)
  const next = cleanReflectionInput(input)
  const lastIndex = next.layers.length - 1
  next.layers = next.layers.map((layer, index) => ({
    ...layer,
    vp: clamp(layer.vp * factor(rng, 0.9, 1.1), 300, 9000),
    rho: clamp(layer.rho * factor(rng, 0.95, 1.05), 1000, 4000),
    thickness: index === lastIndex ? layer.thickness : clamp(layer.thickness * factor(rng, 0.8, 1.25), 0.5, 2000),
  }))
  return next
}

export function perturbRefractionInput(input: RefrInput, seed: number): RefrInput {
  const rng = mulberry32(seed)
  const next = cleanRefractionInput(input)
  const lastIndex = next.layers.length - 1
  next.layers = next.layers.map((layer, index) => ({
    ...layer,
    vp: clamp(layer.vp * factor(rng, 0.75, 1.25), 100, 9000),
    thickness: index === lastIndex ? layer.thickness : clamp(layer.thickness * factor(rng, 0.65, 1.35), 0.2, 500),
  }))
  return next
}

export function perturbResistivityInput(input: VesInput, seed: number): VesInput {
  const rng = mulberry32(seed)
  const next = cleanResistivityInput(input)
  const lastIndex = next.layers.length - 1
  const maxThickness = Math.min(200, 500 / Math.max(1, next.layers.length - 1))
  next.layers = next.layers.map((layer, index) => ({
    ...layer,
    thicknessM:
      index === lastIndex
        ? null
        : clamp((layer.thicknessM ?? 1) * factor(rng, 0.65, 1.35), 0.1, maxThickness),
    resistivityOhmM: clamp(layer.resistivityOhmM * factor(rng, 0.5, 1.8), 0.1, 100000),
  }))
  return next
}

export function gravityChallengeCurve(result: GrvResult, xTitle: string, yTitle: string): ChallengeCurve {
  return { x: result.x, y: result.gMGal, xTitle, yTitle }
}

export function magneticChallengeCurve(result: MagResult, xTitle: string, yTitle: string): ChallengeCurve {
  return { x: result.x, y: result.totalNT, xTitle, yTitle }
}

export function gprChallengeCurve(result: GprResult, xTitle: string, yTitle: string): ChallengeCurve {
  const index = Math.min(Math.max(result.aScanIndex, 0), result.radargram.length - 1)
  return { x: result.tNs, y: result.radargram[index] ?? [], xTitle, yTitle }
}

export function reflectionChallengeCurve(result: ReflResult, xTitle: string, yTitle: string): ChallengeCurve {
  return { x: result.tMs, y: result.trace, xTitle, yTitle }
}

export function refractionChallengeCurve(result: RefrResult, xTitle: string, yTitle: string): ChallengeCurve {
  return { x: result.x, y: result.firstArrivalCleanMs, xTitle, yTitle }
}

export function resistivityChallengeCurve(result: VesResult, xTitle: string, yTitle: string): ChallengeCurve {
  return { x: result.spacingsM, y: result.cleanOhmM, xTitle, yTitle, xType: 'log', yType: 'log' }
}
