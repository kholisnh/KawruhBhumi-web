import type { FieldError } from '../core/fieldError'
import { isNum } from '../core/fieldError'
import { MAX_RECEIVERS } from './solver'
import type { RefrInput } from './types'

export function validateRefraction(input: RefrInput): FieldError[] {
  const errors: FieldError[] = []
  const { survey, layers } = input

  if (!isNum(survey.spreadLength)) errors.push({ path: 'survey.spreadLength', key: 'number' })
  else if (survey.spreadLength < 5 || survey.spreadLength > 2000)
    errors.push({ path: 'survey.spreadLength', key: 'spreadRange' })

  if (!isNum(survey.geophoneSpacing)) errors.push({ path: 'survey.geophoneSpacing', key: 'number' })
  else if (survey.geophoneSpacing < 0.25 || survey.geophoneSpacing > 100)
    errors.push({ path: 'survey.geophoneSpacing', key: 'spacingRange' })

  if (!isNum(survey.noiseMs)) errors.push({ path: 'survey.noiseMs', key: 'number' })
  else if (survey.noiseMs < 0 || survey.noiseMs > 50) errors.push({ path: 'survey.noiseMs', key: 'noiseRange' })

  if (!isNum(survey.waveletFreqHz)) errors.push({ path: 'survey.waveletFreqHz', key: 'number' })
  else if (survey.waveletFreqHz < 5 || survey.waveletFreqHz > 200)
    errors.push({ path: 'survey.waveletFreqHz', key: 'freqRange' })

  if (!isNum(survey.traceNoisePercent)) errors.push({ path: 'survey.traceNoisePercent', key: 'number' })
  else if (survey.traceNoisePercent < 0 || survey.traceNoisePercent > 100)
    errors.push({ path: 'survey.traceNoisePercent', key: 'traceNoiseRange' })

  if (isNum(survey.spreadLength) && isNum(survey.geophoneSpacing) && survey.geophoneSpacing > 0) {
    if (Math.floor(survey.spreadLength / survey.geophoneSpacing) + 1 > MAX_RECEIVERS)
      errors.push({ path: 'survey.geophoneSpacing', key: 'tooManyReceivers' })
  }

  if (layers.length < 2) errors.push({ path: 'layers', key: 'atLeastTwoLayers' })

  layers.forEach((layer, i) => {
    const isHalfSpace = i === layers.length - 1
    if (!isHalfSpace) {
      if (!isNum(layer.thickness)) errors.push({ path: `layer.${i}.thickness`, key: 'number' })
      else if (layer.thickness <= 0) errors.push({ path: `layer.${i}.thickness`, key: 'layerThickness' })
    }
    if (!isNum(layer.vp)) errors.push({ path: `layer.${i}.vp`, key: 'number' })
    else if (layer.vp < 100 || layer.vp > 9000) errors.push({ path: `layer.${i}.vp`, key: 'vpRange' })
  })

  return errors
}
