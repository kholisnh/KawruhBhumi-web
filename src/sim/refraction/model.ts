import type { RefrInput, RefrLayer, RefrSurvey } from './types'

export type RefrScenarioId = 'soilBedrock' | 'threeLayer' | 'weathered' | 'velocityInversion' | 'deepBedrock'

export interface RefrScenario {
  id: RefrScenarioId
  layers: Array<Omit<RefrLayer, 'id'>>
  survey: RefrSurvey
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${++seq}`

const layer = (vp: number, thickness: number): Omit<RefrLayer, 'id'> => ({ vp, thickness })

export const refrScenarios: RefrScenario[] = [
  {
    id: 'soilBedrock',
    layers: [layer(400, 5), layer(2000, 0)],
    survey: { spreadLength: 40, geophoneSpacing: 1, noiseMs: 0.3, waveletFreqHz: 60, traceNoisePercent: 4, seed: 42 },
  },
  {
    id: 'threeLayer',
    layers: [layer(500, 8), layer(1200, 12), layer(2500, 0)],
    survey: { spreadLength: 60, geophoneSpacing: 1, noiseMs: 0.3, waveletFreqHz: 80, traceNoisePercent: 4, seed: 42 },
  },
  {
    id: 'weathered',
    layers: [layer(300, 3), layer(900, 10), layer(2200, 0)],
    survey: { spreadLength: 35, geophoneSpacing: 0.5, noiseMs: 0.2, waveletFreqHz: 80, traceNoisePercent: 5, seed: 42 },
  },
  {
    id: 'velocityInversion',
    layers: [layer(800, 5), layer(500, 10), layer(1500, 0)],
    survey: { spreadLength: 60, geophoneSpacing: 1, noiseMs: 0.3, waveletFreqHz: 80, traceNoisePercent: 4, seed: 42 },
  },
  {
    id: 'deepBedrock',
    layers: [layer(600, 15), layer(2800, 0)],
    survey: { spreadLength: 120, geophoneSpacing: 2, noiseMs: 0.5, waveletFreqHz: 40, traceNoisePercent: 3, seed: 42 },
  },
]

export function refrScenarioToInput(scenario: RefrScenario): RefrInput {
  return {
    layers: scenario.layers.map((l) => ({ ...l, id: uid('layer') })),
    survey: { ...scenario.survey },
  }
}

export function defaultRefrInput(): RefrInput {
  return refrScenarioToInput(refrScenarios[0])
}

export { uid as refrUid }
