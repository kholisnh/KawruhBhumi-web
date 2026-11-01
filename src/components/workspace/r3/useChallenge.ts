import { useCallback, useState } from 'react'
import { curveMisfit, scoreFromMisfit } from './metrics'
import type { ChallengeCheck, ChallengeCurve } from './types'

interface UseChallengeOptions<TInput> {
  input: TInput
  inputKey: string
  makeTarget: (input: TInput, seed: number) => TInput
  computeCurve: (input: TInput) => ChallengeCurve
}

export function useChallenge<TInput>({ input, inputKey, makeTarget, computeCurve }: UseChallengeOptions<TInput>) {
  const [target, setTarget] = useState<ChallengeCurve | null>(null)
  const [checked, setChecked] = useState<ChallengeCheck | null>(null)

  const start = useCallback(() => {
    try {
      const current = computeCurve(input)
      let best: ChallengeCurve | null = null
      let bestDistance = Number.POSITIVE_INFINITY
      for (let attempt = 0; attempt < 8; attempt++) {
        const seed = Math.floor(Math.random() * 2147483647)
        const candidate = computeCurve(makeTarget(input, seed))
        const misfit = curveMisfit(candidate, current)
        const distance = misfit < 8 ? 8 - misfit : misfit > 20 ? misfit - 20 : 0
        if (distance < bestDistance) {
          best = candidate
          bestDistance = distance
        }
        if (distance === 0) break
      }
      setTarget(best)
      setChecked(null)
    } catch {
      setTarget(null)
      setChecked(null)
    }
  }, [computeCurve, input, makeTarget])

  const check = useCallback(() => {
    if (!target) return
    try {
      const curve = computeCurve(input)
      const misfit = curveMisfit(target, curve)
      setChecked({ score: scoreFromMisfit(misfit), misfit, curve, key: inputKey })
    } catch {
      setChecked(null)
    }
  }, [computeCurve, input, inputKey, target])

  const active = checked && checked.key === inputKey ? checked : null
  const stale = Boolean(checked && !active)

  const resetCheck = useCallback(() => setChecked(null), [])

  return { target, active, stale, start, check, resetCheck }
}
