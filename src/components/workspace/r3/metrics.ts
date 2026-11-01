import type { ChallengeCurve, ChallengeFeedback } from './types'

function interpolateY(xs: number[], ys: number[], x: number): number {
  if (xs.length === 0 || ys.length === 0) return Number.NaN
  if (x <= xs[0]) return ys[0]
  const last = xs.length - 1
  if (x >= xs[last]) return ys[last]
  let lo = 0
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (xs[mid] <= x) lo = mid
    else hi = mid
  }
  const span = xs[hi] - xs[lo]
  if (span === 0) return ys[lo]
  const t = (x - xs[lo]) / span
  return ys[lo] + (ys[hi] - ys[lo]) * t
}

function transform(value: number, log: boolean): number {
  return log ? Math.log10(Math.max(value, 1e-9)) : value
}

/** Normalized RMS mismatch in percent, interpolating the current curve onto the target x-axis. */
export function curveMisfit(target: ChallengeCurve, current: ChallengeCurve): number {
  if (target.x.length < 2 || current.x.length < 2) return 100
  const log = target.yType === 'log'
  const ty = target.y.map((value) => transform(value, log))
  const cy = target.x.map((x) => transform(interpolateY(current.x, current.y, x), log))
  let sum = 0
  let count = 0
  for (let i = 0; i < ty.length; i++) {
    if (!Number.isFinite(ty[i]) || !Number.isFinite(cy[i])) continue
    const diff = cy[i] - ty[i]
    sum += diff * diff
    count += 1
  }
  if (count === 0) return 100
  let peak = 1e-9
  for (const value of ty) peak = Math.max(peak, Math.abs(value))
  for (const value of cy) peak = Math.max(peak, Math.abs(value))
  return 100 * Math.sqrt(sum / count) / peak
}

export function scoreFromMisfit(misfit: number): number {
  return Math.round(Math.max(0, Math.min(100, 100 - 2 * misfit)))
}

export function feedbackFor(misfit: number): ChallengeFeedback {
  if (misfit <= 5) return 'excellent'
  if (misfit <= 10) return 'good'
  if (misfit <= 20) return 'close'
  return 'far'
}
