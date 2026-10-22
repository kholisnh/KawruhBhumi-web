import type { ReflInput, ReflLayer, ReflSurvey } from './types'

export type ReflScenarioId = 'sandShale' | 'coalSeam' | 'thinBedTuning' | 'gasSand' | 'hardBottom'

export interface ReflScenario {
  id: ReflScenarioId
  layers: Array<Omit<ReflLayer, 'id'>>
  survey: ReflSurvey
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${++seq}`

const layer = (vp: number, rho: number, thickness: number): Omit<ReflLayer, 'id'> => ({ vp, rho, thickness })

export const reflScenarios: ReflScenario[] = [
  {
    id: 'sandShale',
    layers: [layer(1800, 2000, 100), layer(2600, 2300, 150), layer(4000, 2500, 0)],
    survey: { waveletFreqHz: 40, timeWindowMs: null, minOffsetM: 0, maxOffsetM: 600, nOffsets: 13, noisePercent: 3, seed: 42 },
  },
  {
    id: 'coalSeam',
    layers: [layer(3000, 2500, 80), layer(2200, 1400, 5), layer(3400, 2600, 0)],
    survey: { waveletFreqHz: 60, timeWindowMs: null, minOffsetM: 0, maxOffsetM: 400, nOffsets: 9, noisePercent: 2, seed: 42 },
  },
  {
    id: 'thinBedTuning',
    layers: [layer(2200, 2100, 120), layer(3000, 2400, 8), layer(2400, 2200, 0)],
    survey: { waveletFreqHz: 40, timeWindowMs: null, minOffsetM: 0, maxOffsetM: 500, nOffsets: 11, noisePercent: 2, seed: 42 },
  },
  {
    id: 'gasSand',
    layers: [layer(2000, 2100, 200), layer(1650, 1950, 40), layer(2400, 2300, 0)],
    survey: { waveletFreqHz: 35, timeWindowMs: null, minOffsetM: 0, maxOffsetM: 700, nOffsets: 15, noisePercent: 3, seed: 42 },
  },
  {
    id: 'hardBottom',
    layers: [layer(1500, 1900, 60), layer(3600, 2700, 200), layer(4200, 2700, 0)],
    survey: { waveletFreqHz: 50, timeWindowMs: null, minOffsetM: 0, maxOffsetM: 300, nOffsets: 7, noisePercent: 2, seed: 42 },
  },
]

export function reflScenarioToInput(scenario: ReflScenario): ReflInput {
  return {
    layers: scenario.layers.map((l) => ({ ...l, id: uid('layer') })),
    survey: { ...scenario.survey },
  }
}

export function defaultReflInput(): ReflInput {
  return reflScenarioToInput(reflScenarios[0])
}

export { uid as reflUid }
