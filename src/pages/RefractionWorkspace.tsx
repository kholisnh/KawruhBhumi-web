import { useCallback, useMemo, useRef, useState } from 'react'
import { exportCsv, exportPlotPng, exportSvgPng } from '../components/charts/exporters'
import { AssumptionPanel } from '../components/ui/AssumptionPanel'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { SelectField } from '../components/ui/SelectField'
import { Toggle } from '../components/ui/Toggle'
import { StatusText, WorkspaceShell, useForwardState, usePersistedBoolean } from '../components/workspace/common'
import { ShareButton } from '../components/ui/ShareButton'
import { useSharedScenario } from '../lib/useSharedScenario'
import { RefrLayersPanel, RefrModelPanel, RefrSeismogramPanel, RefrSummaryPanel, RefrSurveyPanel, RefrTravelTimePlot } from '../components/workspace/refraction/RefrParts'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { ComparePanel } from '../components/workspace/r2/ComparePanel'
import { PresetCards } from '../components/workspace/r2/PresetCards'
import { PresetThumbnail } from '../components/workspace/r2/PresetThumbnail'
import { SweepPanel } from '../components/workspace/r2/SweepPanel'
import { ChallengePanel } from '../components/workspace/r3/ChallengePanel'
import { useChallenge } from '../components/workspace/r3/useChallenge'
import { cleanRefractionInput, perturbRefractionInput, refractionChallengeCurve } from '../components/workspace/r3/targets'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot, PresetDifficulty, SweepMetric, SweepParameter } from '../components/workspace/r2/types'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { refrScenarios, refrScenarioToInput, refrUid, type RefrScenarioId } from '../sim/refraction/model'
import { runRefractionForward } from '../sim/refraction/solver'
import type { RefrInput, RefrLayer, RefrResult, RefrSurvey } from '../sim/refraction/types'
import { validateRefraction } from '../sim/refraction/validate'

const refractionDifficulty: Record<RefrScenarioId, PresetDifficulty> = {
  soilBedrock: 'easy',
  threeLayer: 'medium',
  weathered: 'medium',
  velocityInversion: 'advanced',
  deepBedrock: 'advanced',
}

