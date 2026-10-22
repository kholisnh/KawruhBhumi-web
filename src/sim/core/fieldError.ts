/** Shared field-validation types used by every workspace. */

export interface FieldError {
  /** Dotted path, e.g. "survey.frequencyMHz" | "layer.2.epsR" | "body.0.x". */
  path: string
  /** i18n key under the workspace's errors dictionary. */
  key: string
  params?: Record<string, string | number>
}

export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

export function hasErrorAt(errors: FieldError[], path: string): FieldError | undefined {
  return errors.find((e) => e.path === path)
}
