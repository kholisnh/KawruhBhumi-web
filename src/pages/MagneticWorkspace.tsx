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
import { MagBodiesPanel, MagMapPanel, MagModelPanel, MagProfilePanel, MagSurveyPanel, MagSummaryPanel } from '../components/workspace/magnetic/MagParts'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { ComparePanel } from '../components/workspace/r2/ComparePanel'
import { PresetCards } from '../components/workspace/r2/PresetCards'
import { PresetThumbnail } from '../components/workspace/r2/PresetThumbnail'
import { SweepPanel } from '../components/workspace/r2/SweepPanel'
import { ChallengePanel } from '../components/workspace/r3/ChallengePanel'
import { useChallenge } from '../components/workspace/r3/useChallenge'
import { cleanMagneticInput, magneticChallengeCurve, perturbMagneticInput } from '../components/workspace/r3/targets'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot, PresetDifficulty, SweepMetric, SweepParameter } from '../components/workspace/r2/types'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { magScenarios, magScenarioToInput, magUid, type MagScenarioId } from '../sim/magnetic/model'
import { runMagneticForward } from '../sim/magnetic/solver'
import type { MagBody, MagBodyKind, MagInput, MagResult, MagSurvey } from '../sim/magnetic/types'
import { validateMagnetic } from '../sim/magnetic/validate'

const magneticDifficulty: Record<MagScenarioId, PresetDifficulty> = {
  steelTank: 'easy',
  magnetiteDike: 'medium',
  pipeline: 'easy',
  archaeology: 'advanced',
  equatorial: 'advanced',
}

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
  const [showGrid, setShowGrid] = usePersistedBoolean('kb.display.magnetic.grid', true)
  const [showUnits, setShowUnits] = usePersistedBoolean('kb.display.magnetic.units', true)
  const [showBodies, setShowBodies] = usePersistedBoolean('kb.display.magnetic.bodies', true)
  const [showStations, setShowStations] = usePersistedBoolean('kb.display.magnetic.stations', true)
  const [pinned, setPinned] = useState<ComparisonSnapshot | null>(null)
  const challengeInputKey = useMemo(() => JSON.stringify(s.input), [s.input])
  const challenge = useChallenge<MagInput>({
    input: s.input,
    inputKey: challengeInputKey,
    makeTarget: perturbMagneticInput,
    computeCurve: (input) => magneticChallengeCurve(runMagneticForward(cleanMagneticInput(input)), `${d.wshared.distance} (m)`, `${t.profileTitle} (nT)`),
  })
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

  const presetItems = useMemo(
    () =>
      magScenarios.map((scenario) => {
        const result = runMagneticForward(magScenarioToInput(scenario))
        const level = magneticDifficulty[scenario.id]
        return {
          id: scenario.id,
          label: t.scenarios[scenario.id],
          difficulty: d.wshared.r2.difficulty[level],
          level,
          expected: `${fmt(result.diagnostics.maxAbsNT, 1)} nT`,
          thumbnail: <PresetThumbnail method="magnetic" />,
        }
      }),
    [d, t],
  )

  const compareMetrics = useMemo<CompareMetric[]>(() => {
    if (!s.result) return []
    return [
      { id: 'peak', label: d.wshared.r2.maxAbs, unit: 'nT', value: s.result.diagnostics.maxAbsNT },
      { id: 'rms', label: d.wshared.r2.rms, unit: 'nT', value: s.result.diagnostics.rmsNT },
      { id: 'ptp', label: t.peakToPeak, unit: 'nT', value: s.result.diagnostics.peakToPeakNT },
      { id: 'stations', label: d.wshared.stations, value: s.result.diagnostics.nStations, format: (value) => String(Math.round(value)) },
    ]
  }, [d, s.result, t])

  const compareSeries = useMemo<CompareSeries[]>(
    () => (s.result ? [{ name: t.profileTitle, x: s.result.x, y: s.result.totalNT }] : []),
    [s.result, t],
  )

  const comparePlot = useMemo<ComparePlotSpec>(
    () => ({ xTitle: `${d.wshared.distance} (m)`, yTitle: `${t.profileTitle} (nT)` }),
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

  const sweepParameters = useMemo<SweepParameter<MagInput>[]>(() => {
    const first = s.input.bodies[0]
    if (!first) return []
    const depthMax = first.kind === 'prism' ? Math.max(2, first.z2 - 1) : 200
    return [
      {
        id: 'chi',
        label: d.wshared.chi,
        unit: 'SI',
        min: -0.9,
        max: 1,
        get: (input) => input.bodies[0]?.chi ?? 0,
        apply: (input, value) => ({
          ...input,
          bodies: input.bodies.map((body, index) => (index === 0 ? ({ ...body, chi: value } as MagBody) : body)),
        }),
      },
      {
        id: 'depth',
        label: first.kind === 'dipole' ? t.depthZ : t.z1,
        unit: 'm',
        min: 0.1,
        max: depthMax,
        get: (input) => {
          const body = input.bodies[0]
          return body ? (body.kind === 'dipole' ? body.z : body.z1) : 0
        },
        apply: (input, value) => ({
          ...input,
          bodies: input.bodies.map((body, index) =>
            index === 0
              ? body.kind === 'dipole'
                ? ({ ...body, z: value } as MagBody)
                : ({ ...body, z1: value } as MagBody)
              : body,
          ),
        }),
      },
    ]
  }, [d, s.input.bodies, t])

  const sweepMetrics = useMemo<SweepMetric<MagResult>[]>(
    () => [
      { id: 'peak', label: d.wshared.r2.maxAbs, unit: 'nT', get: (result) => result.diagnostics.maxAbsNT },
      { id: 'rms', label: d.wshared.r2.rms, unit: 'nT', get: (result) => result.diagnostics.rmsNT },
    ],
    [d],
  )

  const prepareSweep = useCallback((input: MagInput) => {
    const clone = structuredClone(input)
    clone.survey.noiseNT = 0
    return clone
  }, [])

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
            <PresetCards items={presetItems} activeId={s.scenarioId} onSelect={(id) => s.loadScenario(id as MagScenarioId)} />
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
            run={runMagneticForward}
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
