import { describe, expect, it } from 'vitest'
import { G_CONST } from '../core/constants'
import { grvScenarioToInput, grvScenarios } from './model'
import { MGAL, bodyAttractionMGal, prismAttraction, prismAttraction3D, runGravityForward, sphereAttraction, sphereAttraction3D } from './solver'
import type { GrvInput, GrvPrismBody, GrvSphereBody } from './types'
import { validateGravity } from './validate'

const sphere: GrvSphereBody = { id: 's1', kind: 'sphere', x: 30, y: 0, z: 8, radius: 2.5, deltaRho: -2200 }
const prism: GrvPrismBody = { id: 'p1', kind: 'prism', x1: 22, x2: 28, y: 0, strikeLength: 40, z1: 5, z2: 25, deltaRho: 800 }

const baseSurvey = { lineLength: 60, stationSpacing: 0.5, noiseMGal: 0, mapLines: 25, mapLineSpacing: 2, seed: 42 }
const input = (bodies: GrvInput['bodies'], survey: Partial<GrvInput['survey']> = {}): GrvInput => ({
  bodies,
  survey: { ...baseSurvey, ...survey },
})

describe('gravity sphere (point mass)', () => {
  it('matches Newtonian attraction exactly', () => {
    for (const x of [20, 30, 45]) {
      const v = (4 / 3) * Math.PI * sphere.radius ** 3
      const dx = sphere.x - x
      const r = Math.hypot(dx, sphere.z)
      const expected = (G_CONST * sphere.deltaRho * v * (sphere.z / r ** 3)) / MGAL
      expect(bodyAttractionMGal(sphere, x)).toBeCloseTo(expected, 10)
    }
  })

  it('3D sphere respects the y offset of its centre', () => {
    const shifted: GrvSphereBody = { ...sphere, y: 12 }
    expect(sphereAttraction3D(shifted, 30, 12)).toBeCloseTo(sphereAttraction3D(sphere, 30, 0), 12)
    expect(Math.abs(sphereAttraction3D(shifted, 30, 0))).toBeLessThan(Math.abs(sphereAttraction3D(shifted, 30, 12)))
  })

  it('is maximum in magnitude directly above the centre (negative mass deficit)', () => {
    const g = (x: number) => Math.abs(sphereAttraction(sphere, x))
    expect(g(30)).toBeGreaterThan(g(25))
    expect(g(30)).toBeGreaterThan(g(35))
  })
})

describe('gravity prism (3D finite strike)', () => {
  it('approaches the Bouguer slab value 2πGΔρt for a wide, long prism', () => {
    const wide: GrvPrismBody = { id: 'w', kind: 'prism', x1: -2000, x2: 2000, y: 0, strikeLength: 4000, z1: 5, z2: 9, deltaRho: 500 }
    const t = wide.z2 - wide.z1
    const expected = 2 * Math.PI * G_CONST * wide.deltaRho * t
    const got = prismAttraction3D(wide, 0, 0)
    expect(Math.abs(got - expected) / expected).toBeLessThan(0.02)
  })

  it('converges to the exact 2D infinite-strike formula for a very long prism', () => {
    const long: GrvPrismBody = { ...prism, strikeLength: 1e6 }
    for (const x of [15, 22, 25, 29, 40]) {
      const a2 = prismAttraction(long, x)
      const a3 = prismAttraction3D(long, x, 0)
      expect(Math.abs(a3 - a2) / Math.abs(a2)).toBeLessThan(2e-3)
    }
  })

  it('is symmetric for a centred prism', () => {
    const res = runGravityForward(input([{ ...prism, x1: 25, x2: 35 }], { lineLength: 60, stationSpacing: 0.5 }))
    const n = res.x.length
    for (let i = 0; i < n; i++) {
      expect(res.gMGal[i]).toBeCloseTo(res.gMGal[n - 1 - i], 8)
    }
  })

  it('adds linearly across bodies (superposition, noise-free)', () => {
    const both = runGravityForward(input([sphere, prism]))
    const a = runGravityForward(input([sphere]))
    const b = runGravityForward(input([prism]))
    for (let i = 0; i < both.x.length; i++) {
      expect(both.gMGal[i]).toBeCloseTo(a.gMGal[i] + b.gMGal[i], 9)
    }
  })
})

