/** Shared wavelet helpers for the seismic forward models. */

/** Samples per dominant period used to discretize wavelets. */
export const SAMPLES_PER_PERIOD = 8

/** Analytic Ricker wavelet at time lag τ [ms] with centre frequency f [Hz]. */
export function rickerAt(tauMs: number, fHz: number): number {
  const tau = tauMs / 1000
  const a = Math.PI * fHz * tau
  return (1 - 2 * a * a) * Math.exp(-a * a)
}
