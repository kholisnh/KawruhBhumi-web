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
import { GrvBodiesPanel, GrvMapPanel, GrvModelPanel, GrvProfilePanel, GrvSurveyPanel, GrvSummaryPanel } from '../components/workspace/gravity/GrvParts'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'
import { ComparePanel } from '../components/workspace/r2/ComparePanel'
import { PresetCards } from '../components/workspace/r2/PresetCards'
import { PresetThumbnail } from '../components/workspace/r2/PresetThumbnail'
import { SweepPanel } from '../components/workspace/r2/SweepPanel'
import { ChallengePanel } from '../components/workspace/r3/ChallengePanel'
import { useChallenge } from '../components/workspace/r3/useChallenge'
import { cleanGravityInput, gravityChallengeCurve, perturbGravityInput } from '../components/workspace/r3/targets'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot, PresetDifficulty, SweepMetric, SweepParameter } from '../components/workspace/r2/types'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { grvScenarios, grvScenarioToInput, grvUid, type GrvScenarioId } from '../sim/gravity/model'
import { runGravityForward } from '../sim/gravity/solver'
import type { GrvBody, GrvInput, GrvResult, GrvSurvey } from '../sim/gravity/types'
import { validateGravity } from '../sim/gravity/validate'

const gravityDifficulty: Record<GrvScenarioId, PresetDifficulty> = {
  saltDome: 'medium',
  tunnel: 'easy',
  oreBody: 'medium',
  shallowCavity: 'advanced',
  basaltRidge: 'advanced',
}

function displayDepth(input: GrvInput): number {
  let depth = 5
  for (const b of input.bodies) {
    const dMax = b.kind === 'sphere' ? b.z + b.radius : b.z2
    if (Number.isFinite(dMax)) depth = Math.max(depth, dMax)
  }
  return Math.max(5, depth * 1.25 + 1)
}

