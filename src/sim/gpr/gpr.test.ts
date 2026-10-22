import { describe, expect, it } from 'vitest'
import { C0, EPS0, MU0 } from '../core/constants'
import { gprScenarios, scenarioToInput, uid } from './model'
import { PEC_EPS_R, modelDisplayDepth, rickerWavelet, runGprForward } from './solver'
import { validateGpr } from './validate'
import type { GprInput } from './types'

/**
 * Numerical integrity tests — GPR forward solver.
 *
 * Sign convention: R = (√εr1 − √εr2)/(√εr1 + √εr2) with medium 1 = incident
 * (upper) medium. A reflection from a higher-permittivity medium has R < 0.
 * Units: velocities m/s, times ns in results, depths m, σ in mS/m in inputs.
 */

const makeInput = (over: Partial<GprInput> = {}): GprInput => {
  const base = scenarioToInput(gprScenarios[0])
  return {
    model: { ...base.model, ...(over.model ?? {}) },
    survey: { ...base.survey, ...(over.survey ?? {}) },
    ...over,
  } as GprInput
}

/** Convenience: build a simple two-layer model with one interface. */
const twoLayer = (thickness: number, epsR1: number, epsR2: number, sigma = 0): GprInput =>
  makeInput({
    model: {
      layers: [
        { id: uid('layer'), thickness, epsR: epsR1, sigma },
        { id: uid('layer'), thickness: 0, epsR: epsR2, sigma },
      ],
      targets: [],
    },
  })

describe('wave velocity v = c/√εr', () => {
  it('equals c in vacuum (εr = 1)', () => {
    // A half-space with εr = 1 followed by nothing: use εr = 1 layer and read velocity.
    const input = twoLayer(1, 1, 1)
    const res = runGprForward(input)
    expect(res.layers[0].velocity).toBeCloseTo(C0, 6)
  })

  it('halves at εr = 4 (v = c/2)', () => {
    const res = runGprForward(twoLayer(1, 4, 4))
    expect(res.layers[0].velocity).toBeCloseTo(C0 / 2, 6)
  })
})

describe('normal-incidence reflection coefficient', () => {
  it('is zero for identical media', () => {
    const res = runGprForward(twoLayer(1, 9, 9))
    expect(res.interfaces[0].reflectionCoef).toBeCloseTo(0, 12)
  })

  it('matches the analytical value −1/3 for εr 1 → 4', () => {
    const res = runGprForward(twoLayer(1, 1, 4))
    expect(res.interfaces[0].reflectionCoef).toBeCloseTo(-1 / 3, 12)
  })

  it('flips sign when the media are swapped', () => {
    const a = runGprForward(twoLayer(1, 4, 16)).interfaces[0].reflectionCoef
    const b = runGprForward(twoLayer(1, 16, 4)).interfaces[0].reflectionCoef
    expect(a).toBeCloseTo(-b, 12)
  })

  it('approaches −1 for a metallic target (PEC approximation)', () => {
    const t0 = 2 * 2 / (C0 / Math.sqrt(15)) * 1e9
    const input = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 4, epsR: 15, sigma: 20 },
          { id: uid('layer'), thickness: 0, epsR: 25, sigma: 35 },
        ],
        targets: [{ id: uid('target'), kind: 'cylinder', x: 5, z: 2, radius: 0.1, epsR: PEC_EPS_R, sigma: 1e6 }],
      },
    })
    const res = runGprForward(input)
    expect(res.targets[0].reflectionCoef).toBeLessThan(-0.99)
    expect(res.targets[0].apexTNs).toBeCloseTo(t0, 3)
  })
})

describe('layered two-way travel time', () => {
  it('matches t = 2z/v for a homogeneous top layer', () => {
    const thickness = 5
    const epsR = 4
    const input = twoLayer(thickness, epsR, 9)
    const res = runGprForward(input)
    const expectedNs = (2 * thickness) / (C0 / Math.sqrt(epsR)) * 1e9
    expect(res.interfaces[0].twtNs).toBeCloseTo(expectedNs, 6)
  })

  it('accumulates correctly through two layers', () => {
    const input = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 2, epsR: 4, sigma: 0 },
          { id: uid('layer'), thickness: 3, epsR: 9, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 16, sigma: 0 },
        ],
        targets: [],
      },
    })
    const res = runGprForward(input)
    const expected = ((2 * 2) / (C0 / 2) + (2 * 3) / (C0 / 3)) * 1e9
    expect(res.interfaces[1].twtNs).toBeCloseTo(expected, 6)
  })
})

