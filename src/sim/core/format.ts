/** Number formatting helpers for scientific readouts. */

export function fmt(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '−∞'
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1e5 || abs < 1e-3) {
    return value.toExponential(digits > 2 ? 2 : digits)
  }
  const decimals = abs >= 100 ? Math.max(0, digits - 3) : abs >= 10 ? Math.max(1, digits - 2) : digits
  return value.toFixed(decimals)
}

export function fmtFixed(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '−∞'
  return value.toFixed(decimals)
}

/** Interpolate {token} placeholders in a localized template. */
export function fillTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const v = params[key]
    return v === undefined ? match : String(v)
  })
}
