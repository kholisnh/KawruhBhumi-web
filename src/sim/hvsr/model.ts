import type { HvsrInput, HvsrModel, HvsrSurvey } from './types'

let seq = 0
export const hvsrUid = (prefix: string) => `${prefix}-${++seq}`

export type HvsrScenarioId = 'iknAlluvium' | 'banjarmasinPeat' | 'samarindaMixed' | 'hardBedrock'

export interface HvsrScenario {
  id: HvsrScenarioId
  layers: Array<{ thickness: number; vs: number }>
  survey: HvsrSurvey
}

const survey = (fMin: number, fMax: number): HvsrSurvey => ({
  fMin,
  fMax,
  nFreq: 220,
  qs: 25,
  noisePercent: 2,
  seed: 17,
})

export const hvsrScenarios: HvsrScenario[] = [
  {
    id: 'iknAlluvium',
    layers: [
      { thickness: 8, vs: 130 },
      { thickness: 26, vs: 240 },
      { thickness: 52, vs: 420 },
      { thickness: 0, vs: 850 },
    ],
    survey: survey(0.2, 20),
  },
  {
    id: 'banjarmasinPeat',
    layers: [
      { thickness: 4, vs: 75 },
      { thickness: 12, vs: 145 },
      { thickness: 30, vs: 310 },
      { thickness: 0, vs: 620 },
    ],
    survey: survey(0.3, 25),
  },
  {
    id: 'samarindaMixed',
    layers: [
      { thickness: 6, vs: 190 },
      { thickness: 22, vs: 360 },
      { thickness: 45, vs: 620 },
      { thickness: 0, vs: 1250 },
    ],
    survey: survey(0.2, 22),
  },
  {
    id: 'hardBedrock',
    layers: [
      { thickness: 3, vs: 260 },
      { thickness: 9, vs: 520 },
      { thickness: 20, vs: 900 },
      { thickness: 0, vs: 2200 },
    ],
    survey: survey(0.5, 35),
  },
]

export function scenarioToInput(scenario: HvsrScenario): HvsrInput {
  return {
    model: { layers: scenario.layers.map((l) => ({ id: hvsrUid('layer'), ...l })) },
    survey: { ...scenario.survey },
  }
}

export function defaultHvsrInput(): HvsrInput {
  return scenarioToInput(hvsrScenarios[0])
}

export function totalDepth(model: HvsrModel): number {
  return model.layers.slice(0, -1).reduce((sum, l) => sum + (Number.isFinite(l.thickness) ? Math.max(0, l.thickness) : 0), 0)
}

export function maxDepth(model: HvsrModel): number {
  const d = totalDepth(model)
  return Math.max(10, d * 1.15)
}
