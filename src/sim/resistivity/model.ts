import { gaussian, mulberry32 } from '../core/rng'
import { isNum, type FieldError } from '../core/fieldError'
import { VES_PRESETS, type VesPreset } from './presets'
import { computeVesCurve, logSpacings } from './ves'
import { VES_LIMITS, validateSchlumbergerGeometry, validateVesLayers } from './validation'
import type { VesArrayType, VesLayer } from './types'

export interface VesLayerInput extends VesLayer {
  id: string
}

export interface VesSurvey {
  spacingMinM: number
  spacingMaxM: number
  spacingCount: number
  /** Schlumberger MN/2; ignored by the Wenner array. */
  mnHalfM: number
  /** Multiplicative log-normal noise on apparent resistivity, in percent. */
  noisePercent: number
  seed: number
}

export interface VesInput {
  array: VesArrayType
  survey: VesSurvey
  layers: VesLayerInput[]
}

export interface VesResult {
  array: VesArrayType
  spacingsM: number[]
  cleanOhmM: number[]
  observedOhmM: number[]
  totalDepthM: number
  topResistivityOhmM: number
  bottomResistivityOhmM: number
  minRhoOhmM: number
  maxRhoOhmM: number
}

export type VesScenarioId = string

let uidCounter = 0
export function vesUid(prefix: string): string {
  uidCounter += 1
  return `${prefix}-${uidCounter}`
}

function fromPreset(preset: VesPreset): VesInput {
  return {
    array: preset.array,
    survey: {
      spacingMinM: preset.spacingMinM,
      spacingMaxM: preset.spacingMaxM,
      spacingCount: preset.spacingCount,
      mnHalfM: preset.mnHalfM,
      noisePercent: 2,
      seed: 7,
    },
    layers: preset.layers.map((layer) => ({
      id: vesUid('layer'),
      thicknessM: layer.thicknessM,
      resistivityOhmM: layer.resistivityOhmM,
    })),
  }
}

export const vesScenarios = VES_PRESETS.map((preset) => ({
  id: preset.id,
  preset,
}))

export function vesScenarioToInput(id: VesScenarioId): VesInput {
  const preset = VES_PRESETS.find((item) => item.id === id) ?? VES_PRESETS[0]
  return fromPreset(preset)
}

export function vesTotalDepth(layers: readonly VesLayer[]): number {
  return layers.slice(0, -1).reduce((sum, layer) => sum + (layer.thicknessM ?? 0), 0)
}

export function validateVes(input: VesInput): FieldError[] {
  const errors: FieldError[] = []
  const { survey, layers, array } = input

  if (!isNum(survey.spacingMinM) || survey.spacingMinM < VES_LIMITS.minSpacingM || survey.spacingMinM > VES_LIMITS.maxSpacingM) {
    errors.push({ path: 'survey.spacingMinM', key: 'spacingRange' })
  }
  if (!isNum(survey.spacingMaxM) || survey.spacingMaxM < VES_LIMITS.minSpacingM || survey.spacingMaxM > VES_LIMITS.maxSpacingM) {
    errors.push({ path: 'survey.spacingMaxM', key: 'spacingRange' })
  }
  if (isNum(survey.spacingMinM) && isNum(survey.spacingMaxM) && survey.spacingMinM >= survey.spacingMaxM) {
    errors.push({ path: 'survey.spacingMinM', key: 'spacingOrder' })
  }
  if (!isNum(survey.spacingCount) || survey.spacingCount < 5 || survey.spacingCount > 60) {
    errors.push({ path: 'survey.spacingCount', key: 'countRange' })
  }
  if (!isNum(survey.noisePercent) || survey.noisePercent < 0 || survey.noisePercent > 30) {
    errors.push({ path: 'survey.noisePercent', key: 'noiseRange' })
  }
  if (array === 'schlumberger' && isNum(survey.spacingMinM) && isNum(survey.spacingMaxM)) {
    const minGeom = validateSchlumbergerGeometry(survey.spacingMinM, survey.mnHalfM)
    const maxGeom = validateSchlumbergerGeometry(survey.spacingMaxM, survey.mnHalfM)
    if (minGeom.length > 0 || maxGeom.length > 0) {
      errors.push({ path: 'survey.mnHalfM', key: 'mnGeometry' })
    }
  }

  if (layers.length < VES_LIMITS.minLayers || layers.length > VES_LIMITS.maxLayers) {
    errors.push({ path: 'layers', key: 'layerCount' })
  }

  for (const issue of validateVesLayers(layers)) {
    if (issue.code === 'resistivityRange') {
      errors.push({ path: `layer.${issue.layer}.resistivityOhmM`, key: 'resistivityRange' })
    } else if (issue.code === 'thicknessRange') {
      errors.push({ path: `layer.${issue.layer}.thicknessM`, key: 'thicknessRange' })
    } else if (issue.code === 'lastThickness') {
      errors.push({ path: `layer.${issue.layer}.thicknessM`, key: 'lastThickness' })
    }
  }

  if (vesTotalDepth(layers) > VES_LIMITS.maxTotalDepthM) {
    errors.push({ path: 'layers', key: 'totalDepthRange' })
  }

  return errors
}

export function runVesForward(input: VesInput, seedOverride?: number): VesResult {
  const spacingsM = logSpacings(input.survey.spacingMinM, input.survey.spacingMaxM, Math.round(input.survey.spacingCount))
  const curve = computeVesCurve(input.layers, input.array, {
    spacingsM,
    mnHalfM: input.array === 'schlumberger' ? input.survey.mnHalfM : undefined,
  })
  const cleanOhmM = curve.map((point) => point.rhoAOhmM)
  const rng = mulberry32(seedOverride ?? input.survey.seed)
  const sigma = Math.max(0, input.survey.noisePercent) / 100
  const observedOhmM = cleanOhmM.map((rho) => Math.max(1e-3, rho * Math.exp(gaussian(rng) * sigma)))
  return {
    array: input.array,
    spacingsM,
    cleanOhmM,
    observedOhmM,
    totalDepthM: vesTotalDepth(input.layers),
    topResistivityOhmM: input.layers[0]?.resistivityOhmM ?? 0,
    bottomResistivityOhmM: input.layers[input.layers.length - 1]?.resistivityOhmM ?? 0,
    minRhoOhmM: Math.min(...cleanOhmM),
    maxRhoOhmM: Math.max(...cleanOhmM),
  }
}
