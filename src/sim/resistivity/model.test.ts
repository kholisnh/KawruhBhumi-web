import { describe, expect, it } from 'vitest'
import { runVesForward, validateVes, vesScenarioToInput, vesScenarios } from './model'
import { VES_PRESETS } from './presets'

describe('resistivity workspace model', () => {
  it('every preset passes workspace validation', () => {
    for (const preset of VES_PRESETS) {
      expect(validateVes(vesScenarioToInput(preset.id)), preset.id).toEqual([])
    }
  })

  it('produces finite, positive curves for every preset', () => {
    for (const scenario of vesScenarios) {
      const result = runVesForward(vesScenarioToInput(scenario.id))
      expect(result.spacingsM).toHaveLength(vesScenarioToInput(scenario.id).survey.spacingCount)
      for (const rho of result.cleanOhmM) {
        expect(Number.isFinite(rho)).toBe(true)
        expect(rho).toBeGreaterThan(0)
      }
      for (const rho of result.observedOhmM) {
        expect(Number.isFinite(rho)).toBe(true)
        expect(rho).toBeGreaterThan(0)
      }
    }
  })

  it('is deterministic for a given seed and noisy for a different seed', () => {
    const input = vesScenarioToInput('three-layer-clay')
    const a = runVesForward(input)
    const b = runVesForward(input)
    expect(a.observedOhmM).toEqual(b.observedOhmM)
    const c = runVesForward(input, input.survey.seed + 1)
    expect(c.observedOhmM).not.toEqual(a.observedOhmM)
    expect(c.cleanOhmM).toEqual(a.cleanOhmM)
  })

  it('rejects an MN/2 that is too large for the smallest spacing', () => {
    const input = vesScenarioToInput('three-layer-aquifer')
    input.survey.mnHalfM = input.survey.spacingMinM
    const errors = validateVes(input)
    expect(errors.some((error) => error.key === 'mnGeometry')).toBe(true)
  })

  it('rejects a spacing range that is reversed', () => {
    const input = vesScenarioToInput('two-layer-bedrock')
    input.survey.spacingMinM = 100
    input.survey.spacingMaxM = 1
    expect(validateVes(input).some((error) => error.key === 'spacingOrder')).toBe(true)
  })
})
