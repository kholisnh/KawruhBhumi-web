import { useMemo } from 'react'
import { useI18n } from '../../../i18n'
import { fmt } from '../../../sim/core/format'
import type { FieldError } from '../../../sim/core/fieldError'
import type { MagBody, MagBodyKind, MagInput, MagMap, MagResult, MagSurvey } from '../../../sim/magnetic/types'
import { Plot, type PlotlyModule } from '../../charts/Plot'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { SelectField } from '../../ui/SelectField'
import { Stat } from '../../ui/Stat'
import { anomalyMapFigure, BODY_COLORS, lineFigure, MAG_MAP_COLORSCALE } from '../profile'
import { AnomalySectionSvg, type AnomalyBodyShape } from '../sections'
import { WsErrorList, WsWarningList, useWsErrorFor } from '../common'

const ACCENT = '#60CBFF'

export function MagSurveyPanel({ survey, errors, errDict, patch }: { survey: MagSurvey; errors: FieldError[]; errDict: Record<string, string>; patch: (p: Partial<MagSurvey>) => void }) {
  const { d } = useI18n()
  const t = d.mag
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.surveyTitle}>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label={t.field} unit="nT" value={survey.fieldNT} onChange={(v) => patch({ fieldNT: v })} error={errFor('survey.fieldNT')} />
        <NumberField label={t.inclination} unit="°" value={survey.inclinationDeg} onChange={(v) => patch({ inclinationDeg: v })} error={errFor('survey.inclinationDeg')} />
        <NumberField label={d.wshared.lineLength} unit="m" value={survey.lineLength} onChange={(v) => patch({ lineLength: v })} error={errFor('survey.lineLength')} />
        <NumberField label={d.wshared.spacing} unit="m" value={survey.stationSpacing} onChange={(v) => patch({ stationSpacing: v })} error={errFor('survey.stationSpacing')} />
        <NumberField label={t.mapLines} value={survey.mapLines} onChange={(v) => patch({ mapLines: Math.round(v) })} step={1} error={errFor('survey.mapLines')} />
        <NumberField label={t.mapLineSpacing} unit="m" value={survey.mapLineSpacing} onChange={(v) => patch({ mapLineSpacing: v })} error={errFor('survey.mapLineSpacing')} />
        <NumberField label={d.wshared.noise} unit="nT" value={survey.noiseNT} onChange={(v) => patch({ noiseNT: v })} error={errFor('survey.noiseNT')} />
        <NumberField label={d.wshared.seed} value={survey.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} />
      </div>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function MagBodiesPanel({
  bodies,
  errors,
  errDict,
  patch,
  setKind,
  remove,
  add,
}: {
  bodies: MagBody[]
  errors: FieldError[]
  errDict: Record<string, string>
  patch: (id: string, key: string, value: number) => void
  setKind: (id: string, kind: MagBodyKind) => void
  remove: (id: string) => void
  add: () => void
}) {
  const { d } = useI18n()
  const t = d.mag
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.bodiesTitle} actions={<Button size="sm" variant="ghost" onClick={add}>{t.addBody}</Button>}>
      <div className="space-y-4">
        {bodies.map((body, i) => (
          <div key={body.id} className="rounded-lg border border-gs-raised/70 bg-gs-deep/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge soft color={BODY_COLORS[i % BODY_COLORS.length]}>
                {body.kind === 'dipole' ? t.kindSphere : t.kindPrism}
              </Badge>
              <span className="gs-number text-[10.5px] text-gs-mist">{body.id}</span>
              <button type="button" onClick={() => remove(body.id)} className="ml-auto text-[11px] text-gs-danger transition-colors hover:text-gs-danger/80">
                {t.removeBody}
              </button>
            </div>
            <SelectField
              label={t.kind}
              value={body.kind}
              onChange={(v) => setKind(body.id, v as MagBodyKind)}
              options={[
                { value: 'dipole', label: t.kindSphere },
                { value: 'prism', label: t.kindPrism },
              ]}
              compact
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              {body.kind === 'dipole' ? (
                <>
                  <NumberField compact label={t.posX} unit="m" value={body.x} onChange={(v) => patch(body.id, 'x', v)} error={errFor(`body.${i}.x`)} />
                  <NumberField compact label={t.posY} unit="m" value={body.y} onChange={(v) => patch(body.id, 'y', v)} error={errFor(`body.${i}.y`)} />
                  <NumberField compact label={t.depthZ} unit="m" value={body.z} onChange={(v) => patch(body.id, 'z', v)} error={errFor(`body.${i}.z`)} />
                  <NumberField compact label={t.radius} unit="m" value={body.radius} onChange={(v) => patch(body.id, 'radius', v)} error={errFor(`body.${i}.radius`)} />
                  <NumberField compact label={d.wshared.chi} value={body.chi} onChange={(v) => patch(body.id, 'chi', v)} error={errFor(`body.${i}.chi`)} />
                </>
              ) : (
                <>
                  <NumberField compact label={t.x1} unit="m" value={body.x1} onChange={(v) => patch(body.id, 'x1', v)} error={errFor(`body.${i}.x1`)} />
                  <NumberField compact label={t.x2} unit="m" value={body.x2} onChange={(v) => patch(body.id, 'x2', v)} error={errFor(`body.${i}.x2`)} />
                  <NumberField compact label={t.posY} unit="m" value={body.y} onChange={(v) => patch(body.id, 'y', v)} error={errFor(`body.${i}.y`)} />
                  <NumberField compact label={t.strikeLength} unit="m" value={body.strikeLength} onChange={(v) => patch(body.id, 'strikeLength', v)} error={errFor(`body.${i}.strikeLength`)} />
                  <NumberField compact label={t.z1} unit="m" value={body.z1} onChange={(v) => patch(body.id, 'z1', v)} error={errFor(`body.${i}.z1`)} />
                  <NumberField compact label={t.z2} unit="m" value={body.z2} onChange={(v) => patch(body.id, 'z2', v)} error={errFor(`body.${i}.z2`)} />
                  <NumberField compact label={d.wshared.chi} value={body.chi} onChange={(v) => patch(body.id, 'chi', v)} error={errFor(`body.${i}.chi`)} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function MagModelPanel({ input, dispDepth }: { input: MagInput; dispDepth: number }) {
  const { d } = useI18n()
  const anyOff = input.bodies.some((b) => (b.kind === 'dipole' ? Math.abs(b.y) > b.radius : Math.abs(b.y) > b.strikeLength / 2))
  const shapes: AnomalyBodyShape[] = input.bodies.map((b, i) => {
    const color = BODY_COLORS[i % BODY_COLORS.length]
    if (b.kind === 'dipole') {
      return { id: b.id, kind: 'ellipse', x: b.x, z: b.z, rx: b.radius, rz: b.radius, label: `χ=${b.chi}`, color, offscreen: Math.abs(b.y) > b.radius }
    }
    return { id: b.id, kind: 'rect', x1: b.x1, x2: b.x2, z1: b.z1, z2: b.z2, label: `χ=${b.chi}`, color, offscreen: Math.abs(b.y) > b.strikeLength / 2 }
  })
  return (
    <Panel title={d.mag.crossTitle}>
      <AnomalySectionSvg bodies={shapes} lineLength={input.survey.lineLength} displayDepth={dispDepth} accent={ACCENT} labels={{ distance: d.wshared.distance, depth: d.wshared.depth, surface: d.wshared.surface }} />
      {anyOff && <p className="mt-2 text-[10.5px] leading-relaxed text-gs-mist">{d.wshared.offPlane}</p>}
    </Panel>
  )
}

export function MagProfilePanel({
  result,
  showGrid,
  showUnits,
  showBodies,
  onReady,
  height = 320,
}: {
  result: MagResult
  showGrid: boolean
  showUnits: boolean
  showBodies: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.mag
  const { data, layout } = lineFigure(
    result.x,
    [
      { name: t.total, y: result.totalNT, color: ACCENT, width: 2, fillToZero: true },
      ...result.perBodyNT.map((y, i) => ({ name: result.bodies[i].id, y, color: BODY_COLORS[i % BODY_COLORS.length], width: 1.3, dash: 'dot' as const, opacity: showBodies ? 0.9 : 0 })),
    ],
    { xTitle: `${d.wshared.distance}${showUnits ? ' [m]' : ''}`, yTitle: `ΔT${showUnits ? ' [nT]' : ''}`, showGrid, hoverX: ' m', hoverY: ' nT' },
  )
  return <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
}

function mapPeak(map: MagMap): { x: number; y: number; value: number } | null {
  let best: { x: number; y: number; value: number } | null = null
  for (let j = 0; j < map.y.length; j++) {
    for (let i = 0; i < map.x.length; i++) {
      const v = map.valuesNT[j][i]
      if (!best || Math.abs(v) > Math.abs(best.value)) best = { x: map.x[i], y: map.y[j], value: v }
    }
  }
  return best
}

export function MagMapPanel({
  result,
  showGrid,
  showUnits,
  showStations,
  onReady,
  height = 360,
}: {
  result: MagResult
  showGrid: boolean
  showUnits: boolean
  showStations: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.mag
  const peak = useMemo(() => mapPeak(result.map), [result.map])
  const { data, layout } = useMemo(
    () =>
      anomalyMapFigure({
        x: result.map.x,
        y: result.map.y,
        values: result.map.valuesNT,
        colorscale: MAG_MAP_COLORSCALE,
        xTitle: `${d.wshared.distance}${showUnits ? ' [m]' : ''}`,
        yTitle: `${t.posY}${showUnits ? ' [m]' : ''}`,
        showGrid,
        showStations,
        peak,
        peakLabel: peak ? `${t.mapPeak} ${fmt(peak.value, 2)}${showUnits ? ' nT' : ''}` : '',
      }),
    [result.map, showGrid, showUnits, showStations, peak, d.wshared.distance, t.posY, t.mapPeak],
  )
  return (
    <div>
      <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
      <p className="mt-1 text-[10.5px] leading-relaxed text-gs-mist">{t.mapNote}</p>
    </div>
  )
}

export function MagSummaryPanel({ result, errDict, showUnits }: { result: MagResult; errDict: Record<string, string>; showUnits: boolean }) {
  const { d } = useI18n()
  const t = d.mag
  const dg = result.diagnostics
  return (
    <div className="space-y-5">
      <Panel title={t.summaryTitle}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label={d.wshared.stations} value={fmt(dg.nStations, 0)} />
          <Stat label="|ΔT| max" value={fmt(dg.maxAbsNT, 2)} unit={showUnits ? 'nT' : undefined} accent={ACCENT} />
          <Stat label={t.peakToPeak} value={fmt(dg.peakToPeakNT, 2)} unit={showUnits ? 'nT' : undefined} />
          <Stat label="RMS" value={fmt(dg.rmsNT, 3)} unit={showUnits ? 'nT' : undefined} />
          <Stat label={t.mapPeak} value={fmt(dg.mapMaxAbsNT, 2)} unit={showUnits ? 'nT' : undefined} />
        </div>
      </Panel>
      <Panel title={t.bodiesTable}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gs-raised/70 text-[10px] uppercase tracking-wide text-gs-mist">
                <th className="py-1.5 pr-3 font-medium">ID</th>
                <th className="py-1.5 pr-3 font-medium">{t.kind}</th>
                <th className="py-1.5 pr-3 font-medium">{d.wshared.chi}</th>
                <th className="py-1.5 pr-3 font-medium">{t.size}</th>
                <th className="py-1.5 pr-3 font-medium">{t.posXYZ}</th>
                <th className="py-1.5 font-medium">{t.moment}</th>
              </tr>
            </thead>
            <tbody>
              {result.bodies.map((b) => (
                <tr key={b.id} className="border-b border-gs-raised/40 text-[11.5px] text-gs-ice">
                  <td className="gs-number py-1.5 pr-3 text-gs-mist">{b.id}</td>
                  <td className="py-1.5 pr-3">{b.kind === 'dipole' ? t.kindSphere : t.kindPrism}</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.chi, 3)}</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.sizeValue, 1)} m³</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.x, 1)}, {fmt(b.y, 1)}, {fmt(b.z, 1)} m</td>
                  <td className="gs-number py-1.5">{fmt(b.momentAm2, 2)} A·m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-gs-mist">{t.momentNote}</p>
      </Panel>
      <WsWarningList warnings={dg.warnings} dict={errDict} />
    </div>
  )
}
