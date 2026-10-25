import { useCallback, useMemo, useRef, useState } from 'react'
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
import { MagBodiesPanel, MagMapPanel, MagModelPanel, MagProfilePanel, MagSurveyPanel, MagSummaryPanel } from '../components/workspace/magnetic/MagParts'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { magScenarios, magScenarioToInput, magUid, type MagScenarioId } from '../sim/magnetic/model'
import { runMagneticForward } from '../sim/magnetic/solver'
import type { MagBody, MagBodyKind, MagInput, MagResult, MagSurvey } from '../sim/magnetic/types'
import { validateMagnetic } from '../sim/magnetic/validate'

function displayDepth(input: MagInput): number {
  let depth = 5
  for (const b of input.bodies) {
    const dMax = b.kind === 'dipole' ? b.z + b.radius : b.z2
    if (Number.isFinite(dMax)) depth = Math.max(depth, dMax)
  }
  return Math.max(5, depth * 1.25 + 1)
}

export function MagneticWorkspace() {
  const { d } = useI18n()
  const shared = useSharedScenario<MagInput>('magnetic')
  const t = d.mag
  const s = useForwardState<MagInput, MagResult, MagScenarioId>({
    scenarios: magScenarios,
    initialScenario: (shared?.scenarioId as MagScenarioId | undefined) ?? 'steelTank',
    initialInput: shared?.input,
    autoRun: true,
    storageKey: 'kb.scenario.magnetic',
    scenarioInput: useCallback((id: MagScenarioId) => magScenarioToInput(magScenarios.find((x) => x.id === id) ?? magScenarios[0]), []),
    validate: validateMagnetic,
    run: runMagneticForward,
    clone: (i) => structuredClone(i),
  })
  const [showGrid, setShowGrid] = useState(true)
  const [showUnits, setShowUnits] = useState(true)
  const [showBodies, setShowBodies] = useState(true)
  const [showStations, setShowStations] = useState(true)
  const profileEl = useRef<HTMLDivElement | null>(null)
  const mapEl = useRef<HTMLDivElement | null>(null)

  const patchSurvey = (p: Partial<MagSurvey>) => s.setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...p } }))
  const patchBody = (id: string, key: string, value: number) =>
    s.setInput((prev) => ({ ...prev, bodies: prev.bodies.map((b) => (b.id === id ? ({ ...b, [key]: value } as MagBody) : b)) }))
  const setKind = (id: string, kind: MagBodyKind) =>
    s.setInput((prev) => ({
      ...prev,
      bodies: prev.bodies.map((b) =>
        b.id === id
          ? kind === 'dipole'
            ? { id, kind: 'dipole' as const, x: prev.survey.lineLength * 0.5, y: 0, z: 2, radius: 0.5, chi: 0.05 }
            : { id, kind: 'prism' as const, x1: prev.survey.lineLength * 0.4, x2: prev.survey.lineLength * 0.6, y: 0, strikeLength: 6, z1: 1, z2: 6, chi: 0.05 }
          : b,
      ),
    }))
  const addBody = () =>
    s.setInput((prev) => ({
      ...prev,
      bodies: [
        ...prev.bodies,
        { id: magUid('prism'), kind: 'prism' as const, x1: prev.survey.lineLength * 0.4, x2: prev.survey.lineLength * 0.6, y: 0, strikeLength: 6, z1: 1, z2: 6, chi: 0.05 },
      ],
    }))
  const removeBody = (id: string) => s.setInput((prev) => ({ ...prev, bodies: prev.bodies.filter((b) => b.id !== id) }))

  const dispDepth = useMemo(() => displayDepth(s.input), [s.input])

  const handleExportCsv = () => {
    if (!s.result) return
    const r = s.result
    exportCsv(
      `kawruhbhumi-magnetic-${s.scenarioId}.csv`,
      ['x_m', 'dt_total_nT', ...r.bodies.map((b) => `dt_${b.id}_nT`)],
      r.x.map((x, i) => [x, r.totalNT[i], ...r.perBodyNT.map((arr) => arr[i])]),
    )
  }

  const handleExportMapCsv = () => {
    if (!s.result) return
    const { x, y, valuesNT } = s.result.map
    const rows: Array<Array<string | number>> = []
    for (let j = 0; j < y.length; j++) {
      for (let i = 0; i < x.length; i++) rows.push([x[i], y[j], valuesNT[j][i]])
    }
    exportCsv(`kawruhbhumi-magnetic-${s.scenarioId}-map.csv`, ['x_m', 'y_m', 'dt_nT'], rows)
  }

  return (
    <WorkspaceShell
      methodId="magnetic"
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
          <ShareButton methodId="magnetic" scenarioId={s.scenarioId} input={s.input} />
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!s.result}>
            {d.wshared.exportCsv}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => profileEl.current && exportPlotPng(profileEl.current, `kawruhbhumi-magnetic-profile-${s.scenarioId}.png`)}
          >
            {d.wshared.exportPng}
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Toggle label={d.wshared.showGrid} checked={showGrid} onChange={setShowGrid} />
          <Toggle label={d.wshared.showUnits} checked={showUnits} onChange={setShowUnits} />
          <Toggle label={t.showBodies} checked={showBodies} onChange={setShowBodies} />
          <Toggle label={t.showStations} checked={showStations} onChange={setShowStations} />
        </>
      }
      status={<StatusText result={s.result} dirty={s.dirty} />}
      left={
        <>
          <Panel title={t.scenario} compact>
            <SelectField
              label={t.scenario}
              value={s.scenarioId}
              onChange={(v) => s.loadScenario(v as MagScenarioId)}
              options={s.scenarioIds.map((id) => ({ value: id, label: t.scenarios[id] }))}
              compact
            />
          </Panel>
          <MagSurveyPanel survey={s.input.survey} errors={s.errors} errDict={t.errors} patch={patchSurvey} />
          <MagBodiesPanel bodies={s.input.bodies} errors={s.errors} errDict={t.errors} patch={patchBody} setKind={setKind} remove={removeBody} add={addBody} />
        </>
      }
      right={
        <>
          <Panel
            title={t.profileTitle}
            actions={
              s.result ? (
                <span className="gs-number text-xs text-gs-mist">
                  {d.wshared.stations}: {fmt(s.result.diagnostics.nStations, 0)}
                </span>
              ) : undefined
            }
          >
            {!s.result ? (
              <EmptyState title={t.profileTitle} body={d.wshared.notRun} />
            ) : (
              <MagProfilePanel
                result={s.result}
                showGrid={showGrid}
                showUnits={showUnits}
                showBodies={showBodies}
                onReady={(el) => {
                  profileEl.current = el
                }}
              />
            )}
          </Panel>
          <Panel
            title={t.mapTitle}
            actions={
              s.result ? (
                <span className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={handleExportMapCsv}>
                    {d.wshared.exportCsv}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => mapEl.current && exportPlotPng(mapEl.current, `kawruhbhumi-magnetic-map-${s.scenarioId}.png`)}
                  >
                    {d.wshared.exportPng}
                  </Button>
                </span>
              ) : undefined
            }
          >
            {!s.result ? (
              <EmptyState title={t.mapTitle} body={d.wshared.notRun} />
            ) : (
              <MagMapPanel
                result={s.result}
                showGrid={showGrid}
                showUnits={showUnits}
                showStations={showStations}
                onReady={(el) => {
                  mapEl.current = el
                }}
              />
            )}
          </Panel>
          <MagModelPanel input={s.input} dispDepth={dispDepth} />
          {s.result && <MagSummaryPanel result={s.result} errDict={{ ...t.warnings, ...t.errors }} showUnits={showUnits} />}
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
