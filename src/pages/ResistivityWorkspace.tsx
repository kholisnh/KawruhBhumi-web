import { useCallback, useMemo, useRef, useState } from 'react'
import { exportCsv, exportPlotPng } from '../components/charts/exporters'
import { AssumptionPanel } from '../components/ui/AssumptionPanel'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { SelectField } from '../components/ui/SelectField'
import { Toggle } from '../components/ui/Toggle'
import { StatusText, WorkspaceShell, useForwardState, usePersistedBoolean } from '../components/workspace/common'
import { ShareButton } from '../components/ui/ShareButton'
import { useSharedScenario } from '../lib/useSharedScenario'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { ComparePanel } from '../components/workspace/r2/ComparePanel'
import { PresetCards } from '../components/workspace/r2/PresetCards'
import { PresetThumbnail } from '../components/workspace/r2/PresetThumbnail'
import { SweepPanel } from '../components/workspace/r2/SweepPanel'
import { ChallengePanel } from '../components/workspace/r3/ChallengePanel'
import { useChallenge } from '../components/workspace/r3/useChallenge'
import { cleanResistivityInput, perturbResistivityInput, resistivityChallengeCurve } from '../components/workspace/r3/targets'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot, PresetDifficulty, SweepMetric, SweepParameter } from '../components/workspace/r2/types'
import { VesCurvePlot, VesLayersPanel, VesModelSvg, VesSummaryPanel, VesSurveyPanel } from '../components/workspace/resistivity/VesParts'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import {
  runVesForward,
  validateVes,
  vesScenarioToInput,
  vesScenarios,
  vesTotalDepth,
  vesUid,
  type VesInput,
  type VesLayerInput,
  type VesResult,
  type VesScenarioId,
  type VesSurvey,
} from '../sim/resistivity/model'
import type { VesArrayType } from '../sim/resistivity/types'
import { VES_LIMITS } from '../sim/resistivity/validation'

const resistivityDifficulty: Record<VesScenarioId, PresetDifficulty> = {
  'two-layer-bedrock': 'easy',
  'three-layer-clay': 'medium',
  'three-layer-aquifer': 'medium',
  'four-layer-saline': 'advanced',
  'five-layer-layered': 'advanced',
}

