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
import { ReflGatherPanel, ReflLayersPanel, ReflModelPanel, ReflPicksPanel, ReflSummaryPanel, ReflSurveyPanel, ReflTracePanel } from '../components/workspace/reflection/ReflParts'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { ComparePanel } from '../components/workspace/r2/ComparePanel'
import { PresetCards } from '../components/workspace/r2/PresetCards'
import { PresetThumbnail } from '../components/workspace/r2/PresetThumbnail'
import { SweepPanel } from '../components/workspace/r2/SweepPanel'
import { ChallengePanel } from '../components/workspace/r3/ChallengePanel'
import { useChallenge } from '../components/workspace/r3/useChallenge'
import { cleanReflectionInput, perturbReflectionInput, reflectionChallengeCurve } from '../components/workspace/r3/targets'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot, PresetDifficulty, SweepMetric, SweepParameter } from '../components/workspace/r2/types'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { reflScenarios, reflScenarioToInput, reflUid, type ReflScenarioId } from '../sim/reflection/model'
import { runReflectionForward } from '../sim/reflection/solver'
import type { ReflInput, ReflLayer, ReflResult, ReflSurvey } from '../sim/reflection/types'
import { validateReflection } from '../sim/reflection/validate'

const reflectionDifficulty: Record<ReflScenarioId, PresetDifficulty> = {
  sandShale: 'easy',
  coalSeam: 'medium',
  thinBedTuning: 'advanced',
  gasSand: 'medium',
  hardBottom: 'easy',
}

