import { describe, expect, it } from 'vitest'
import type { ChallengeCurve } from './types'
import { curveMisfit, feedbackFor, scoreFromMisfit } from './metrics'
import {
  cleanGprInput,
  cleanGravityInput,
  cleanMagneticInput,
  cleanReflectionInput,
  cleanRefractionInput,
  cleanResistivityInput,
  gprChallengeCurve,
  gravityChallengeCurve,
  magneticChallengeCurve,
  perturbGprInput,
  perturbGravityInput,
  perturbMagneticInput,
  perturbReflectionInput,
  perturbRefractionInput,
  perturbResistivityInput,
  reflectionChallengeCurve,
  refractionChallengeCurve,
  resistivityChallengeCurve,
} from './targets'
import { gprScenarios, scenarioToInput as gprScenarioToInput } from '../../../sim/gpr/model'
import { runGprForward } from '../../../sim/gpr/solver'
import { validateGpr } from '../../../sim/gpr/validate'
import { grvScenarios, grvScenarioToInput } from '../../../sim/gravity/model'
import { runGravityForward } from '../../../sim/gravity/solver'
import { validateGravity } from '../../../sim/gravity/validate'
import { magScenarios, magScenarioToInput } from '../../../sim/magnetic/model'
import { runMagneticForward } from '../../../sim/magnetic/solver'
import { validateMagnetic } from '../../../sim/magnetic/validate'
import { reflScenarios, reflScenarioToInput } from '../../../sim/reflection/model'
import { runReflectionForward } from '../../../sim/reflection/solver'
import { validateReflection } from '../../../sim/reflection/validate'
import { refrScenarios, refrScenarioToInput } from '../../../sim/refraction/model'
import { runRefractionForward } from '../../../sim/refraction/solver'
import { validateRefraction } from '../../../sim/refraction/validate'
import { runVesForward, validateVes, vesScenarioToInput } from '../../../sim/resistivity/model'

describe('challenge scoring', () => {
  const target = { x: [1, 2, 3, 4], y: [2, 4, 6, 8], xTitle: 'x', yTitle: 'y' }

  it('gives zero misfit and full score for an identical curve', () => {
    expect(curveMisfit(target, target)).toBe(0)
    expect(scoreFromMisfit(0)).toBe(100)
  })

  it('interpolates the current curve onto the target axis', () => {
    const shifted = { ...target, y: target.y.map((value) => value * 1.1) }
    expect(curveMisfit(target, shifted)).toBeCloseTo(6.224, 3)
    expect(scoreFromMisfit(10)).toBe(80)
  })

  it('clamps scores and classifies feedback thresholds', () => {
    expect(scoreFromMisfit(100)).toBe(0)
    expect(scoreFromMisfit(-5)).toBe(100)
    expect(feedbackFor(5)).toBe('excellent')
    expect(feedbackFor(10)).toBe('good')
    expect(feedbackFor(20)).toBe('close')
    expect(feedbackFor(20.1)).toBe('far')
  })
})

function challengeCase<TInput, TResult>(
  name: string,
  input: TInput,
  clean: (input: TInput) => TInput,
  perturb: (input: TInput, seed: number) => TInput,
  validate: (input: TInput) => unknown[],
  run: (input: TInput) => TResult,
  curve: (result: TResult, xTitle: string, yTitle: string) => ChallengeCurve,
) {
  return {
    name,
    evaluate: () => {
      const targetInput = perturb(input, 20261029)
      return {
        errors: validate(targetInput),
        target: curve(run(targetInput), 'x', 'y'),
        current: curve(run(clean(input)), 'x', 'y'),
      }
    },
  }
}

const cases = [
  challengeCase('GPR', gprScenarioToInput(gprScenarios[0]), cleanGprInput, perturbGprInput, validateGpr, runGprForward, gprChallengeCurve),
  challengeCase('gravity', grvScenarioToInput(grvScenarios[0]), cleanGravityInput, perturbGravityInput, validateGravity, runGravityForward, gravityChallengeCurve),
  challengeCase('magnetic', magScenarioToInput(magScenarios[0]), cleanMagneticInput, perturbMagneticInput, validateMagnetic, runMagneticForward, magneticChallengeCurve),
  challengeCase('reflection', reflScenarioToInput(reflScenarios[0]), cleanReflectionInput, perturbReflectionInput, validateReflection, runReflectionForward, reflectionChallengeCurve),
  challengeCase('refraction', refrScenarioToInput(refrScenarios[0]), cleanRefractionInput, perturbRefractionInput, validateRefraction, runRefractionForward, refractionChallengeCurve),
  challengeCase('resistivity', vesScenarioToInput('two-layer-bedrock'), cleanResistivityInput, perturbResistivityInput, validateVes, runVesForward, resistivityChallengeCurve),
]

describe.each(cases)('$name challenge target', (item) => {
  it('perturbs to a valid, finite, non-identical curve', () => {
    const { errors, target, current } = item.evaluate()
    expect(errors).toEqual([])
    expect(target.x.length).toBeGreaterThan(1)
    expect(target.y).toHaveLength(target.x.length)
    expect(target.y.every(Number.isFinite)).toBe(true)
    expect(current.y.every(Number.isFinite)).toBe(true)
    expect(curveMisfit(target, current)).toBeGreaterThan(0)
    expect(curveMisfit(current, current)).toBe(0)
  })
})
