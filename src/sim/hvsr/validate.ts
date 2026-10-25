import type { FieldError } from '../core/fieldError'
import type { HvsrInput } from './types'

const err = (path: string, key: string, params?: Record<string, string | number>): FieldError => ({ path, key, params })

export function validateHvsr(input: HvsrInput): FieldError[] {
  const errors: FieldError[] = []
  const { model, survey } = input

  if (model.layers.length < 2) errors.push(err('model.layers', 'needTwoLayers'))
  if (model.layers.length > 8) errors.push(err('model.layers', 'tooManyLayers'))

  model.layers.forEach((layer, i) => {
    const isHalf = i === model.layers.length - 1
    if (!Number.isFinite(layer.vs) || layer.vs < 40 || layer.vs > 4000) {
      errors.push(err(`layer.${i}.vs`, 'vsRange', { min: 40, max: 4000 }))
    }
    if (!isHalf && (!Number.isFinite(layer.thickness) || layer.thickness <= 0 || layer.thickness > 500)) {
      errors.push(err(`layer.${i}.thickness`, 'thicknessRange', { min: 0.05, max: 500 }))
    }
  })

  if (!Number.isFinite(survey.fMin) || survey.fMin < 0.05 || survey.fMin > 10) errors.push(err('survey.fMin', 'fMinRange', { min: 0.05, max: 10 }))
  if (!Number.isFinite(survey.fMax) || survey.fMax <= survey.fMin || survey.fMax > 60) {
    errors.push(err('survey.fMax', 'fMaxRange', { min: survey.fMin, max: 60 }))
  }
  if (!Number.isFinite(survey.nFreq) || survey.nFreq < 60 || survey.nFreq > 500) errors.push(err('survey.nFreq', 'nFreqRange', { min: 60, max: 500 }))
  if (!Number.isFinite(survey.qs) || survey.qs < 2 || survey.qs > 200) errors.push(err('survey.qs', 'qRange', { min: 2, max: 200 }))
  if (!Number.isFinite(survey.noisePercent) || survey.noisePercent < 0 || survey.noisePercent > 30) {
    errors.push(err('survey.noisePercent', 'noiseRange', { min: 0, max: 30 }))
  }
  if (!Number.isFinite(survey.seed)) errors.push(err('survey.seed', 'seedInteger'))

  return errors
}
