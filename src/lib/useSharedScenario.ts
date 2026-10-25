import { useMemo } from 'react'
import type { MethodId } from '../content/methods'
import { readScenarioFromLocation } from './permalink'

export function useSharedScenario<T>(methodId: MethodId): { scenarioId: string; input: T } | null {
  return useMemo(() => readScenarioFromLocation(methodId) as { scenarioId: string; input: T } | null, [methodId])
}
