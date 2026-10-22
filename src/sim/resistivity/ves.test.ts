import { describe, expect, it } from 'vitest'
import { getVesPreset, VES_PRESETS } from './presets'
import type { VesLayer } from './types'
import { validateSchlumbergerGeometry, validateVesLayers } from './validation'
import {
  besselJ0,
  computeVesCurve,
  hankelJ,
  logSpacings,
  schlumbergerApparent,
  surfaceTransform,
  twoLayerSchlumberger,
  twoLayerWenner,
  wennerApparent,
} from './ves'

const layer = (thicknessM: number | null, resistivityOhmM: number): VesLayer => ({ thicknessM, resistivityOhmM })

function seriesJ(layers: VesLayer[], rM: number): number {
  const rho1 = layers[0].resistivityOhmM
  const rho2 = layers[1].resistivityOhmM
  const h = layers[0].thicknessM!
  const k = (rho2 - rho1) / (rho2 + rho1)
  let sum = 0
  let term = k
  for (let m = 1; m <= 400; m++) {
    sum += term / Math.hypot(rM, 2 * m * h)
    term *= k
    if (Math.abs(term) < 1e-16) break
  }
  return 2 * rho1 * sum
}

describe('Bessel J0', () => {
  it('matches reference values', () => {
    expect(besselJ0(0)).toBeCloseTo(1, 8)
    expect(besselJ0(1)).toBeCloseTo(0.7651976865579666, 7)
    expect(besselJ0(2)).toBeCloseTo(0.22389077914123567, 7)
    expect(besselJ0(5)).toBeCloseTo(-0.1775967713143383, 7)
    expect(besselJ0(10)).toBeCloseTo(-0.2459357644513483, 6)
    expect(besselJ0(20)).toBeCloseTo(0.16702466434058322, 6)
  })
})

describe('layered-earth transform', () => {
  it('is constant for a homogeneous half-space', () => {
    const layers = [layer(null, 85)]
    for (const lambda of [0, 0.1, 1, 10]) {
      expect(surfaceTransform(lambda, layers)).toBeCloseTo(85, 12)
    }
  })

  it('reduces to the bottom resistivity at λ = 0 and the top resistivity at λ → ∞', () => {
    const layers = [layer(4, 120), layer(null, 25)]
    expect(surfaceTransform(0, layers)).toBeCloseTo(25, 10)
    expect(surfaceTransform(1000, layers)).toBeCloseTo(120, 6)
  })

  it('matches the closed-form two-layer transform', () => {
    const rho1 = 120
    const rho2 = 25
    const h = 4
    const k = (rho2 - rho1) / (rho2 + rho1)
    const layers = [layer(h, rho1), layer(null, rho2)]
    for (const lambda of [0.01, 0.1, 0.5, 2]) {
      const t = Math.tanh(lambda * h)
      const expected = (rho1 * (rho2 + rho1 * t)) / (rho1 + rho2 * t)
      expect(surfaceTransform(lambda, layers)).toBeCloseTo(expected, 12)
      expect((surfaceTransform(lambda, layers) - rho1) / (2 * rho1)).toBeCloseTo(
        (k * Math.exp(-2 * lambda * h)) / (1 - k * Math.exp(-2 * lambda * h)),
        10,
      )
    }
  })
})

describe('Hankel quadrature', () => {
  it('reproduces the two-layer image series for J(r)', () => {
    const layers = [layer(5, 100), layer(null, 10)]
    for (const r of [1, 2, 5, 10, 20, 50]) {
      const numeric = hankelJ(layers, r)
      const exact = seriesJ(layers, r)
      expect(Math.abs(numeric - exact) / Math.abs(exact)).toBeLessThan(2e-3)
    }
  })

  it('handles a resistive basement (positive contrast)', () => {
    const layers = [layer(8, 50), layer(null, 500)]
    for (const r of [2, 10, 30]) {
      const numeric = hankelJ(layers, r)
      const exact = seriesJ(layers, r)
      expect(Math.abs(numeric - exact) / Math.abs(exact)).toBeLessThan(2e-3)
    }
  })
})

describe('Wenner apparent resistivity', () => {
  it('returns the layer resistivity over a homogeneous half-space', () => {
    for (const a of [0.5, 2, 10, 50]) {
      expect(wennerApparent([layer(null, 75)], a)).toBeCloseTo(75, 10)
    }
  })

  it('matches the two-layer closed form', () => {
    const cases: Array<[number, number, number]> = [
      [100, 10, 5],
      [50, 500, 8],
      [120, 30, 2],
    ]
    const spacings = [0.5, 1, 2, 5, 10, 20, 50, 100, 200]
    for (const [rho1, rho2, h] of cases) {
      const layers = [layer(h, rho1), layer(null, rho2)]
      for (const a of spacings) {
        const numeric = wennerApparent(layers, a)
        const exact = twoLayerWenner(rho1, rho2, h, a)
        expect(Math.abs(numeric - exact) / exact).toBeLessThan(2e-3)
      }
    }
  })

  it('tends to the top and bottom resistivities at small and large spacings', () => {
    const layers = [layer(10, 80), layer(null, 320)]
    expect(wennerApparent(layers, 0.2) / 80).toBeCloseTo(1, 2)
    expect(wennerApparent(layers, 5000) / 320).toBeCloseTo(1, 1)
  })
})

