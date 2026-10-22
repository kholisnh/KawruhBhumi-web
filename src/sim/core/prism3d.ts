/**
 * Exact closed-form gravity quantities of a homogeneous rectangular prism,
 * z positive downwards, in the corner-sum formulation of the second
 * derivatives of the potential (Nagy, Papp & Benedek 2000).
 *
 * The functions return the geometric part of the field only:
 *   - gHat  : ∫ (x_i − ξ_i)/r³ dV  [m], so that g_i = G·Δρ·gHat_i [m/s²]
 *   - tensor: ∂²/∂x_i∂x_j ∫ dV/r   [dimensionless], so that the true gravity
 *     gradient is G·Δρ·tensor.
 *
 * The dimensionless tensor is also used for magnetics through Poisson's
 * relation: the anomalous field of a uniformly magnetized body is
 * B = (μ₀/4π)·M·T̂ (outside the body), giving
 * ΔT ≈ (χ·F₀/4π)·f̂ᵀ T̂ f̂  for induced magnetization M = χH₀ = χF₀/μ₀.
 */

export interface PrismBox {
  x1: number
  x2: number
  y1: number
  y2: number
  z1: number
  z2: number
}

export interface PrismQuantities {
  /** ∫(∂/∂x)(1/r) dV: x component of the attraction per G·Δρ, z down positive. */
  gx: number
  gy: number
  gz: number
  xx: number
  yy: number
  zz: number
  xy: number
  xz: number
  yz: number
}

/** Safe log for (u + r) → 0 (observation exactly on an edge/face). */
function lnSum(u: number, w: number): number {
  const v = u + w
  return v > 1e-12 ? Math.log(v) : 0
}

/**
 * Single-argument arctangent u/v as in the classic corner formulas. Unlike
 * atan2 it decays with distance (the pieces of π introduced by atan2 do not
 * cancel between corners). v == 0 is the well-defined ±π/2 limit.
 */
function atanq(u: number, v: number): number {
  if (v !== 0) return Math.atan(u / v)
  return u > 0 ? Math.PI / 2 : u < 0 ? -Math.PI / 2 : 0
}

/**
 * All first and second derivatives of the unit-density potential ∫ dV/r of a
 * rectangular prism in a single pass over the eight corners.
 */
export function prismQuantities(x: number, y: number, z: number, p: PrismBox): PrismQuantities {
  const xs = [p.x1, p.x2]
  const ys = [p.y1, p.y2]
  const zs = [p.z1, p.z2]
  let gx = 0
  let gy = 0
  let gz = 0
  let xx = 0
  let yy = 0
  let zz = 0
  let xy = 0
  let xz = 0
  let yz = 0
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      for (let k = 0; k < 2; k++) {
        const X = x - xs[i]
        const Y = y - ys[j]
        const Z = z - zs[k]
        const r = Math.sqrt(X * X + Y * Y + Z * Z)
        const s = (i === 0 ? -1 : 1) * (j === 0 ? -1 : 1) * (k === 0 ? -1 : 1)
        const atX = atanq(Y * Z, X * r)
        const atY = atanq(X * Z, Y * r)
        const atZ = atanq(X * Y, Z * r)
        xx += s * atX
        yy += s * atY
        zz += s * atZ
        xy -= s * lnSum(Z, r)
        xz -= s * lnSum(Y, r)
        yz -= s * lnSum(X, r)
        gx += s * (X * atX - Y * lnSum(Z, r) - Z * lnSum(Y, r))
        gy += s * (Y * atY - X * lnSum(Z, r) - Z * lnSum(X, r))
        gz += s * (Z * atZ - X * lnSum(Y, r) - Y * lnSum(X, r))
      }
    }
  }
  return { gx, gy, gz, xx, yy, zz, xy, xz, yz }
}

/** Vertical attraction per G·Δρ [m] (z down positive). */
export function prismGzHat(x: number, y: number, z: number, p: PrismBox): number {
  return prismQuantities(x, y, z, p).gz
}
