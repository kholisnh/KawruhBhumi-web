import { describe, expect, it } from 'vitest'
import { MU0 } from '../core/constants'
import { magScenarioToInput, magScenarios } from './model'
import { bodyAnomalyT, bodyAnomalyT3D, runMagneticForward } from './solver'
import type { MagDipoleBody, MagInput, MagPrismBody } from './types'
import { validateMagnetic } from './validate'

const dipole: MagDipoleBody = { id: 'd1', kind: 'dipole', x: 10, y: 0, z: 10, radius: 1, chi: 0.01 }
const prism: MagPrismBody = { id: 'p1', kind: 'prism', x1: -1, x2: 1, y: 0, strikeLength: 60, z1: 2, z2: 4, chi: 0.05 }

const baseSurvey = {
  fieldNT: 48000,
  inclinationDeg: 60,
  lineLength: 50,
  stationSpacing: 1,
  noiseNT: 0,
  mapLines: 25,
  mapLineSpacing: 2,
  seed: 42,
}

const input = (bodies: MagInput['bodies'], survey: Partial<MagInput['survey']> = {}): MagInput => ({
  bodies,
  survey: { ...baseSurvey, ...survey },
})

describe('magnetic dipole (closed form)', () => {
  it('matches the analytic induced-dipole total-field anomaly', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const inc = (baseSurvey.inclinationDeg * Math.PI) / 180
    const v = (4 / 3) * Math.PI * dipole.radius ** 3
    for (const r of [5, 20, 100]) {
      const px = dipole.x + r * Math.cos(inc)
      const pz = dipole.z + r * Math.sin(inc)
      const expectedAtPoint = ((dipole.chi * v * fieldT) / (4 * Math.PI)) * (3 * 1 - 1) / r ** 3
      const got = bodyAnomalyT(dipole, px, pz, fieldT, inc)
      expect(got).toBeCloseTo(expectedAtPoint, 12)
    }
  })

  it('is negative perpendicular to the field direction through the centre', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const inc = (baseSurvey.inclinationDeg * Math.PI) / 180
    const v = (4 / 3) * Math.PI * dipole.radius ** 3
    const r = 12
    const px = dipole.x - r * Math.sin(inc)
    const pz = dipole.z + r * Math.cos(inc)
    const expected = ((dipole.chi * v * fieldT) / (4 * Math.PI * r ** 3)) * (0 - 1)
    expect(bodyAnomalyT(dipole, px, pz, fieldT, inc)).toBeCloseTo(expected, 12)
  })

  it('3D dipole respects the y offset of the sphere centre', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const inc = (baseSurvey.inclinationDeg * Math.PI) / 180
    const shifted: MagDipoleBody = { ...dipole, y: 15 }
    const onCentre = bodyAnomalyT3D(shifted, 10, 15, fieldT, inc)
    expect(onCentre).toBeCloseTo(bodyAnomalyT3D(dipole, 10, 0, fieldT, inc), 12)
    const offCentre = bodyAnomalyT3D(shifted, 10, 0, fieldT, inc)
    expect(Math.abs(offCentre - onCentre) / Math.abs(onCentre)).toBeGreaterThan(0.5)
  })
})

