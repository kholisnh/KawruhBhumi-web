import { describe, expect, it } from 'vitest'
import { reflScenarioToInput, reflScenarios } from './model'
import { rickerAt, runReflectionForward, SAMPLES_PER_PERIOD } from './solver'
import type { ReflInput, ReflLayer } from './types'
import { validateReflection } from './validate'

const layer = (vp: number, rho: number, thickness: number, id: string): ReflLayer => ({ id, vp, rho, thickness })

const baseSurvey = {
  waveletFreqHz: 40,
  timeWindowMs: null,
  minOffsetM: 0,
  maxOffsetM: 400,
  nOffsets: 5,
  noisePercent: 0,
  seed: 42,
}

const input = (layers: ReflLayer[], survey: Partial<ReflInput['survey']> = {}): ReflInput => ({
  layers,
  survey: { ...baseSurvey, ...survey },
})

describe('reflection coefficients and travel times', () => {
  it('computes normal-incidence R = (Z2−Z1)/(Z2+Z1) exactly', () => {
    const layers = [layer(1800, 2000, 100, 'a'), layer(2600, 2300, 0, 'b')]
    const res = runReflectionForward(input(layers))
    const z1 = 1800 * 2000
    const z2 = 2600 * 2300
    expect(res.picks[0].reflectionCoef).toBeCloseTo((z2 - z1) / (z2 + z1), 12)
  })

  it('computes two-way times t = 2h/v', () => {
    const layers = [layer(2000, 2200, 150, 'a'), layer(3000, 2400, 50, 'b'), layer(4000, 2500, 0, 'c')]
    const res = runReflectionForward(input(layers))
    expect(res.picks[0].twtMs).toBeCloseTo((2 * 150) / 2000 * 1000, 10)
    expect(res.picks[1].twtMs).toBeCloseTo((2 * 150) / 2000 * 1000 + (2 * 50) / 3000 * 1000, 10)
  })

  it('applies cumulative transmission loss ∏(1 − R²)', () => {
    const layers = [layer(1600, 2000, 200, 'a'), layer(2400, 2300, 200, 'b'), layer(3200, 2500, 0, 'c')]
    const res = runReflectionForward(input(layers))
    const r1 = res.picks[0].reflectionCoef
    const r2 = res.picks[1].reflectionCoef
    expect(res.picks[0].transmission).toBeCloseTo(1, 12)
    expect(res.picks[1].transmission).toBeCloseTo(1 - r1 * r1, 12)
    expect(res.picks[1].amplitude).toBeCloseTo(r2 * (1 - r1 * r1), 12)
  })

  it('computes interval RMS velocities correctly for a single layer over a half-space', () => {
    const layers = [layer(2500, 2400, 300, 'a'), layer(4000, 2600, 0, 'b')]
    const res = runReflectionForward(input(layers))
    expect(res.picks[0].vrms).toBeCloseTo(2500, 8)
  })
})

