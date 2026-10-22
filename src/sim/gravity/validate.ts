import type { FieldError } from '../core/fieldError'
import { isNum } from '../core/fieldError'
import { MAX_STATIONS } from './solver'
import type { GrvInput } from './types'

export function validateGravity(input: GrvInput): FieldError[] {
  const errors: FieldError[] = []
  const { survey, bodies } = input

  if (!isNum(survey.lineLength)) errors.push({ path: 'survey.lineLength', key: 'number' })
  else if (survey.lineLength < 2 || survey.lineLength > 2000) errors.push({ path: 'survey.lineLength', key: 'lineRange' })

  if (!isNum(survey.stationSpacing)) errors.push({ path: 'survey.stationSpacing', key: 'number' })
  else if (survey.stationSpacing < 0.05 || survey.stationSpacing > 50)
    errors.push({ path: 'survey.stationSpacing', key: 'spacingRange' })

  if (!isNum(survey.noiseMGal)) errors.push({ path: 'survey.noiseMGal', key: 'number' })
  else if (survey.noiseMGal < 0 || survey.noiseMGal > 10) errors.push({ path: 'survey.noiseMGal', key: 'noiseRange' })

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
    if (!isNum(body.deltaRho)) errors.push({ path: `body.${i}.deltaRho`, key: 'number' })
    else if (body.deltaRho < -5000 || body.deltaRho > 5000) errors.push({ path: `body.${i}.deltaRho`, key: 'rhoRange' })

    if (!isNum(body.y)) errors.push({ path: `body.${i}.y`, key: 'number' })
    else if (Math.abs(body.y) > 2000) errors.push({ path: `body.${i}.y`, key: 'yRange' })

    if (body.kind === 'sphere') {
      if (!isNum(body.x)) errors.push({ path: `body.${i}.x`, key: 'number' })
      else if (body.x < 0 || body.x > survey.lineLength) errors.push({ path: `body.${i}.x`, key: 'inLine' })

      if (!isNum(body.z)) errors.push({ path: `body.${i}.z`, key: 'number' })
      else if (body.z <= 0 || body.z > 2000) errors.push({ path: `body.${i}.z`, key: 'depthRange' })

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
        if (body.z2 > 5000) errors.push({ path: `body.${i}.z2`, key: 'depthRange' })
      }
    }
  })

  return errors
}
