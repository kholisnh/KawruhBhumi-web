import { describe, expect, it } from 'vitest'
import { experimentsByMethod } from './experiments'
import { METHODS } from './methods'
import { scenarioIdsByMethod, scenarioInputByMethod } from './scenarioIds'
import { buildAnswerKey, buildWorksheet, scenarioCodeFor } from './teacherPack'

describe('teacher pack scenario codes', () => {
  it('maps every guided experiment to a real scenario', () => {
    METHODS.forEach((method) => {
      const experiments = experimentsByMethod[method.id]
      expect(experiments).toHaveLength(3)
      experiments.forEach((experiment) => {
        expect(scenarioIdsByMethod[method.id]).toContain(experiment.scenarioId)
        expect(scenarioInputByMethod[method.id](experiment.scenarioId)).toBeTruthy()
      })
    })
  })

  it('builds EN and ID worksheets with 21 runnable codes', () => {
    ;(['en', 'id'] as const).forEach((lang) => {
      const worksheet = buildWorksheet(lang)
      expect(worksheet.match(/#\/simulator\//g)).toHaveLength(21)
      expect(worksheet).not.toContain('undefined')
      METHODS.forEach((method) => {
        experimentsByMethod[method.id].forEach((experiment) => {
          expect(worksheet).toContain(scenarioCodeFor(method.id, experiment.scenarioId))
        })
      })
    })
  })

  it('builds answer keys with scenario codes and expected observations', () => {
    ;(['en', 'id'] as const).forEach((lang) => {
      const key = buildAnswerKey(lang)
      expect(key.match(/#\/simulator\//g)).toHaveLength(21)
      expect(key).not.toContain('undefined')
      METHODS.forEach((method) => {
        experimentsByMethod[method.id].forEach((experiment) => {
          expect(key).toContain(scenarioCodeFor(method.id, experiment.scenarioId))
          expect(key).toContain(experiment.observe[lang])
        })
      })
    })
  })
})
