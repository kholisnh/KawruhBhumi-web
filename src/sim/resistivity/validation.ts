import type { VesLayer } from './types'

export type VesIssueCode =
  | 'layerCount'
  | 'resistivityRange'
  | 'thicknessRange'
  | 'lastThickness'
  | 'arrayGeometry'

export interface VesIssue {
  code: VesIssueCode
  layer?: number
}

export const VES_LIMITS = {
  minLayers: 2,
  maxLayers: 8,
  minResistivityOhmM: 0.1,
  maxResistivityOhmM: 100000,
  minThicknessM: 0.1,
  maxThicknessM: 200,
  maxTotalDepthM: 500,
  minSpacingM: 0.1,
  maxSpacingM: 1000,
} as const

const inRange = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max

export function validateVesLayers(layers: readonly VesLayer[]): VesIssue[] {
  const issues: VesIssue[] = []
  if (layers.length < VES_LIMITS.minLayers || layers.length > VES_LIMITS.maxLayers) {
    issues.push({ code: 'layerCount' })
  }

  layers.forEach((layer, index) => {
    if (!inRange(layer.resistivityOhmM, VES_LIMITS.minResistivityOhmM, VES_LIMITS.maxResistivityOhmM)) {
      issues.push({ code: 'resistivityRange', layer: index })
    }
    const isLast = index === layers.length - 1
    if (isLast && layer.thicknessM !== null) {
      issues.push({ code: 'lastThickness', layer: index })
    }
    if (!isLast && (layer.thicknessM === null || !inRange(layer.thicknessM, VES_LIMITS.minThicknessM, VES_LIMITS.maxThicknessM))) {
      issues.push({ code: 'thicknessRange', layer: index })
    }
  })

  const totalDepth = layers.slice(0, -1).reduce((acc, layer) => acc + (layer.thicknessM ?? 0), 0)
  if (totalDepth > VES_LIMITS.maxTotalDepthM) {
    issues.push({ code: 'thicknessRange', layer: layers.length - 2 })
  }

  return issues
}

export function validateSchlumbergerGeometry(abHalfM: number, mnHalfM: number): VesIssue[] {
  const ratio = mnHalfM / abHalfM
  if (!(abHalfM > 0) || !(mnHalfM > 0) || ratio <= 0 || ratio > 0.5) {
    return [{ code: 'arrayGeometry' }]
  }
  return []
}
