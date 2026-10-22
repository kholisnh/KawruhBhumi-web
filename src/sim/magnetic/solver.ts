import { MU0 } from '../core/constants'
import { gaussian, mulberry32 } from '../core/rng'
import { prismQuantities } from '../core/prism3d'
import type { MagBody, MagBodySummary, MagInput, MagMap, MagResult } from './types'

export const MAX_STATIONS = 4000
export const MAX_MAP_NODES = 20000

/**
 * Magnetic forward model — classification: SEMI-ANALYTICAL.
 *
 * - Sphere target: closed-form induced dipole (valid when the observation
 *   distance is large compared with the radius; thin-body approximation).
 * - Prism target: exact closed-form field of a uniformly magnetized 3D
 *   rectangular prism of finite strike, obtained from the second-derivative
 *   (gravity gradient) tensor of the prism potential via Poisson's relation:
 *   B = (μ₀/4π)·M·T̂ outside the body, so ΔT ≈ (χF₀/4π)·f̂ᵀ T̂ f̂.
 *
 * Assumptions: induced magnetization only (M = χH₀, demagnetization ignored),
 * the ambient field direction is constant (declination 0, i.e. the field lies
 * in the x–z profile plane), and the total-field anomaly ΔT is approximated by
 * the projection of the anomalous vector field onto the ambient field direction
 * (valid for |B_anom| ≪ |F₀|).
 */

/** Unit-magnetization 2D prism field at (x, z); z positive downwards. */
function prismField(x: number, z: number, m1: number, m2: number, x1: number, x2: number, z1: number, z2: number): [number, number] {
  const r2 = (px: number, pz: number) => (x - px) * (x - px) + (z - pz) * (z - pz)
  const at = (u: number, v: number) => Math.atan(u / v)

  const hx =
    (m2 / (4 * Math.PI)) *
      (Math.log(r2(x2, z1)) - Math.log(r2(x1, z1)) - Math.log(r2(x2, z2)) + Math.log(r2(x1, z2))) +
    (m1 / (2 * Math.PI)) * (-at(z2 - z, x - x1) + at(z1 - z, x - x1) + at(z2 - z, x - x2) - at(z1 - z, x - x2))

  const hz =
    -(m2 / (2 * Math.PI)) * (at(x2 - x, z - z1) - at(x1 - x, z - z1)) +
    (m2 / (2 * Math.PI)) * (at(x2 - x, z - z2) - at(x1 - x, z - z2)) +
    (m1 / (4 * Math.PI)) * (Math.log(r2(x1, z2)) - Math.log(r2(x1, z1)) + Math.log(r2(x2, z1)) - Math.log(r2(x2, z2)))

  return [hx, hz]
}

/**
 * Total-field anomaly [T] of one body at a station on the profile (y = 0),
 * using the legacy 2D infinite-strike prism formula.
 *
 * Reference implementation only: it is the L → ∞ limit of the 3D model and is
 * kept for unit-test cross-validation. The solver itself evaluates the 3D
 * formulas so that profiles and maps share one physical model.
 */
export function bodyAnomalyT(body: MagBody, x: number, z: number, fieldT: number, incRad: number): number {
  const fx = Math.cos(incRad)
  const fz = Math.sin(incRad)

  if (body.kind === 'dipole') {
    const v = (4 / 3) * Math.PI * body.radius ** 3
    const dx = x - body.x
    const dz = z - body.z
    const r = Math.hypot(dx, dz)
    if (r < 1e-9) return 0
    const mHatR = (fx * dx + fz * dz) / r
    return ((body.chi * v * fieldT) / (4 * Math.PI * r ** 3)) * (3 * mHatR * mHatR - 1)
  }

  const area = (body.x2 - body.x1) * (body.z2 - body.z1)
  if (area <= 0) return 0
  const mx = body.chi * (fieldT / MU0) * fx
  const mz = body.chi * (fieldT / MU0) * fz
  const [hx, hz] = prismField(x, z, mx, mz, body.x1, body.x2, body.z1, body.z2)
  return MU0 * (hx * fx + hz * fz)
}

/** Total-field anomaly [T] of one body at an arbitrary station (x, y). */
export function bodyAnomalyT3D(body: MagBody, x: number, y: number, fieldT: number, incRad: number): number {
  const fx = Math.cos(incRad)
  const fz = Math.sin(incRad)

  if (body.kind === 'dipole') {
    const v = (4 / 3) * Math.PI * body.radius ** 3
    const dx = x - body.x
    const dy = y - body.y
    const dz = -body.z
    const r = Math.hypot(dx, dy, dz)
    if (r < 1e-9) return 0
    const mHatR = (fx * dx + fz * dz) / r
    return ((body.chi * v * fieldT) / (4 * Math.PI * r ** 3)) * (3 * mHatR * mHatR - 1)
  }

  const half = body.strikeLength / 2
  if (half <= 0 || body.x2 <= body.x1 || body.z2 <= body.z1) return 0
  const t = prismQuantities(x, y, 0, { x1: body.x1, x2: body.x2, y1: body.y - half, y2: body.y + half, z1: body.z1, z2: body.z2 })
  // f̂ = (fx, 0, fz): f̂ᵀ T̂ f̂ = fx²·xx + 2·fx·fz·xz + fz²·zz
  const projected = fx * fx * t.xx + 2 * fx * fz * t.xz + fz * fz * t.zz
  return (body.chi * fieldT * projected) / (4 * Math.PI)
}

