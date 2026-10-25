import { describe, expect, it } from 'vitest'
import { hvsrUid, hvsrScenarios, scenarioToInput, type HvsrScenarioId } from './model'
import { logFrequencies, modelCurve, runHvsrForward } from './solver'
import { runHvsrInversion } from './inversion'
import type { HvsrInput, HvsrLayer } from './types'

const layer = (thickness: number, vs: number): HvsrLayer => ({ id: hvsrUid('test'), thickness, vs })

const input = (layers: HvsrLayer[]): HvsrInput => ({
  model: { layers },
  survey: { fMin: 0.2, fMax: 20, nFreq: 220, qs: 60, noisePercent: 0, seed: 3 },
})

describe('HVSR forward model', () => {
  it('returns an almost flat H/V curve for a uniform half-space', () => {
    const result = runHvsrForward(input([layer(20, 500), layer(0, 500)]))
    for (const value of result.hvsr) expect(value).toBeGreaterThan(0.92)
    for (const value of result.hvsr) expect(value).toBeLessThan(1.08)
  })

  it('puts the fundamental peak near Vs/(4H) for a single soft layer', () => {
    const vs = 200
    const h = 30
    const result = runHvsrForward(input([layer(h, vs), layer(0, 900)]))
    expect(result.diagnostics.a0).toBeGreaterThan(2)
    expect(result.diagnostics.f0).toBeGreaterThan(0.65)
    expect(result.diagnostics.f0).toBeLessThan(2.2)
  })

  it('moves f0 to lower frequency as the soft layer thickens', () => {
    const thin = runHvsrForward(input([layer(15, 180), layer(0, 900)]))
    const thick = runHvsrForward(input([layer(60, 180), layer(0, 900)]))
    expect(thick.diagnostics.f0).toBeLessThan(thin.diagnostics.f0)
  })

  it('raises amplification with a stronger impedance contrast', () => {
    const weak = runHvsrForward(input([layer(30, 300), layer(0, 450)]))
    const strong = runHvsrForward(input([layer(30, 180), layer(0, 1800)]))
    expect(strong.diagnostics.a0).toBeGreaterThan(weak.diagnostics.a0)
  })

  it('is deterministic for a fixed seed and scan', () => {
    const a = runHvsrForward(input([layer(10, 150), layer(25, 300), layer(0, 900)]))
    const b = runHvsrForward(input([layer(10, 150), layer(25, 300), layer(0, 900)]))
    expect(a.hvsr).toEqual(b.hvsr)
  })

  it('produces log-spaced frequencies including both endpoints', () => {
    const f = logFrequencies(0.2, 20, 5)
    expect(f[0]).toBeCloseTo(0.2, 12)
    expect(f[4]).toBeCloseTo(20, 12)
    expect(f[2]).toBeCloseTo(2, 12)
  })

  it('flags an edge peak outside the reliable band', () => {
    const result = runHvsrForward(input([layer(2, 1000), layer(0, 1100)]))
    expect(result.diagnostics.warnings.some((w) => w.key === 'edgePeak' || w.key === 'lowContrast')).toBe(true)
  })
})

describe('HVSR inversion', () => {
  it('fits a synthetic three-layer curve and recovers a plausible Vs profile', () => {
    const trueModel = {
      layers: [layer(8, 180), layer(24, 420), layer(0, 1200)],
    }
    const frequencies = logFrequencies(0.3, 15, 140)
    const observed = modelCurve(trueModel, frequencies, 40)
    const result = runHvsrInversion({
      observed,
      frequencies,
      qs: 40,
      layerCount: 3,
      initialSamples: 1600,
      bestCount: 70,
      newSamples: 280,
      iterations: 7,
      seed: 11,
    })
    expect(result.misfit).toBeLessThan(6)
    expect(result.predicted).toHaveLength(observed.length)
    expect(result.best.layers[0].vs).toBeGreaterThan(90)
    expect(result.best.layers[0].vs).toBeLessThan(650)
    expect(result.vsP50).toHaveLength(result.depth.length)
    expect(result.evaluations).toBeGreaterThan(1500)
  })

  it('is reproducible for a fixed seed', () => {
    const trueModel = { layers: [layer(10, 200), layer(30, 500), layer(0, 1400)] }
    const frequencies = logFrequencies(0.5, 10, 90)
    const observed = modelCurve(trueModel, frequencies, 30)
    const settings = {
      observed,
      frequencies,
      qs: 30,
      layerCount: 3,
      initialSamples: 300,
      bestCount: 30,
      newSamples: 80,
      iterations: 2,
      seed: 5,
    }
    const a = runHvsrInversion(settings)
    const b = runHvsrInversion(settings)
    expect(a.best.misfit).toBeCloseTo(b.best.misfit, 10)
    expect(a.best.layers.map((l) => l.vs)).toEqual(b.best.layers.map((l) => l.vs))
  })

  it('marks a low-frequency fundamental for the IKN soft column', () => {
    const result = runHvsrForward(scenarioToInput(hvsrScenarios[0]))
    expect(result.diagnostics.f0).toBeGreaterThan(0.5)
    expect(result.diagnostics.f0).toBeLessThan(2)
    expect(result.diagnostics.warnings.some((w) => w.key === 'higherMode')).toBe(true)
  })

  it('has curated scenarios that all run', () => {
    for (const scenario of hvsrScenarios) {
      const result = runHvsrForward(scenarioToInput(scenario))
      expect(result.diagnostics.f0).toBeGreaterThan(0)
      expect(Number.isFinite(result.diagnostics.a0)).toBe(true)
    }
  })

  it('exports scenario ids as a typed union', () => {
    const id: HvsrScenarioId = 'iknAlluvium'
    expect(id).toBe('iknAlluvium')
  })
})