describe('magnetic 3D prism (finite strike)', () => {
  it('converges to the exact 2D infinite-strike field for a very long prism', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const inc = (baseSurvey.inclinationDeg * Math.PI) / 180
    const body: MagPrismBody = { ...prism, x1: 24, x2: 26, z1: 1, z2: 5, strikeLength: 1e6 }
    for (const x of [18, 24, 25, 27, 33]) {
      const a2 = bodyAnomalyT(body, x, 0, fieldT, inc)
      const a3 = bodyAnomalyT3D(body, x, 0, fieldT, inc)
      expect(Math.abs(a3 - a2) / Math.abs(a2)).toBeLessThan(2e-3)
    }
  })

  it('far field of a small cube matches the point-dipole closed form', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const inc = (baseSurvey.inclinationDeg * Math.PI) / 180
    const cube: MagPrismBody = { id: 'c', kind: 'prism', x1: -0.5, x2: 0.5, y: 0, strikeLength: 1, z1: 19.5, z2: 20.5, chi: 0.1 }
    const v = 1
    for (const px of [30, -45, 60]) {
      // General dipole field of a point moment m = M·V = χH₀V placed at the
      // cube centre (0, 0, 20); observation at the surface (px, 0, 0).
      const dx = px
      const dz = -20
      const r = Math.hypot(dx, dz)
      const fdot = (Math.cos(inc) * dx + Math.sin(inc) * dz) / r
      const expected = (((cube.chi * v * fieldT) / (4 * Math.PI * r ** 3)) * (3 * fdot * fdot - 1))
      const got = bodyAnomalyT3D(cube, px, 0, fieldT, inc)
      expect(Math.abs(got - expected) / Math.abs(expected)).toBeLessThan(5e-3)
    }
  })

  it('approaches the 2D dipole-line field at large distance', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const inc = (baseSurvey.inclinationDeg * Math.PI) / 180
    const long: MagPrismBody = { ...prism, strikeLength: 1e6 }
    const area = (long.x2 - long.x1) * (long.z2 - long.z1)
    const r = 500
    const cx = (long.x1 + long.x2) / 2
    const cz = (long.z1 + long.z2) / 2
    const px = cx + r * Math.cos(inc)
    const pz = cz + r * Math.sin(inc)
    const expected = ((long.chi * fieldT * area) / (2 * Math.PI * r * r)) * (2 * 1 - 1)
    const got = bodyAnomalyT(long, px, pz, fieldT, inc)
    expect(Math.abs(got - expected) / Math.abs(expected)).toBeLessThan(0.01)
  })

  it('is symmetric for a vertical field over a centred prism', () => {
    const body: MagPrismBody = { ...prism, x1: 24, x2: 26, z1: 1, z2: 5 }
    const res = runMagneticForward(input([body], { inclinationDeg: 90, lineLength: 50, stationSpacing: 1 }))
    const n = res.x.length
    for (let i = 0; i < n; i++) {
      expect(res.totalNT[i]).toBeCloseTo(res.totalNT[n - 1 - i], 8)
    }
  })

  it('adds linearly across bodies (superposition, noise-free)', () => {
    const both = runMagneticForward(input([dipole, prism]))
    const a = runMagneticForward(input([dipole]))
    const b = runMagneticForward(input([prism]))
    for (let i = 0; i < both.x.length; i++) {
      expect(both.totalNT[i]).toBeCloseTo(a.totalNT[i] + b.totalNT[i], 9)
    }
  })

  it('produces a sign-consistent anomaly over a shallow metal-like body (I = 60°)', () => {
    const body: MagPrismBody = { kind: 'prism', x1: 23, x2: 27, y: 0, strikeLength: 60, z1: 0.5, z2: 1.5, chi: 0.3, id: 'p2' }
    const res = runMagneticForward(input([body]))
    const centre = res.totalNT[Math.round(25 / baseSurvey.stationSpacing)]
    expect(centre).toBeGreaterThan(0)
  })
})

describe('magnetic anomaly map', () => {
  it('builds a grid centred on the profile with the profile values on the central line', () => {
    const body: MagPrismBody = { kind: 'prism', x1: 20, x2: 30, y: 0, strikeLength: 40, z1: 2, z2: 8, chi: 0.1, id: 'b' }
    const res = runMagneticForward(input([body], { lineLength: 50, stationSpacing: 1, mapLines: 9, mapLineSpacing: 5 }))
    expect(res.map.y).toHaveLength(9)
    expect(res.map.y[4]).toBe(0)
    expect(res.map.y[0]).toBe(-20)
    expect(res.map.valuesNT).toHaveLength(9)
    expect(res.map.valuesNT[0]).toHaveLength(res.x.length)
    for (let i = 0; i < res.x.length; i++) {
      const central = res.map.valuesNT[4][i]
      const direct = res.perBodyNT[0][i]
      expect(central).toBeCloseTo(direct, 6)
    }
  })

  it('is symmetric about the profile for a centred body (I = 90°)', () => {
    const res = runMagneticForward(input([prism], { inclinationDeg: 90, mapLines: 5, mapLineSpacing: 5 }))
    const { y, valuesNT } = res.map
    for (let j = 0; j < y.length; j++) {
      const jj = y.length - 1 - j
      for (let i = 0; i < res.x.length; i++) {
        expect(valuesNT[j][i]).toBeCloseTo(valuesNT[jj][i], 9)
      }
    }
  })

  it('reports map statistics consistent with the grid', () => {
    const res = runMagneticForward(input([prism]))
    let maxAbs = 0
    let minV = Infinity
    let maxV = -Infinity
    for (const row of res.map.valuesNT) {
      for (const v of row) {
        maxAbs = Math.max(maxAbs, Math.abs(v))
        minV = Math.min(minV, v)
        maxV = Math.max(maxV, v)
      }
    }
    expect(res.diagnostics.mapMaxAbsNT).toBeCloseTo(maxAbs, 9)
    expect(res.diagnostics.mapMinNT).toBeCloseTo(minV, 9)
    expect(res.diagnostics.mapMaxNT).toBeCloseTo(maxV, 9)
  })
})

