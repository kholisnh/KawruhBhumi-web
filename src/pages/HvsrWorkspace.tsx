import { useState } from 'react'
import { AssumptionPanel } from '../components/ui/AssumptionPanel'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { Stat } from '../components/ui/Stat'
import { ShareButton } from '../components/ui/ShareButton'
import { StatusText, WorkspaceShell, useForwardState, WsWarningList } from '../components/workspace/common'
import { HvsrCurvePlot, HvsrInversionCurvePlot, HvsrInversionProfilePlot, HvsrProfilePlot } from '../components/workspace/hvsr/HvsrCharts'
import { HvsrInversionPanel, HvsrModelPanel, HvsrScenarioPanel } from '../components/workspace/hvsr/HvsrPanels'
import { useHvsrInversion } from '../components/workspace/hvsr/useHvsrInversion'
import { HvsrComparison } from '../components/workspace/hvsr/HvsrComparison'
import { HvsrChallenge } from '../components/workspace/hvsr/HvsrChallenge'
import type { HvsrPinnedCurve } from '../components/workspace/hvsr/HvsrCharts'
import { exportCsv } from '../components/charts/exporters'
import { useI18n } from '../i18n'
import { fmt } from '../sim/core/format'
import { hvsrScenarios, hvsrUid, scenarioToInput, totalDepth, type HvsrScenarioId } from '../sim/hvsr/model'
import { runHvsrForward } from '../sim/hvsr/solver'
import type { HvsrInput, HvsrInversionSettings, HvsrLayer, HvsrResult } from '../sim/hvsr/types'
import { validateHvsr } from '../sim/hvsr/validate'
import { useSharedScenario } from '../lib/useSharedScenario'

const cloneInput = (input: HvsrInput): HvsrInput => ({
  model: { layers: input.model.layers.map((layer) => ({ ...layer, id: hvsrUid('layer') })) },
  survey: { ...input.survey },
})

const DEFAULT_SETTINGS: HvsrInversionSettings = {
  layerCount: 4,
  initialSamples: 1200,
  bestCount: 60,
  newSamples: 220,
  iterations: 5,
  seed: 41,
}

