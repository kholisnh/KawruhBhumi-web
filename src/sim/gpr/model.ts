import type { GprInput, GprSurvey, TargetKind } from './types'

let seq = 0
export const uid = (prefix: string) => `${prefix}-${++seq}`

export type ScenarioId = 'sandBedrock' | 'buriedPipe' | 'concreteRebar' | 'voidAsphalt' | 'wetClay'

export interface GprScenario {
  id: ScenarioId
  layers: Array<{ thickness: number; epsR: number; sigma: number }>
  targets: Array<{ kind: TargetKind; x: number; z: number; radius: number; epsR: number; sigma: number }>
  survey: GprSurvey
}

/**
 * Curated scenarios built from typical literature property ranges
 * (Reynolds 2011; Jol 2008; Annan 2009 — see reference library).
 * Layer thicknesses and geometry are synthetic teaching examples.
 */
export const gprScenarios: GprScenario[] = [
  {
    id: 'sandBedrock',
    layers: [
      { thickness: 2.5, epsR: 4, sigma: 0.5 }, // dry sand
      { thickness: 0, epsR: 8, sigma: 2 }, // limestone bedrock (half-space)
    ],
    targets: [],
    survey: { frequencyMHz: 400, traceSpacing: 0.1, lineLength: 20, timeWindowNs: null, noisePercent: 0, seed: 7 },
  },
  {
    id: 'buriedPipe',
    layers: [
      { thickness: 4, epsR: 15, sigma: 20 }, // moist soil
      { thickness: 0, epsR: 25, sigma: 35 }, // wet substratum (half-space)
    ],
    targets: [{ kind: 'cylinder', x: 8, z: 1.6, radius: 0.15, epsR: 1e6, sigma: 1e6 }], // metal pipe (PEC approximation)
    survey: { frequencyMHz: 400, traceSpacing: 0.08, lineLength: 16, timeWindowNs: null, noisePercent: 2, seed: 7 },
  },
  {
    id: 'concreteRebar',
    layers: [
      { thickness: 0.6, epsR: 6, sigma: 10 }, // concrete slab
      { thickness: 0, epsR: 15, sigma: 30 }, // moist subgrade (half-space)
    ],
    targets: [
      { kind: 'cylinder', x: 1.5, z: 0.12, radius: 0.01, epsR: 1e6, sigma: 1e6 },
      { kind: 'cylinder', x: 2.5, z: 0.12, radius: 0.01, epsR: 1e6, sigma: 1e6 },
      { kind: 'cylinder', x: 3.5, z: 0.12, radius: 0.01, epsR: 1e6, sigma: 1e6 },
      { kind: 'cylinder', x: 4.5, z: 0.12, radius: 0.01, epsR: 1e6, sigma: 1e6 },
    ],
    survey: { frequencyMHz: 900, traceSpacing: 0.05, lineLength: 6, timeWindowNs: null, noisePercent: 1, seed: 11 },
  },
  {
    id: 'voidAsphalt',
    layers: [
      { thickness: 0.15, epsR: 6, sigma: 5 }, // asphalt
      { thickness: 1, epsR: 8, sigma: 15 }, // base gravel
      { thickness: 0, epsR: 30, sigma: 40 }, // wet subgrade (half-space)
    ],
    targets: [{ kind: 'point', x: 6, z: 0.5, radius: 0.4, epsR: 1, sigma: 0 }], // air-filled cavity
    survey: { frequencyMHz: 500, traceSpacing: 0.1, lineLength: 12, timeWindowNs: null, noisePercent: 1.5, seed: 5 },
  },
  {
    id: 'wetClay',
    layers: [
      { thickness: 6, epsR: 28, sigma: 100 }, // wet clay — strongly attenuating
      { thickness: 0, epsR: 10, sigma: 5 }, // substratum (half-space)
    ],
    targets: [{ kind: 'point', x: 9, z: 3.5, radius: 0.5, epsR: 1, sigma: 0 }],
    survey: { frequencyMHz: 250, traceSpacing: 0.2, lineLength: 15, timeWindowNs: null, noisePercent: 2, seed: 3 },
  },
]

export function scenarioToInput(scenario: GprScenario): GprInput {
  return {
    model: {
      layers: scenario.layers.map((l) => ({ id: uid('layer'), ...l })),
      targets: scenario.targets.map((t) => ({ id: uid('target'), ...t })),
    },
    survey: { ...scenario.survey },
  }
}

export function defaultGprInput(): GprInput {
  return scenarioToInput(gprScenarios[0])
}
