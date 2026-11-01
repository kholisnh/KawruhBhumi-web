import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { MethodId } from '../content/methods'
import { readScenarioFromLocation } from './permalink'
import { scenarioInputByMethod } from '../content/scenarioIds'

export function useSharedScenario<T>(methodId: MethodId): { scenarioId: string; input?: T } | null {
  const location = useLocation()
  const hash = typeof window === 'undefined' ? `${location.pathname}${location.search}${location.hash}` : window.location.hash
  return useMemo(() => {
    const parsed = readScenarioFromLocation(methodId, hash)
    if (!parsed) return null
    return {
      scenarioId: parsed.scenarioId,
      input: (parsed.input ?? scenarioInputByMethod[methodId](parsed.scenarioId)) as T,
    }
  }, [methodId, hash])
}
