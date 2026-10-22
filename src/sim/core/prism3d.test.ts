import { describe, expect, it } from 'vitest'
import { G_CONST } from './constants'
import { prismGzHat, prismQuantities, type PrismBox } from './prism3d'
import { prismAttraction } from '../gravity/solver'
import type { GrvPrismBody } from '../gravity/types'

const box: PrismBox = { x1: -3, x2: 3, y1: -2, y2: 2, z1: 5, z2: 10 }

describe('prism3d — unit-density vertical attraction', () => {
  it('converges to the exact 2D (infinite-strike) attraction on the profile', () => {
    const long: PrismBox = { ...box, y1: -5e5, y2: 5e5 }
    const body2d: GrvPrismBody = { id: 'p', kind: 'prism', x1: box.x1, x2: box.x2, y: 0, strikeLength: 1e6, z1: box.z1, z2: box.z2, deltaRho: 1 }
    for (const x of [-8, -1.5, 0, 2.7, 9]) {
      const got = prismGzHat(x, 0, 0, long)
      const want = prismAttraction(body2d, x) / G_CONST
      expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(2e-3)
    }
  })

  it('approaches the point-mass attraction far away', () => {
    const small: PrismBox = { x1: -0.5, x2: 0.5, y1: -0.5, y2: 0.5, z1: 19.5, z2: 20.5 }
    const volume = 1
    for (const x of [0, 30]) {
      for (const y of [0, 25]) {
        const r = Math.hypot(x, y, -20)
        const want = (volume * 20) / (r * r * r)
        const got = prismGzHat(x, y, 0, small)
        expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(1e-3)
      }
    }
  })

  it('matches its own finite-difference gradient (tensor consistency)', () => {
    const p = { ...box }
    const h = 1e-3
    const pts: Array<[number, number, number]> = [
      [1.3, 0.7, 0],
      [-4.2, 3.1, 0],
      [0.4, -6.5, 0],
    ]
    for (const [x, y, z] of pts) {
      const q = prismQuantities(x, y, z, p)
      const dz = (prismGzHat(x, y, z + h, p) - prismGzHat(x, y, z - h, p)) / (2 * h)
      const dx = (prismGzHat(x + h, y, z, p) - prismGzHat(x - h, y, z, p)) / (2 * h)
      const dy = (prismGzHat(x, y + h, z, p) - prismGzHat(x, y - h, z, p)) / (2 * h)
      const dxx = (prismQuantities(x + h, y, z, p).gx - prismQuantities(x - h, y, z, p).gx) / (2 * h)
      const dxy = (prismQuantities(x, y + h, z, p).gx - prismQuantities(x, y - h, z, p).gx) / (2 * h)
      const dyy = (prismQuantities(x, y + h, z, p).gy - prismQuantities(x, y - h, z, p).gy) / (2 * h)
      expect(Math.abs(q.zz - dz) / Math.abs(q.zz)).toBeLessThan(1e-3)
      expect(Math.abs(q.xz - dx) / Math.abs(q.xz)).toBeLessThan(1e-3)
      expect(Math.abs(q.yz - dy) / Math.abs(q.yz)).toBeLessThan(1e-3)
      expect(Math.abs(q.xx - dxx) / Math.abs(q.xx)).toBeLessThan(1e-3)
      expect(Math.abs(q.xy - dxy) / Math.abs(q.xy)).toBeLessThan(1e-3)
      expect(Math.abs(q.yy - dyy) / Math.abs(q.yy)).toBeLessThan(1e-3)
    }
  })

  it('obeys Laplace equation outside the source (tensor trace = 0)', () => {
    const p = { ...box }
    for (const [x, y, z] of [
      [0, 0, 0],
      [7.5, -4.4, 12],
      [-20, 13, 3],
    ] as Array<[number, number, number]>) {
      const q = prismQuantities(x, y, z, p)
      const trace = q.xx + q.yy + q.zz
      const scale = Math.max(Math.abs(q.xx), Math.abs(q.yy), Math.abs(q.zz), 1e-12)
      expect(Math.abs(trace) / scale).toBeLessThan(1e-6)
    }
  })

  it('is evanescent below the source on the vertical axis (positive T_zz above a mass)', () => {
    const q = prismQuantities(0, 0, 0, box)
    expect(q.zz).toBeGreaterThan(0)
    expect(q.gz).toBeGreaterThan(0)
  })
})