describe('synthetic trace and gather', () => {
  it('places the wavelet extremum at the interface two-way time', () => {
    const layers = [layer(1800, 2000, 100, 'a'), layer(2600, 2300, 0, 'b')]
    const res = runReflectionForward(input(layers, { noisePercent: 0, nOffsets: 1, minOffsetM: 0, maxOffsetM: 0 }))
    const pick = res.picks[0]
    let best = 0
    for (let i = 1; i < res.trace.length; i++) {
      if (Math.abs(res.trace[i]) > Math.abs(res.trace[best])) best = i
    }
    const dt = res.diagnostics.dtMs
    expect(Math.abs(res.tMs[best] - pick.twtMs)).toBeLessThanOrEqual(dt)
  })

  it('scales amplitudes linearly with the reflection coefficient (isolated events)', () => {
    // With a single isolated event, the normalized waveform shape is
    // independent of R: normalization divides the whole trace by its peak,
    // which is proportional to |R|.
    const strong = runReflectionForward(input([layer(1800, 2000, 100, 'a'), layer(3200, 2600, 0, 'b')]))
    const weak = runReflectionForward(input([layer(1800, 2000, 100, 'a'), layer(1950, 2050, 0, 'b')]))
    expect(strong.picks[0].reflectionCoef).toBeGreaterThan(weak.picks[0].reflectionCoef)
    for (let i = 0; i < strong.trace.length; i++) {
      expect(strong.trace[i]).toBeCloseTo(weak.trace[i], 10)
    }
    expect(Math.max(...strong.trace.map(Math.abs))).toBeCloseTo(1, 10)
  })

  it('implements NMO kinematics t²(x) = t₀² + x²/v_rms² in the gather', () => {
    const layers = [layer(2000, 2200, 500, 'a'), layer(3500, 2500, 0, 'b')]
    const res = runReflectionForward(input(layers, { nOffsets: 3, minOffsetM: 0, maxOffsetM: 800, noisePercent: 0 }))
    const pick = res.picks[0]
    const far = res.offsetsM[2]
    const expectedTx = Math.sqrt(pick.twtMs ** 2 + ((far / pick.vrms) * 1000) ** 2)
    let best = 0
    for (let i = 1; i < res.gather[2].length; i++) {
      if (Math.abs(res.gather[2][i]) > Math.abs(res.gather[2][best])) best = i
    }
    expect(Math.abs(res.tMs[best] - expectedTx)).toBeLessThanOrEqual(res.diagnostics.dtMs)
  })

  it('samples the Ricker wavelet at 8 samples per period with zero mean', () => {
    const f = 40
    const dtMs = 1000 / (SAMPLES_PER_PERIOD * f)
    let sum = 0
    for (let k = -50; k <= 50; k++) sum += rickerAt(k * dtMs, f)
    expect(Math.abs(sum)).toBeLessThan(1e-2)
    expect(rickerAt(0, f)).toBeCloseTo(1, 12)
  })

  it('is deterministic without noise and reproducible with a fixed seed', () => {
    const layers = [layer(1800, 2000, 100, 'a'), layer(2600, 2300, 150, 'b'), layer(4000, 2500, 0, 'c')]
    const a = runReflectionForward(input(layers))
    const b = runReflectionForward(input(layers))
    expect(a.trace).toEqual(b.trace)
    const n1 = runReflectionForward(input(layers, { noisePercent: 5, seed: 9 }))
    const n2 = runReflectionForward(input(layers, { noisePercent: 5, seed: 9 }))
    const n3 = runReflectionForward(input(layers, { noisePercent: 5, seed: 10 }))
    expect(n1.trace).toEqual(n2.trace)
    expect(n1.trace).not.toEqual(n3.trace)
  })

  it('normalizes amplitudes to |max| = 1 before noise', () => {
    const layers = [layer(1800, 2000, 100, 'a'), layer(2600, 2300, 0, 'b')]
    const res = runReflectionForward(input(layers, { noisePercent: 0 }))
    const max = Math.max(...res.trace.map((v) => Math.abs(v)))
    expect(max).toBeCloseTo(1, 10)
  })
})

describe('reflection warnings, scenarios and validation', () => {
  it('flags thin beds below λ/4 and weak contrasts', () => {
    const layers = [layer(3000, 2500, 80, 'a'), layer(2200, 1400, 5, 'b'), layer(3400, 2600, 0, 'c')]
    const res = runReflectionForward(input(layers, { waveletFreqHz: 60 }))
    const keys = res.diagnostics.warnings.map((w) => w.key)
    expect(keys).toContain('thinLayer')
    const weak = runReflectionForward(input([layer(2000, 2300, 100, 'a'), layer(2010, 2302, 0, 'b')]))
    expect(weak.diagnostics.warnings.map((w) => w.key)).toContain('weakContrast')
  })

  it('all presets produce finite traces and gathers', () => {
    for (const s of reflScenarios) {
      const res = runReflectionForward(reflScenarioToInput(s))
      expect(res.trace.every((v) => Number.isFinite(v))).toBe(true)
      expect(res.gather.every((tr) => tr.every((v) => Number.isFinite(v)))).toBe(true)
      expect(res.picks.length).toBeGreaterThan(0)
      expect(res.diagnostics.maxAbsAmplitude).toBeGreaterThan(0)
    }
  })

  it('validates survey and layer ranges with dotted paths', () => {
    const bad = validateReflection(
      input([layer(2000, 2200, -5, 'a'), layer(100, 9000, 0, 'b')], { nOffsets: 0, noisePercent: -1, maxOffsetM: -1 }),
    )
    const paths = bad.map((e) => e.path)
    expect(paths).toContain('survey.nOffsets')
    expect(paths).toContain('survey.noisePercent')
    expect(paths).toContain('layer.0.thickness')
    expect(paths).toContain('layer.1.vp')
    expect(paths).toContain('layer.1.rho')
  })

  it('accepts all shipped presets', () => {
    for (const s of reflScenarios) {
      expect(validateReflection(reflScenarioToInput(s))).toEqual([])
    }
  })
})
