import { describe, expect, it } from 'vitest'
import { refrScenarioToInput, refrScenarios } from './model'
import { runRefractionForward } from './solver'
import type { RefrInput, RefrLayer } from './types'
import { validateRefraction } from './validate'

const layer = (vp: number, thickness: number, id: string): RefrLayer => ({ id, vp, thickness })

const baseSurvey = { spreadLength: 40, geophoneSpacing: 1, noiseMs: 0, waveletFreqHz: 60, traceNoisePercent: 0, seed: 42 }

const input = (layers: RefrLayer[], survey: Partial<RefrInput['survey']> = {}): RefrInput => ({
  layers,
  survey: { ...baseSurvey, ...survey },
})

describe('two-layer refraction (classic analytic case)', () => {
  const layers = [layer(400, 5, 'a'), layer(2000, 0, 'b')]
  const res = runRefractionForward(input(layers))

  it('computes the head-wave travel time 2h√(V²−v₁²)/(v₁V) + x/V exactly', () => {
    const t0 = (2 * 5 * Math.sqrt(2000 ** 2 - 400 ** 2)) / (400 * 2000) * 1000
    for (const xi of [10, 20, 40]) {
      const r = Math.round(xi / baseSurvey.geophoneSpacing)
      expect(res.branchTimesMs[1]![r]).toBeCloseTo(t0 + (xi / 2000) * 1000, 10)
    }
  })

  it('computes the crossover distance x_c = tᵢ/(1/v₁ − 1/V) exactly', () => {
    const t0 = (2 * 5 * Math.sqrt(2000 ** 2 - 400 ** 2)) / (400 * 2000) * 1000
    const xc = t0 / (1000 / 400 - 1000 / 2000)
    expect(res.branches[1].crossoverM).toBeCloseTo(xc, 10)
    const before = res.firstArrivalBranch[Math.round((xc - 5) / 1)]
    const after = res.firstArrivalBranch[Math.round((xc + 5) / 1)]
    expect(before).toBe(0)
    expect(after).toBe(1)
  })

  it('recovers the layer thickness from the intercept time (interpretation aid)', () => {
    expect(res.diagnostics.firstRefractorDepthM).toBeCloseTo(5, 8)
  })

  it('reports the critical angle asin(v₁/V)', () => {
    const expected = (Math.asin(400 / 2000) * 180) / Math.PI
    expect(res.branches[1].criticalAngleDeg).toBeCloseTo(expected, 10)
  })

  it('first arrivals are always the minimum over the generated branches', () => {
    for (let r = 0; r < res.x.length; r++) {
      const min = Math.min(...res.branches.map((b) => b.timesMs[r]).filter((v) => Number.isFinite(v)))
      expect(res.firstArrivalCleanMs[r]).toBeCloseTo(min, 12)
    }
  })
})

describe('multilayer refraction', () => {
  it('computes the three-layer head-wave intercept analytically', () => {
    const layers = [layer(500, 8, 'a'), layer(1200, 12, 'b'), layer(2500, 0, 'c')]
    const res = runRefractionForward(input(layers, { spreadLength: 60 }))
    const sin1 = 500 / 2500
    const cos1 = Math.sqrt(1 - sin1 * sin1)
    const sin2 = 1200 / 2500
    const cos2 = Math.sqrt(1 - sin2 * sin2)
    const t0Deep = ((2 * 8 * cos1) / 500 + (2 * 12 * cos2) / 1200) * 1000
    expect(res.branches[2].interceptMs).toBeCloseTo(t0Deep, 10)
    expect(res.branches[2].velocity).toBe(2500)
  })

  it('skips branches across a velocity inversion and flags them', () => {
    const layers = [layer(800, 5, 'a'), layer(500, 10, 'b'), layer(1500, 0, 'c')]
    const res = runRefractionForward(input(layers, { spreadLength: 60 }))
    expect(res.branchTimesMs[1]).toBeNull()
    expect(res.branches[1].interfaceIndex).toBe(0)
    expect(res.diagnostics.warnings.map((w) => w.key)).toContain('velocityInversion')
    expect(res.branchTimesMs[2]).not.toBeNull()
  })

  it('warns when no refractor exists (all velocities decrease)', () => {
    const res = runRefractionForward(input([layer(1200, 5, 'a'), layer(600, 0, 'b')]))
    const keys = res.diagnostics.warnings.map((w) => w.key)
    expect(keys).toContain('noRefractor')
    expect(res.diagnostics.nRefractedFirstArrivals).toBe(0)
  })

  it('warns when the spread is too short for the first refractor', () => {
    const res = runRefractionForward(input([layer(1000, 5, 'a'), layer(3000, 0, 'b')], { spreadLength: 10, geophoneSpacing: 1 }))
    const keys = res.diagnostics.warnings.map((w) => w.key)
    expect(keys).toContain('spreadTooShort')
    expect(res.firstArrivalBranch[res.x.length - 1]).toBe(0)
  })
})