describe('Schlumberger apparent resistivity', () => {
  it('matches the two-layer closed form', () => {
    const cases: Array<[number, number, number]> = [
      [100, 10, 5],
      [50, 500, 8],
    ]
    const spacings = [1, 2, 5, 10, 20, 50, 100, 200]
    for (const [rho1, rho2, h] of cases) {
      const layers = [layer(h, rho1), layer(null, rho2)]
      for (const l of spacings) {
        const b = l / 3
        const numeric = schlumbergerApparent(layers, l, b)
        const exact = twoLayerSchlumberger(rho1, rho2, h, l, b)
        expect(Math.abs(numeric - exact) / exact).toBeLessThan(2e-3)
      }
    }
  })

  it('is identical to Wenner for the same four electrodes', () => {
    const layers = [layer(6, 60), layer(14, 12), layer(null, 420)]
    for (const a of [0.5, 2, 5, 20, 80]) {
      const wenner = wennerApparent(layers, a)
      const schlumberger = schlumbergerApparent(layers, 1.5 * a, 0.5 * a)
      expect(schlumberger).toBeCloseTo(wenner, 10)
    }
  })
})

describe('N-layer behaviour', () => {
  it('collapses a repeated layer onto the layer below it', () => {
    const three = [layer(4, 50), layer(10, 30), layer(null, 30)]
    const two = [layer(4, 50), layer(null, 30)]
    for (const a of [0.5, 2, 10, 50]) {
      expect(wennerApparent(three, a)).toBeCloseTo(wennerApparent(two, a), 9)
    }
  })

  it('stays bounded by the extreme layer resistivities', () => {
    const layers = [layer(1.5, 25), layer(8, 3), layer(20, 70), layer(null, 320)]
    const spacings = logSpacings(0.3, 500, 40)
    for (const a of spacings) {
      const value = wennerApparent(layers, a)
      expect(value).toBeGreaterThanOrEqual(3)
      expect(value).toBeLessThanOrEqual(320)
    }
  })

  it('computes full curves for every preset in both arrays', () => {
    for (const preset of VES_PRESETS) {
      const spacings = logSpacings(preset.spacingMinM, preset.spacingMaxM, preset.spacingCount)
      const curve = computeVesCurve(preset.layers, preset.array, { spacingsM: spacings, mnHalfM: preset.mnHalfM })
      expect(curve).toHaveLength(preset.spacingCount)
      expect(curve.every((point) => Number.isFinite(point.rhoAOhmM) && point.rhoAOhmM > 0)).toBe(true)
    }
    expect(getVesPreset('does-not-exist')).toBe(VES_PRESETS[0])
  })
})

describe('validation', () => {
  it('accepts presets', () => {
    for (const preset of VES_PRESETS) {
      expect(validateVesLayers(preset.layers)).toEqual([])
    }
  })

  it('rejects bad layer counts, ranges and thickness conventions', () => {
    expect(validateVesLayers([layer(null, 10)]).some((issue) => issue.code === 'layerCount')).toBe(true)
    expect(
      validateVesLayers([layer(2, 0.01), layer(null, 10)]).some((issue) => issue.code === 'resistivityRange'),
    ).toBe(true)
    expect(
      validateVesLayers([layer(null, 10), layer(2, 10)]).some((issue) => issue.code === 'lastThickness'),
    ).toBe(true)
    expect(validateVesLayers([layer(0, 10), layer(null, 20)]).some((issue) => issue.code === 'thicknessRange')).toBe(true)
  })

  it('checks Schlumberger MN/2 geometry', () => {
    expect(validateSchlumbergerGeometry(10, 2)).toEqual([])
    expect(validateSchlumbergerGeometry(10, 6).some((issue) => issue.code === 'arrayGeometry')).toBe(true)
    expect(validateSchlumbergerGeometry(10, 0).some((issue) => issue.code === 'arrayGeometry')).toBe(true)
  })
})

describe('logSpacings', () => {
  it('is monotonic and inclusive', () => {
    const values = logSpacings(0.5, 200, 12)
    expect(values).toHaveLength(12)
    expect(values[0]).toBeCloseTo(0.5, 12)
    expect(values[11]).toBeCloseTo(200, 9)
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1])
  })
})
