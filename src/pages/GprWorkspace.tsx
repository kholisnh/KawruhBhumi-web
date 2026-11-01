import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { exportPlotPng, exportRadargramCsv } from '../components/charts/exporters'
import { GeoCrossSection } from '../components/geo/GeoCrossSection'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { modelDisplayDepth, runGprForward, surveySummaryRows } from '../sim/gpr/solver'
import { AssumptionPanel } from '../components/ui/AssumptionPanel'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Toggle } from '../components/ui/Toggle'
import {
  ErrorList,
  LayerEditor,
  PicksPanel,
  ScenarioSelect,
  SummaryPanel,
  SurveyPanelFields,
  TargetEditor,
  WarningsPanel,
  WorkspacePipeline,
  useErrorFor,
} from '../components/workspace/gpr/GprPanels'
import { AScanPlot, RadargramPlot } from '../components/workspace/gpr/plots'
import { useGprState } from '../components/workspace/gpr/useGprState'
import { MethodSwitcher } from '../components/workspace/MethodSwitcher'
import { ComparePanel } from '../components/workspace/r2/ComparePanel'
import { PresetCards } from '../components/workspace/r2/PresetCards'
import { PresetThumbnail } from '../components/workspace/r2/PresetThumbnail'
import { SweepPanel } from '../components/workspace/r2/SweepPanel'
import { ChallengePanel } from '../components/workspace/r3/ChallengePanel'
import { useChallenge } from '../components/workspace/r3/useChallenge'
import { cleanGprInput, gprChallengeCurve, perturbGprInput } from '../components/workspace/r3/targets'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot, PresetDifficulty, SweepMetric, SweepParameter } from '../components/workspace/r2/types'
import { ReportPanel } from '../components/workspace/ReportPanel'
import { GuidedExperiments } from '../components/workspace/GuidedExperiments'
import { ReadResultCard } from '../components/workspace/ReadResultCard'
import { MobileControlsButton, WorkspaceControls, usePersistedBoolean } from '../components/workspace/common'
import { ShareButton } from '../components/ui/ShareButton'
import { useSharedScenario } from '../lib/useSharedScenario'
import type { GprInput, GprResult } from '../sim/gpr/types'
import { gprScenarios, scenarioToInput, type ScenarioId } from '../sim/gpr/model'

const gprDifficulty: Record<ScenarioId, PresetDifficulty> = {
  sandBedrock: 'easy',
  buriedPipe: 'easy',
  concreteRebar: 'advanced',
  voidAsphalt: 'medium',
  wetClay: 'advanced',
}

function traceIndexAt(result: GprResult, x: number): number {
  const spacing = result.x.length > 1 ? result.x[1] - result.x[0] : 1
  return Math.min(Math.max(Math.round((x - result.x[0]) / spacing), 0), result.x.length - 1)
}