export function RefractionWorkspace() {
  const { d } = useI18n()
  const shared = useSharedScenario<RefrInput>('refraction')
  const t = d.refr
  const s = useForwardState<RefrInput, RefrResult, RefrScenarioId>({
    scenarios: refrScenarios,
    initialScenario: (shared?.scenarioId as RefrScenarioId | undefined) ?? 'soilBedrock',
    initialInput: shared?.input,
    autoRun: true,
    storageKey: 'kb.scenario.refraction',
    scenarioInput: useCallback((id: RefrScenarioId) => refrScenarioToInput(refrScenarios.find((x) => x.id === id) ?? refrScenarios[0]), []),
    validate: validateRefraction,
    run: runRefractionForward,
    clone: (i) => structuredClone(i),
  })
  const [showGrid, setShowGrid] = usePersistedBoolean('kb.display.refraction.grid', true)
  const [showUnits, setShowUnits] = usePersistedBoolean('kb.display.refraction.units', true)
  const [showRays, setShowRays] = usePersistedBoolean('kb.display.refraction.rays', true)
  const [wiggle, setWiggle] = usePersistedBoolean('kb.display.refraction.wiggle', true)
  const [balance, setBalance] = usePersistedBoolean('kb.display.refraction.balance', true)
  const [showPicks, setShowPicks] = usePersistedBoolean('kb.display.refraction.picks', false)
  const travelEl = useRef<HTMLDivElement | null>(null)
  const recordEl = useRef<HTMLDivElement | null>(null)
  const recordSvgEl = useRef<SVGSVGElement | null>(null)
  const [pinned, setPinned] = useState<ComparisonSnapshot | null>(null)
  const challengeInputKey = useMemo(() => JSON.stringify(s.input), [s.input])
  const challenge = useChallenge<RefrInput>({
    input: s.input,
    inputKey: challengeInputKey,
    makeTarget: perturbRefractionInput,
    computeCurve: (input) => refractionChallengeCurve(runRefractionForward(cleanRefractionInput(input)), `${d.wshared.distance} (m)`, `${t.travelTitle} (ms)`),
  })

  const presetItems = useMemo(
    () =>
      refrScenarios.map((scenario) => {
        const result = runRefractionForward(refrScenarioToInput(scenario))
        const level = refractionDifficulty[scenario.id]
        const depth = result.diagnostics.firstRefractorDepthM
        return {
          id: scenario.id,
          label: t.scenarios[scenario.id],
          difficulty: d.wshared.r2.difficulty[level],
          level,
          expected: depth === null ? '—' : `${fmt(depth, 1)} m`,
          thumbnail: <PresetThumbnail method="refraction" />,
        }
      }),
    [d, t],
  )

  const compareMetrics = useMemo<CompareMetric[]>(() => {
    if (!s.result) return []
    return [
      { id: 'arrival', label: d.wshared.r2.maxArrival, unit: 'ms', value: s.result.diagnostics.maxFirstArrivalMs },
      {
        id: 'depth',
        label: t.depthEstimate,
        unit: 'm',
        value: s.result.diagnostics.firstRefractorDepthM ?? Number.NaN,
      },
      { id: 'vdirect', label: t.vDirect, unit: 'm/s', value: s.result.diagnostics.vDirectMps, format: (value) => String(Math.round(value)) },
      { id: 'nref', label: t.nRefracted, value: s.result.diagnostics.nRefractedFirstArrivals, format: (value) => String(Math.round(value)) },
    ]
  }, [d, s.result, t])

  const compareSeries = useMemo<CompareSeries[]>(
    () => (s.result ? [{ name: t.firstArrivalsClean, x: s.result.x, y: s.result.firstArrivalCleanMs }] : []),
    [s.result, t],
  )

  const comparePlot = useMemo<ComparePlotSpec>(
    () => ({ xTitle: `${d.wshared.distance} (m)`, yTitle: `${t.travelTitle} (ms)` }),
    [d, t],
  )

  const pinResult = () => {
    if (!s.result) return
    setPinned({
      scenarioLabel: t.scenarios[s.scenarioId],
      metrics: compareMetrics,
      series: compareSeries,
      plot: comparePlot,
    })
  }

  const sweepParameters = useMemo<SweepParameter<RefrInput>[]>(() => {
    const first = s.input.layers[0]
    if (!first) return []
    const maxSpread = Math.min(2000, Math.max(5, 3999 * s.input.survey.geophoneSpacing))
    return [
      {
        id: 'thickness',
        label: t.thickness,
        unit: 'm',
        min: 0.1,
        max: 200,
        get: (input) => input.layers[0]?.thickness ?? 0,
        apply: (input, value) => ({
          ...input,
          layers: input.layers.map((layer, index) => (index === 0 ? { ...layer, thickness: value } : layer)),
        }),
      },
      {
        id: 'spread',
        label: t.spread,
        unit: 'm',
        min: 5,
        max: maxSpread,
        get: (input) => input.survey.spreadLength,
        apply: (input, value) => ({ ...input, survey: { ...input.survey, spreadLength: value } }),
      },
    ]
  }, [s.input.layers, s.input.survey.geophoneSpacing, t])

  const sweepMetrics = useMemo<SweepMetric<RefrResult>[]>(
    () => [
      { id: 'depth', label: t.depthEstimate, unit: 'm', get: (result) => result.diagnostics.firstRefractorDepthM ?? Number.NaN },
      { id: 'arrival', label: d.wshared.r2.maxArrival, unit: 'ms', get: (result) => result.diagnostics.maxFirstArrivalMs },
    ],
    [d, t],
  )

  const prepareSweep = useCallback((input: RefrInput) => {
    const clone = structuredClone(input)
    clone.survey.noiseMs = 0
    clone.survey.traceNoisePercent = 0
    return clone
  }, [])

  const patchSurvey = (p: Partial<RefrSurvey>) => s.setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...p } }))
  const patchLayer = (id: string, key: string, value: number) =>
    s.setInput((prev) => ({ ...prev, layers: prev.layers.map((l) => (l.id === id ? ({ ...l, [key]: value } as RefrLayer) : l)) }))
  const addLayer = () =>
    s.setInput((prev) => {
      const half = prev.layers[prev.layers.length - 1]
      const mid: RefrLayer = { id: refrUid('layer'), vp: 2200, thickness: 20 }
      return { ...prev, layers: [...prev.layers.slice(0, -1), mid, half] }
    })
  const removeLayer = (id: string) => s.setInput((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== id) }))

  const handleExportCsv = () => {
    if (!s.result) return
    const r = s.result
    exportCsv(
      `kawruhbhumi-refraction-${s.scenarioId}.csv`,
      ['x_m', 'first_arrival_ms', 'branch_index', 'clean_ms'],
      r.x.map((x, i) => [x, r.firstArrivalMs[i], r.firstArrivalBranch[i], r.firstArrivalCleanMs[i]]),
    )
  }

  const handleExportRecordCsv = () => {
    if (!s.result) return
    const r = s.result
    const s0 = r.seismogram
    const rStride = Math.max(1, Math.ceil(r.x.length / 300))
    const tStride = Math.max(1, Math.ceil(s0.tMs.length / 400))
    const rows: Array<Array<string | number>> = []
    for (let i = 0; i < r.x.length; i += rStride) {
      for (let j = 0; j < s0.tMs.length; j += tStride) {
        rows.push([r.x[i], Number(s0.tMs[j].toFixed(4)), s0.traces[i][j]])
      }
    }
    exportCsv(`kawruhbhumi-refraction-${s.scenarioId}-record.csv`, ['offset_m', 't_ms', 'amplitude'], rows)
  }

  return (
    <WorkspaceShell
      methodId="refraction"
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
          <ShareButton methodId="refraction" scenarioId={s.scenarioId} input={s.input} />
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!s.result}>
            {d.wshared.exportCsv}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => travelEl.current && exportPlotPng(travelEl.current, `kawruhbhumi-refraction-traveltime-${s.scenarioId}.png`)}
          >
            {d.wshared.exportPng}
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Toggle label={d.wshared.showGrid} checked={showGrid} onChange={setShowGrid} />
          <Toggle label={d.wshared.showUnits} checked={showUnits} onChange={setShowUnits} />
          <Toggle label={t.showRays} checked={showRays} onChange={setShowRays} />
          <Toggle label={t.wiggle} checked={wiggle} onChange={setWiggle} />
          <Toggle label={t.agc} checked={balance} onChange={setBalance} />
          <Toggle label={t.firstBreaks} checked={showPicks} onChange={setShowPicks} />
        </>
      }
      status={<StatusText result={s.result} dirty={s.dirty} />}
      left={
        <>
          <Panel title={t.scenario} compact>
            <SelectField
              label={t.scenario}
              value={s.scenarioId}
              onChange={(v) => s.loadScenario(v as RefrScenarioId)}
              options={s.scenarioIds.map((id) => ({ value: id, label: t.scenarios[id] }))}
              compact
            />
            <PresetCards items={presetItems} activeId={s.scenarioId} onSelect={(id) => s.loadScenario(id as RefrScenarioId)} />
          </Panel>
          <RefrSurveyPanel survey={s.input.survey} errors={s.errors} errDict={t.errors} patch={patchSurvey} />
          <RefrLayersPanel layers={s.input.layers} errors={s.errors} errDict={t.errors} patch={patchLayer} add={addLayer} remove={removeLayer} />
        </>
      }
      right={
        <>
          <Panel title={t.travelTitle}>
            {!s.result ? (
              <EmptyState title={t.travelTitle} body={d.wshared.notRun} />
            ) : (
              <RefrTravelTimePlot
                result={s.result}
                showGrid={showGrid}
                showUnits={showUnits}
                onReady={(el) => {
                  travelEl.current = el
                }}
              />
            )}
          </Panel>
          <Panel
            title={t.seismogramTitle}
            actions={
              s.result ? (
                <span className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={handleExportRecordCsv}>
                    {d.wshared.exportCsv}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const name = `kawruhbhumi-refraction-record-${s.scenarioId}.png`
                      if (wiggle && recordSvgEl.current) exportSvgPng(recordSvgEl.current, name)
                      else if (recordEl.current) exportPlotPng(recordEl.current, name)
                    }}
                  >
                    {d.wshared.exportPng}
                  </Button>
                </span>
              ) : undefined
            }
          >
            {!s.result ? (
              <EmptyState title={t.seismogramTitle} body={d.wshared.notRun} />
            ) : (
              <RefrSeismogramPanel
                result={s.result}
                wiggle={wiggle}
                balance={balance}
                showGrid={showGrid}
                showUnits={showUnits}
                showPicks={showPicks}
                onReady={(el) => {
                  recordEl.current = el
                }}
                onSvg={(svg) => {
                  recordSvgEl.current = svg
                }}
              />
            )}
          </Panel>
          <RefrModelPanel input={s.input} result={s.result} showRays={showRays} />
          {s.result && <RefrSummaryPanel result={s.result} input={s.input} errDict={{ ...t.warnings, ...t.errors }} />}
          <ComparePanel
            pinned={pinned}
            currentMetrics={compareMetrics}
            currentSeries={compareSeries}
            plot={comparePlot}
            currentScenarioLabel={t.scenarios[s.scenarioId]}
            canPin={Boolean(s.result) && !s.dirty}
            stale={s.dirty}
            onPin={pinResult}
            onClear={() => setPinned(null)}
          />
          <SweepPanel
            input={s.input}
            parameters={sweepParameters}
            metrics={sweepMetrics}
            run={runRefractionForward}
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