describe('gravity anomaly map', () => {
  it('builds a grid centred on the profile with the profile values on the central line', () => {
    const res = runGravityForward(input([prism], { mapLines: 9, mapLineSpacing: 5 }))
    expect(res.map.y).toHaveLength(9)
    expect(res.map.y[4]).toBe(0)
    expect(res.map.y[0]).toBe(-20)
    expect(res.map.valuesMGal).toHaveLength(9)
    expect(res.map.valuesMGal[0]).toHaveLength(res.x.length)
    for (let i = 0; i < res.x.length; i++) {
      expect(res.map.valuesMGal[4][i]).toBeCloseTo(res.perBodyMGal[0][i], 9)
    }
  })

  it('is symmetric about the profile for a centred body', () => {
    const res = runGravityForward(input([prism], { mapLines: 5, mapLineSpacing: 4 }))
    const { y, valuesMGal } = res.map
    for (let j = 0; j < y.length; j++) {
      const jj = y.length - 1 - j
      for (let i = 0; i < res.x.length; i++) {
        expect(valuesMGal[j][i]).toBeCloseTo(valuesMGal[jj][i], 9)
      }
    }
  })

  it('reports map statistics consistent with the grid', () => {
    const res = runGravityForward(input([sphere, prism]))
    let maxAbs = 0
    let minV = Infinity
    let maxV = -Infinity
    for (const row of res.map.valuesMGal) {
      for (const v of row) {
        maxAbs = Math.max(maxAbs, Math.abs(v))
        minV = Math.min(minV, v)
        maxV = Math.max(maxV, v)
      }
    }
    expect(res.diagnostics.mapMaxAbsMGal).toBeCloseTo(maxAbs, 9)
    expect(res.diagnostics.mapMinMGal).toBeCloseTo(minV, 9)
    expect(res.diagnostics.mapMaxMGal).toBeCloseTo(maxV, 9)
  })

  it('keeps the map noise-free while the profile carries the seeded noise', () => {
    const a = runGravityForward(input([prism], { noiseMGal: 0.1, seed: 3 }))
    const b = runGravityForward(input([prism], { noiseMGal: 0.1, seed: 4 }))
    expect(a.map.valuesMGal).toEqual(b.map.valuesMGal)
    expect(a.gMGal).not.toEqual(b.gMGal)
  })
})

describe('gravity reproducibility and diagnostics', () => {
  it('is exactly deterministic without noise', () => {
    const a = runGravityForward(input([prism]))
    const b = runGravityForward(input([prism]))
    expect(a.gMGal).toEqual(b.gMGal)
    expect(a.map.valuesMGal).toEqual(b.map.valuesMGal)
  })

  it('reproduces the same noise for the same seed and differs for another seed', () => {
    const a = runGravityForward(input([prism], { noiseMGal: 0.05, seed: 7 }))
    const b = runGravityForward(input([prism], { noiseMGal: 0.05, seed: 7 }))
    const c = runGravityForward(input([prism], { noiseMGal: 0.05, seed: 8 }))
    expect(a.gMGal).toEqual(b.gMGal)
    expect(a.gMGal).not.toEqual(c.gMGal)
  })

  it('reports finite diagnostics and scenario peaks', () => {
    const res = runGravityForward(input([prism]))
    expect(res.diagnostics.nStations).toBe(res.x.length)
    expect(res.diagnostics.peakToPeakMGal).toBeGreaterThan(0)
    expect(res.bodies[0].peakMGal).toBeCloseTo(Math.max(...res.perBodyMGal[0]), 10)
    expect(res.bodies[0].excessMassKg).toBeCloseTo(800 * (28 - 22) * (25 - 5) * prism.strikeLength, 6)
  })

  it('flags near-surface prisms and near-field spheres', () => {
    const res = runGravityForward(input([{ ...prism, z1: 0.01 }, { ...sphere, z: 1, radius: 2 }]))
    const keys = res.diagnostics.warnings.map((w) => w.key)
    expect(keys).toContain('prismAtSurface')
    expect(keys).toContain('sphereNearField')
  })
})

describe('gravity scenarios and validation', () => {
  it('all presets produce finite anomalies with non-trivial amplitude', () => {
    for (const s of grvScenarios) {
      const res = runGravityForward(grvScenarioToInput(s))
      expect(res.gMGal.every((v) => Number.isFinite(v))).toBe(true)
      expect(res.map.valuesMGal.every((row) => row.every((v) => Number.isFinite(v)))).toBe(true)
      expect(res.diagnostics.peakToPeakMGal).toBeGreaterThan(0.01)
      expect(res.diagnostics.mapMaxAbsMGal).toBeGreaterThan(0.005)
    }
  })

  it('validates survey and body ranges with dotted paths', () => {
    const bad = validateGravity(
      input(
        [
          { ...prism, x2: -5, strikeLength: 0 } as GrvPrismBody,
          { ...sphere, radius: 0, deltaRho: 9000, y: -4000 } as GrvSphereBody,
        ],
        { stationSpacing: 0, noiseMGal: -1, mapLines: 24, mapLineSpacing: -1 },
      ),
    )
    const paths = bad.map((e) => e.path)
    expect(paths).toContain('survey.stationSpacing')
    expect(paths).toContain('survey.noiseMGal')
    expect(paths).toContain('survey.mapLines')
    expect(paths).toContain('survey.mapLineSpacing')
    expect(paths).toContain('body.0.x2')
    expect(paths).toContain('body.0.strikeLength')
    expect(paths).toContain('body.1.radius')
    expect(paths).toContain('body.1.deltaRho')
    expect(paths).toContain('body.1.y')
  })

  it('accepts all shipped presets', () => {
    for (const s of grvScenarios) {
      expect(validateGravity(grvScenarioToInput(s))).toEqual([])
    }
  })

  it('body summaries report total volume and excess mass', () => {
    const res = runGravityForward(input([prism]))
    const volume = (prism.x2 - prism.x1) * (prism.z2 - prism.z1) * prism.strikeLength
    expect(res.bodies[0].sizeValue).toBeCloseTo(volume, 9)
    expect(res.bodies[0].excessMassKg).toBeCloseTo(prism.deltaRho * volume, 9)
    expect(res.bodies[0].y).toBe(0)
  })
})