export function GravityWorkspace() {
  const { d } = useI18n()
  const shared = useSharedScenario<GrvInput>('gravity')
  const t = d.grv
  const s = useForwardState<GrvInput, GrvResult, GrvScenarioId>({
    scenarios: grvScenarios,
    initialScenario: (shared?.scenarioId as GrvScenarioId | undefined) ?? 'saltDome',
    initialInput: shared?.input,
    autoRun: true,
    storageKey: 'kb.scenario.gravity',
    scenarioInput: useCallback((id: GrvScenarioId) => grvScenarioToInput(grvScenarios.find((x) => x.id === id) ?? grvScenarios[0]), []),
    validate: validateGravity,
    run: runGravityForward,
    clone: (i) => structuredClone(i),
  })
  const [showGrid, setShowGrid] = usePersistedBoolean('kb.display.gravity.grid', true)
  const [showUnits, setShowUnits] = usePersistedBoolean('kb.display.gravity.units', true)
  const [showBodies, setShowBodies] = usePersistedBoolean('kb.display.gravity.bodies', true)
  const [showStations, setShowStations] = usePersistedBoolean('kb.display.gravity.stations', true)
  const [pinned, setPinned] = useState<ComparisonSnapshot | null>(null)
  const challengeInputKey = useMemo(() => JSON.stringify(s.input), [s.input])
  const challenge = useChallenge<GrvInput>({
    input: s.input,
    inputKey: challengeInputKey,
    makeTarget: perturbGravityInput,
    computeCurve: (input) => gravityChallengeCurve(runGravityForward(cleanGravityInput(input)), `${d.wshared.distance} (m)`, `${t.profileTitle} (mGal)`),
  })
  const profileEl = useRef<HTMLDivElement | null>(null)
  const mapEl = useRef<HTMLDivElement | null>(null)

  const patchSurvey = (p: Partial<GrvSurvey>) => s.setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...p } }))
  const patchBody = (id: string, key: string, value: number) =>
    s.setInput((prev) => ({ ...prev, bodies: prev.bodies.map((b) => (b.id === id ? ({ ...b, [key]: value } as GrvBody) : b)) }))
  const setKind = (id: string, kind: GrvBody['kind']) =>
    s.setInput((prev) => ({
      ...prev,
      bodies: prev.bodies.map((b) =>
        b.id === id
          ? kind === 'sphere'
            ? { id, kind: 'sphere' as const, x: prev.survey.lineLength * 0.5, y: 0, z: 20, radius: 8, deltaRho: -300 }
            : { id, kind: 'prism' as const, x1: prev.survey.lineLength * 0.35, x2: prev.survey.lineLength * 0.65, y: 0, strikeLength: 30, z1: 5, z2: 60, deltaRho: -250 }
          : b,
      ),
    }))
  const addBody = () =>
    s.setInput((prev) => ({
      ...prev,
      bodies: [
        ...prev.bodies,
        { id: grvUid('prism'), kind: 'prism' as const, x1: prev.survey.lineLength * 0.35, x2: prev.survey.lineLength * 0.65, y: 0, strikeLength: 30, z1: 5, z2: 60, deltaRho: -250 },
      ],
    }))
  const removeBody = (id: string) => s.setInput((prev) => ({ ...prev, bodies: prev.bodies.filter((b) => b.id !== id) }))

  const dispDepth = useMemo(() => displayDepth(s.input), [s.input])

  const presetItems = useMemo(
    () =>
      grvScenarios.map((scenario) => {
        const result = runGravityForward(grvScenarioToInput(scenario))
        const level = gravityDifficulty[scenario.id]
        return {
          id: scenario.id,
          label: t.scenarios[scenario.id],
          difficulty: d.wshared.r2.difficulty[level],
          level,
          expected: `${fmt(result.diagnostics.maxAbsMGal, 2)} mGal`,
          thumbnail: <PresetThumbnail method="gravity" />,
        }
      }),
    [d, t],
  )

  const compareMetrics = useMemo<CompareMetric[]>(() => {
    if (!s.result) return []
    return [
      { id: 'peak', label: t.peak, unit: 'mGal', value: s.result.diagnostics.maxAbsMGal },
      { id: 'rms', label: d.wshared.r2.rms, unit: 'mGal', value: s.result.diagnostics.rmsMGal },
      { id: 'ptp', label: t.peakToPeak, unit: 'mGal', value: s.result.diagnostics.peakToPeakMGal },
      { id: 'stations', label: d.wshared.stations, value: s.result.diagnostics.nStations, format: (value) => String(Math.round(value)) },
    ]
  }, [d, s.result, t])

  const compareSeries = useMemo<CompareSeries[]>(
    () => (s.result ? [{ name: t.profileTitle, x: s.result.x, y: s.result.gMGal }] : []),
    [s.result, t],
  )

  const comparePlot = useMemo<ComparePlotSpec>(
    () => ({ xTitle: `${d.wshared.distance} (m)`, yTitle: `${t.profileTitle} (mGal)` }),
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

  const sweepParameters = useMemo<SweepParameter<GrvInput>[]>(() => {
    const first = s.input.bodies[0]
    if (!first) return []
    const depthMax = first.kind === 'prism' ? Math.max(2, first.z2 - 1) : 200
    return [
      {
        id: 'density',
        label: t.deltaRho,
        unit: 'kg/m³',
        min: -5000,
        max: 5000,
        get: (input) => input.bodies[0]?.deltaRho ?? 0,
        apply: (input, value) => ({
          ...input,
          bodies: input.bodies.map((body, index) => (index === 0 ? ({ ...body, deltaRho: value } as GrvBody) : body)),
        }),
      },
      {
        id: 'depth',
        label: first.kind === 'sphere' ? t.depthZ : t.z1,
        unit: 'm',
        min: 1,
        max: depthMax,
        get: (input) => {
          const body = input.bodies[0]
          return body ? (body.kind === 'sphere' ? body.z : body.z1) : 0
        },
        apply: (input, value) => ({
          ...input,
          bodies: input.bodies.map((body, index) =>
            index === 0
              ? body.kind === 'sphere'
                ? ({ ...body, z: value } as GrvBody)
                : ({ ...body, z1: value } as GrvBody)
              : body,
          ),
        }),
      },
    ]
  }, [s.input.bodies, t])

  const sweepMetrics = useMemo<SweepMetric<GrvResult>[]>(
    () => [
      { id: 'peak', label: t.peak, unit: 'mGal', get: (result) => result.diagnostics.maxAbsMGal },
      { id: 'rms', label: d.wshared.r2.rms, unit: 'mGal', get: (result) => result.diagnostics.rmsMGal },
    ],
    [d, t],
  )

  const prepareSweep = useCallback((input: GrvInput) => {
    const clone = structuredClone(input)
    clone.survey.noiseMGal = 0
    return clone
  }, [])

  const handleExportCsv = () => {
    if (!s.result) return
    const r = s.result
    exportCsv(
      `kawruhbhumi-gravity-${s.scenarioId}.csv`,
      ['x_m', 'g_total_mGal', ...r.bodies.map((b) => `g_${b.id}_mGal`)],
      r.x.map((x, i) => [x, r.gMGal[i], ...r.perBodyMGal.map((arr) => arr[i])]),
    )
  }

  const handleExportMapCsv = () => {
    if (!s.result) return
    const { x, y, valuesMGal } = s.result.map
    const rows: Array<Array<string | number>> = []
    for (let j = 0; j < y.length; j++) {
      for (let i = 0; i < x.length; i++) rows.push([x[i], y[j], valuesMGal[j][i]])
    }
    exportCsv(`kawruhbhumi-gravity-${s.scenarioId}-map.csv`, ['x_m', 'y_m', 'g_mGal'], rows)
  }

  return (
    <WorkspaceShell
      methodId="gravity"
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
          <ShareButton methodId="gravity" scenarioId={s.scenarioId} input={s.input} />
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!s.result}>
            {d.wshared.exportCsv}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!s.result}
            onClick={() => profileEl.current && exportPlotPng(profileEl.current, `kawruhbhumi-gravity-profile-${s.scenarioId}.png`)}
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
              onChange={(v) => s.loadScenario(v as GrvScenarioId)}
              options={s.scenarioIds.map((id) => ({ value: id, label: t.scenarios[id] }))}
              compact
            />
            <PresetCards items={presetItems} activeId={s.scenarioId} onSelect={(id) => s.loadScenario(id as GrvScenarioId)} />
          </Panel>
          <GrvSurveyPanel survey={s.input.survey} errors={s.errors} errDict={t.errors} patch={patchSurvey} />
          <GrvBodiesPanel bodies={s.input.bodies} errors={s.errors} errDict={t.errors} patch={patchBody} setKind={setKind} remove={removeBody} add={addBody} />
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
              <GrvProfilePanel
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
                    onClick={() => mapEl.current && exportPlotPng(mapEl.current, `kawruhbhumi-gravity-map-${s.scenarioId}.png`)}
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
              <GrvMapPanel
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
          <GrvModelPanel input={s.input} dispDepth={dispDepth} />
          {s.result && <GrvSummaryPanel result={s.result} errDict={{ ...t.warnings, ...t.errors }} showUnits={showUnits} />}
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
            run={runGravityForward}
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
