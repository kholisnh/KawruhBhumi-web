import type { FieldError } from '../core/fieldError'
import { isNum } from '../core/fieldError'
import type { MagInput } from './types'
import { MAX_STATIONS } from './solver'

export function validateMagnetic(input: MagInput): FieldError[] {
  const errors: FieldError[] = []
  const { survey, bodies } = input

  if (!isNum(survey.fieldNT)) errors.push({ path: 'survey.fieldNT', key: 'number' })
  else if (survey.fieldNT < 20000 || survey.fieldNT > 70000) errors.push({ path: 'survey.fieldNT', key: 'fieldRange' })

  if (!isNum(survey.inclinationDeg)) errors.push({ path: 'survey.inclinationDeg', key: 'number' })
  else if (survey.inclinationDeg < -90 || survey.inclinationDeg > 90)
    errors.push({ path: 'survey.inclinationDeg', key: 'inclinationRange' })

  if (!isNum(survey.lineLength)) errors.push({ path: 'survey.lineLength', key: 'number' })
  else if (survey.lineLength < 2 || survey.lineLength > 1000) errors.push({ path: 'survey.lineLength', key: 'lineRange' })

  if (!isNum(survey.stationSpacing)) errors.push({ path: 'survey.stationSpacing', key: 'number' })
  else if (survey.stationSpacing < 0.05 || survey.stationSpacing > 20)
    errors.push({ path: 'survey.stationSpacing', key: 'spacingRange' })

  if (!isNum(survey.noiseNT)) errors.push({ path: 'survey.noiseNT', key: 'number' })
  else if (survey.noiseNT < 0 || survey.noiseNT > 1000) errors.push({ path: 'survey.noiseNT', key: 'noiseRange' })

  if (!isNum(survey.mapLines)) errors.push({ path: 'survey.mapLines', key: 'number' })
  else if (survey.mapLines % 2 !== 1 || survey.mapLines < 3 || survey.mapLines > 61)
    errors.push({ path: 'survey.mapLines', key: 'mapLinesRange' })

  if (!isNum(survey.mapLineSpacing)) errors.push({ path: 'survey.mapLineSpacing', key: 'number' })
  else if (survey.mapLineSpacing < 0.1 || survey.mapLineSpacing > 500) errors.push({ path: 'survey.mapLineSpacing', key: 'mapSpacingRange' })

  if (isNum(survey.lineLength) && isNum(survey.stationSpacing) && survey.stationSpacing > 0) {
    if (Math.floor(survey.lineLength / survey.stationSpacing) + 1 > MAX_STATIONS)
      errors.push({ path: 'survey.stationSpacing', key: 'tooManyStations' })
  }

  bodies.forEach((body, i) => {
    if (!isNum(body.chi)) errors.push({ path: `body.${i}.chi`, key: 'number' })
    else if (body.chi < -0.9 || body.chi > 1) errors.push({ path: `body.${i}.chi`, key: 'chiRange' })

    if (!isNum(body.y)) errors.push({ path: `body.${i}.y`, key: 'number' })
    else if (Math.abs(body.y) > 2000) errors.push({ path: `body.${i}.y`, key: 'yRange' })

    if (body.kind === 'dipole') {
      if (!isNum(body.x)) errors.push({ path: `body.${i}.x`, key: 'number' })
      else if (body.x < 0 || body.x > survey.lineLength) errors.push({ path: `body.${i}.x`, key: 'inLine' })

      if (!isNum(body.z)) errors.push({ path: `body.${i}.z`, key: 'number' })
      else if (body.z <= 0 || body.z > 200) errors.push({ path: `body.${i}.z`, key: 'depthRange' })

      if (!isNum(body.radius)) errors.push({ path: `body.${i}.radius`, key: 'number' })
      else if (body.radius <= 0) errors.push({ path: `body.${i}.radius`, key: 'positive' })
    } else {
      if (!isNum(body.strikeLength)) errors.push({ path: `body.${i}.strikeLength`, key: 'number' })
      else if (body.strikeLength < 0.5 || body.strikeLength > 10000) errors.push({ path: `body.${i}.strikeLength`, key: 'strikeRange' })
      if (!isNum(body.x1) || !isNum(body.x2)) errors.push({ path: `body.${i}.x1`, key: 'number' })
      else {
        if (body.x2 <= body.x1) errors.push({ path: `body.${i}.x2`, key: 'x2AfterX1' })
        if (body.x2 < 0 || body.x1 > survey.lineLength) errors.push({ path: `body.${i}.x1`, key: 'inLine' })
      }
      if (!isNum(body.z1) || !isNum(body.z2)) errors.push({ path: `body.${i}.z1`, key: 'number' })
      else {
        if (body.z2 <= body.z1) errors.push({ path: `body.${i}.z2`, key: 'z2AfterZ1' })
        if (body.z2 > 2000) errors.push({ path: `body.${i}.z2`, key: 'depthRange' })
      }
    }
  })

  return errors
}
