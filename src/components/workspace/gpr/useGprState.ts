import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gprScenarios, scenarioToInput, uid, type ScenarioId } from '../../../sim/gpr/model'
import { runGprForward } from '../../../sim/gpr/solver'
import type { EmLayer, GprInput, GprResult, GprSurvey, GprTarget } from '../../../sim/gpr/types'
import { validateGpr, type FieldError } from '../../../sim/gpr/validate'

export interface GprStateApi {
  input: GprInput
  result: GprResult | null
  errors: FieldError[]
  /** True when the model has changed since the last successful run. */
  dirty: boolean
  scenarioId: ScenarioId
  runError: string | null
  setSurvey: (patch: Partial<GprSurvey>) => void
  setLayer: (id: string, patch: Partial<EmLayer>) => void
  addLayer: () => void
  removeLayer: (id: string) => void
  setTarget: (id: string, patch: Partial<GprTarget>) => void
  addTarget: () => void
  removeTarget: (id: string) => void
  loadScenario: (id: ScenarioId) => void
  run: () => void
  resetModel: () => void
}

const cloneInput = (input: GprInput): GprInput => ({
  model: { layers: input.model.layers.map((l) => ({ ...l })), targets: input.model.targets.map((t) => ({ ...t })) },
  survey: { ...input.survey },
})

const scenarioInput = (id: ScenarioId): GprInput => {
  const s = gprScenarios.find((x) => x.id === id) ?? gprScenarios[0]
  return scenarioToInput(s)
}

/**
 * Single source of truth for both the full GPR workspace and the landing
 * preview sandbox. Forward-model stages stay strictly separated:
 * model state → (validated) solver run → immutable result snapshot.
 */
export function useGprState(
  initialScenario: ScenarioId = 'sandBedrock',
  options: { initialInput?: GprInput; autoRun?: boolean; storageKey?: string } = {},
): GprStateApi {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(() => {
    if (options.initialInput || !options.storageKey || typeof window === 'undefined') return initialScenario
    try {
      const stored = localStorage.getItem(options.storageKey)
      return gprScenarios.some((s) => s.id === stored) ? (stored as ScenarioId) : initialScenario
    } catch {
      return initialScenario
    }
  })
  const [input, setInput] = useState<GprInput>(() => (options.initialInput ? cloneInput(options.initialInput) : scenarioInput(scenarioId)))
  const [result, setResult] = useState<GprResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [lastRunJson, setLastRunJson] = useState<string | null>(null)

  const errors = useMemo(() => validateGpr(input), [input])
  const inputJson = useMemo(() => JSON.stringify(input), [input])
  const dirty = result !== null && lastRunJson !== inputJson

  const setSurvey = useCallback((patch: Partial<GprSurvey>) => {
    setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...patch } }))
  }, [])

  const setLayer = useCallback((id: string, patch: Partial<EmLayer>) => {
    setInput((prev) => ({
      ...prev,
      model: { ...prev.model, layers: prev.model.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) },
    }))
  }, [])

  const addLayer = useCallback(() => {
    setInput((prev) => {
      const layers = [...prev.model.layers]
      const half = layers.pop()!
      layers.push({ id: uid('layer'), thickness: 2, epsR: 12, sigma: 10 })
      layers.push(half)
      return { ...prev, model: { ...prev.model, layers } }
    })
  }, [])

  const removeLayer = useCallback((id: string) => {
    setInput((prev) => {
      if (prev.model.layers.length <= 2) return prev
      const layers = prev.model.layers.filter((l) => l.id !== id || l === prev.model.layers[prev.model.layers.length - 1])
      return { ...prev, model: { ...prev.model, layers } }
    })
  }, [])

  const setTarget = useCallback((id: string, patch: Partial<GprTarget>) => {
    setInput((prev) => ({
      ...prev,
      model: { ...prev.model, targets: prev.model.targets.map((t) => (t.id === id ? { ...t, ...patch } : t)) },
    }))
  }, [])

  const addTarget = useCallback(() => {
    setInput((prev) => ({
      ...prev,
      model: {
        ...prev.model,
        targets: [
          ...prev.model.targets,
          {
            id: uid('target'),
            kind: 'point',
            x: prev.survey.lineLength / 2,
            z: 1,
            radius: 0.3,
            epsR: 1,
            sigma: 0,
          },
        ],
      },
    }))
  }, [])

  const removeTarget = useCallback((id: string) => {
    setInput((prev) => ({ ...prev, model: { ...prev.model, targets: prev.model.targets.filter((t) => t.id !== id) } }))
  }, [])

  const loadScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id)
    if (options.storageKey) {
      try {
        localStorage.setItem(options.storageKey, id)
      } catch {
        /* storage may be unavailable */
      }
    }
    const next = scenarioInput(id)
    setInput(next)
    setLastRunJson(null)
    setResult(null)
    setRunError(null)
  }, [options.storageKey])

  const run = useCallback(() => {
    const currentErrors = validateGpr(input)
    if (currentErrors.length > 0) {
      setRunError('validation')
      return
    }
    try {
      const snapshot = cloneInput(input)
      const res = runGprForward(snapshot)
      setResult(res)
      setLastRunJson(JSON.stringify(input))
      setRunError(null)
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err))
    }
  }, [input])

  const resetModel = useCallback(() => {
    const next = scenarioInput(scenarioId)
    setInput(next)
    setLastRunJson(null)
    setResult(null)
    setRunError(null)
  }, [scenarioId])

  const runRef = useRef(run)
  useEffect(() => {
    runRef.current = run
  }, [run])
  const autoRan = useRef(false)
  useEffect(() => {
    if (!options.autoRun || autoRan.current) return
    autoRan.current = true
    runRef.current()
  }, [options.autoRun])

  return {
    input,
    result,
    errors,
    dirty,
    scenarioId,
    runError,
    setSurvey,
    setLayer,
    addLayer,
    removeLayer,
    setTarget,
    addTarget,
    removeTarget,
    loadScenario,
    run,
    resetModel,
  }
}