describe('attenuation α = (σ/2)·√(μ₀/ε₀·εr)', () => {
  it('is zero in a lossless medium (skin depth ∞)', () => {
    const res = runGprForward(twoLayer(2, 4, 9, 0))
    expect(res.layers[0].alpha).toBe(0)
    expect(res.layers[0].skinDepth).toBe(Infinity)
  })

  it('matches the analytical low-loss formula', () => {
    const epsR = 16
    const sigmaMSm = 20
    const res = runGprForward(twoLayer(2, epsR, epsR, sigmaMSm))
    const expected = (sigmaMSm / 1000 / 2) * Math.sqrt(MU0 / (EPS0 * epsR))
    expect(res.layers[0].alpha).toBeCloseTo(expected, 12)
  })

  it('scales linearly with conductivity', () => {
    const a1 = runGprForward(twoLayer(2, 9, 9, 10)).layers[0].alpha
    const a2 = runGprForward(twoLayer(2, 9, 9, 20)).layers[0].alpha
    expect(a2).toBeCloseTo(2 * a1, 12)
  })
})

describe('Ricker wavelet', () => {
  it('is zero-mean and symmetric', () => {
    const w = rickerWavelet(400e6, 1e-9 / 3.2)
    const sum = w.reduce((a, b) => a + b, 0)
    expect(Math.abs(sum)).toBeLessThan(1e-3)
    const n = w.length
    for (let i = 0; i < Math.floor(n / 2); i++) {
      expect(w[i]).toBeCloseTo(w[n - 1 - i], 12)
    }
  })

  it('has its peak at zero time', () => {
    const w = rickerWavelet(500e6, 2.5e-10)
    const maxIdx = w.indexOf(Math.max(...w))
    expect(maxIdx).toBe(Math.floor(w.length / 2))
  })
})

describe('target hyperbola kinematics', () => {
  it('places the apex at t₀ = 2z/v_rms at the target position', () => {
    const z = 3
    const epsR = 9
    const input = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 10, epsR, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 16, sigma: 0 },
        ],
        targets: [{ id: uid('target'), kind: 'point', x: 5, z, radius: 0.2, epsR: 1, sigma: 0 }],
      },
      survey: { frequencyMHz: 400, traceSpacing: 0.1, lineLength: 10, timeWindowNs: null, noisePercent: 0, seed: 1 },
    })
    const res = runGprForward(input)
    const expectedApex = ((2 * z) / (C0 / Math.sqrt(epsR))) * 1e9
    expect(res.targets[0].apexTNs).toBeCloseTo(expectedApex, 6)
    expect(res.targets[0].vRms).toBeCloseTo(C0 / Math.sqrt(epsR), 3)

    // The reflection apex should appear at the expected sample in the trace at x = x0.
    const traceIdx = res.x.findIndex((xi) => Math.abs(xi - 5) < 1e-9)
    const apexSample = Math.round(expectedApex / res.diagnostics.dtNs)
    const half = 4
    const window = res.radargram[traceIdx].slice(apexSample - half, apexSample + half + 1)
    const globalMax = Math.max(...res.radargram[traceIdx])
    expect(Math.max(...window)).toBeCloseTo(globalMax, 6)
  })

  it('amplitude decays with distance along the profile', () => {
    const input = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 10, epsR: 9, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 16, sigma: 0 },
        ],
        targets: [{ id: uid('target'), kind: 'point', x: 5, z: 2, radius: 0.2, epsR: 1, sigma: 0 }],
      },
      survey: { frequencyMHz: 400, traceSpacing: 0.5, lineLength: 10, timeWindowNs: null, noisePercent: 0, seed: 1 },
    })
    const res = runGprForward(input)
    const apexTrace = res.x.findIndex((x) => Math.abs(x - 5) < 1e-9)
    const farTrace = 0
    const apexSample = Math.round(res.targets[0].apexTNs / res.diagnostics.dtNs)
    // far trace: use the sample nearest the predicted travel time for that offset
    const dx = res.x[farTrace] - 5
    const tFar = Math.sqrt(res.targets[0].apexTNs ** 2 + ((2 * dx * 1e9) / res.targets[0].vRms) ** 2)
    const farSample = Math.round(tFar / res.diagnostics.dtNs)
    const apexAmp = Math.max(...res.radargram[apexTrace].slice(apexSample - 6, apexSample + 7).map(Math.abs))
    const farAmp = Math.max(...res.radargram[farTrace].slice(farSample - 6, farSample + 7).map(Math.abs))
    expect(farAmp).toBeLessThan(apexAmp)
  })
})

