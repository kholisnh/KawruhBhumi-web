import { useCallback, useRef, useState } from 'react'
import { exportCsv, exportPlotPng } from '../components/charts/exporters'
import { AssumptionPanel } from '../components/ui/AssumptionPanel'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { SelectField } from '../components/ui/SelectField'
import { Toggle } from '../components/ui/Toggle'
import { StatusText, WorkspaceShell, useForwardState } from '../components/workspace/common'
import { ShareButton } from '../components/ui/ShareButton'
import { useSharedScenario } from '../lib/useSharedScenario'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { VesCurvePlot, VesLayersPanel, VesModelSvg, VesSummaryPanel, VesSurveyPanel } from '../components/workspace/resistivity/VesParts'
import { useI18n } from '../i18n'
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
  const [showGrid, setShowGrid] = useState(true)
  const [showUnits, setShowUnits] = useState(true)
  const curveEl = useRef<HTMLDivElement | null>(null)

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
