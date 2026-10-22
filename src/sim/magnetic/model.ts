import type { MagBody, MagDipoleBody, MagInput, MagPrismBody, MagSurvey } from './types'

export type MagScenarioId = 'steelTank' | 'magnetiteDike' | 'pipeline' | 'archaeology' | 'equatorial'

export type MagBodyTemplate = Omit<MagDipoleBody, 'id'> | Omit<MagPrismBody, 'id'>

export interface MagScenario {
  id: MagScenarioId
  bodies: MagBodyTemplate[]
  survey: Omit<MagSurvey, 'seed'> & { seed: number }
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${++seq}`

export const magScenarios: MagScenario[] = [
  {
    id: 'steelTank',
    bodies: [{ kind: 'prism', x1: 8, x2: 10.4, y: 0, strikeLength: 6, z1: 1.2, z2: 2.8, chi: 0.25 }],
    survey: { fieldNT: 48000, inclinationDeg: 60, lineLength: 30, stationSpacing: 0.5, noiseNT: 2, mapLines: 25, mapLineSpacing: 1, seed: 42 },
  },
  {
    id: 'magnetiteDike',
    bodies: [{ kind: 'prism', x1: 12, x2: 18, y: 0, strikeLength: 120, z1: 1.5, z2: 25, chi: 0.05 }],
    survey: { fieldNT: 45000, inclinationDeg: 45, lineLength: 60, stationSpacing: 1, noiseNT: 3, mapLines: 25, mapLineSpacing: 5, seed: 42 },
  },
  {
    id: 'pipeline',
    bodies: [{ kind: 'prism', x1: 16, x2: 32, y: 0, strikeLength: 200, z1: 0.8, z2: 1.2, chi: 0.2 }],
    survey: { fieldNT: 47000, inclinationDeg: 60, lineLength: 45, stationSpacing: 0.5, noiseNT: 2, mapLines: 25, mapLineSpacing: 2, seed: 42 },
  },
  {
    id: 'archaeology',
    bodies: [{ kind: 'dipole', x: 6, y: 0, z: 0.8, radius: 0.4, chi: 0.02 }],
    survey: { fieldNT: 48000, inclinationDeg: 60, lineLength: 12, stationSpacing: 0.25, noiseNT: 1, mapLines: 25, mapLineSpacing: 0.5, seed: 42 },
  },
  {
    id: 'equatorial',
    bodies: [{ kind: 'prism', x1: 20, x2: 26, y: 0, strikeLength: 80, z1: 1, z2: 8, chi: 0.08 }],
    survey: { fieldNT: 35000, inclinationDeg: 5, lineLength: 50, stationSpacing: 0.5, noiseNT: 2, mapLines: 25, mapLineSpacing: 5, seed: 42 },
  },
]

export function magScenarioToInput(scenario: MagScenario): MagInput {
  return {
    bodies: scenario.bodies.map((b) => ({ ...b, id: uid(b.kind === 'dipole' ? 'dipole' : 'prism') }) as MagBody),
    survey: { ...scenario.survey },
  }
}

export function defaultMagInput(): MagInput {
  return magScenarioToInput(magScenarios[0])
}

export { uid as magUid }
