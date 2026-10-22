import type { GprInput } from './types'
import type { FieldError } from '../core/fieldError'
import { isNum } from '../core/fieldError'
import { modelDisplayDepth, PEC_EPS_R, SAMPLES_PER_PERIOD } from './solver'

export type { FieldError } from '../core/fieldError'
export { hasErrorAt } from '../core/fieldError'

/**
 * Validates the full GPR input. Returns an empty array for valid models.
 * The solver assumes valid input; the UI must call this before running.
 */
export function validateGpr(input: GprInput): FieldError[] {
  const errors: FieldError[] = []
  const { model, survey } = input

  // Survey parameters -------------------------------------------------------
  if (!isNum(survey.frequencyMHz)) errors.push({ path: 'survey.frequencyMHz', key: 'number' })
  else if (survey.frequencyMHz < 10 || survey.frequencyMHz > 3000)
    errors.push({ path: 'survey.frequencyMHz', key: 'freqRange' })

  if (!isNum(survey.traceSpacing)) errors.push({ path: 'survey.traceSpacing', key: 'number' })
  else if (survey.traceSpacing < 0.02 || survey.traceSpacing > 5)
    errors.push({ path: 'survey.traceSpacing', key: 'spacingRange' })

  if (!isNum(survey.lineLength)) errors.push({ path: 'survey.lineLength', key: 'number' })
  else if (survey.lineLength < 1 || survey.lineLength > 500)
    errors.push({ path: 'survey.lineLength', key: 'lineRange' })

  if (survey.timeWindowNs !== null) {
    if (!isNum(survey.timeWindowNs)) errors.push({ path: 'survey.timeWindowNs', key: 'number' })
    else if (survey.timeWindowNs < 2 || survey.timeWindowNs > 2000)
      errors.push({ path: 'survey.timeWindowNs', key: 'timeWindowRange' })
  }

  if (!isNum(survey.noisePercent)) errors.push({ path: 'survey.noisePercent', key: 'number' })
  else if (survey.noisePercent < 0 || survey.noisePercent > 100)
    errors.push({ path: 'survey.noisePercent', key: 'noiseRange' })

  // Sizing guards -------------------------------------------------------------
  const traces = Math.floor(survey.lineLength / Math.max(survey.traceSpacing, 1e-9)) + 1
  if (isNum(traces) && traces > 3000) errors.push({ path: 'survey.lineLength', key: 'tooManyTraces' })
  if (isNum(survey.frequencyMHz) && isNum(survey.timeWindowNs) && survey.frequencyMHz > 0) {
    const dtNs = 1e9 / (SAMPLES_PER_PERIOD * survey.frequencyMHz * 1e6)
    const samples = Math.floor(survey.timeWindowNs / dtNs) + 1
    if (samples > 6000) errors.push({ path: 'survey.timeWindowNs', key: 'tooManySamples' })
  }

  // Layers ---------------------------------------------------------------------
  if (model.layers.length < 1) errors.push({ path: 'layers', key: 'atLeastOneLayer' })
  model.layers.forEach((layer, i) => {
    const isHalfSpace = i === model.layers.length - 1
    if (!isHalfSpace) {
      if (!isNum(layer.thickness)) errors.push({ path: `layer.${i}.thickness`, key: 'number' })
      else if (layer.thickness <= 0) errors.push({ path: `layer.${i}.thickness`, key: 'layerThickness' })
    }
    if (!isNum(layer.epsR)) errors.push({ path: `layer.${i}.epsR`, key: 'number' })
    else if (layer.epsR < 1 || layer.epsR > 100) errors.push({ path: `layer.${i}.epsR`, key: 'epsRange' })
    if (!isNum(layer.sigma)) errors.push({ path: `layer.${i}.sigma`, key: 'number' })
    else if (layer.sigma < 0 || layer.sigma > 1e6) errors.push({ path: `layer.${i}.sigma`, key: 'sigmaRange' })
  })

  // Targets ---------------------------------------------------------------------
  const displayDepth = modelDisplayDepth(model)
  model.targets.forEach((target, i) => {
    if (!isNum(target.x)) errors.push({ path: `target.${i}.x`, key: 'number' })
    else if (target.x < 0 || target.x > survey.lineLength) errors.push({ path: `target.${i}.x`, key: 'targetInLine' })

    if (!isNum(target.z)) errors.push({ path: `target.${i}.z`, key: 'number' })
    else if (target.z <= 0 || target.z > displayDepth) errors.push({ path: `target.${i}.z`, key: 'targetDepth' })

    if (!isNum(target.radius)) errors.push({ path: `target.${i}.radius`, key: 'number' })
    else if (target.radius <= 0) errors.push({ path: `target.${i}.radius`, key: 'radiusPositive' })

    if (!isNum(target.epsR)) errors.push({ path: `target.${i}.epsR`, key: 'number' })
    else if (target.epsR < 1 || target.epsR > PEC_EPS_R) errors.push({ path: `target.${i}.epsR`, key: 'epsRange' })

    if (!isNum(target.sigma)) errors.push({ path: `target.${i}.sigma`, key: 'number' })
    else if (target.sigma < 0 || target.sigma > 1e6) errors.push({ path: `target.${i}.sigma`, key: 'sigmaRange' })
  })

  return errors
}
