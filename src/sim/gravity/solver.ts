import { G_CONST } from '../core/constants'
import { gaussian, mulberry32 } from '../core/rng'
import { prismGzHat } from '../core/prism3d'
import type { GrvBody, GrvBodySummary, GrvInput, GrvMap, GrvResult } from './types'

export const MAX_STATIONS = 4000
export const MAX_MAP_NODES = 20000
/** 1 mGal = 1e-5 m/s². */
export const MGAL = 1e-5

/**
 * Gravity forward model — classification: ANALYTICAL.
 *
 * - Sphere target: exact point-mass (Newtonian) attraction of a homogeneous
 *   sphere, which is identical to a point mass at its centre.
 * - Prism target: exact closed-form attraction of a 3D rectangular prism of
 *   finite strike (Nagy, Papp & Benedek 2000 corner formulas).
 *
 * Assumptions: constant density contrast, flat terrain at z = 0, no regional
 * field, no terrain corrections, and no isostatic or tidal effects. Positive
 * values denote downward attraction. Free-air and Bouguer corrections are not
 * applied — the profile is a synthetic Bouguer anomaly over the bodies alone.
 */

/** Vertical attraction [m/s²] of a sphere at surface station (x, y). */
export function sphereAttraction3D(body: GrvBody & { kind: 'sphere' }, x: number, y: number): number {
  const v = (4 / 3) * Math.PI * body.radius ** 3
  const dx = body.x - x
  const dy = body.y - y
  const dz = body.z
  const r3 = Math.pow(dx * dx + dy * dy + dz * dz, 1.5)
  return G_CONST * body.deltaRho * v * (dz / r3)
}

/** Corner integral F(u, h) = u·ln√(u²+h²) − u + h·atan(u/h). */
function cornerF(u: number, h: number): number {
  const r = Math.hypot(u, h)
  const lnTerm = u === 0 ? 0 : u * Math.log(r)
  return lnTerm - u + h * Math.atan2(u, h)
}

/**
 * Vertical attraction [m/s²] of a 2D prism of infinite strike at (x, 0).
 * Reference implementation only: it is the L → ∞ limit of the 3D formulas and
 * is kept for unit-test cross-validation.
 */
export function prismAttraction(body: GrvBody & { kind: 'prism' }, x: number): number {
  const { x1, x2, z1, z2, deltaRho } = body
  const u1 = x1 - x
  const u2 = x2 - x
  const g =
    2 * G_CONST * deltaRho * (cornerF(u2, z2) - cornerF(u2, z1) - cornerF(u1, z2) + cornerF(u1, z1))
  return g
}

/** Vertical attraction [m/s²] of a sphere at (x, 0) (2D reference). */
export function sphereAttraction(body: GrvBody & { kind: 'sphere' }, x: number): number {
  return sphereAttraction3D(body, x, 0)
}

/** Vertical attraction [m/s²] of a 3D finite-strike prism at surface station (x, y). */
export function prismAttraction3D(body: GrvBody & { kind: 'prism' }, x: number, y: number): number {
  const half = body.strikeLength / 2
  if (half <= 0 || body.x2 <= body.x1 || body.z2 <= body.z1) return 0
  return (
    G_CONST *
    body.deltaRho *
    prismGzHat(x, y, 0, { x1: body.x1, x2: body.x2, y1: body.y - half, y2: body.y + half, z1: body.z1, z2: body.z2 })
  )
}

/** Attraction [mGal] of one body at station (x, y). */
export function bodyAttractionMGal3D(body: GrvBody, x: number, y: number): number {
  const a = body.kind === 'sphere' ? sphereAttraction3D(body, x, y) : prismAttraction3D(body, x, y)
  return a / MGAL
}

/** Attraction [mGal] of one body at station (x, 0) (2D reference). */
export function bodyAttractionMGal(body: GrvBody, x: number): number {
  return bodyAttractionMGal3D(body, x, 0)
}

function bodySummary(body: GrvBody, x: number[], g: number[]): GrvBodySummary {
  const cmp = (a: number, b: number) => Math.abs(b) - Math.abs(a)
  const idx = x.map((_, i) => i).sort((i, j) => cmp(g[i], g[j]))[0]
  if (body.kind === 'sphere') {
    const v = (4 / 3) * Math.PI * body.radius ** 3
    return {
      id: body.id,
      kind: body.kind,
      deltaRho: body.deltaRho,
      sizeValue: v,
      excessMassKg: body.deltaRho * v,
      x: body.x,
      y: body.y,
      z: body.z,
      peakMGal: g[idx] ?? 0,
    }
  }
  const volume = Math.max(0, (body.x2 - body.x1) * (body.z2 - body.z1) * body.strikeLength)
  return {
    id: body.id,
    kind: body.kind,
    deltaRho: body.deltaRho,
    sizeValue: volume,
    excessMassKg: body.deltaRho * volume,
    x: (body.x1 + body.x2) / 2,
    y: body.y,
    z: (body.z1 + body.z2) / 2,
    peakMGal: g[idx] ?? 0,
  }
}

