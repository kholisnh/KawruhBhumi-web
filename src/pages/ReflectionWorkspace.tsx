import { useCallback, useRef, useState } from 'react'
import { exportCsv, exportPlotPng, exportSvgPng } from '../components/charts/exporters'
import { AssumptionPanel } from '../components/ui/AssumptionPanel'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { SelectField } from '../components/ui/SelectField'
import { Toggle } from '../components/ui/Toggle'
import { StatusText, WorkspaceShell, useForwardState } from '../components/workspace/common'
import { ReflGatherPanel, ReflLayersPanel, ReflModelPanel, ReflPicksPanel, ReflSummaryPanel, ReflSurveyPanel, ReflTracePanel } from '../components/workspace/reflection/ReflParts'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { reflScenarios, reflScenarioToInput, reflUid, type ReflScenarioId } from '../sim/reflection/model'
import { runReflectionForward } from '../sim/reflection/solver'
import type { ReflInput, ReflLayer, ReflResult, ReflSurvey } from '../sim/reflection/types'
import { validateReflection } from '../sim/reflection/validate'

export function ReflectionWorkspace() {
  const { d } = useI18n()
  const t = d.refl
  const s = useForwardState<ReflInput, ReflResult, ReflScenarioId>({
    scenarios: reflScenarios,
    initialScenario: 'sandShale',
    scenarioInput: useCallback((id: ReflScenarioId) => reflScenarioToInput(reflScenarios.find((x) => x.id === id) ?? reflScenarios[0]), []),
    validate: validateReflection,
    run: runReflectionForward,
    clone: (i) => structuredClone(i),
  })
  const [showGrid, setShowGrid] = useState(true)
  const [showUnits, setShowUnits] = useState(true)
  const [showNmo, setShowNmo] = useState(true)
  const [wiggle, setWiggle] = useState(true)
  const traceEl = useRef<HTMLDivElement | null>(null)
  const gatherEl = useRef<HTMLDivElement | null>(null)
  const gatherSvgEl = useRef<SVGSVGElement | null>(null)

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
                <span className="gs-number text-[10.5px] text-gs-mist">
                  max |amp| {fmt(s.result.diagnostics.maxAbsAmplitude, 3)} {t.relAmp}
                </span>
              }
            >
              <ReflSummaryPanel result={s.result} errDict={{ ...t.warnings, ...t.errors }} showUnits={showUnits} />
            </Panel>
          )}
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
