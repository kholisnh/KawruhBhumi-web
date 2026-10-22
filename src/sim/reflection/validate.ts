import type { FieldError } from '../core/fieldError'
import { isNum } from '../core/fieldError'
import { SAMPLES_PER_PERIOD } from './solver'
import type { ReflInput } from './types'

export function validateReflection(input: ReflInput): FieldError[] {
  const errors: FieldError[] = []
  const { survey, layers } = input

  if (!isNum(survey.waveletFreqHz)) errors.push({ path: 'survey.waveletFreqHz', key: 'number' })
  else if (survey.waveletFreqHz < 5 || survey.waveletFreqHz > 500)
    errors.push({ path: 'survey.waveletFreqHz', key: 'freqRange' })

  if (survey.timeWindowMs !== null) {
    if (!isNum(survey.timeWindowMs)) errors.push({ path: 'survey.timeWindowMs', key: 'number' })
    else if (survey.timeWindowMs < 10 || survey.timeWindowMs > 20000)
      errors.push({ path: 'survey.timeWindowMs', key: 'timeWindowRange' })
  }

  if (!isNum(survey.minOffsetM)) errors.push({ path: 'survey.minOffsetM', key: 'number' })
  else if (survey.minOffsetM < 0) errors.push({ path: 'survey.minOffsetM', key: 'offsetRange' })

  if (!isNum(survey.maxOffsetM)) errors.push({ path: 'survey.maxOffsetM', key: 'number' })
  else if (survey.maxOffsetM < survey.minOffsetM) errors.push({ path: 'survey.maxOffsetM', key: 'offsetOrder' })

  if (!isNum(survey.nOffsets)) errors.push({ path: 'survey.nOffsets', key: 'number' })
  else if (survey.nOffsets < 1 || survey.nOffsets > 64) errors.push({ path: 'survey.nOffsets', key: 'nOffsetsRange' })

  if (!isNum(survey.noisePercent)) errors.push({ path: 'survey.noisePercent', key: 'number' })
  else if (survey.noisePercent < 0 || survey.noisePercent > 100)
    errors.push({ path: 'survey.noisePercent', key: 'noiseRange' })

  if (layers.length < 2) errors.push({ path: 'layers', key: 'atLeastTwoLayers' })

  layers.forEach((layer, i) => {
    const isHalfSpace = i === layers.length - 1
    if (!isHalfSpace) {
      if (!isNum(layer.thickness)) errors.push({ path: `layer.${i}.thickness`, key: 'number' })
      else if (layer.thickness <= 0) errors.push({ path: `layer.${i}.thickness`, key: 'layerThickness' })
    }
    if (!isNum(layer.vp)) errors.push({ path: `layer.${i}.vp`, key: 'number' })
    else if (layer.vp < 300 || layer.vp > 9000) errors.push({ path: `layer.${i}.vp`, key: 'vpRange' })

    if (!isNum(layer.rho)) errors.push({ path: `layer.${i}.rho`, key: 'number' })
    else if (layer.rho < 1000 || layer.rho > 4000) errors.push({ path: `layer.${i}.rho`, key: 'rhoRange' })
  })

  // Sampling guard
  if (isNum(survey.waveletFreqHz) && survey.waveletFreqHz > 0 && survey.timeWindowMs !== null && isNum(survey.timeWindowMs)) {
    const dtMs = 1000 / (SAMPLES_PER_PERIOD * survey.waveletFreqHz)
    if (Math.floor(survey.timeWindowMs / dtMs) + 1 > 8000) errors.push({ path: 'survey.timeWindowMs', key: 'tooManySamples' })
  }

  return errors
}