function bodySummary(body: MagBody, fieldT: number): MagBodySummary {
  const m = (body.chi * fieldT) / MU0
  if (body.kind === 'dipole') {
    const v = (4 / 3) * Math.PI * body.radius ** 3
    return { id: body.id, kind: body.kind, chi: body.chi, sizeValue: v, momentAm2: m * v, x: body.x, y: body.y, z: body.z }
  }
  const volume = Math.max(0, (body.x2 - body.x1) * (body.z2 - body.z1) * body.strikeLength)
  return {
    id: body.id,
    kind: body.kind,
    chi: body.chi,
    sizeValue: volume,
    momentAm2: m * volume,
    x: (body.x1 + body.x2) / 2,
    y: body.y,
    z: (body.z1 + body.z2) / 2,
  }
}

function computeMap(survey: MagInput['survey'], fieldT: number, incRad: number, bodies: MagBody[], x: number[], n: number): MagMap {
  const lines = Math.max(3, Math.round(survey.mapLines))
  const y: number[] = []
  for (let j = 0; j < lines; j++) y.push((j - (lines - 1) / 2) * survey.mapLineSpacing)

  const perLine = Math.max(2, Math.floor(MAX_MAP_NODES / lines))
  const stride = Math.max(1, Math.ceil(n / perLine))
  const mapX: number[] = []
  for (let i = 0; i < n; i += stride) mapX.push(x[i])
  if (mapX.length < 2) mapX.push(mapX[0] !== undefined ? mapX[0] + survey.stationSpacing : survey.stationSpacing)

  const valuesNT = y.map((yy) => mapX.map((xx) => bodies.reduce((acc, b) => acc + bodyAnomalyT3D(b, xx, yy, fieldT, incRad), 0) * 1e9))
  return { x: mapX, y, valuesNT, stride }
}

/** Deterministic forward run; identical inputs give identical outputs. */
export function runMagneticForward(input: MagInput): MagResult {
  const { survey, bodies } = input
  const n = Math.min(Math.floor(survey.lineLength / survey.stationSpacing) + 1, MAX_STATIONS)
  const x: number[] = []
  for (let i = 0; i < n; i++) x.push(i * survey.stationSpacing)

  const fieldT = survey.fieldNT * 1e-9
  const incRad = (survey.inclinationDeg * Math.PI) / 180
  const rng = mulberry32(survey.seed)

  const perBodyNT: number[][] = bodies.map(() => new Array<number>(n).fill(0))
  const totalNoiseFree = new Array<number>(n).fill(0)

  for (let b = 0; b < bodies.length; b++) {
    for (let i = 0; i < n; i++) {
      const a = bodyAnomalyT3D(bodies[b], x[i], 0, fieldT, incRad) * 1e9
      perBodyNT[b][i] = a
      totalNoiseFree[i] += a
    }
  }

  const totalNT = totalNoiseFree.map((v) => v + (survey.noiseNT > 0 ? gaussian(rng) * survey.noiseNT : 0))

  let maxAbs = 0
  let sumSq = 0
  for (let i = 0; i < n; i++) {
    maxAbs = Math.max(maxAbs, Math.abs(totalNT[i]))
    sumSq += totalNT[i] * totalNT[i]
  }
  let minV = Infinity
  let maxV = -Infinity
  for (const v of totalNoiseFree) {
    minV = Math.min(minV, v)
    maxV = Math.max(maxV, v)
  }

  const map = computeMap(survey, fieldT, incRad, bodies, x, n)
  let mapMaxAbsNT = 0
  let mapMinNT = Infinity
  let mapMaxNT = -Infinity
  for (const row of map.valuesNT) {
    for (const v of row) {
      mapMaxAbsNT = Math.max(mapMaxAbsNT, Math.abs(v))
      mapMinNT = Math.min(mapMinNT, v)
      mapMaxNT = Math.max(mapMaxNT, v)
    }
  }

  const warnings: MagResult['diagnostics']['warnings'] = []
  for (const body of bodies) {
    if (body.kind === 'prism') {
      if (body.z1 <= 0.05) warnings.push({ key: 'prismAtSurface', params: { id: body.id } })
      if (body.chi >= 0.5) warnings.push({ key: 'strongChi', params: { id: body.id, chi: body.chi.toFixed(2) } })
    } else {
      if (body.z - body.radius <= 0) warnings.push({ key: 'sphereAtSurface', params: { id: body.id } })
      if (body.chi >= 0.5) warnings.push({ key: 'strongChi', params: { id: body.id, chi: body.chi.toFixed(2) } })
      if (body.radius > body.z) warnings.push({ key: 'dipoleNearField', params: { id: body.id } })
    }
  }

  return {
    x,
    totalNT,
    perBodyNT,
    map,
    bodies: bodies.map((b) => bodySummary(b, fieldT)),
    diagnostics: {
      nStations: n,
      maxAbsNT: maxAbs,
      rmsNT: Math.sqrt(sumSq / Math.max(n, 1)),
      peakToPeakNT: Number.isFinite(minV) ? maxV - minV : 0,
      noiseNT: survey.noiseNT,
      mapMaxAbsNT: Number.isFinite(mapMaxAbsNT) ? mapMaxAbsNT : 0,
      mapMinNT: Number.isFinite(mapMinNT) ? mapMinNT : 0,
      mapMaxNT: Number.isFinite(mapMaxNT) ? mapMaxNT : 0,
      warnings,
    },
    survey,
  }
}
