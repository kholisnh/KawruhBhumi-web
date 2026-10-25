import { useMemo } from 'react'
import { useI18n } from '../../../i18n'
import { useFieldHelp } from '../../../content/fieldHelp'
import { totalDepth, hvsrScenarios, scenarioToInput, type HvsrScenarioId } from '../../../sim/hvsr/model'
import { runHvsrForward } from '../../../sim/hvsr/solver'
import { fmt } from '../../../sim/core/format'
import type { HvsrInput, HvsrInversionSettings, HvsrLayer, HvsrModel, HvsrSurvey } from '../../../sim/hvsr/types'
import type { FieldError } from '../../../sim/core/fieldError'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { SelectField } from '../../ui/SelectField'
import { WsErrorList, useWsErrorFor } from '../common'

function MiniVelocityProfile({ input }: { input: HvsrInput }) {
  const depth = Math.max(10, totalDepth(input.model))
  const points: string[] = []
  let top = 0
  input.model.layers.forEach((layer, index) => {
    const isHalf = index === input.model.layers.length - 1
    const bottom = isHalf ? depth : top + layer.thickness
    const x = 4 + (Math.min(1800, Math.max(0, layer.vs)) / 1800) * 52
    points.push(`${x},${4 + (top / depth) * 32}`, `${x},${4 + (bottom / depth) * 32}`)
    top = bottom
  })
  return (
    <svg viewBox="0 0 60 40" className="h-16 w-full" aria-hidden>
      <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="4" y1="36" x2="56" y2="36" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.8" />
    </svg>
  )
}