export function ResistivityWorkspace() {
  const { d } = useI18n()
  const shared = useSharedScenario<VesInput>('resistivity')
  const t = d.ves
  const s = useForwardState<VesInput, VesResult, VesScenarioId>({
    scenarios: vesScenarios,
    initialScenario: (shared?.scenarioId as VesScenarioId | undefined) ?? 'two-layer-bedrock',
    initialInput: shared?.input,
    autoRun: true,
    storageKey: 'kb.scenario.resistivity',
    scenarioInput: useCallback((id: VesScenarioId) => vesScenarioToInput(id), []),
    validate: validateVes,
    run: (input) => runVesForward(input),
    clone: (input) => structuredClone(input),
  })
  const [showGrid, setShowGrid] = usePersistedBoolean('kb.display.resistivity.grid', true)
  const [showUnits, setShowUnits] = usePersistedBoolean('kb.display.resistivity.units', true)
  const curveEl = useRef<HTMLDivElement | null>(null)
  const [pinned, setPinned] = useState<ComparisonSnapshot | null>(null)
  const challengeInputKey = useMemo(() => JSON.stringify(s.input), [s.input])
  const challenge = useChallenge<VesInput>({
    input: s.input,
    inputKey: challengeInputKey,
    makeTarget: perturbResistivityInput,
    computeCurve: (input) => resistivityChallengeCurve(runVesForward(cleanResistivityInput(input)), `${t.spacingAxis} (m)`, `${t.rhoAxis} (Ω·m)`),
  })

  const presetItems = useMemo(
    () =>
      vesScenarios.map((scenario) => {
        const result = runVesForward(vesScenarioToInput(scenario.id))
        const level = resistivityDifficulty[scenario.id] ?? 'medium'
        return {
          id: scenario.id,
          label: (t.scenarios as Record<string, string>)[scenario.id] ?? scenario.id,
          difficulty: d.wshared.r2.difficulty[level],
          level,
          expected: `${fmt(result.maxRhoOhmM, 0)} Ω·m max`,
          thumbnail: <PresetThumbnail method="resistivity" />,
        }
      }),
    [d, t],
  )

  const compareMetrics = useMemo<CompareMetric[]>(() => {
    if (!s.result) return []
    return [
      { id: 'top', label: t.topRho, unit: 'Ω·m', value: s.result.topResistivityOhmM },
      { id: 'bottom', label: t.bottomRho, unit: 'Ω·m', value: s.result.bottomResistivityOhmM },
      { id: 'max', label: t.apparentRange, unit: 'Ω·m', value: s.result.maxRhoOhmM },
      { id: 'depth', label: t.totalDepth, unit: 'm', value: s.result.totalDepthM },
    ]
  }, [s.result, t])

  const compareSeries = useMemo<CompareSeries[]>(
    () => (s.result ? [{ name: t.cleanCurve, x: s.result.spacingsM, y: s.result.cleanOhmM }] : []),
    [s.result, t],
  )

  const comparePlot = useMemo<ComparePlotSpec>(
    () => ({ xTitle: `${t.spacingAxis} (m)`, yTitle: `${t.rhoAxis} (Ω·m)`, xType: 'log', yType: 'log' }),
    [t],
  )

  const pinResult = () => {
    if (!s.result) return
    setPinned({
      scenarioLabel: (t.scenarios as Record<string, string>)[s.scenarioId] ?? s.scenarioId,
      metrics: compareMetrics,
      series: compareSeries,
      plot: comparePlot,
    })
  }

  const sweepParameters = useMemo<SweepParameter<VesInput>[]>(() => {
    const first = s.input.layers[0]
    if (!first) return []
    const otherDepth = vesTotalDepth(s.input.layers) - (first.thicknessM ?? 0)
    const maxThickness = Math.max(0.1, Math.min(200, 500 - otherDepth))
    return [
      {
        id: 'rho',
        label: t.topRho,
        unit: 'Ω·m',
        min: 0.1,
        max: 100000,
        get: (input) => input.layers[0]?.resistivityOhmM ?? 0,
        apply: (input, value) => ({
          ...input,
          layers: input.layers.map((layer, index) => (index === 0 ? { ...layer, resistivityOhmM: value } : layer)),
        }),
      },
      {
        id: 'thickness',
        label: t.thickness,
        unit: 'm',
        min: 0.1,
        max: maxThickness,
        get: (input) => input.layers[0]?.thicknessM ?? 0,
        apply: (input, value) => ({
          ...input,
          layers: input.layers.map((layer, index) => (index === 0 ? { ...layer, thicknessM: value } : layer)),
        }),
      },
    ]
  }, [s.input.layers, t])

  const sweepMetrics = useMemo<SweepMetric<VesResult>[]>(
    () => [
      { id: 'max', label: t.apparentRange, unit: 'Ω·m', get: (result) => result.maxRhoOhmM },
      { id: 'depth', label: t.totalDepth, unit: 'm', get: (result) => result.totalDepthM },
    ],
    [t],
  )

  const prepareSweep = useCallback((input: VesInput) => {
    const clone = structuredClone(input)
    clone.survey.noisePercent = 0
    return clone
  }, [])

  const patchSurvey = (p: Partial<VesSurvey>) => s.setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...p } }))
  const setArray = (array: VesArrayType) =>
    s.setInput((prev) => {
      const mn = prev.survey.mnHalfM
      const invalid = !(mn > 0) || mn >= prev.survey.spacingMinM || mn / prev.survey.spacingMinM > 0.5
      const fallback = Math.max(0.1, prev.survey.spacingMinM * 0.2)
      return {
        ...prev,
        array,
        survey: array === 'schlumberger' && invalid ? { ...prev.survey, mnHalfM: Number(fallback.toPrecision(3)) } : prev.survey,
      }
    })

  const patchLayer = (id: string, key: 'resistivityOhmM' | 'thicknessM', value: number) =>
    s.setInput((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => {
        if (layer.id !== id) return layer
        if (key === 'thicknessM') {
          return layer.thicknessM === null ? layer : { ...layer, thicknessM: value }
        }
        return { ...layer, resistivityOhmM: value }
      }),
    }))

  const addLayer = () =>
    s.setInput((prev) => {
      if (prev.layers.length >= VES_LIMITS.maxLayers) return prev
      const half = prev.layers[prev.layers.length - 1]
      const above = prev.layers[prev.layers.length - 2]
      const rho = Math.sqrt(Math.max(above.resistivityOhmM, 0.1) * Math.max(half.resistivityOhmM, 0.1))
      const layer: VesLayerInput = { id: vesUid('layer'), thicknessM: 5, resistivityOhmM: Number(rho.toPrecision(3)) }
      return { ...prev, layers: [...prev.layers.slice(0, -1), layer, half] }
    })

  const removeLayer = (id: string) => s.setInput((prev) => ({ ...prev, layers: prev.layers.filter((layer) => layer.id !== id) }))

  const handleExportCsv = () => {
    if (!s.result) return
    exportCsv(
      `kawruhbhumi-resistivity-${s.scenarioId}.csv`,
      ['spacing_m', 'rho_clean_ohm_m', 'rho_observed_ohm_m'],
      s.result.spacingsM.map((x, i) => [x, s.result?.cleanOhmM[i] ?? 0, s.result?.observedOhmM[i] ?? 0]),
    )
  }

  return (
    <WorkspaceShell
      methodId="resistivity"
      badge={t.badge}
      title={t.title}
      subtitle={t.subtitle}
      solverNote={t.solverNote}
      toolbar={
        <>
          <Button variant="primary" onClick={s.run}>
            {d.wshared.runSim}
          </Button>
          <Button variant="secondary" onClick={s.resetModel}>
            {d.wshared.resetModel}
          </Button>
          <ShareButton methodId="resistivity" scenarioId={s.scenarioId} input={s.input} />
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!s.result}>
            {d.wshared.exportCsv}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => curveEl.current && exportPlotPng(curveEl.current, `kawruhbhumi-resistivity-curve-${s.scenarioId}.png`)}
          >
            {d.wshared.exportPng}
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Toggle label={d.wshared.showGrid} checked={showGrid} onChange={setShowGrid} />
          <Toggle label={d.wshared.showUnits} checked={showUnits} onChange={setShowUnits} />
        </>
      }
      status={<StatusText result={s.result} dirty={s.dirty} />}
      left={
        <>
          <Panel title={t.scenario} compact>
            <SelectField
              label={t.scenario}
              value={s.scenarioId}
              onChange={(v) => s.loadScenario(v)}
              options={s.scenarioIds.map((id) => ({ value: id, label: (t.scenarios as Record<string, string>)[id] ?? id }))}
              compact
            />
            <PresetCards
              items={presetItems}
              activeId={s.scenarioId}
              onSelect={(id) => s.loadScenario(id)}
            />
          </Panel>
          <VesSurveyPanel survey={s.input.survey} array={s.input.array} errors={s.errors} errDict={t.errors} patch={patchSurvey} setArray={setArray} />
          <VesLayersPanel layers={s.input.layers} errors={s.errors} errDict={t.errors} patch={patchLayer} add={addLayer} remove={removeLayer} />
          <Panel compact>
            <p className="text-xs leading-relaxed text-gs-mist">
              {t.depthHint} {vesTotalDepth(s.input.layers).toFixed(2)} m
            </p>
          </Panel>
        </>
      }
      right={
        <>
          <Panel title={t.curveTitle}>
            {!s.result ? (
              <EmptyState title={t.curveTitle} body={d.wshared.notRun} />
            ) : (
              <VesCurvePlot
                result={s.result}
                showGrid={showGrid}
                showUnits={showUnits}
                onReady={(el) => {
                  curveEl.current = el
                }}
              />
            )}
          </Panel>
          <Panel title={t.modelTitle}>
            <VesModelSvg input={s.input} />
          </Panel>
          {s.result && <VesSummaryPanel result={s.result} input={s.input} />}
          <ComparePanel
            pinned={pinned}
            currentMetrics={compareMetrics}
            currentSeries={compareSeries}
            plot={comparePlot}
            currentScenarioLabel={(t.scenarios as Record<string, string>)[s.scenarioId] ?? s.scenarioId}
            canPin={Boolean(s.result) && !s.dirty}
            stale={s.dirty}
            onPin={pinResult}
            onClear={() => setPinned(null)}
          />
          <SweepPanel
            input={s.input}
            parameters={sweepParameters}
            metrics={sweepMetrics}
            run={(input) => runVesForward(input)}
            prepare={prepareSweep}
            disabled={s.errors.length > 0}
          />

          <ChallengePanel
            target={challenge.target}
            active={challenge.active}
            stale={challenge.stale}
            canStart={s.errors.length === 0}
            canCheck={s.errors.length === 0}
            onStart={challenge.start}
            onCheck={challenge.check}
            onReset={() => {
              s.resetModel()
              challenge.resetCheck()
            }}
          />
        </>
      }
      bottom={
        <>
          <Panel title={d.ws.pipeline}>
            <WorkspacePipeline />
          </Panel>
          <AssumptionPanel title={d.wshared.assumptionsTitle} items={t.assumptions} />
        </>
      }
    />
  )
}
