import { useI18n } from '../../../i18n'
import { useFieldHelp } from '../../../content/fieldHelp'
import { fillTemplate, fmt } from '../../../sim/core/format'
import type { GprResult } from '../../../sim/gpr/types'
import type { FieldError } from '../../../sim/gpr/validate'
import { Button } from '../../ui/Button'
import { NumberField } from '../../ui/NumberField'
import { RangeField } from '../../ui/RangeField'
import { SelectField } from '../../ui/SelectField'
import { Stat } from '../../ui/Stat'
import { Toggle } from '../../ui/Toggle'
import type { EmLayer, GprSurvey, GprTarget, TargetKind } from '../../../sim/gpr/types'
import type { ScenarioId } from '../../../sim/gpr/model'
import { chartColors } from '../../charts/plotTheme'

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

export function useErrorFor(errors: FieldError[]) {
  const { d } = useI18n()
  return (path: string): string | undefined => {
    const e = errors.find((x) => x.path === path)
    if (!e) return undefined
    const template = (d.ws.errors as Record<string, string>)[e.key] ?? e.key
    return fillTemplate(template, e.params ?? {})
  }
}

export function ErrorList({ errors }: { errors: FieldError[] }) {
  const { d } = useI18n()
  if (errors.length === 0) return null
  return (
    <div className="rounded-lg border border-gs-danger/40 bg-gs-danger/8 px-3 py-2">
      <p className="text-xs font-semibold text-gs-danger">
        {d.common.errorsTitle} ({errors.length})
      </p>
      <ul className="mt-1 space-y-0.5">
        {errors.slice(0, 6).map((e, i) => {
          const template = (d.ws.errors as Record<string, string>)[e.key] ?? e.key
          return (
            <li key={`${e.path}-${i}`} className="gs-number text-xs text-gs-danger/90">
              {e.path} — {fillTemplate(template, e.params ?? {})}
            </li>
          )
        })}
        {errors.length > 6 && <li className="text-xs text-gs-danger/80">…</li>}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Scenario selector                                                   */
/* ------------------------------------------------------------------ */

export function ScenarioSelect({ value, onChange }: { value: ScenarioId; onChange: (id: ScenarioId) => void }) {
  const { d } = useI18n()
  const s = d.ws.scenarios
  return (
    <SelectField
      label={d.ws.scenario}
      value={value}
      onChange={onChange}
      options={[
        { value: 'sandBedrock', label: s.sandBedrock },
        { value: 'buriedPipe', label: s.buriedPipe },
        { value: 'concreteRebar', label: s.concreteRebar },
        { value: 'voidAsphalt', label: s.voidAsphalt },
        { value: 'wetClay', label: s.wetClay },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Survey & acquisition                                                */
/* ------------------------------------------------------------------ */

interface SurveyPanelProps {
  survey: GprSurvey
  onPatch: (patch: Partial<GprSurvey>) => void
  errorFor: (path: string) => string | undefined
}

export function SurveyPanelFields({ survey, onPatch, errorFor }: SurveyPanelProps) {
  const { d } = useI18n()
  const help = useFieldHelp()
  const t = d.ws
  const autoWindow = survey.timeWindowNs === null
  return (
    <div className="space-y-3.5">
      <RangeField
        label={t.frequency}
        value={survey.frequencyMHz}
        onChange={(v) => onPatch({ frequencyMHz: v })}
        min={50}
        max={1500}
        step={10}
        unit="MHz"
        error={errorFor('survey.frequencyMHz')}
        help={help('gpr.frequency')}
      />
      <RangeField
        label={t.traceSpacing}
        value={survey.traceSpacing}
        onChange={(v) => onPatch({ traceSpacing: v })}
        min={0.05}
        max={1}
        step={0.01}
        unit="m"
        error={errorFor('survey.traceSpacing')}
        help={help('gpr.spacing')}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={t.lineLength}
          value={survey.lineLength}
          onChange={(v) => onPatch({ lineLength: v })}
          unit="m"
          error={errorFor('survey.lineLength')}
        />
        <NumberField
          label={t.seed}
          value={survey.seed}
          onChange={(v) => onPatch({ seed: Math.round(v) })}
          error={errorFor('survey.seed')}
        />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <NumberField
            label={t.timeWindow}
            value={survey.timeWindowNs ?? NaN}
            onChange={(v) => onPatch({ timeWindowNs: Number.isNaN(v) ? 2 : v })}
            unit="ns"
            disabled={autoWindow}
            error={autoWindow ? undefined : errorFor('survey.timeWindowNs')}
          />
        </div>
        <div className="pb-5">
          <Toggle
            label={t.timeWindowAuto}
            checked={autoWindow}
            onChange={(checked) => onPatch({ timeWindowNs: checked ? null : Math.max(20, (survey.lineLength / 150) * 1000) })}
          />
        </div>
      </div>
      <RangeField
        label={t.noiseLevel}
        value={survey.noisePercent}
        onChange={(v) => onPatch({ noisePercent: v })}
        min={0}
        max={30}
        step={0.5}
        unit="%"
        error={errorFor('survey.noisePercent')}
        help={help('gpr.noise')}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Layer editor                                                        */
/* ------------------------------------------------------------------ */

interface LayerEditorProps {
  layers: EmLayer[]
  onChange: (id: string, patch: Partial<EmLayer>) => void
  onAdd: () => void
  onRemove: (id: string) => void
  errorFor: (path: string) => string | undefined
}

export function LayerEditor({ layers, onChange, onAdd, onRemove, errorFor }: LayerEditorProps) {
  const { d } = useI18n()
  const t = d.ws
  return (
    <div>
      <div className="mb-2 grid grid-cols-[1.4rem_1fr_1fr_1fr_1.6rem] items-end gap-1.5 text-right text-xs font-semibold tracking-wide text-gs-mist uppercase">
        <span aria-hidden />
        <span>{t.thickness} [m]</span>
        <span>{t.epsR}</span>
        <span>
          {t.sigma} [mS/m]
        </span>
        <span aria-hidden />
      </div>
      <div className="space-y-1.5">
        {layers.map((layer, i) => {
          const isHalf = i === layers.length - 1
          return (
            <div key={layer.id} className="grid grid-cols-[1.4rem_1fr_1fr_1fr_1.6rem] items-start gap-1.5">
              <span className="gs-number pt-2 text-xs text-gs-mist" title={isHalf ? t.halfSpace : `${t.layer} ${i + 1}`}>
                L{i + 1}
              </span>
              <NumberField
                label={`${t.layer} ${i + 1} ${t.thickness}`}
                compact
                value={isHalf ? Infinity : layer.thickness}
                onChange={(v) => onChange(layer.id, { thickness: v })}
                disabled={isHalf}
                error={isHalf ? undefined : errorFor(`layer.${i}.thickness`)}
              />
              <NumberField
                label={`${t.layer} ${i + 1} εr`}
                compact
                value={layer.epsR}
                onChange={(v) => onChange(layer.id, { epsR: v })}
                error={errorFor(`layer.${i}.epsR`)}
              />
              <NumberField
                label={`${t.layer} ${i + 1} σ`}
                compact
                value={layer.sigma}
                onChange={(v) => onChange(layer.id, { sigma: v })}
                error={errorFor(`layer.${i}.sigma`)}
              />
              <button
                type="button"
                onClick={() => onRemove(layer.id)}
                disabled={isHalf || layers.length <= 2}
                className="mt-1.5 rounded-md px-1 py-1 text-gs-mist transition-colors hover:bg-gs-danger/10 hover:text-gs-danger disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`${t.removeLayer} L${i + 1}`}
                title={t.removeLayer}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 4h10M6 4V2.8A.8.8 0 0 1 6.8 2h2.4a.8.8 0 0 1 .8.8V4m-6 0 .5 9a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9L11 4" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
      {isHalfNote(layers.length) && (
        <p className="mt-1.5 text-xs text-gs-mist">
          L{layers.length} = {t.halfSpace}
        </p>
      )}
      <Button size="sm" variant="ghost" onClick={onAdd} className="mt-2">
        + {t.addLayer}
      </Button>
    </div>
  )
}

function isHalfNote(count: number): boolean {
  return count > 0
}

/* ------------------------------------------------------------------ */
/* Target editor                                                       */
/* ------------------------------------------------------------------ */

interface TargetEditorProps {
  targets: GprTarget[]
  onChange: (id: string, patch: Partial<GprTarget>) => void
  onAdd: () => void
  onRemove: (id: string) => void
  errorFor: (path: string) => string | undefined
}

export function TargetEditor({ targets, onChange, onAdd, onRemove, errorFor }: TargetEditorProps) {
  const { d } = useI18n()
  const t = d.ws
  return (
    <div className="space-y-3">
      {targets.map((target, i) => (
        <div key={target.id} className="rounded-xl border border-black/10 bg-gs-deep/60 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="gs-number text-xs font-semibold text-gs-amber">T{i + 1}</span>
            <button
              type="button"
              onClick={() => onRemove(target.id)}
              className="rounded-md px-1.5 py-0.5 text-xs text-gs-mist transition-colors hover:bg-gs-danger/10 hover:text-gs-danger"
            >
              {t.removeTarget}
            </button>
          </div>
          <div className="mb-2">
            <SelectField
              label={t.targetKind}
              compact
              value={target.kind}
              onChange={(kind) => onChange(target.id, { kind: kind as TargetKind })}
              options={[
                { value: 'point', label: t.point },
                { value: 'cylinder', label: t.cylinder },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberField
              label={`T${i + 1} ${t.targetX}`}
              compact
              value={target.x}
              onChange={(v) => onChange(target.id, { x: v })}
              unit="m"
              error={errorFor(`target.${i}.x`)}
            />
            <NumberField
              label={`T${i + 1} ${t.targetZ}`}
              compact
              value={target.z}
              onChange={(v) => onChange(target.id, { z: v })}
              unit="m"
              error={errorFor(`target.${i}.z`)}
            />
            <NumberField
              label={`T${i + 1} ${t.radius}`}
              compact
              value={target.radius}
              onChange={(v) => onChange(target.id, { radius: v })}
              unit="m"
              error={errorFor(`target.${i}.radius`)}
            />
            <NumberField
              label={`T${i + 1} εr`}
              compact
              value={target.epsR}
              onChange={(v) => onChange(target.id, { epsR: v })}
              error={errorFor(`target.${i}.epsR`)}
            />
            <NumberField
              label={`T${i + 1} σ`}
              compact
              value={target.sigma}
              onChange={(v) => onChange(target.id, { sigma: v })}
              error={errorFor(`target.${i}.sigma`)}
            />
            <div className="flex items-end pb-4">
              <span className="text-xs leading-tight text-gs-mist/80">{t.isMetal}: εr = 1e6</span>
            </div>
          </div>
        </div>
      ))}
      <Button size="sm" variant="ghost" onClick={onAdd}>
        + {t.addTarget}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Warnings                                                            */
/* ------------------------------------------------------------------ */

export function WarningsPanel({ result }: { result: GprResult | null }) {
  const { d } = useI18n()
  if (!result) return null
  const warnings = result.diagnostics.warnings
  if (warnings.length === 0) {
    return <p className="text-xs text-gs-mist">{d.ws.noWarnings}</p>
  }
  return (
    <ul className="space-y-2">
      {warnings.map((w, i) => {
        const template = (d.ws.warnings as Record<string, string>)[w.key] ?? w.key
        const isHigh = w.key === 'highAttenuation'
        return (
          <li key={`${w.key}-${i}`} className="flex gap-2 text-xs leading-relaxed text-gs-mist">
            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${isHigh ? 'bg-gs-danger' : 'bg-gs-amber'}`} aria-hidden />
            <span>{fillTemplate(template, w.params)}</span>
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Numerical summary                                                   */
/* ------------------------------------------------------------------ */

export function SummaryPanel({ result, showUnits }: { result: GprResult | null; showUnits: boolean }) {
  const { d } = useI18n()
  const t = d.ws
  if (!result) return null
  const diag = result.diagnostics
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        <Stat label={t.nTraces} value={diag.nTraces} unit={showUnits ? '' : undefined} />
        <Stat label={t.samples} value={diag.samples} />
        <Stat label={t.dt} value={fmt(diag.dtNs, 4)} unit="ns" />
        <Stat label={t.maxTWT} value={fmt(diag.timeWindowNs, 4)} unit="ns" />
        <Stat label="v̄" value={fmt(diag.vAvg / 1e9, 4)} unit="m/ns" />
        <Stat label="λ" value={fmt(diag.wavelengthM, 3)} unit="m" />
        <Stat label={t.resolution} value={fmt(diag.verticalResolutionM, 3)} unit="m" />
        <Stat label={t.skinDepth} value={fmt(diag.avgSkinDepthM, 3)} unit="m" accent={chartColors.amber} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/10">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-black/10 bg-gs-deep/80 text-xs tracking-wider text-gs-mist uppercase">
              <th className="px-3 py-1.5">{t.layer}</th>
              <th className="px-3 py-1.5">{t.thickness} [m]</th>
              <th className="px-3 py-1.5">{t.epsR}</th>
              <th className="px-3 py-1.5">{t.sigma} [mS/m]</th>
              <th className="px-3 py-1.5">v [m/ns]</th>
              <th className="px-3 py-1.5">α [Np/m]</th>
              <th className="px-3 py-1.5">{t.skinDepth} [m]</th>
            </tr>
          </thead>
          <tbody className="gs-number">
            {result.layers.map((l) => (
              <tr key={l.index} className="border-b border-black/8 text-gs-mist last:border-0">
                <td className="px-3 py-1.5 text-gs-ice">L{l.index + 1}</td>
                <td className="px-3 py-1.5">{l.thickness === Infinity ? '∞' : fmt(l.thickness, 3)}</td>
                <td className="px-3 py-1.5">{fmt(l.epsR, 3)}</td>
                <td className="px-3 py-1.5">{fmt(l.sigma, 3)}</td>
                <td className="px-3 py-1.5">{fmt(l.velocity / 1e9, 4)}</td>
                <td className="px-3 py-1.5">{fmt(l.alpha, 3)}</td>
                <td className="px-3 py-1.5">{fmt(l.skinDepth, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Picks table                                                         */
/* ------------------------------------------------------------------ */

export function PicksPanel({ result }: { result: GprResult | null }) {
  const { d } = useI18n()
  const t = d.ws
  if (!result) return null
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-black/10">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="border-b border-black/10 bg-gs-deep/80 text-xs tracking-wider text-gs-mist uppercase">
              <th className="px-3 py-1.5">{t.interface}</th>
              <th className="px-3 py-1.5">{t.twt} [ns]</th>
              <th className="px-3 py-1.5">{t.depthEst} [m]</th>
              <th className="px-3 py-1.5">{t.reflectionCoef}</th>
              <th className="px-3 py-1.5">{t.velocityAbove} [m/ns]</th>
            </tr>
          </thead>
          <tbody className="gs-number">
            {result.interfaces.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-center text-gs-mist/70">
                  —
                </td>
              </tr>
            )}
            {result.interfaces.map((itf) => (
              <tr key={itf.index} className="border-b border-black/8 text-gs-mist last:border-0">
                <td className="px-3 py-1.5 text-gs-ice">
                  {t.interface} {itf.index}
                </td>
                <td className="px-3 py-1.5">{fmt(itf.twtNs, 4)}</td>
                <td className="px-3 py-1.5">{fmt(itf.depthM, 3)}</td>
                <td className={`px-3 py-1.5 ${itf.reflectionCoef < 0 ? 'text-gs-amber' : 'text-gs-teal'}`}>{fmt(itf.reflectionCoef, 3)}</td>
                <td className="px-3 py-1.5">{fmt(itf.vAbove / 1e9, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.targets.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-gs-deep/80 text-xs tracking-wider text-gs-mist uppercase">
                <th className="px-3 py-1.5">{t.target}</th>
                <th className="px-3 py-1.5">x [m]</th>
                <th className="px-3 py-1.5">z [m]</th>
                <th className="px-3 py-1.5">{t.twt} [ns]</th>
                <th className="px-3 py-1.5">R</th>
                <th className="px-3 py-1.5">v_rms [m/ns]</th>
              </tr>
            </thead>
            <tbody className="gs-number">
              {result.targets.map((tg, i) => (
                <tr key={tg.id} className="border-b border-black/8 text-gs-mist last:border-0">
                  <td className="px-3 py-1.5 text-gs-amber">T{i + 1}</td>
                  <td className="px-3 py-1.5">{fmt(tg.x, 3)}</td>
                  <td className="px-3 py-1.5">{fmt(tg.z, 3)}</td>
                  <td className="px-3 py-1.5">{fmt(tg.apexTNs, 4)}</td>
                  <td className={`px-3 py-1.5 ${tg.reflectionCoef < 0 ? 'text-gs-amber' : 'text-gs-teal'}`}>{fmt(tg.reflectionCoef, 3)}</td>
                  <td className="px-3 py-1.5">{fmt(tg.vRms / 1e9, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs leading-relaxed text-gs-mist/85">{t.depthConversion}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pipeline stages (uses hub stage descriptions)                       */
/* ------------------------------------------------------------------ */

export function WorkspacePipeline() {
  const { d } = useI18n()
  const t = d.ws
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {(
        [
          ['model', d.hub.stages[0].d],
          ['solver', d.hub.stages[1].d],
          ['synthetic', d.hub.stages[2].d],
          ['interpret', d.hub.stages[3].d],
        ] as const
      ).map(([key, desc], i) => (
        <li key={key} className={`rounded-xl border px-3 py-2.5 ${i === 1 ? 'border-gs-cyan/50 bg-gs-cyan/8' : 'border-black/10 bg-gs-deep/60'}`}>
          <div className="flex items-center gap-2">
            <span className={`gs-number flex h-5 w-5 items-center justify-center rounded-md text-xs font-semibold ${i === 1 ? 'bg-gs-cyan text-gs-navy' : 'bg-black/5 text-gs-mist'}`}>
              {i + 1}
            </span>
            <span className={`text-xs font-semibold ${i === 1 ? 'text-gs-cyan' : 'text-gs-ice'}`}>{t.stages[key]}</span>
          </div>
          <p className="mt-1.5 text-xs leading-snug text-gs-mist">{desc}</p>
        </li>
      ))}
    </ol>
  )
}
