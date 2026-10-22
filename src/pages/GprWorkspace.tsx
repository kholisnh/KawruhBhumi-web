import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { exportPlotPng, exportRadargramCsv } from '../components/charts/exporters'
import { GeoCrossSection } from '../components/geo/GeoCrossSection'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { modelDisplayDepth, surveySummaryRows } from '../sim/gpr/solver'
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

export function GprWorkspace() {
  const { d } = useI18n()
  const s = useGprState()
  const errorFor = useErrorFor(s.errors)
  const [showGrid, setShowGrid] = useState(true)
  const [showUnits, setShowUnits] = useState(true)
  const [selectedX, setSelectedX] = useState(2)

  const radarEl = useRef<HTMLDivElement | null>(null)
  const aScanEl = useRef<HTMLDivElement | null>(null)

  const traceIndex = useMemo(() => {
    if (!s.result) return 0
    const spacing = s.result.x.length > 1 ? s.result.x[1] - s.result.x[0] : 1
    const idx = Math.round((selectedX - s.result.x[0]) / spacing)
    return Math.min(Math.max(idx, 0), s.result.x.length - 1)
  }, [s.result, selectedX])

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
        <Link to="/simulator" className="transition-colors hover:text-gs-cyan">
          {d.ws.breadcrumb}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gs-ice">{d.methods.list.gpr.abbr}</span>
      </nav>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gs-ice">{d.ws.title}</h1>
          <Badge soft color="#E85353">
            APPROXIMATE
          </Badge>
        </div>
        <p className="mt-1.5 max-w-4xl text-sm leading-relaxed text-gs-mist">{d.ws.subtitle}</p>
        <p className="mt-2 max-w-4xl text-[11px] leading-relaxed text-gs-mist/85">{d.ws.solverNote}</p>
      </header>

      <Panel compact className="mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
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
          <Toggle label={d.ws.showGrid} checked={showGrid} onChange={setShowGrid} />
          <Toggle label={d.ws.showUnits} checked={showUnits} onChange={setShowUnits} />
          <span className="ml-auto text-[11px]">
            {s.result && !s.dirty && <span className="text-gs-teal">{d.ws.current}</span>}
            {s.result && s.dirty && <span className="text-gs-amber">{d.ws.stale}</span>}
          </span>
        </div>
        {s.runError && s.runError !== 'validation' && (
          <p className="mt-2 rounded-lg border border-gs-danger/40 bg-gs-danger/8 px-3 py-2 text-[11px] text-gs-danger">
            {s.runError}
          </p>
        )}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel title={d.ws.scenario} compact>
            <ScenarioSelect value={s.scenarioId} onChange={s.loadScenario} />
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
        </div>

        <div className="space-y-5">
          <Panel title={d.ws.crossSection}>
            <GeoCrossSection
              layers={s.input.model.layers}
              targets={s.input.model.targets}
              lineLength={s.input.survey.lineLength}
              displayDepth={s.result?.diagnostics.displayDepthM ?? modelDisplayDepth(s.input.model)}
              showGrid={showGrid}
              showUnits={showUnits}
              height={340}
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
              <span className="gs-number text-[10.5px] text-gs-mist">
                {d.ws.trace} x = {fmt(selectedX, 3)} m
              </span>
            }
          >
            {!s.result ? (
              <EmptyState title={d.ws.radargram} body={d.ws.notRun} />
            ) : (
              <>
                {s.dirty && (
                  <p className="mb-3 rounded-lg border border-gs-amber/40 bg-gs-amber/8 px-3 py-2 text-[11px] text-gs-amber">
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
      </div>
    </div>
  )
}
