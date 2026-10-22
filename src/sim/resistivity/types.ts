export interface VesLayer {
  /** Layer thickness in metres. The last (half-space) layer uses null. */
  thicknessM: number | null
  resistivityOhmM: number
}

export type VesArrayType = 'wenner' | 'schlumberger'

export interface VesCurvePoint {
  /** Wenner a-spacing or Schlumberger AB/2, in metres. */
  spacingM: number
  rhoAOhmM: number
}

export interface VesCurveOptions {
  /** Wenner a-spacing or Schlumberger AB/2 values, in metres. */
  spacingsM: number[]
  /** Schlumberger MN/2 in metres; defaults to spacing / 3. */
  mnHalfM?: number
}

export interface VesModel {
  name: string
  layers: VesLayer[]
}
