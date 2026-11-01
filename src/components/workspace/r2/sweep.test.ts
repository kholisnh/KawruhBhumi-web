import { describe, expect, it } from 'vitest'
import { clamp, formatMetricDelta, formatMetricValue, metricDelta, sweepValues } from './sweep'

describe('sweepValues', () => {
  it('creates a sorted, bounded sweep around the centre', () => {
    const values = sweepValues(100, 40, 9, 10, 200)
    expect(values).toHaveLength(9)
    expect(values[0]).toBeCloseTo(60, 6)
    expect(values[4]).toBeCloseTo(100, 6)
    expect(values[8]).toBeCloseTo(140, 6)
    expect(values).toEqual([...values].sort((a, b) => a - b))
  })

  it('clamps values to the guarded range and removes duplicates', () => {
    const values = sweepValues(1, 90, 9, 1, 10)
    expect(values[0]).toBe(1)
    expect(values[values.length - 1]).toBeCloseTo(1.9, 6)
    expect(new Set(values).size).toBe(values.length)
  })

  it('rejects invalid ranges and clamps the requested range', () => {
    expect(sweepValues(5, 40, 9, 10, 1)).toEqual([])
    expect(sweepValues(Number.NaN, 40, 9, 1, 10)).toEqual([])
    expect(sweepValues(50, 500, 5, 1, 100)[0]).toBe(2.5)
    expect(sweepValues(50, 500, 5, 1, 100)[4]).toBe(97.5)
  })
})

describe('comparison helpers', () => {
  it('computes signed deltas', () => {
    expect(metricDelta(12, 10)).toBe(2)
    expect(metricDelta(8, 10)).toBe(-2)
  })

  it('formats values and signed deltas', () => {
    expect(formatMetricValue(Number.NaN)).toBe('—')
    expect(formatMetricValue(1.2345, (value) => value.toFixed(2))).toBe('1.23')
    expect(formatMetricDelta(0)).toBe('0')
    expect(formatMetricDelta(2.5, (value) => value.toFixed(1))).toBe('+2.5')
    expect(formatMetricDelta(-2.5, (value) => value.toFixed(1))).toBe('−2.5')
  })

  it('clamps arbitrary values', () => {
    expect(clamp(5, 1, 10)).toBe(5)
    expect(clamp(-5, 1, 10)).toBe(1)
    expect(clamp(50, 1, 10)).toBe(10)
  })
})