describe('determinism and acquisition geometry', () => {
  it('produces identical results for identical inputs', () => {
    const input = makeInput()
    const a = runGprForward(input)
    const b = runGprForward(input)
    expect(a.radargram).toEqual(b.radargram)
    expect(a.interfaces).toEqual(b.interfaces)
  })

  it('produces identical noise for identical seeds', () => {
    const input = makeInput({ survey: { ...makeInput().survey, noisePercent: 10, seed: 42 } })
    const a = runGprForward(input)
    const b = runGprForward(input)
    expect(a.radargram).toEqual(b.radargram)
  })

  it('has the expected radargram dimensions', () => {
    const input = makeInput({
      survey: { frequencyMHz: 400, traceSpacing: 0.5, lineLength: 10, timeWindowNs: null, noisePercent: 0, seed: 1 },
    })
    const res = runGprForward(input)
    expect(res.x.length).toBe(21) // 10 m / 0.5 m + 1
    expect(res.radargram.length).toBe(21)
    expect(res.radargram.every((tr) => tr.length === res.diagnostics.samples)).toBe(true)
    expect(res.tNs[1] - res.tNs[0]).toBeCloseTo(res.diagnostics.dtNs, 10)
  })

  it('normalizes the radargram to a maximum absolute amplitude of 1', () => {
    const res = runGprForward(makeInput())
    let max = 0
    for (const tr of res.radargram) for (const v of tr) max = Math.max(max, Math.abs(v))
    expect(max).toBeCloseTo(1, 6)
  })

  it('keeps the 8 samples-per-period sampling rule', () => {
    const res = runGprForward(makeInput({ survey: { ...makeInput().survey, frequencyMHz: 250 } }))
    expect(res.diagnostics.dtNs).toBeCloseTo(1e9 / (8 * 250e6), 9)
  })
})

describe('warnings and diagnostics', () => {
  it('flags strong attenuation in wet clay', () => {
    const input = scenarioToInput(gprScenarios.find((s) => s.id === 'wetClay')!)
    const res = runGprForward(input)
    expect(res.diagnostics.warnings.some((w) => w.key === 'highAttenuation')).toBe(true)
  })

  it('reports thin-layer warnings when a layer is below λ/4', () => {
    const input = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 0.05, epsR: 81, sigma: 0 },
          { id: uid('layer'), thickness: 5, epsR: 10, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 25, sigma: 0 },
        ],
        targets: [],
      },
      survey: { ...makeInput().survey, frequencyMHz: 100 },
    })
    const res = runGprForward(input)
    expect(res.diagnostics.warnings.some((w) => w.key === 'thinLayer')).toBe(true)
  })

  it('computes display depth from layer thicknesses', () => {
    const input = twoLayer(4, 15, 25)
    expect(modelDisplayDepth(input.model)).toBeCloseTo(4 + Math.max(3, 1.2), 12)
  })
})

describe('input validation', () => {
  it('accepts all curated scenarios', () => {
    for (const s of gprScenarios) {
      expect(validateGpr(scenarioToInput(s))).toEqual([])
    }
  })

  it('rejects εr below 1 and non-positive thickness', () => {
    const input = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 0, epsR: 4, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 9, sigma: 0 },
        ],
        targets: [],
      },
    })
    const errors = validateGpr(input)
    expect(errors.some((e) => e.key === 'layerThickness')).toBe(true)

    const input2 = makeInput({
      model: {
        layers: [
          { id: uid('layer'), thickness: 1, epsR: 0.5, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 9, sigma: 0 },
        ],
        targets: [],
      },
    })
    expect(validateGpr(input2).some((e) => e.key === 'epsRange')).toBe(true)
  })

  it('rejects targets outside the line or deeper than the display depth', () => {
    const input = makeInput({
      survey: { ...makeInput().survey, lineLength: 10 },
      model: {
        layers: [
          { id: uid('layer'), thickness: 2, epsR: 4, sigma: 0 },
          { id: uid('layer'), thickness: 0, epsR: 9, sigma: 0 },
        ],
        targets: [
          { id: uid('target'), kind: 'point', x: 12, z: 1, radius: 0.2, epsR: 1, sigma: 0 },
          { id: uid('target'), kind: 'point', x: 5, z: 99, radius: 0.2, epsR: 1, sigma: 0 },
        ],
      },
    })
    const errors = validateGpr(input)
    expect(errors.some((e) => e.path === 'target.0.x' && e.key === 'targetInLine')).toBe(true)
    expect(errors.some((e) => e.path === 'target.1.z' && e.key === 'targetDepth')).toBe(true)
  })

  it('rejects excessive trace counts', () => {
    const input = makeInput({
      survey: { ...makeInput().survey, lineLength: 500, traceSpacing: 0.05 },
    })
    expect(validateGpr(input).some((e) => e.key === 'tooManyTraces')).toBe(true)
  })
})
