import type { VesArrayType, VesCurveOptions, VesCurvePoint, VesLayer } from './types'

/** Eight-point Gauss–Legendre abscissae and weights on [-1, 1]. */
const GL_X = [
  -0.9602898564975363, -0.7966664774136267, -0.525532409916329, -0.1834346424956498,
  0.1834346424956498, 0.525532409916329, 0.7966664774136267, 0.9602898564975363,
]
const GL_W = [
  0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.362683783378362,
  0.362683783378362, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763,
]

/**
 * Bessel function J0(x) using the rational (|x| < 8) and asymptotic (x >= 8)
 * approximations from Numerical Recipes, accurate to about 1e-8.
 */
export function besselJ0(x: number): number {
  const ax = Math.abs(x)
  if (ax < 8) {
    const y = x * x
    const a =
      57568490574.0 +
      y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))))
    const b =
      57568490411.0 + y * (1029532985.0 + y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y))))
    return a / b
  }
  const z = 8 / ax
  const y = z * z
  const xx = ax - 0.785398164
  const p = 1 + y * (-0.001098628627 + y * (0.00002734510407 + y * (-0.000002073370639 + y * 0.0000002093887211)))
  const q = -0.01562499995 + y * (0.0001430488765 + y * (-0.000006911147651 + y * (0.0000007621095161 - y * 0.0000000934935152)))
  return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * p - z * Math.sin(xx) * q)
}

/**
 * Resistivity transform T(λ) at the surface for a layered earth (Stefanescu).
 * Recursion from the bottom half-space upwards:
 *   T_j = ρ_j (T_{j+1} + ρ_j tanh(λ h_j)) / (ρ_j + T_{j+1} tanh(λ h_j))
 */
export function surfaceTransform(lambda: number, layers: readonly VesLayer[]): number {
  let transform = layers[layers.length - 1].resistivityOhmM
  for (let j = layers.length - 2; j >= 0; j--) {
    const rho = layers[j].resistivityOhmM
    const t = Math.tanh(lambda * (layers[j].thicknessM ?? 0))
    transform = (rho * (transform + rho * t)) / (rho + transform * t)
  }
  return transform
}

/**
 * Hankel integral of the layered-earth kernel:
 *   J(r1) − J(r2) = ∫₀^∞ [T(λ) − ρ₁] [J₀(λ r1) − J₀(λ r2)] dλ
 * The kernel decays as exp(−2 λ h_min), so the quadrature stops at λ ≈ 10 / h_min.
 */
function integrateKernel(layers: readonly VesLayer[], rMax: number, sample: (lambda: number) => number): number {
  if (layers.length < 2) return 0
  const rho1 = layers[0].resistivityOhmM
  const hMin = Math.min(...layers.slice(0, -1).map((layer) => layer.thicknessM ?? Infinity))
  const lambdaMax = Number.isFinite(hMin) ? 10 / hMin : 10
  const step = Math.min(Math.PI / (2 * rMax), hMin > 0 ? 0.125 / hMin : Math.PI / (2 * rMax))

  let total = 0
  for (let lo = 0; lo < lambdaMax; lo += step) {
    const hi = Math.min(lo + step, lambdaMax)
    const mid = 0.5 * (lo + hi)
    const half = 0.5 * (hi - lo)
    let local = 0
    for (let k = 0; k < 8; k++) {
      const lambda = mid + half * GL_X[k]
      local += GL_W[k] * (surfaceTransform(lambda, layers) - rho1) * sample(lambda)
    }
    total += local * half
  }
  return total
}

export function hankelDifference(layers: readonly VesLayer[], r1: number, r2: number): number {
  return integrateKernel(layers, Math.max(r1, r2), (lambda) => besselJ0(lambda * r1) - besselJ0(lambda * r2))
}

/** J(r) = ∫₀^∞ [T(λ) − ρ₁] J₀(λr) dλ, the layered contribution to potential. */
export function hankelJ(layers: readonly VesLayer[], rM: number): number {
  return integrateKernel(layers, rM, (lambda) => besselJ0(lambda * rM))
}

/** Wenner apparent resistivity: ρa = ρ₁ + 2a [J(a) − J(2a)]. */
export function wennerApparent(layers: readonly VesLayer[], aM: number): number {
  const rho1 = layers[0].resistivityOhmM
  return rho1 + 2 * aM * hankelDifference(layers, aM, 2 * aM)
}

/** Schlumberger apparent resistivity: ρa = ρ₁ + (L²−b²)/(2b) [J(L−b) − J(L+b)]. */
export function schlumbergerApparent(layers: readonly VesLayer[], abHalfM: number, mnHalfM: number): number {
  const rho1 = layers[0].resistivityOhmM
  const l = abHalfM
  const b = mnHalfM
  if (!(b > 0) || b >= l) return Number.NaN
  const factor = (l * l - b * b) / (2 * b)
  return rho1 + factor * hankelDifference(layers, l - b, l + b)
}

export function apparentResistivity(
  layers: readonly VesLayer[],
  array: VesArrayType,
  spacingM: number,
  mnHalfM?: number,
): number {
  return array === 'wenner' ? wennerApparent(layers, spacingM) : schlumbergerApparent(layers, spacingM, mnHalfM ?? spacingM / 3)
}

export function computeVesCurve(
  layers: readonly VesLayer[],
  array: VesArrayType,
  options: VesCurveOptions,
): VesCurvePoint[] {
  return options.spacingsM.map((spacingM) => ({
    spacingM,
    rhoAOhmM: apparentResistivity(layers, array, spacingM, options.mnHalfM),
  }))
}

/** Logarithmically spaced soundings from min to max (inclusive). */
export function logSpacings(minM: number, maxM: number, count: number): number[] {
  if (count < 2) return [minM]
  const ratio = Math.log(maxM / minM) / (count - 1)
  return Array.from({ length: count }, (_, i) => minM * Math.exp(i * ratio))
}

/** Closed-form two-layer apparent resistivity, used to validate the quadrature. */
export function twoLayerWenner(rho1: number, rho2: number, hM: number, aM: number): number {
  const k = (rho2 - rho1) / (rho2 + rho1)
  let sum = 0
  let term = k
  for (let m = 1; m <= 200; m++) {
    const depth = 2 * m * hM
    sum += term * (1 / Math.hypot(aM, depth) - 1 / Math.hypot(2 * aM, depth))
    term *= k
    if (Math.abs(term) < 1e-15) break
  }
  return rho1 + 4 * aM * rho1 * sum
}

/** Closed-form two-layer apparent resistivity for the Schlumberger array. */
export function twoLayerSchlumberger(rho1: number, rho2: number, hM: number, lM: number, bM: number): number {
  const k = (rho2 - rho1) / (rho2 + rho1)
  let sum = 0
  let term = k
  for (let m = 1; m <= 200; m++) {
    const depth = 2 * m * hM
    sum += term * (1 / Math.hypot(lM - bM, depth) - 1 / Math.hypot(lM + bM, depth))
    term *= k
    if (Math.abs(term) < 1e-15) break
  }
  return rho1 + 2 * rho1 * ((lM * lM - bM * bM) / (2 * bM)) * sum
}
