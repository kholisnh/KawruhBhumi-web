import { useMemo } from 'react'
import { useI18n } from '../../../i18n'
import { useFieldHelp } from '../../../content/fieldHelp'
import { fmt } from '../../../sim/core/format'
import type { FieldError } from '../../../sim/core/fieldError'
import type { GrvBody, GrvInput, GrvMap, GrvResult, GrvSurvey } from '../../../sim/gravity/types'
import { Plot, type PlotlyModule } from '../../charts/Plot'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { SelectField } from '../../ui/SelectField'
import { Stat } from '../../ui/Stat'
import { anomalyMapFigure, BODY_COLORS, GRV_MAP_COLORSCALE, lineFigure } from '../profile'
import { AnomalySectionSvg, type AnomalyBodyShape } from '../sections'
import { WsErrorList, WsWarningList, useWsErrorFor } from '../common'

const ACCENT = '#E85353'

export function GrvSurveyPanel({ survey, errors, errDict, patch }: { survey: GrvSurvey; errors: FieldError[]; errDict: Record<string, string>; patch: (p: Partial<GrvSurvey>) => void }) {
  const { d } = useI18n()
  const help = useFieldHelp()
  const t = d.grv
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.surveyTitle}>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label={d.wshared.lineLength} unit="m" value={survey.lineLength} onChange={(v) => patch({ lineLength: v })} error={errFor('survey.lineLength')} />
        <NumberField label={d.wshared.spacing} unit="m" value={survey.stationSpacing} onChange={(v) => patch({ stationSpacing: v })} error={errFor('survey.stationSpacing')} help={help('grv.depth')} />
        <NumberField label={t.mapLines} value={survey.mapLines} onChange={(v) => patch({ mapLines: Math.round(v) })} step={1} error={errFor('survey.mapLines')} />
        <NumberField label={t.mapLineSpacing} unit="m" value={survey.mapLineSpacing} onChange={(v) => patch({ mapLineSpacing: v })} error={errFor('survey.mapLineSpacing')} />
        <NumberField label={d.wshared.noise} unit="mGal" value={survey.noiseMGal} onChange={(v) => patch({ noiseMGal: v })} error={errFor('survey.noiseMGal')} />
        <NumberField label={d.wshared.seed} value={survey.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} />
      </div>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function GrvBodiesPanel({
  bodies,
  errors,
  errDict,
  patch,
  setKind,
  remove,
  add,
}: {
  bodies: GrvBody[]
  errors: FieldError[]
  errDict: Record<string, string>
  patch: (id: string, key: string, value: number) => void
  setKind: (id: string, kind: GrvBody['kind']) => void
  remove: (id: string) => void
  add: () => void
}) {
  const { d } = useI18n()
  const t = d.grv
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.bodiesTitle} actions={<Button size="sm" variant="ghost" onClick={add}>{t.addBody}</Button>}>
      <div className="space-y-4">
        {bodies.map((body, i) => (
          <div key={body.id} className="rounded-lg border border-gs-raised/70 bg-gs-deep/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge soft color={BODY_COLORS[i % BODY_COLORS.length]}>
                {body.kind === 'sphere' ? t.kindSphere : t.kindPrism}
              </Badge>
              <span className="gs-number text-xs text-gs-mist">{body.id}</span>
              <button type="button" onClick={() => remove(body.id)} className="ml-auto text-xs text-gs-danger transition-colors hover:text-gs-danger/80">
                {t.removeBody}
              </button>
            </div>
            <SelectField
              label={t.kind}
              value={body.kind}
              onChange={(v) => setKind(body.id, v as GrvBody['kind'])}
              options={[
                { value: 'sphere', label: t.kindSphere },
                { value: 'prism', label: t.kindPrism },
              ]}
              compact
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              {body.kind === 'sphere' ? (
                <>
                  <NumberField compact label={t.posX} unit="m" value={body.x} onChange={(v) => patch(body.id, 'x', v)} error={errFor(`body.${i}.x`)} />
                  <NumberField compact label={t.posY} unit="m" value={body.y} onChange={(v) => patch(body.id, 'y', v)} error={errFor(`body.${i}.y`)} />
                  <NumberField compact label={t.depthZ} unit="m" value={body.z} onChange={(v) => patch(body.id, 'z', v)} error={errFor(`body.${i}.z`)} />
                  <NumberField compact label={t.radius} unit="m" value={body.radius} onChange={(v) => patch(body.id, 'radius', v)} error={errFor(`body.${i}.radius`)} />
                  <NumberField compact label={t.deltaRho} unit="kg/m³" value={body.deltaRho} onChange={(v) => patch(body.id, 'deltaRho', v)} error={errFor(`body.${i}.deltaRho`)} />
                </>
              ) : (
                <>
                  <NumberField compact label={t.x1} unit="m" value={body.x1} onChange={(v) => patch(body.id, 'x1', v)} error={errFor(`body.${i}.x1`)} />
                  <NumberField compact label={t.x2} unit="m" value={body.x2} onChange={(v) => patch(body.id, 'x2', v)} error={errFor(`body.${i}.x2`)} />
                  <NumberField compact label={t.posY} unit="m" value={body.y} onChange={(v) => patch(body.id, 'y', v)} error={errFor(`body.${i}.y`)} />
                  <NumberField compact label={t.strikeLength} unit="m" value={body.strikeLength} onChange={(v) => patch(body.id, 'strikeLength', v)} error={errFor(`body.${i}.strikeLength`)} />
                  <NumberField compact label={t.z1} unit="m" value={body.z1} onChange={(v) => patch(body.id, 'z1', v)} error={errFor(`body.${i}.z1`)} />
                  <NumberField compact label={t.z2} unit="m" value={body.z2} onChange={(v) => patch(body.id, 'z2', v)} error={errFor(`body.${i}.z2`)} />
                  <NumberField compact label={t.deltaRho} unit="kg/m³" value={body.deltaRho} onChange={(v) => patch(body.id, 'deltaRho', v)} error={errFor(`body.${i}.deltaRho`)} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function GrvModelPanel({ input, dispDepth }: { input: GrvInput; dispDepth: number }) {
  const { d } = useI18n()
  const anyOff = input.bodies.some((b) => (b.kind === 'sphere' ? Math.abs(b.y) > b.radius : Math.abs(b.y) > b.strikeLength / 2))
  const shapes: AnomalyBodyShape[] = input.bodies.map((b) => {
    const color = b.deltaRho >= 0 ? '#E85353' : '#252525'
    if (b.kind === 'sphere') return { id: b.id, kind: 'ellipse', x: b.x, z: b.z, rx: b.radius, rz: b.radius, label: `Δρ=${b.deltaRho}`, color, offscreen: Math.abs(b.y) > b.radius }
    return { id: b.id, kind: 'rect', x1: b.x1, x2: b.x2, z1: b.z1, z2: b.z2, label: `Δρ=${b.deltaRho}`, color, offscreen: Math.abs(b.y) > b.strikeLength / 2 }
  })
  return (
    <Panel title={d.grv.crossTitle}>
      <AnomalySectionSvg bodies={shapes} lineLength={input.survey.lineLength} displayDepth={dispDepth} accent={'#E85353'} labels={{ distance: d.wshared.distance, depth: d.wshared.depth, surface: d.wshared.surface }} />
      <p className="mt-2 text-xs text-gs-mist">
        <span className="text-gs-amber">■</span> Δρ &gt; 0 · <span className="text-gs-blue">■</span> Δρ &lt; 0
      </p>
      {anyOff && <p className="mt-1 text-xs leading-relaxed text-gs-mist">{d.wshared.offPlane}</p>}
    </Panel>
  )
}

export function GrvProfilePanel({
  result,
  showGrid,
  showUnits,
  showBodies,
  onReady,
  height = 320,
}: {
  result: GrvResult
  showGrid: boolean
  showUnits: boolean
  showBodies: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.grv
  const { data, layout } = lineFigure(
    result.x,
    [
      { name: t.total, y: result.gMGal, color: ACCENT, width: 2, fillToZero: true },
      ...result.perBodyMGal.map((y, i) => ({ name: result.bodies[i].id, y, color: BODY_COLORS[i % BODY_COLORS.length], width: 1.3, dash: 'dot' as const, opacity: showBodies ? 0.9 : 0 })),
    ],
    { xTitle: `${d.wshared.distance}${showUnits ? ' [m]' : ''}`, yTitle: `g${showUnits ? ' [mGal]' : ''}`, showGrid, hoverX: ' m', hoverY: ' mGal' },
  )
  return <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
}

function mapPeak(map: GrvMap): { x: number; y: number; value: number } | null {
  let best: { x: number; y: number; value: number } | null = null
  for (let j = 0; j < map.y.length; j++) {
    for (let i = 0; i < map.x.length; i++) {
      const v = map.valuesMGal[j][i]
      if (!best || Math.abs(v) > Math.abs(best.value)) best = { x: map.x[i], y: map.y[j], value: v }
    }
  }
  return best
}

export function GrvMapPanel({
  result,
  showGrid,
  showUnits,
  showStations,
  onReady,
  height = 360,
}: {
  result: GrvResult
  showGrid: boolean
  showUnits: boolean
  showStations: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.grv
  const peak = useMemo(() => mapPeak(result.map), [result.map])
  const { data, layout } = useMemo(
    () =>
      anomalyMapFigure({
        x: result.map.x,
        y: result.map.y,
        values: result.map.valuesMGal,
        colorscale: GRV_MAP_COLORSCALE,
        xTitle: `${d.wshared.distance}${showUnits ? ' [m]' : ''}`,
        yTitle: `${t.posY}${showUnits ? ' [m]' : ''}`,
        showGrid,
        showStations,
        peak,
        peakLabel: peak ? `${t.mapPeak} ${fmt(peak.value, 3)}${showUnits ? ' mGal' : ''}` : '',
      }),
    [result.map, showGrid, showUnits, showStations, peak, d.wshared.distance, t.posY, t.mapPeak],
  )
  return (
    <div>
      <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
      <p className="mt-1 text-xs leading-relaxed text-gs-mist">{t.mapNote}</p>
    </div>
  )
}

export function GrvSummaryPanel({ result, errDict, showUnits }: { result: GrvResult; errDict: Record<string, string>; showUnits: boolean }) {
  const { d } = useI18n()
  const t = d.grv
  const dg = result.diagnostics
  return (
    <div className="space-y-5">
      <Panel title={t.summaryTitle}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label={d.wshared.stations} value={fmt(dg.nStations, 0)} />
          <Stat label="|g| max" value={fmt(dg.maxAbsMGal, 3)} unit={showUnits ? 'mGal' : undefined} accent={ACCENT} />
          <Stat label={t.peakToPeak} value={fmt(dg.peakToPeakMGal, 3)} unit={showUnits ? 'mGal' : undefined} />
          <Stat label="RMS" value={fmt(dg.rmsMGal, 4)} unit={showUnits ? 'mGal' : undefined} />
          <Stat label={t.mapPeak} value={fmt(dg.mapMaxAbsMGal, 3)} unit={showUnits ? 'mGal' : undefined} />
        </div>
      </Panel>
      <Panel title={t.bodiesTable}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gs-raised/70 text-xs uppercase tracking-wide text-gs-mist">
                <th className="py-1.5 pr-3 font-medium">ID</th>
                <th className="py-1.5 pr-3 font-medium">{t.kind}</th>
                <th className="py-1.5 pr-3 font-medium">{t.deltaRho}</th>
                <th className="py-1.5 pr-3 font-medium">{t.size}</th>
                <th className="py-1.5 pr-3 font-medium">{t.posXYZ}</th>
                <th className="py-1.5 pr-3 font-medium">{t.excessMass}</th>
                <th className="py-1.5 font-medium">{t.peak}</th>
              </tr>
            </thead>
            <tbody>
              {result.bodies.map((b) => (
                <tr key={b.id} className="border-b border-gs-raised/40 text-xs text-gs-ice">
                  <td className="gs-number py-1.5 pr-3 text-gs-mist">{b.id}</td>
                  <td className="py-1.5 pr-3">{b.kind === 'sphere' ? t.kindSphere : t.kindPrism}</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.deltaRho, 0)}</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.sizeValue, 1)} m³</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.x, 1)}, {fmt(b.y, 1)}, {fmt(b.z, 1)} m</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.excessMassKg, 3)} kg</td>
                  <td className="gs-number py-1.5">{fmt(b.peakMGal, 3)} mGal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <WsWarningList warnings={dg.warnings} dict={errDict} />
    </div>
  )
}
