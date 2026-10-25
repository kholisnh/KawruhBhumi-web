export interface HvsrLayer {
  id: string
  /** Thickness in metres. The last layer is a half-space and uses 0. */
  thickness: number
  /** Shear-wave velocity in m/s. */
  vs: number
}

export interface HvsrModel {
  layers: HvsrLayer[]
}

export interface HvsrSurvey {
  fMin: number
  fMax: number
  nFreq: number
  /** Shear-wave quality factor used for numerical damping. */
  qs: number
  /** Multiplicative log-normal noise applied to the H/V curve [%]. */
  noisePercent: number
  seed: number
}

export interface HvsrInput {
  model: HvsrModel
  survey: HvsrSurvey
}

export interface HvsrDiagnostics {
  nLayers: number
  maxDepthM: number
  f0: number
  a0: number
  /** f0 predicted by Vs/(4H) for a single layer, using the thickness-weighted Vs. */
  quarterWaveEstimate: number
  peakAtEdge: boolean
  lowContrast: boolean
  warnings: Array<{ key: string; params: Record<string, string | number> }>
}

export interface HvsrResult {
  frequencies: number[]
  hvsr: number[]
  hHorizontal: number[]
  hVertical: number[]
  model: HvsrModel
  survey: HvsrSurvey
  diagnostics: HvsrDiagnostics
}

export interface HvsrInversionSettings {
  /** Number of layers including the half-space (2–5). */
  layerCount: number
  /** Initial uniform samples. */
  initialSamples: number
  /** Number of best models retained at each iteration. */
  bestCount: number
  /** New samples generated per iteration. */
  newSamples: number
  /** Number of refinement iterations. */
  iterations: number
  seed: number
}

export interface HvsrInversionModel {
  layers: HvsrLayer[]
  misfit: number
}

export interface HvsrInversionResult {
  best: HvsrInversionModel
  ensemble: HvsrInversionModel[]
  frequencies: number[]
  observed: number[]
  predicted: number[]
  /** 5th/50th/95th percentile Vs at each depth. */
  depth: number[]
  vsP05: number[]
  vsP50: number[]
  vsP95: number[]
  misfit: number
  settings: HvsrInversionSettings
  evaluations: number
}
