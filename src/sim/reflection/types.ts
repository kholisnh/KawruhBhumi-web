/** Typed structures for the seismic-reflection forward model. Display units: m, m/s, kg/m³, ms, Hz. */

export interface ReflLayer {
  id: string
  /** P-wave velocity [m/s]. */
  vp: number
  /** Density [kg/m³]. */
  rho: number
  /** Thickness [m]; ignored for the last layer (half-space). */
  thickness: number
}

export interface ReflSurvey {
  /** Ricker wavelet centre frequency [Hz]. */
  waveletFreqHz: number
  /** Recording time window [ms]; null = automatic. */
  timeWindowMs: number | null
  /** Minimum source–receiver offset of the gather [m]. */
  minOffsetM: number
  /** Maximum source–receiver offset of the gather [m]. */
  maxOffsetM: number
  /** Number of offset traces in the gather (including the near trace). */
  nOffsets: number
  /** Gaussian noise level [% of maximum synthetic amplitude]. */
  noisePercent: number
  /** Deterministic noise seed. */
  seed: number
}

export interface ReflInput {
  layers: ReflLayer[]
  survey: ReflSurvey
}

export interface ReflPick {
  /** 1-based interface index (top → bottom). */
  index: number
  /** Interface depth [m]. */
  depthM: number
  /** Zero-offset two-way travel time [ms]. */
  twtMs: number
  /** Acoustic impedance above / below [kg/(m²·s)]. */
  zAbove: number
  zBelow: number
  /** Normal-incidence reflection coefficient. */
  reflectionCoef: number
  /** Cumulative two-way transmission loss applied to this primary. */
  transmission: number
  /** Relative primary amplitude (R × transmission). */
  amplitude: number
  /** RMS velocity of the layers above [m/s]. */
  vrms: number
}

export interface ReflDiagnostics {
  dtMs: number
  samples: number
  timeWindowMs: number
  /** Thickness-weighted average velocity [m/s]. */
  vAvg: number
  /** Dominant wavelength in the average medium [m]. */
  wavelengthM: number
  /** Vertical resolution estimate λ/4 [m]. */
  verticalResolutionM: number
  maxAbsAmplitude: number
  warnings: Array<{ key: string; params: Record<string, string | number> }>
}

export interface ReflResult {
  /** Two-way time axis [ms]. */
  tMs: number[]
  /** Zero-offset synthetic trace (normalized relative amplitude). */
  trace: number[]
  /** Gather: amplitude matrix [offsetIndex][sampleIndex] (normalized). */
  gather: number[][]
  offsetsM: number[]
  picks: ReflPick[]
  diagnostics: ReflDiagnostics
  survey: ReflSurvey
}
