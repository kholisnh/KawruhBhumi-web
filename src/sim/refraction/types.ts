/** Typed structures for the seismic-refraction forward model. Display units: m, m/s, ms. */

export interface RefrLayer {
  id: string
  /** P-wave velocity [m/s]. */
  vp: number
  /** Thickness [m]; ignored for the last layer (half-space). */
  thickness: number
}

export interface RefrSurvey {
  /** Maximum source–geophone offset (spread length) [m]. */
  spreadLength: number
  /** Geophone spacing [m]. */
  geophoneSpacing: number
  /** Gaussian pick-time noise [ms]. */
  noiseMs: number
  /** Dominant source frequency of the synthetic shot record [Hz]. */
  waveletFreqHz: number
  /** Continuous record noise, % of maximum trace amplitude. */
  traceNoisePercent: number
  /** Deterministic noise seed. */
  seed: number
}

export interface RefrInput {
  layers: RefrLayer[]
  survey: RefrSurvey
}

export interface RefrBranch {
  /** 0 = direct wave; i ≥ 1 = head wave along the base of layer i (1-based). */
  index: number
  /** Interface index (0-based) for head waves; null for the direct wave. */
  interfaceIndex: number | null
  /** Apparent (slope) velocity [m/s]; layer velocity or refractor velocity. */
  velocity: number
  /** Intercept time at x = 0 [ms]. */
  interceptMs: number
  /** Critical angle at the refractor [°] (90 for the direct wave). */
  criticalAngleDeg: number
  /** Crossover distance with the previous valid branch [m]; null if none. */
  crossoverM: number | null
  /** Branch travel time at every receiver [ms]. */
  timesMs: number[]
}

export interface RefrDiagnostics {
  nReceivers: number
  /** Number of head-wave branches that reach the far receiver as first arrival. */
  nRefractedFirstArrivals: number
  /** Two-layer intercept-time depth estimate for the first refractor [m]; null when not applicable. */
  firstRefractorDepthM: number | null
  vDirectMps: number
  maxFirstArrivalMs: number
  warnings: Array<{ key: string; params: Record<string, string | number> }>
}

/**
 * Schematic synthetic shot record ("field-style" seismic traces).
 * Amplitudes are normalized relative values from a geometric-spreading model
 * (no elastic radiation pattern, no attenuation, no surface waves) — the wavelet
 * arrival times are exact for the layered model; the amplitudes are display-realistic,
 * not an elastodynamic solution.
 */
export interface RefrSeismogram {
  /** Record time axis [ms]. */
  tMs: number[]
  /** One trace per receiver [receiver][sample]; globally normalized to max |amp| = 1. */
  traces: number[][]
  /** Dominant source frequency used [Hz]. */
  f0Hz: number
  /** Sample interval [ms]. */
  dtMs: number
}

export interface RefrResult {
  /** Receiver positions [m] (shot at x = 0). */
  x: number[]
  /** Travel times of every branch (null where the branch is not generated). */
  branchTimesMs: Array<number[] | null>
  /** First-arrival travel time at every receiver (includes noise). */
  firstArrivalMs: number[]
  /** First-arrival travel time without noise. */
  firstArrivalCleanMs: number[]
  /** Index of the branch that is first at each receiver; -1 when undefined. */
  firstArrivalBranch: number[]
  branches: RefrBranch[]
  /** Synthetic shot record with a trace per receiver. */
  seismogram: RefrSeismogram
  diagnostics: RefrDiagnostics
  survey: RefrSurvey
}