function HvsrPresetCards({ scenarioId, onScenario }: { scenarioId: HvsrScenarioId; onScenario: (id: HvsrScenarioId) => void }) {
  const { d } = useI18n()
  const t = d.hvsr
  const difficulty: Record<HvsrScenarioId, string> = {
    iknAlluvium: t.presetEasy,
    banjarmasinPeat: t.presetMedium,
    samarindaMixed: t.presetMedium,
    hardBedrock: t.presetAdvanced,
  }
  const presets = useMemo(
    () =>
      hvsrScenarios.map((scenario) => {
        const input = scenarioToInput(scenario)
        return { scenario, input, result: runHvsrForward(input) }
      }),
    [],
  )
  return (
    <div>
      <p className="text-xs font-medium text-gs-mist">{t.presetTitle}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-gs-mist">{t.presetSub}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {presets.map(({ scenario, input, result }) => {
          const active = scenario.id === scenarioId
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onScenario(scenario.id)}
              aria-pressed={active}
              className={`rounded-lg border p-2 text-left transition-colors ${
                active ? 'border-gs-cyan/60 bg-gs-cyan/10' : 'border-black/10 bg-gs-deep/45 hover:border-gs-cyan/40'
              }`}
            >
              <div className={active ? 'text-gs-cyan' : 'text-gs-mist'}>
                <MiniVelocityProfile input={input} />
              </div>
              <p className="mt-1 text-xs font-semibold text-gs-ice">{t.scenarios[scenario.id]}</p>
              <p className="mt-0.5 text-[11px] text-gs-mist">{difficulty[scenario.id]}</p>
              <p className="gs-number mt-0.5 text-[11px] text-gs-mist">
                {t.presetExpected}: f0 {fmt(result.diagnostics.f0, 2)} Hz · A0 {fmt(result.diagnostics.a0, 2)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function HvsrScenarioPanel({
  scenarioId,
  onScenario,
  survey,
  patch,
  errors,
  errDict,
}: {
  scenarioId: HvsrScenarioId
  onScenario: (id: HvsrScenarioId) => void
  survey: HvsrSurvey
  patch: (p: Partial<HvsrSurvey>) => void
  errors: FieldError[]
  errDict: Record<string, string>
}) {
  const { d } = useI18n()
  const t = d.hvsr
  const help = useFieldHelp()
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.surveyTitle}>
      <div className="space-y-3.5">
        <SelectField
          label={t.scenario}
          value={scenarioId}
          onChange={onScenario}
          options={hvsrScenarios.map((s) => ({ value: s.id, label: t.scenarios[s.id] }))}
        />
        <HvsrPresetCards scenarioId={scenarioId} onScenario={onScenario} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t.fMin} unit="Hz" value={survey.fMin} onChange={(v) => patch({ fMin: v })} error={errFor('survey.fMin')} />
          <NumberField label={t.fMax} unit="Hz" value={survey.fMax} onChange={(v) => patch({ fMax: v })} error={errFor('survey.fMax')} />
          <NumberField label={t.nFreq} value={survey.nFreq} onChange={(v) => patch({ nFreq: Math.round(v) })} step={1} error={errFor('survey.nFreq')} />
        </div>
        <details className="rounded-lg border border-black/8 bg-gs-deep/45 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-gs-mist">{t.advanced}</summary>
          <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.advancedHint}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumberField label={t.qs} value={survey.qs} onChange={(v) => patch({ qs: v })} error={errFor('survey.qs')} help={help('hvsr.qs')} />
            <NumberField label={t.noise} unit="%" value={survey.noisePercent} onChange={(v) => patch({ noisePercent: v })} error={errFor('survey.noisePercent')} help={help('hvsr.noise')} />
            <NumberField label={t.seed} value={survey.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} error={errFor('survey.seed')} />
          </div>
        </details>
        <p className="text-xs leading-relaxed text-gs-mist">{t.surveyNote}</p>
      </div>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function HvsrModelPanel({
  model,
  errors,
  errDict,
  patchLayer,
  addLayer,
  removeLayer,
}: {
  model: HvsrModel
  errors: FieldError[]
  errDict: Record<string, string>
  patchLayer: (id: string, patch: Partial<HvsrLayer>) => void
  addLayer: () => void
  removeLayer: (id: string) => void
}) {
  const { d } = useI18n()
  const t = d.hvsr
  const help = useFieldHelp()
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.modelTitle}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-gs-mist">
          {t.depthHint}: <span className="gs-number text-gs-ice">{totalDepth(model).toFixed(0)} m</span>
        </p>
        <Button variant="secondary" size="sm" onClick={addLayer} disabled={model.layers.length >= 8}>
          {t.addLayer}
        </Button>
      </div>
      <div className="space-y-2">
        {model.layers.map((layer, i) => {
          const isHalf = i === model.layers.length - 1
          return (
            <div key={layer.id} className="rounded-lg border border-black/8 bg-gs-deep/45 p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gs-mist">
                  {isHalf ? t.halfSpace : `${t.layerN} ${i + 1}`}
                </span>
                {!isHalf && model.layers.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeLayer(layer.id)}
                    className="text-xs font-medium text-gs-danger hover:text-gs-danger/80"
                  >
                    {t.removeLayer}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label={`${t.thickness} (m)`}
                  value={isHalf ? Infinity : layer.thickness}
                  onChange={(v) => patchLayer(layer.id, { thickness: v })}
                  disabled={isHalf}
                  error={isHalf ? undefined : errFor(`layer.${i}.thickness`)}
                  help={help('hvsr.thickness')}
                />
                <NumberField
                  label={`${t.vs} (m/s)`}
                  value={layer.vs}
                  onChange={(v) => patchLayer(layer.id, { vs: v })}
                  error={errFor(`layer.${i}.vs`)}
                  help={help('hvsr.vs')}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.layersNote}</p>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function HvsrInversionPanel({
  settings,
  patch,
  onRun,
  onCancel,
  running,
  progress,
  disabled,
  hasResult,
  error,
}: {
  settings: HvsrInversionSettings
  patch: (p: Partial<HvsrInversionSettings>) => void
  onRun: () => void
  onCancel: () => void
  running: boolean
  progress: number
  disabled: boolean
  hasResult: boolean
  error: string | null
}) {
  const { d } = useI18n()
  const t = d.hvsr
  const help = useFieldHelp()
  return (
    <Panel title={t.inversionTitle}>
      <p className="mb-3 text-xs leading-relaxed text-gs-mist">{t.inversionSub}</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label={t.layerCount} value={settings.layerCount} onChange={(v) => patch({ layerCount: Math.round(v) })} step={1} help={help('hvsr.layers')} />
      </div>
      <details className="mt-3 rounded-lg border border-black/8 bg-gs-deep/45 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-gs-mist">{t.advanced}</summary>
        <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.advancedHint}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField label={t.initialSamples} value={settings.initialSamples} onChange={(v) => patch({ initialSamples: Math.round(v) })} step={50} />
          <NumberField label={t.bestCount} value={settings.bestCount} onChange={(v) => patch({ bestCount: Math.round(v) })} step={5} />
          <NumberField label={t.newSamples} value={settings.newSamples} onChange={(v) => patch({ newSamples: Math.round(v) })} step={20} />
          <NumberField label={t.iterations} value={settings.iterations} onChange={(v) => patch({ iterations: Math.round(v) })} step={1} help={help('hvsr.iterations')} />
          <NumberField label={t.invSeed} value={settings.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} />
        </div>
      </details>
      <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.inversionLayerNote}</p>
      {!hasResult && <p className="mt-2 text-xs text-gs-amber">{t.noInversion}</p>}
      {running ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gs-mist">
            <span>{t.running}</span>
            <span className="gs-number">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gs-deep">
            <div className="h-full rounded-full bg-gs-violet transition-[width]" style={{ width: `${Math.max(2, progress * 100)}%` }} />
          </div>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {t.cancelInversion}
          </Button>
        </div>
      ) : (
        <Button className="mt-3" onClick={onRun} disabled={disabled} title={!hasResult ? t.noInversion : undefined}>
          {t.runInversion}
        </Button>
      )}
      {error && <p className="mt-2 text-xs text-gs-danger">{error}</p>}
    </Panel>
  )
}
