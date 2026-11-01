import type { MethodId } from './methods'
import { gprScenarios, scenarioToInput as gprScenarioToInput } from '../sim/gpr/model'
import { magScenarios, magScenarioToInput } from '../sim/magnetic/model'
import { grvScenarios, grvScenarioToInput } from '../sim/gravity/model'
import { reflScenarios, reflScenarioToInput } from '../sim/reflection/model'
import { refrScenarios, refrScenarioToInput } from '../sim/refraction/model'
import { vesScenarios, vesScenarioToInput } from '../sim/resistivity/model'
import { hvsrScenarios, scenarioToInput as hvsrScenarioToInput } from '../sim/hvsr/model'

export const scenarioIdsByMethod: Record<MethodId, readonly string[]> = {
  gpr: gprScenarios.map((scenario) => scenario.id),
  magnetic: magScenarios.map((scenario) => scenario.id),
  gravity: grvScenarios.map((scenario) => scenario.id),
  reflection: reflScenarios.map((scenario) => scenario.id),
  refraction: refrScenarios.map((scenario) => scenario.id),
  resistivity: vesScenarios.map((scenario) => scenario.id),
  hvsr: hvsrScenarios.map((scenario) => scenario.id),
}

export function isScenarioId(methodId: MethodId, scenarioId: string): boolean {
  return scenarioIdsByMethod[methodId].includes(scenarioId)
}

function scenarioInput<T extends { id: string }>(scenarios: T[], id: string, toInput: (scenario: T) => unknown): unknown {
  const scenario = scenarios.find((item) => item.id === id)
  if (!scenario) throw new Error(`Unknown scenario: ${id}`)
  return toInput(scenario)
}

/** Resolve a scenario code to its preset input, so `?scenario=` behaves like a full permalink. */
export const scenarioInputByMethod: Record<MethodId, (scenarioId: string) => unknown> = {
  gpr: (id) => scenarioInput(gprScenarios, id, gprScenarioToInput),
  magnetic: (id) => scenarioInput(magScenarios, id, magScenarioToInput),
  gravity: (id) => scenarioInput(grvScenarios, id, grvScenarioToInput),
  reflection: (id) => scenarioInput(reflScenarios, id, reflScenarioToInput),
  refraction: (id) => scenarioInput(refrScenarios, id, refrScenarioToInput),
  resistivity: (id) => vesScenarioToInput(id),
  hvsr: (id) => scenarioInput(hvsrScenarios, id, hvsrScenarioToInput),
}