describe('synthetic shot record (seismogram)', () => {
  const layers = [layer(400, 5, 'a'), layer(2000, 0, 'b')]
  const res = runRefractionForward(input(layers, { traceNoisePercent: 0 }))

  it('produces one trace per receiver with a consistent time axis', () => {
    const s = res.seismogram
    expect(s.traces.length).toBe(res.x.length)
    for (const tr of s.traces) expect(tr.length).toBe(s.tMs.length)
    expect(s.tMs[0]).toBe(0)
    expect(s.tMs[s.tMs.length - 1]).toBeGreaterThan(res.diagnostics.maxFirstArrivalMs)
    expect(s.f0Hz).toBe(60)
  })

  it('places wavelet energy at the analytic branch arrival times', () => {
    const s = res.seismogram
    for (const r of [5, 35]) {
      let bestIdx = 0
      let bestAbs = 0
      for (let i = 0; i < s.traces[r].length; i++) {
        const a = Math.abs(s.traces[r][i])
        if (a > bestAbs) {
          bestAbs = a
          bestIdx = i
        }
      }
      const peakTime = s.tMs[bestIdx]
      const arrivals = res.branches.map((b) => b.timesMs[r]).filter((v) => Number.isFinite(v))
      expect(arrivals.some((ta) => Math.abs(peakTime - ta) <= 0.5 * (1000 / s.f0Hz))).toBe(true)
      expect(bestAbs).toBeGreaterThan(0.02)
    }
  })

  it('globally normalizes the record and stays finite', () => {
    let maxAbs = 0
    for (const tr of res.seismogram.traces) for (const v of tr) {
      expect(Number.isFinite(v)).toBe(true)
      maxAbs = Math.max(maxAbs, Math.abs(v))
    }
    expect(maxAbs).toBeCloseTo(1, 6)
  })

  it('is deterministic with a fixed seed and differs across seeds', () => {
    const a = runRefractionForward(input(layers, { traceNoisePercent: 6, seed: 7 }))
    const b = runRefractionForward(input(layers, { traceNoisePercent: 6, seed: 7 }))
    const c = runRefractionForward(input(layers, { traceNoisePercent: 6, seed: 8 }))
    expect(a.seismogram.traces).toEqual(b.seismogram.traces)
    expect(a.seismogram.traces).not.toEqual(c.seismogram.traces)
  })

  it('all presets produce finite records', () => {
    for (const s of refrScenarios) {
      const r = runRefractionForward(refrScenarioToInput(s))
      expect(r.seismogram.traces.length).toBe(r.x.length)
      expect(r.seismogram.traces[0].every((v) => Number.isFinite(v))).toBe(true)
    }
  })
})

describe('refraction noise, scenarios and validation', () => {
  it('is deterministic without noise and reproducible with a fixed seed', () => {
    const layers = [layer(400, 5, 'a'), layer(2000, 0, 'b')]
    const a = runRefractionForward(input(layers))
    const b = runRefractionForward(input(layers))
    expect(a.firstArrivalMs).toEqual(b.firstArrivalMs)
    const n1 = runRefractionForward(input(layers, { noiseMs: 0.5, seed: 9 }))
    const n2 = runRefractionForward(input(layers, { noiseMs: 0.5, seed: 9 }))
    const n3 = runRefractionForward(input(layers, { noiseMs: 0.5, seed: 10 }))
    expect(n1.firstArrivalMs).toEqual(n2.firstArrivalMs)
    expect(n1.firstArrivalMs).not.toEqual(n3.firstArrivalMs)
  })

  it('all presets produce finite travel times and receivers', () => {
    for (const s of refrScenarios) {
      const res = runRefractionForward(refrScenarioToInput(s))
      expect(res.firstArrivalMs.every((v) => Number.isFinite(v))).toBe(true)
      expect(res.x.length).toBeGreaterThan(4)
      expect(res.diagnostics.maxFirstArrivalMs).toBeGreaterThan(0)
    }
  })

  it('validates survey and layer ranges with dotted paths', () => {
    const bad = validateRefraction(
      input([layer(50, -1, 'a'), layer(9500, 0, 'b')], { geophoneSpacing: 0, spreadLength: 5000, noiseMs: -1 }),
    )
    const paths = bad.map((e) => e.path)
    expect(paths).toContain('survey.geophoneSpacing')
    expect(paths).toContain('survey.spreadLength')
    expect(paths).toContain('survey.noiseMs')
    expect(paths).toContain('layer.0.thickness')
    expect(paths).toContain('layer.0.vp')
    expect(paths).toContain('layer.1.vp')
  })

  it('accepts all shipped presets', () => {
    for (const s of refrScenarios) {
      expect(validateRefraction(refrScenarioToInput(s))).toEqual([])
    }
  })
})
