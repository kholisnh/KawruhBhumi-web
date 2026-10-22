/** Typed structures for the gravity forward model. Display units: metres, mGal, kg/m³. */

export interface GrvSphereBody {
  id: string
  kind: 'sphere'
  /** Sphere centre position along the profile [m]. */
  x: number
  /** Sphere centre position across the profile [m]. */
  y: number
  /** Sphere centre depth [m]. */
  z: number
  /** Sphere radius [m]. */
  radius: number
  /** Density contrast relative to the host [kg/m³]. */
  deltaRho: number
}

export interface GrvPrismBody {
  id: string
  kind: 'prism'
  /** Horizontal extent along the profile [m]. */
  x1: number
  x2: number
  /** Centre of the strike extent across the profile [m]. */
  y: number
  /** Finite strike length along y [m] (extent y ± strikeLength/2). */
  strikeLength: number
  /** Depth extent (top, bottom) [m]. */
  z1: number
  z2: number
  /** Density contrast relative to the host [kg/m³]. */
  deltaRho: number
}

export type GrvBody = GrvSphereBody | GrvPrismBody

export interface GrvSurvey {
  /** Profile length [m]. */
  lineLength: number
  /** Station spacing [m]. */
  stationSpacing: number
  /** Gaussian noise level, absolute [mGal]. */
  noiseMGal: number
  /** Number of parallel lines of the map survey grid (odd, centred on the profile). */
  mapLines: number
  /** Spacing between map survey lines [m]. */
  mapLineSpacing: number
  /** Deterministic noise seed. */
  seed: number
}

export interface GrvInput {
  bodies: GrvBody[]
  survey: GrvSurvey
}

export interface GrvBodySummary {
  id: string
  kind: GrvBody['kind']
  deltaRho: number
  /** Body volume [m³]. */
  sizeValue: number
  /** Excess mass Δρ·V [kg]. */
  excessMassKg: number
  x: number
  y: number
  z: number
  /** Maximum anomaly over the body centre [mGal] (noise-free). */
  peakMGal: number
}

export interface GrvMap {
  /** Station positions sampled for the map [m]. */
  x: number[]
  /** Map line positions across the profile [m] (centred on y = 0). */
  y: number[]
  /** Noise-free anomaly [mGal], [line][station]. */
  valuesMGal: number[][]
  /** Station decimation used for the map (1 = every station). */
  stride: number
}

export interface GrvDiagnostics {
  nStations: number
  maxAbsMGal: number
  rmsMGal: number
  peakToPeakMGal: number
  noiseMGal: number
  /** Peak |anomaly| on the map grid [mGal] (noise-free). */
  mapMaxAbsMGal: number
  mapMinMGal: number
  mapMaxMGal: number
  warnings: Array<{ key: string; params: Record<string, string | number> }>
}

export interface GrvResult {
  x: number[]
  /** Vertical attraction (positive downwards) [mGal], including noise. */
  gMGal: number[]
  /** Per-body contributions [mGal] (noise-free). */
  perBodyMGal: number[][]
  /** Noise-free anomaly on the map survey grid. */
  map: GrvMap
  bodies: GrvBodySummary[]
  diagnostics: GrvDiagnostics
  survey: GrvSurvey
}
