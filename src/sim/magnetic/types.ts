/** Typed structures for the magnetic forward model. Display units: metres, nT, SI susceptibility. */

export type MagBodyKind = 'dipole' | 'prism'

export interface MagDipoleBody {
  id: string
  kind: 'dipole'
  /** Sphere centre position along the profile [m]. */
  x: number
  /** Sphere centre position across the profile [m]. */
  y: number
  /** Sphere centre depth [m]. */
  z: number
  /** Sphere radius [m] (volume = 4/3 π R³). */
  radius: number
  /** Magnetic susceptibility (SI, dimensionless). */
  chi: number
}

export interface MagPrismBody {
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
  /** Magnetic susceptibility (SI, dimensionless). */
  chi: number
}

export type MagBody = MagDipoleBody | MagPrismBody

export interface MagSurvey {
  /** Ambient total field intensity [nT]. */
  fieldNT: number
  /** Field inclination [°], positive downwards. */
  inclinationDeg: number
  /** Profile length [m]. */
  lineLength: number
  /** Station spacing [m]. */
  stationSpacing: number
  /** Gaussian noise level, absolute [nT]. */
  noiseNT: number
  /** Number of parallel lines of the map survey grid (odd, centred on the profile). */
  mapLines: number
  /** Spacing between map survey lines [m]. */
  mapLineSpacing: number
  /** Deterministic noise seed. */
  seed: number
}

export interface MagInput {
  bodies: MagBody[]
  survey: MagSurvey
}

export interface MagBodySummary {
  id: string
  kind: MagBodyKind
  chi: number
  /** Body volume [m³]. */
  sizeValue: number
  /** Effective dipole moment M·V [A·m²]. */
  momentAm2: number
  x: number
  y: number
  z: number
}

export interface MagMap {
  /** Station positions sampled for the map [m]. */
  x: number[]
  /** Map line positions across the profile [m] (centred on y = 0). */
  y: number[]
  /** Noise-free anomaly [nT], [line][station]. */
  valuesNT: number[][]
  /** Station decimation used for the map (1 = every station). */
  stride: number
}

export interface MagDiagnostics {
  nStations: number
  maxAbsNT: number
  rmsNT: number
  /** Peak-to-peak amplitude of the total anomaly [nT]. */
  peakToPeakNT: number
  noiseNT: number
  /** Peak |anomaly| on the map grid [nT] (noise-free). */
  mapMaxAbsNT: number
  mapMinNT: number
  mapMaxNT: number
  warnings: Array<{ key: string; params: Record<string, string | number> }>
}

export interface MagResult {
  /** Station positions [m]. */
  x: number[]
  /** Total-field anomaly ΔT [nT] including noise. */
  totalNT: number[]
  /** Per-body contributions [nT] (noise-free). */
  perBodyNT: number[][]
  /** Noise-free anomaly on the map survey grid. */
  map: MagMap
  bodies: MagBodySummary[]
  diagnostics: MagDiagnostics
  survey: MagSurvey
}