describe('magnetic reproducibility and diagnostics', () => {
  it('is exactly deterministic without noise', () => {
    const a = runMagneticForward(input([prism]))
    const b = runMagneticForward(input([prism]))
    expect(a.totalNT).toEqual(b.totalNT)
    expect(a.map.valuesNT).toEqual(b.map.valuesNT)
  })

  it('reproduces the same noise for the same seed and differs for another seed', () => {
    const a = runMagneticForward(input([prism], { noiseNT: 5, seed: 7 }))
    const b = runMagneticForward(input([prism], { noiseNT: 5, seed: 7 }))
    const c = runMagneticForward(input([prism], { noiseNT: 5, seed: 8 }))
    expect(a.totalNT).toEqual(b.totalNT)
    expect(a.totalNT).not.toEqual(c.totalNT)
  })

  it('reports peak-to-peak and RMS consistently', () => {
    const res = runMagneticForward(input([prism]))
    expect(res.diagnostics.nStations).toBe(res.x.length)
    expect(res.diagnostics.peakToPeakNT).toBeGreaterThan(0)
    expect(res.diagnostics.rmsNT).toBeGreaterThan(0)
    expect(res.diagnostics.maxAbsNT).toBeGreaterThanOrEqual(res.diagnostics.rmsNT / Math.sqrt(res.x.length))
  })

  it('flags strong susceptibility and near-surface bodies', () => {
    const strong: MagPrismBody = { ...prism, chi: 0.8, z1: 0.01 }
    const res = runMagneticForward(input([strong]))
    const keys = res.diagnostics.warnings.map((w) => w.key)
    expect(keys).toContain('strongChi')
    expect(keys).toContain('prismAtSurface')
  })
})

describe('magnetic scenarios and validation', () => {
  it('all presets produce finite anomalies and maps', () => {
    for (const s of magScenarios) {
      const res = runMagneticForward(magScenarioToInput(s))
      expect(res.totalNT.every((v) => Number.isFinite(v))).toBe(true)
      expect(res.map.valuesNT.every((row) => row.every((v) => Number.isFinite(v)))).toBe(true)
      expect(res.diagnostics.maxAbsNT).toBeGreaterThan(0)
      expect(res.diagnostics.mapMaxAbsNT).toBeGreaterThan(0)
    }
  })

  it('validates survey and body ranges with dotted paths', () => {
    const bad = validateMagnetic(
      input(
        [
          { ...prism, x2: -5, chi: 5, strikeLength: 0 } as MagPrismBody,
          { ...dipole, y: 5000 } as MagDipoleBody,
        ],
        { stationSpacing: 0, lineLength: 5000, noiseNT: -1, mapLines: 24, mapLineSpacing: 0 },
      ),
    )
    const paths = bad.map((e) => e.path)
    expect(paths).toContain('survey.stationSpacing')
    expect(paths).toContain('survey.lineLength')
    expect(paths).toContain('survey.noiseNT')
    expect(paths).toContain('survey.mapLines')
    expect(paths).toContain('survey.mapLineSpacing')
    expect(paths).toContain('body.0.chi')
    expect(paths).toContain('body.0.x2')
    expect(paths).toContain('body.0.strikeLength')
    expect(paths).toContain('body.1.y')
  })

  it('accepts all shipped presets', () => {
    for (const s of magScenarios) {
      expect(validateMagnetic(magScenarioToInput(s))).toEqual([])
    }
  })

  it('moment summary is consistent with the induced-dipole formula', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const res = runMagneticForward(input([dipole]))
    const v = (4 / 3) * Math.PI * dipole.radius ** 3
    expect(res.bodies[0].momentAm2).toBeCloseTo(((dipole.chi * fieldT) / MU0) * v, 10)
  })

  it('prism summary reports total volume and moment M·V', () => {
    const fieldT = baseSurvey.fieldNT * 1e-9
    const res = runMagneticForward(input([prism]))
    const volume = (prism.x2 - prism.x1) * (prism.z2 - prism.z1) * prism.strikeLength
    expect(res.bodies[0].sizeValue).toBeCloseTo(volume, 9)
    expect(res.bodies[0].momentAm2).toBeCloseTo(((prism.chi * fieldT) / MU0) * volume, 12)
    expect(res.bodies[0].y).toBe(0)
  })
})