export function ReflectionWorkspace() {
  const { d } = useI18n()
  const shared = useSharedScenario<ReflInput>('reflection')
  const t = d.refl
  const s = useForwardState<ReflInput, ReflResult, ReflScenarioId>({
    scenarios: reflScenarios,
    initialScenario: (shared?.scenarioId as ReflScenarioId | undefined) ?? 'sandShale',
    initialInput: shared?.input,
    autoRun: true,
    storageKey: 'kb.scenario.reflection',
    scenarioInput: useCallback((id: ReflScenarioId) => reflScenarioToInput(reflScenarios.find((x) => x.id === id) ?? reflScenarios[0]), []),
    validate: validateReflection,
    run: runReflectionForward,
    clone: (i) => structuredClone(i),
  })
  const [showGrid, setShowGrid] = usePersistedBoolean('kb.display.reflection.grid', true)
  const [showUnits, setShowUnits] = usePersistedBoolean('kb.display.reflection.units', true)
  const [showNmo, setShowNmo] = usePersistedBoolean('kb.display.reflection.nmo', true)
  const [wiggle, setWiggle] = usePersistedBoolean('kb.display.reflection.wiggle', true)
  const traceEl = useRef<HTMLDivElement | null>(null)
  const gatherEl = useRef<HTMLDivElement | null>(null)
  const gatherSvgEl = useRef<SVGSVGElement | null>(null)
  const [pinned, setPinned] = useState<ComparisonSnapshot | null>(null)
  const challengeInputKey = useMemo(() => JSON.stringify(s.input), [s.input])
  const challenge = useChallenge<ReflInput>({
    input: s.input,
    inputKey: challengeInputKey,
    makeTarget: perturbReflectionInput,
    computeCurve: (input) => reflectionChallengeCurve(runReflectionForward(cleanReflectionInput(input)), `${t.twt ?? 'TWT'} (ms)`, `${t.amplitude} (${d.common.au})`),
  })

  const presetItems = useMemo(
    () =>
      reflScenarios.map((scenario) => {
        const result = runReflectionForward(reflScenarioToInput(scenario))
        const level = reflectionDifficulty[scenario.id]
        return {
          id: scenario.id,
          label: t.scenarios[scenario.id],
          difficulty: d.wshared.r2.difficulty[level],
          level,
          expected: `${fmt(result.diagnostics.verticalResolutionM, 1)} m λ/4`,
          thumbnail: <PresetThumbnail method="reflection" />,
        }
      }),
    [d, t],
  )

  const compareMetrics = useMemo<CompareMetric[]>(() => {
    if (!s.result) return []
    return [
      { id: 'amp', label: d.wshared.r2.maxAbs, unit: d.common.au, value: s.result.diagnostics.maxAbsAmplitude },
      { id: 'resolution', label: t.resolution, unit: 'm', value: s.result.diagnostics.verticalResolutionM },
      { id: 'vavg', label: t.vAvg, unit: 'm/s', value: s.result.diagnostics.vAvg, format: (value) => String(Math.round(value)) },
      { id: 'samples', label: t.samples, value: s.result.diagnostics.samples, format: (value) => String(Math.round(value)) },
    ]
  }, [d, s.result, t])

  const compareSeries = useMemo<CompareSeries[]>(
    () => (s.result ? [{ name: t.traceTitle, x: s.result.tMs, y: s.result.trace }] : []),
    [s.result, t],
  )

  const comparePlot = useMemo<ComparePlotSpec>(
    () => ({ xTitle: `${t.twt ?? 'TWT'} (ms)`, yTitle: `${t.amplitude} (${d.common.au})` }),
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

  const sweepParameters = useMemo<SweepParameter<ReflInput>[]>(() => {
    const first = s.input.layers[0]
    if (!first) return []
    return [
      {
        id: 'frequency',
        label: t.freq,
        unit: 'Hz',
        min: 5,
        max: 200,
        get: (input) => input.survey.waveletFreqHz,
        apply: (input, value) => ({ ...input, survey: { ...input.survey, waveletFreqHz: value } }),
      },
      {
        id: 'thickness',
        label: t.thickness,
        unit: 'm',
        min: 0.1,
        max: 500,
        get: (input) => input.layers[0]?.thickness ?? 0,
        apply: (input, value) => ({
          ...input,
          layers: input.layers.map((layer, index) => (index === 0 ? { ...layer, thickness: value } : layer)),
        }),
      },
    ]
  }, [s.input.layers, t])

  const sweepMetrics = useMemo<SweepMetric<ReflResult>[]>(
    () => [
      { id: 'amp', label: d.wshared.r2.maxAbs, unit: d.common.au, get: (result) => result.diagnostics.maxAbsAmplitude },
      { id: 'resolution', label: t.resolution, unit: 'm', get: (result) => result.diagnostics.verticalResolutionM },
    ],
    [d, t],
  )

  const prepareSweep = useCallback((input: ReflInput) => {
    const clone = structuredClone(input)
    clone.survey.noisePercent = 0
    return clone
  }, [])

  const patchSurvey = (p: Partial<ReflSurvey>) => s.setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...p } }))
  const patchLayer = (id: string, key: string, value: number) =>
    s.setInput((prev) => ({ ...prev, layers: prev.layers.map((l) => (l.id === id ? ({ ...l, [key]: value } as ReflLayer) : l)) }))
  const addLayer = () =>
    s.setInput((prev) => {
      const half = prev.layers[prev.layers.length - 1]
      const mid: ReflLayer = { id: reflUid('layer'), vp: 2500, rho: 2300, thickness: 50 }
      return { ...prev, layers: [...prev.layers.slice(0, -1), mid, half] }
    })
  const removeLayer = (id: string) => s.setInput((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== id) }))

  const handleExportTraceCsv = () => {
    if (!s.result) return
    exportCsv(
      `kawruhbhumi-reflection-${s.scenarioId}-trace.csv`,
      ['twt_ms', 'amplitude'],
      s.result.tMs.map((timeMs, i) => [timeMs, s.result!.trace[i]]),
    )
  }
  const handleExportPicksCsv = () => {
    if (!s.result) return
    exportCsv(
      `kawruhbhumi-reflection-${s.scenarioId}-picks.csv`,
      ['interface', 'depth_m', 'twt_ms', 'z_above', 'z_below', 'R', 'transmission', 'amplitude', 'vrms_mps'],
      s.result.picks.map((p) => [p.index, p.depthM, p.twtMs, p.zAbove, p.zBelow, p.reflectionCoef, p.transmission, p.amplitude, p.vrms]),
    )
  }

  return (
    <WorkspaceShell
      methodId="reflection"
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
          <ShareButton methodId="reflection" scenarioId={s.scenarioId} input={s.input} />
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="secondary" size="sm" onClick={handleExportTraceCsv} disabled={!s.result}>
            {d.wshared.exportCsv} — {t.traceTitle}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => {
              const name = `kawruhbhumi-reflection-gather-${s.scenarioId}.png`
              if (wiggle && gatherSvgEl.current) exportSvgPng(gatherSvgEl.current, name)
              else if (gatherEl.current) exportPlotPng(gatherEl.current, name)
            }}
          >
            {d.wshared.exportPng}
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Toggle label={d.wshared.showGrid} checked={showGrid} onChange={setShowGrid} />
          <Toggle label={d.wshared.showUnits} checked={showUnits} onChange={setShowUnits} />
          <Toggle label={t.showNmo} checked={showNmo} onChange={setShowNmo} />
          <Toggle label={t.wiggle} checked={wiggle} onChange={setWiggle} />
        </>
      }
      status={<StatusText result={s.result} dirty={s.dirty} />}
      left={
        <>
          <Panel title={t.scenario} compact>
            <SelectField
              label={t.scenario}
              value={s.scenarioId}
              onChange={(v) => s.loadScenario(v as ReflScenarioId)}
              options={s.scenarioIds.map((id) => ({ value: id, label: t.scenarios[id] }))}
              compact
            />
            <PresetCards items={presetItems} activeId={s.scenarioId} onSelect={(id) => s.loadScenario(id as ReflScenarioId)} />
          </Panel>
          <ReflSurveyPanel survey={s.input.survey} errors={s.errors} errDict={t.errors} patch={patchSurvey} />
          <ReflLayersPanel layers={s.input.layers} errors={s.errors} errDict={t.errors} patch={patchLayer} add={addLayer} remove={removeLayer} />
        </>
      }
      right={
        <>
          <Panel
            title={t.traceTitle}
            actions={
              <Button
                variant="ghost"
                size="sm"
                disabled={!s.result}
                onClick={() => traceEl.current && exportPlotPng(traceEl.current, `kawruhbhumi-reflection-trace-${s.scenarioId}.png`)}
              >
                {d.wshared.exportPng}
              </Button>
            }
          >
            {!s.result ? (
              <EmptyState title={t.traceTitle} body={d.wshared.notRun} />
            ) : (
              <ReflTracePanel
                result={s.result}
                showGrid={showGrid}
                showUnits={showUnits}
                onReady={(el) => {
                  traceEl.current = el
                }}
              />
            )}
          </Panel>
          <Panel title={t.gatherTitle}>
            {!s.result ? (
              <EmptyState title={t.gatherTitle} body={d.wshared.notRun} />
            ) : (
              <ReflGatherPanel
                result={s.result}
                wiggle={wiggle}
                showGrid={showGrid}
                showUnits={showUnits}
                showNmo={showNmo}
                onReady={(el) => {
                  gatherEl.current = el
                }}
                onSvg={(svg) => {
                  gatherSvgEl.current = svg
                }}
              />
            )}
          </Panel>
          <ReflModelPanel input={s.input} />
          {s.result ? (
            <ReflPicksPanel result={s.result} onExportCsv={handleExportPicksCsv} />
          ) : (
            <Panel title={t.picksTitle}>
              <EmptyState title={t.picksTitle} body={d.wshared.notRun} />
            </Panel>
          )}
          {s.result && (
            <Panel
              title={t.diagTitle}
              actions={
                <span className="gs-number text-xs text-gs-mist">
                  max |amp| {fmt(s.result.diagnostics.maxAbsAmplitude, 3)} {t.relAmp}
                </span>
              }
            >
              <ReflSummaryPanel result={s.result} errDict={{ ...t.warnings, ...t.errors }} showUnits={showUnits} />
            </Panel>
          )}
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
            run={runReflectionForward}
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
