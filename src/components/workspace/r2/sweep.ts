import { fmt } from '../../../sim/core/format'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function sweepValues(center: number, rangePct: number, steps: number, min: number, max: number): number[] {
  if (!Number.isFinite(center) || !Number.isFinite(min) || !Number.isFinite(max) || max < min) return []
  const count = Math.max(2, Math.min(21, Math.round(steps)))
  const range = Math.max(0, Math.min(95, rangePct)) / 100
  const values: number[] = []
  for (let i = 0; i < count; i += 1) {
    const factor = -range + (2 * range * i) / (count - 1)
    const value = Number(clamp(center * (1 + factor), min, max).toPrecision(6))
    const duplicate = values.some((existing) => Math.abs(existing - value) < 1e-9 * Math.max(1, Math.abs(value)))
    if (!duplicate) values.push(value)
  }
  return values.sort((a, b) => a - b)
}

export function metricDelta(current: number, pinned: number): number {
  return current - pinned
}

export function formatMetricValue(value: number, format?: (value: number) => string): string {
  if (!Number.isFinite(value)) return '—'
  return format ? format(value) : fmt(value, 3)
}

export function formatMetricDelta(value: number, format?: (value: number) => string): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  return `${value > 0 ? '+' : '−'}${formatMetricValue(Math.abs(value), format)}`
}
