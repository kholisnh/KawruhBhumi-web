import type { GrvBody, GrvInput, GrvPrismBody, GrvSphereBody, GrvSurvey } from './types'

export type GrvScenarioId = 'saltDome' | 'tunnel' | 'oreBody' | 'shallowCavity' | 'basaltRidge'

export type GrvBodyTemplate = Omit<GrvSphereBody, 'id'> | Omit<GrvPrismBody, 'id'>

export interface GrvScenario {
  id: GrvScenarioId
  bodies: GrvBodyTemplate[]
  survey: GrvSurvey
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${++seq}`

export const grvScenarios: GrvScenario[] = [
  {
    id: 'saltDome',
    bodies: [{ kind: 'prism', x1: 8, x2: 52, y: 0, strikeLength: 160, z1: 15, z2: 110, deltaRho: -250 }],
    survey: { lineLength: 80, stationSpacing: 1, noiseMGal: 0.005, mapLines: 25, mapLineSpacing: 10, seed: 42 },
  },
  {
    id: 'tunnel',
    bodies: [{ kind: 'sphere', x: 30, y: 0, z: 8, radius: 2.5, deltaRho: -2200 }],
    survey: { lineLength: 60, stationSpacing: 0.5, noiseMGal: 0.01, mapLines: 25, mapLineSpacing: 2, seed: 42 },
  },
  {
    id: 'oreBody',
    bodies: [{ kind: 'prism', x1: 22, x2: 28, y: 0, strikeLength: 30, z1: 5, z2: 25, deltaRho: 800 }],
    survey: { lineLength: 60, stationSpacing: 0.5, noiseMGal: 0.02, mapLines: 25, mapLineSpacing: 2, seed: 42 },
  },
  {
    id: 'shallowCavity',
    bodies: [{ kind: 'sphere', x: 10, y: 0, z: 2.5, radius: 1.5, deltaRho: -2000 }],
    survey: { lineLength: 25, stationSpacing: 0.25, noiseMGal: 0.005, mapLines: 21, mapLineSpacing: 1, seed: 42 },
  },
  {
    id: 'basaltRidge',
    bodies: [{ kind: 'prism', x1: 30, x2: 70, y: 0, strikeLength: 200, z1: 8, z2: 60, deltaRho: 350 }],
    survey: { lineLength: 100, stationSpacing: 1, noiseMGal: 0.01, mapLines: 31, mapLineSpacing: 10, seed: 42 },
  },
]

export function grvScenarioToInput(scenario: GrvScenario): GrvInput {
  return {
    bodies: scenario.bodies.map((b) => ({ ...b, id: uid(b.kind === 'sphere' ? 'sphere' : 'prism') }) as GrvBody),
    survey: { ...scenario.survey },
  }
}

export function defaultGrvInput(): GrvInput {
  return grvScenarioToInput(grvScenarios[0])
}

export { uid as grvUid }
