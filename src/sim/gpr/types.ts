/** Typed data structures for the GPR forward model. All inputs use display units. */

export interface EmLayer {
  id: string
  /** Thickness in metres. Ignored for the last layer (semi-infinite half-space). */
  thickness: number
  /** Relative dielectric permittivity εr (dimensionless, ≥ 1). */
  epsR: number
  /** Electrical conductivity in millisiemens per metre. */
  sigma: number
}

export type TargetKind = 'point' | 'cylinder'

export interface GprTarget {
  id: string
  kind: TargetKind
  /** Horizontal position along the survey line [m]. */
  x: number
  /** Depth of the target centre [m]. */
  z: number
  /** Radius [m] — used for the cylinder amplitude model and the glyph. */
  radius: number
  /** Relative permittivity of the target. Use a very large value for the PEC (metal) limit. */
  epsR: number
  /** Conductivity of the target [mS/m]. Currently informational (contrast enters through εr). */
  sigma: number
}

export interface GprModel {
  /** Layers top → bottom; the last layer is the semi-infinite half-space. */
  layers: EmLayer[]
  targets: GprTarget[]
}

export interface GprSurvey {
  /** Antenna centre frequency [MHz]. */
  frequencyMHz: number
  /** Trace spacing along the line [m]. */
  traceSpacing: number
  /** Survey line length [m]. */
  lineLength: number
  /** Explicit time window [ns]; null = automatic (recommended). */
  timeWindowNs: number | null
  /** Relative noise level [% of maximum synthetic amplitude]. */
  noisePercent: number
  /** Deterministic noise seed. */
  seed: number
}

export interface GprInput {
  model: GprModel
  survey: GprSurvey
}

export interface LayerDiagnostics {
  index: number
  /** Thickness [m]; Infinity for the half-space. */
  thickness: number
  epsR: number
  sigma: number
  /** Wave velocity [m/s]. */
  velocity: number
  /** Low-loss attenuation [Np/m]. */
  alpha: number
  /** One-way amplitude skin depth 1/α [m]; Infinity when α = 0. */
  skinDepth: number
  /** Cumulative two-way travel time at the base of the layer [ns]; null for the half-space. */
  twtBottomNs: number | null
}

export interface InterfacePick {
  /** 1-based interface index (top → bottom). */
  index: number
  /** Depth of the interface [m]. */
  depthM: number
  /** Two-way travel time to the interface [ns]. */
  twtNs: number
  /** Normal-incidence reflection coefficient. */
  reflectionCoef: number
  /** Velocity above / below [m/s]. */
  vAbove: number
  vBelow: number
  /** Relative two-way amplitude after transmission and attenuation losses (before normalization). */
  amplitude: number
}

export interface TargetPick {
  id: string
  kind: TargetKind
  x: number
  z: number
  /** Apex two-way travel time [ns]. */
  apexTNs: number
  /** Effective reflection coefficient at the target (host vs target εr). */
  reflectionCoef: number
  /** RMS velocity of the layers above the target [m/s]. */
  vRms: number
  /** Host layer index used for the contrast. */
  hostLayer: number
}

export interface SolverWarning {
  key: string
  params: Record<string, string | number>
}

export interface GprDiagnostics {
  /** Sample interval [ns]. */
  dtNs: number
  samples: number
  nTraces: number
  /** Actual time window used [ns]. */
  timeWindowNs: number
  /** Depth of the base of the last finite layer [m]. */
  totalDepthM: number
  /** Displayed model depth [m]. */
  displayDepthM: number
  /** Thickness-weighted average velocity [m/s]. */
  vAvg: number
  /** Antenna wavelength in the average medium [m]. */
  wavelengthM: number
  /** Vertical resolution estimate λ/4 [m]. */
  verticalResolutionM: number
  /** Thickness-weighted average 1/e amplitude depth [m]. */
  avgSkinDepthM: number
  /** Maximum |amplitude| of the raw synthetic before normalization. */
  maxAbsAmplitude: number
  /** Samples per period of the antenna frequency. */
  samplesPerPeriod: number
  warnings: SolverWarning[]
}

export interface GprResult {
  /** Trace positions along the line [m]. */
  x: number[]
  /** Two-way travel time axis [ns]. */
  tNs: number[]
  /** radargram[traceIndex][sampleIndex], normalized to [-1, 1] relative amplitude. */
  radargram: number[][]
  /** Index of the trace displayed as A-scan. */
  aScanIndex: number
  layers: LayerDiagnostics[]
  interfaces: InterfacePick[]
  targets: TargetPick[]
  diagnostics: GprDiagnostics
  /** Echo of the survey for the summary panel. */
  survey: GprSurvey
}