function computeMap(survey: GrvInput['survey'], bodies: GrvBody[], x: number[], n: number): GrvMap {
  const lines = Math.max(3, Math.round(survey.mapLines))
  const y: number[] = []
  for (let j = 0; j < lines; j++) y.push((j - (lines - 1) / 2) * survey.mapLineSpacing)

  const perLine = Math.max(2, Math.floor(MAX_MAP_NODES / lines))
  const stride = Math.max(1, Math.ceil(n / perLine))
  const mapX: number[] = []
  for (let i = 0; i < n; i += stride) mapX.push(x[i])
  if (mapX.length < 2) mapX.push(mapX[0] !== undefined ? mapX[0] + survey.stationSpacing : survey.stationSpacing)

  const valuesMGal = y.map((yy) => mapX.map((xx) => bodies.reduce((acc, b) => acc + bodyAttractionMGal3D(b, xx, yy), 0)))
  return { x: mapX, y, valuesMGal, stride }
}

/** Deterministic forward run; identical inputs give identical outputs. */
export function runGravityForward(input: GrvInput): GrvResult {
  const { survey, bodies } = input
  const n = Math.min(Math.floor(survey.lineLength / survey.stationSpacing) + 1, MAX_STATIONS)
  const x: number[] = []
  for (let i = 0; i < n; i++) x.push(i * survey.stationSpacing)

  const rng = mulberry32(survey.seed)
  const perBodyMGal: number[][] = bodies.map(() => new Array<number>(n).fill(0))
  const totalNoiseFree = new Array<number>(n).fill(0)

  for (let b = 0; b < bodies.length; b++) {
    for (let i = 0; i < n; i++) {
      const a = bodyAttractionMGal3D(bodies[b], x[i], 0)
      perBodyMGal[b][i] = a
      totalNoiseFree[i] += a
    }
  }

  const gMGal = totalNoiseFree.map((v) => v + (survey.noiseMGal > 0 ? gaussian(rng) * survey.noiseMGal : 0))

  let maxAbs = 0
  let sumSq = 0
  let minV = Infinity
  let maxV = -Infinity
  for (let i = 0; i < n; i++) {
    maxAbs = Math.max(maxAbs, Math.abs(gMGal[i]))
    sumSq += gMGal[i] * gMGal[i]
    minV = Math.min(minV, totalNoiseFree[i])
    maxV = Math.max(maxV, totalNoiseFree[i])
  }

  const map = computeMap(survey, bodies, x, n)
  let mapMaxAbsMGal = 0
  let mapMinMGal = Infinity
  let mapMaxMGal = -Infinity
  for (const row of map.valuesMGal) {
    for (const v of row) {
      mapMaxAbsMGal = Math.max(mapMaxAbsMGal, Math.abs(v))
      mapMinMGal = Math.min(mapMinMGal, v)
      mapMaxMGal = Math.max(mapMaxMGal, v)
    }
  }

  const warnings: GrvResult['diagnostics']['warnings'] = []
  for (const body of bodies) {
    if (body.kind === 'prism') {
      if (body.z1 <= 0.05) warnings.push({ key: 'prismAtSurface', params: { id: body.id } })
      if (body.z1 < (body.x2 - body.x1) / 4 && body.z1 < 3)
        warnings.push({ key: 'thinSheet', params: { id: body.id } })
    } else {
      if (body.radius > body.z) warnings.push({ key: 'sphereNearField', params: { id: body.id } })
      if (body.z - body.radius <= 0) warnings.push({ key: 'sphereAtSurface', params: { id: body.id } })
    }
  }

  return {
    x,
    gMGal,
    perBodyMGal,
    map,
    bodies: bodies.map((b, bi) => bodySummary(b, x, perBodyMGal[bi])),
    diagnostics: {
      nStations: n,
      maxAbsMGal: maxAbs,
      rmsMGal: Math.sqrt(sumSq / Math.max(n, 1)),
      peakToPeakMGal: Number.isFinite(minV) ? maxV - minV : 0,
      noiseMGal: survey.noiseMGal,
      mapMaxAbsMGal: Number.isFinite(mapMaxAbsMGal) ? mapMaxAbsMGal : 0,
      mapMinMGal: Number.isFinite(minV) ? mapMinMGal : 0,
      mapMaxMGal: Number.isFinite(mapMaxMGal) ? mapMaxMGal : 0,
      warnings,
    },
    survey,
  }
}