export function HvsrWorkspace() {
  const { d } = useI18n()
  const t = d.hvsr
  const shared = useSharedScenario<HvsrInput>('hvsr')
  const s = useForwardState<HvsrInput, HvsrResult, HvsrScenarioId>({
    scenarios: hvsrScenarios,
    initialScenario: (shared?.scenarioId as HvsrScenarioId | undefined) ?? 'iknAlluvium',
    scenarioInput: (id) => scenarioToInput(hvsrScenarios.find((scenario) => scenario.id === id) ?? hvsrScenarios[0]),
    validate: validateHvsr,
    run: runHvsrForward,
    clone: cloneInput,
    initialInput: shared?.input,
    autoRun: true,
    storageKey: 'kb.scenario.hvsr',
  })
  const inv = useHvsrInversion()
  const [settings, setSettings] = useState<HvsrInversionSettings>(DEFAULT_SETTINGS)
  const [invTarget, setInvTarget] = useState<string | null>(null)
  const [pinned, setPinned] = useState<HvsrPinnedCurve | null>(null)

  const patchSurvey = (patch: Partial<HvsrInput['survey']>) => {
    s.setInput((prev) => ({ ...prev, survey: { ...prev.survey, ...patch } }))
  }

  const patchLayer = (id: string, patch: Partial<HvsrLayer>) => {
    s.setInput((prev) => ({
      ...prev,
      model: { layers: prev.model.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)) },
    }))
  }

  const addLayer = () => {
    s.setInput((prev) => {
      if (prev.model.layers.length >= 8) return prev
      const layers = prev.model.layers
      const inserted: HvsrLayer = { id: hvsrUid('layer'), thickness: 10, vs: 300 }
      return { ...prev, model: { layers: [...layers.slice(0, -1), inserted, layers[layers.length - 1]] } }
    })
  }

  const removeLayer = (id: string) => {
    s.setInput((prev) => {
      if (prev.model.layers.length <= 2) return prev
      return { ...prev, model: { layers: prev.model.layers.filter((layer) => layer.id !== id) } }
    })
  }

  const runInversion = () => {
    if (!s.result || s.dirty || s.errors.length > 0) return
    setInvTarget(JSON.stringify(s.result.hvsr))
    inv.run({
      observed: s.result.hvsr,
      frequencies: s.result.frequencies,
      qs: s.input.survey.qs,
      settings,
      initialModel: s.input.model,
    })
  }

  const invStale = Boolean(
    inv.result &&
      (s.dirty || invTarget !== (s.result ? JSON.stringify(s.result.hvsr) : '') || JSON.stringify(inv.result.settings) !== JSON.stringify(settings)),
  )

  const exportCurve = () => {
    if (!s.result) return
    exportCsv(
      `kawruhbhumi-hvsr-${s.scenarioId}-curve.csv`,
      ['frequency_hz', 'hvsr', 'sh_horizontal'],
      s.result.frequencies.map((f, i) => [f.toFixed(5), s.result!.hvsr[i].toFixed(6), s.result!.hHorizontal[i].toFixed(6)]),
    )
  }

  const exportModel = () => {
    exportCsv(
      `kawruhbhumi-hvsr-${s.scenarioId}-model.csv`,
      ['layer', 'thickness_m', 'vs_m_s'],
      s.input.model.layers.map((layer, i) => [i + 1, layer.thickness, layer.vs]),
    )
  }

  return (
    <WorkspaceShell
      methodId="hvsr"
      badge={t.badge}
      title={t.title}
      subtitle={t.subtitle}
      solverNote={t.solverNote}
      status={<StatusText result={s.result} dirty={s.dirty} />}
      toolbar={
        <>
          <Button onClick={s.run} disabled={s.errors.length > 0}>
            {d.wshared.runSim}
          </Button>
          <Button variant="secondary" onClick={s.resetModel}>
            {d.wshared.resetModel}
          </Button>
          <ShareButton methodId="hvsr" scenarioId={s.scenarioId} input={s.input} />
          <span className="mx-1 hidden h-5 w-px bg-black/5 sm:block" aria-hidden />
          <Button variant="ghost" size="sm" onClick={exportCurve} disabled={!s.result}>
            {t.downloadCurve}
          </Button>
          <Button variant="ghost" size="sm" onClick={exportModel}>
            {t.downloadModel}
          </Button>
        </>
      }
      left={
        <>
          <HvsrScenarioPanel
            scenarioId={s.scenarioId}
            onScenario={s.loadScenario}
            survey={s.input.survey}
            patch={patchSurvey}
            errors={s.errors.filter((e) => e.path.startsWith('survey.'))}
            errDict={t.errors}
          />
          <HvsrModelPanel
            model={s.input.model}
            errors={s.errors.filter((e) => e.path.startsWith('layer.') || e.path.startsWith('model.'))}
            errDict={t.errors}
            patchLayer={patchLayer}
            addLayer={addLayer}
            removeLayer={removeLayer}
          />
          <HvsrInversionPanel
            settings={settings}
            patch={(p) => setSettings((prev) => ({ ...prev, ...p }))}
            onRun={runInversion}
            onCancel={inv.cancel}
            running={inv.running}
            progress={inv.progress}
            disabled={!s.result || s.dirty || s.errors.length > 0}
            hasResult={Boolean(s.result)}
            error={inv.error}
          />
        </>
      }
      right={
        <>
          {s.result ? (
            <>
              <Panel
                title={t.curveTitle}
                actions={
                  <Button variant="ghost" size="sm" onClick={exportCurve}>
                    {d.wshared.exportCsv}
                  </Button>
                }
              >
                <HvsrCurvePlot result={s.result} title={t.cleanCurve} xTitle={t.freqAxis} yTitle={t.hAxis} f0Label={t.f0} />
                <p className="mt-1 text-xs leading-relaxed text-gs-mist">{t.curveNote}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label={t.f0} value={fmt(s.result.diagnostics.f0, 3)} unit="Hz" accent="#7A5AF8" />
                  <Stat label={t.a0} value={fmt(s.result.diagnostics.a0, 2)} />
                  <Stat label={t.quarterWave} value={fmt(s.result.diagnostics.quarterWaveEstimate, 3)} unit="Hz" />
                  <Stat label={t.depthHint} value={fmt(totalDepth(s.input.model), 1)} unit="m" />
                </div>
                <div className="mt-3">
                  <WsWarningList warnings={s.result.diagnostics.warnings} dict={t.warnings} />
                </div>
              </Panel>

              <Panel
                title={t.modelProfileTitle}
                actions={
                  <Button variant="ghost" size="sm" onClick={exportModel}>
                    {d.wshared.exportCsv}
                  </Button>
                }
              >
                <HvsrProfilePlot model={s.input.model} title={t.modelTitle} xTitle={t.vsAxis} yTitle={t.depthAxis} />
                <p className="mt-1 text-xs leading-relaxed text-gs-mist">{t.profileNote}</p>
              </Panel>
            </>
          ) : (
            <Panel title={t.curveTitle}>
              <p className="text-sm leading-relaxed text-gs-mist">{d.wshared.notRun}</p>
            </Panel>
          )}

          {inv.result && (
            <>
              <Panel title={t.inversionResultTitle}>
                {invStale && (
                  <p className="mb-3 rounded-lg border border-gs-amber/40 bg-gs-amber/8 px-3 py-2 text-xs text-gs-amber">{t.inversionStale}</p>
                )}
                <p className="mb-3 text-xs leading-relaxed text-gs-mist">{t.inversionResultSub}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Stat label={t.misfit} value={fmt(inv.result.misfit, 2)} />
                  <Stat label={t.evaluations} value={inv.result.evaluations.toLocaleString()} />
                  <Stat label={t.layerCount} value={inv.result.settings.layerCount} />
                </div>
                <div className="mt-3 grid gap-4 xl:grid-cols-2">
                  <div>
                    <HvsrInversionCurvePlot
                      inversion={inv.result}
                      observedLabel={t.observed}
                      predictedLabel={t.predicted}
                      xTitle={t.freqAxis}
                      yTitle={t.hAxis}
                    />
                  </div>
                  <div>
                    <HvsrInversionProfilePlot
                      inversion={inv.result}
                      bandLabel={t.percentileBand}
                      medianLabel={t.ensemble}
                      bestLabel={t.bestModel}
                      xTitle={t.vsAxis}
                      yTitle={t.depthAxis}
                    />
                  </div>
                </div>
                <p className="mt-2 rounded-lg border border-gs-amber/25 bg-gs-amber/5 px-3 py-2 text-xs leading-relaxed text-gs-mist">{t.nonUniqueNote}</p>
              </Panel>
            </>
          )}
          <HvsrComparison input={s.input} result={s.result} pinned={pinned} onPin={setPinned} onClear={() => setPinned(null)} />
          <HvsrChallenge input={s.input} />
        </>
      }
      bottom={
        <div className="grid gap-5 lg:grid-cols-2">
          <AssumptionPanel title={d.wshared.assumptionsTitle} items={t.assumptions} />
          <AssumptionPanel title={t.inversionTitle} items={t.inversionAssumptions} />
        </div>
      }
    />
  )
}