export function GprWorkspace() {
  const { d } = useI18n()
  const shared = useSharedScenario<GprInput>('gpr')
  const s = useGprState((shared?.scenarioId as ScenarioId | undefined) ?? 'sandBedrock', { initialInput: shared?.input, autoRun: true, storageKey: 'kb.scenario.gpr' })
  const errorFor = useErrorFor(s.errors)
  const [showGrid, setShowGrid] = usePersistedBoolean('kb.display.gpr.grid', true)
  const [showUnits, setShowUnits] = usePersistedBoolean('kb.display.gpr.units', true)
  const [selectedX, setSelectedX] = useState(2)
  const [pinned, setPinned] = useState<ComparisonSnapshot | null>(null)
  const [controlsOpen, setControlsOpen] = useState(false)
  const challengeInputKey = useMemo(() => JSON.stringify(s.input), [s.input])
  const challenge = useChallenge<GprInput>({
    input: s.input,
    inputKey: challengeInputKey,
    makeTarget: perturbGprInput,
    computeCurve: (input) => gprChallengeCurve(runGprForward(cleanGprInput(input)), `${d.ws.time} (ns)`, d.common.au),
  })
  const closeControls = useCallback(() => setControlsOpen(false), [])

  const radarEl = useRef<HTMLDivElement | null>(null)
  const aScanEl = useRef<HTMLDivElement | null>(null)

  const traceIndex = useMemo(() => (s.result ? traceIndexAt(s.result, selectedX) : 0), [s.result, selectedX])

  const presetItems = useMemo(
    () =>
      gprScenarios.map((scenario) => {
        const result = runGprForward(scenarioToInput(scenario))
        const level = gprDifficulty[scenario.id]
        return {
          id: scenario.id,
          label: d.ws.scenarios[scenario.id],
          difficulty: d.wshared.r2.difficulty[level],
          level,
          expected: `${fmt(result.diagnostics.verticalResolutionM, 2)} m λ/4`,
          thumbnail: <PresetThumbnail method="gpr" />,
        }
      }),
    [d],
  )

  const compareMetrics = useMemo<CompareMetric[]>(() => {
    if (!s.result) return []
    return [
      { id: 'traces', label: d.ws.nTraces, value: s.result.diagnostics.nTraces, format: (value) => String(Math.round(value)) },
      { id: 'resolution', label: d.ws.resolution, unit: 'm', value: s.result.diagnostics.verticalResolutionM },
      { id: 'amp', label: d.wshared.r2.maxAbs, unit: d.common.au, value: s.result.diagnostics.maxAbsAmplitude },
      { id: 'window', label: d.ws.maxTWT, unit: 'ns', value: s.result.diagnostics.timeWindowNs },
    ]
  }, [d, s.result])

  const compareSeries = useMemo<CompareSeries[]>(() => {
    if (!s.result) return []
    const index = traceIndexAt(s.result, selectedX)
    return [{ name: `A-scan x = ${fmt(s.result.x[index], 2)} m`, x: s.result.tNs, y: s.result.radargram[index] }]
  }, [s.result, selectedX])

  const comparePlot = useMemo<ComparePlotSpec>(
    () => ({ xTitle: `${d.ws.time} (ns)`, yTitle: d.common.au }),
    [d],
  )

  const pinResult = () => {
    if (!s.result) return
    setPinned({
      scenarioLabel: d.ws.scenarios[s.scenarioId],
      metrics: compareMetrics,
      series: compareSeries,
      plot: comparePlot,
    })
  }

  const sweepParameters = useMemo<SweepParameter<GprInput>[]>(() => {
    const first = s.input.model.layers[0]
    if (!first) return []
    return [
      {
        id: 'frequency',
        label: d.ws.frequency,
        unit: 'MHz',
        min: 10,
        max: 3000,
        get: (input) => input.survey.frequencyMHz,
        apply: (input, value) => ({ ...input, survey: { ...input.survey, frequencyMHz: value } }),
      },
      {
        id: 'epsr',
        label: d.ws.epsR,
        unit: 'εr',
        min: 1,
        max: 100,
        get: (input) => input.model.layers[0]?.epsR ?? 1,
        apply: (input, value) => ({
          ...input,
          model: {
            ...input.model,
            layers: input.model.layers.map((layer, index) => (index === 0 ? { ...layer, epsR: value } : layer)),
          },
        }),
      },
    ]
  }, [d, s.input.model.layers])

  const sweepMetrics = useMemo<SweepMetric<GprResult>[]>(
    () => [
      { id: 'resolution', label: d.ws.resolution, unit: 'm', get: (result) => result.diagnostics.verticalResolutionM },
      { id: 'amp', label: d.wshared.r2.maxAbs, unit: d.common.au, get: (result) => result.diagnostics.maxAbsAmplitude },
    ],
    [d],
  )

  const prepareSweep = useCallback((input: GprInput) => {
    const clone = structuredClone(input)
    clone.survey.noisePercent = 0
    return clone
  }, [])

  const handleExportCsv = () => {
    if (!s.result) return
    const meta: Array<[string, string]> = [
      ['scenario', d.ws.scenarios[s.scenarioId]],
      ['frequency_MHz', String(s.result.survey.frequencyMHz)],
      ['trace_spacing_m', String(s.result.survey.traceSpacing)],
      ['line_length_m', String(s.result.survey.lineLength)],
      ['time_window_ns', fmt(s.result.diagnostics.timeWindowNs, 4)],
      ['noise_percent', String(s.result.survey.noisePercent)],
      ['seed', String(s.result.survey.seed)],
      ...surveySummaryRows(s.result.survey),
    ]
    exportRadargramCsv(`kawruhbhumi-gpr-${s.scenarioId}.csv`, meta, s.result.x, s.result.tNs, s.result.radargram)
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <nav className="mb-4 flex items-center gap-2 text-xs text-gs-mist" aria-label="Breadcrumb">
        <Link to="/simulator" className="inline-flex min-h-11 items-center transition-colors hover:text-gs-cyan">
          {d.ws.breadcrumb}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gs-ice">{d.methods.list.gpr.abbr}</span>
      </nav>

      <MethodSwitcher active="gpr" />

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gs-ice">{d.ws.title}</h1>
          <Badge soft color="#E85353">
            APPROXIMATE
          </Badge>
        </div>
        <p className="mt-1.5 max-w-4xl text-sm leading-relaxed text-gs-mist">{d.ws.subtitle}</p>
        <p className="mt-2 max-w-4xl text-xs leading-relaxed text-gs-mist">{d.ws.solverNote}</p>
      </header>

      <div className="no-print sticky top-16 z-30 mb-5 rounded-2xl bg-gs-navy/90 p-1 backdrop-blur lg:static lg:bg-transparent lg:p-0">
      <Panel compact>
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold tracking-wide text-gs-mist uppercase">
          <span className="rounded-full bg-gs-cyan/10 px-2 py-0.5 text-gs-cyan">1 · {d.wshared.stepModel}</span>
          <span aria-hidden>→</span>
          <span className="rounded-full bg-gs-deep px-2 py-0.5">2 · {d.wshared.stepRun}</span>
          <span aria-hidden>→</span>
          <span className="rounded-full bg-gs-deep px-2 py-0.5">3 · {d.wshared.stepRead}</span>
        </div>
        <div className="flex min-w-0 flex-nowrap items-center gap-2.5 overflow-x-auto pb-1 xl:flex-wrap xl:overflow-visible xl:pb-0">
          <MobileControlsButton onClick={() => setControlsOpen(true)} />
          <Button variant="primary" onClick={s.run}>
            {d.ws.runSim}
          </Button>
          <Button variant="secondary" onClick={s.resetModel}>
            {d.ws.resetModel}
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!s.result}>
            {d.ws.exportCsv}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => radarEl.current && exportPlotPng(radarEl.current, `kawruhbhumi-gpr-radargram-${s.scenarioId}.png`)}
          >
            {d.ws.exportPng} — {d.ws.radargram.toLowerCase()}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => aScanEl.current && exportPlotPng(aScanEl.current, `kawruhbhumi-gpr-ascan.png`)}
          >
            {d.ws.exportPng} — A-scan
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <ShareButton methodId="gpr" scenarioId={s.scenarioId} input={s.input} />
          <Toggle label={d.ws.showGrid} checked={showGrid} onChange={setShowGrid} />
          <Toggle label={d.ws.showUnits} checked={showUnits} onChange={setShowUnits} />
          <span className="ml-auto shrink-0 text-xs">
            {s.result && !s.dirty && <span className="text-gs-teal">{d.ws.current}</span>}
            {s.result && s.dirty && <span className="text-gs-amber">{d.ws.stale}</span>}
          </span>
        </div>
        {s.runError && s.runError !== 'validation' && (
          <p className="mt-2 rounded-lg border border-gs-danger/40 bg-gs-danger/8 px-3 py-2 text-xs text-gs-danger">
            {s.runError}
          </p>
        )}
      </Panel>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <WorkspaceControls open={controlsOpen} onClose={closeControls} title={d.wshared.modelControls}>
          <Panel title={d.ws.scenario} compact>
            <ScenarioSelect value={s.scenarioId} onChange={s.loadScenario} />
            <PresetCards items={presetItems} activeId={s.scenarioId} onSelect={(id) => s.loadScenario(id as ScenarioId)} />
          </Panel>
          <Panel title={d.ws.survey} compact>
            <SurveyPanelFields survey={s.input.survey} onPatch={s.setSurvey} errorFor={errorFor} />
          </Panel>
          <Panel title={d.ws.layers} compact>
            <LayerEditor
              layers={s.input.model.layers}
              onChange={s.setLayer}
              onAdd={s.addLayer}
              onRemove={s.removeLayer}
              errorFor={errorFor}
            />
          </Panel>
          <Panel title={d.ws.targets} compact>
            <TargetEditor
              targets={s.input.model.targets}
              onChange={s.setTarget}
              onAdd={s.addTarget}
              onRemove={s.removeTarget}
              errorFor={errorFor}
            />
          </Panel>
          <ErrorList errors={s.errors} />
        </WorkspaceControls>

        <div className="min-w-0 space-y-5">
          <Panel title={d.ws.crossSection}>
            <GeoCrossSection
              layers={s.input.model.layers}
              targets={s.input.model.targets}
              lineLength={s.input.survey.lineLength}
              displayDepth={s.result?.diagnostics.displayDepthM ?? modelDisplayDepth(s.input.model)}
              showGrid={showGrid}
              showUnits={showUnits}
              labels={{
                surface: d.ws.surface,
                transmitter: d.ws.transmitter,
                depth: d.ws.depth,
                distance: d.ws.distance,
              }}
            />
          </Panel>

          <Panel
            title={d.ws.radargram}
            actions={
              <span className="gs-number text-xs text-gs-mist">
                {d.ws.trace} x = {fmt(selectedX, 3)} m
              </span>
            }
          >
            {!s.result ? (
              <EmptyState title={d.ws.radargram} body={d.ws.notRun} />
            ) : (
              <>
                {s.dirty && (
                  <p className="mb-3 rounded-lg border border-gs-amber/40 bg-gs-amber/8 px-3 py-2 text-xs text-gs-amber">
                    {d.ws.stale}
                  </p>
                )}
                <RadargramPlot
                  result={s.result}
                  showGrid={showGrid}
                  showUnits={showUnits}
                  height={400}
                  onSelectTrace={(x) => setSelectedX(x)}
                  onReady={(el) => {
                    radarEl.current = el
                  }}
                />
              </>
            )}
          </Panel>

          {s.result && (
            <Panel
              title={d.ws.aScan}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aScanEl.current && exportPlotPng(aScanEl.current, 'kawruhbhumi-gpr-ascan.png')}
                >
                  {d.ws.exportPng}
                </Button>
              }
            >
              <AScanPlot
                result={s.result}
                traceIndex={traceIndex}
                showGrid={showGrid}
                showUnits={showUnits}
                height={250}
                onReady={(el) => {
                  aScanEl.current = el
                }}
              />
            </Panel>
          )}

          <Panel title={d.ws.diagnostics}>
            <SummaryPanel result={s.result} showUnits={showUnits} />
            {!s.result && <EmptyState title={d.ws.diagnostics} body={d.ws.notRun} />}
          </Panel>

          <ComparePanel
            pinned={pinned}
            currentMetrics={compareMetrics}
            currentSeries={compareSeries}
            plot={comparePlot}
            currentScenarioLabel={d.ws.scenarios[s.scenarioId]}
            canPin={Boolean(s.result) && !s.dirty}
            stale={s.dirty}
            onPin={pinResult}
            onClear={() => setPinned(null)}
          />

          <SweepPanel
            input={s.input}
            parameters={sweepParameters}
            metrics={sweepMetrics}
            run={runGprForward}
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

          <Panel title={d.ws.picks}>
            {s.result ? <PicksPanel result={s.result} /> : <EmptyState title={d.ws.picks} body={d.ws.notRun} />}
          </Panel>

          <Panel title={d.common.warningsTitle}>
            {s.result ? <WarningsPanel result={s.result} /> : <EmptyState title={d.common.warningsTitle} body={d.ws.notRun} />}
          </Panel>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <Panel title={d.ws.pipeline}>
          <WorkspacePipeline />
        </Panel>
        <AssumptionPanel title={d.ws.assumptionsTitle} items={d.ws.assumptions} footer={d.ws.depthConversion} />
        <ReadResultCard methodId="gpr" />
        <GuidedExperiments methodId="gpr" />
        <ReportPanel />
      </div>
    </div>
  )
}
