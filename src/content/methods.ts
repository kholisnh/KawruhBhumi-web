/** Method registry: single source of truth for the seven simulation methods. */

export type MethodId = 'gpr' | 'magnetic' | 'gravity' | 'reflection' | 'refraction' | 'resistivity' | 'hvsr'

export interface MethodMeta {
  id: MethodId
  /** Accent colour from the shared design system. */
  accent: string
  /** Workspace availability (all seven methods ship workspaces). */
  available: boolean
  /** Workspace route. */
  route: string
}

export const METHODS: MethodMeta[] = [
  { id: 'gpr', accent: '#3664F4', available: true, route: '/simulator/gpr' },
  { id: 'magnetic', accent: '#60CBFF', available: true, route: '/simulator/magnetic' },
  { id: 'gravity', accent: '#E85353', available: true, route: '/simulator/gravity' },
  { id: 'reflection', accent: '#2E9FBF', available: true, route: '/simulator/reflection' },
  { id: 'refraction', accent: '#252525', available: true, route: '/simulator/refraction' },
  { id: 'resistivity', accent: '#B23A3A', available: true, route: '/simulator/resistivity' },
  { id: 'hvsr', accent: '#7A5AF8', available: true, route: '/simulator/hvsr' },
]

export const methodById = (id: MethodId): MethodMeta => {
  const m = METHODS.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown method: ${id}`)
  return m
}
