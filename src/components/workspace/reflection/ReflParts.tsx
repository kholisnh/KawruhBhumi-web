import { useMemo, useState } from 'react'
import { useI18n } from '../../../i18n'
import { useFieldHelp } from '../../../content/fieldHelp'
import { fmt } from '../../../sim/core/format'
import type { FieldError } from '../../../sim/core/fieldError'
import type { ReflInput, ReflLayer, ReflResult, ReflSurvey } from '../../../sim/reflection/types'
import { Plot, type PlotlyModule } from '../../charts/Plot'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { Stat } from '../../ui/Stat'
import { Toggle } from '../../ui/Toggle'
import { BODY_COLORS, gatherFigure, traceFigure } from '../profile'
import { LayersSectionSvg, velocityColor, type SectionLayer } from '../sections'
import { WiggleRecord } from '../seismicDisplay'
import { WsErrorList, WsWarningList, useWsErrorFor } from '../common'

const ACCENT = '#2E9FBF'

export function ReflSurveyPanel({ survey, errors, errDict, patch }: { survey: ReflSurvey; errors: FieldError[]; errDict: Record<string, string>; patch: (p: Partial<ReflSurvey>) => void }) {
  const { d } = useI18n()
  const help = useFieldHelp()
  const t = d.refl
  const errFor = useWsErrorFor(errors, errDict)
  const [autoWindow, setAutoWindow] = useState(survey.timeWindowMs === null)
  return (
    <Panel title={t.surveyTitle}>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label={t.freq} unit="Hz" value={survey.waveletFreqHz} onChange={(v) => patch({ waveletFreqHz: v })} error={errFor('survey.waveletFreqHz')} help={help('refl.frequency')} />
        <NumberField label={t.nOffsets} value={survey.nOffsets} onChange={(v) => patch({ nOffsets: Math.round(v) })} step={1} error={errFor('survey.nOffsets')} />
        <NumberField label={t.minOffset} unit="m" value={survey.minOffsetM} onChange={(v) => patch({ minOffsetM: v })} error={errFor('survey.minOffsetM')} />
        <NumberField label={t.maxOffset} unit="m" value={survey.maxOffsetM} onChange={(v) => patch({ maxOffsetM: v })} error={errFor('survey.maxOffsetM')} help={help('refl.spread')} />
        <NumberField label={d.wshared.noise} unit="%" value={survey.noisePercent} onChange={(v) => patch({ noisePercent: v })} error={errFor('survey.noisePercent')} />
        <NumberField label={d.wshared.seed} value={survey.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} />
      </div>
      <div className="mt-3">
        <Toggle
          label={t.autoWindow}
          checked={autoWindow}
          onChange={(on) => {
            setAutoWindow(on)
            patch({ timeWindowMs: on ? null : 500 })
          }}
        />
        {!autoWindow && (
          <div className="mt-2">
            <NumberField label={t.timeWindow} unit="ms" value={survey.timeWindowMs ?? 500} onChange={(v) => patch({ timeWindowMs: v })} error={errFor('survey.timeWindowMs')} />
          </div>
        )}
      </div>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function ReflLayersPanel({
  layers,
  errors,
  errDict,
  patch,
  add,
  remove,
}: {
  layers: ReflLayer[]
  errors: FieldError[]
  errDict: Record<string, string>
  patch: (id: string, key: string, value: number) => void
  add: () => void
  remove: (id: string) => void
}) {
  const { d } = useI18n()
  const t = d.refl
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.layersTitle} actions={<Button size="sm" variant="ghost" onClick={add}>{t.addLayer}</Button>}>
      <div className="space-y-3">
        {layers.map((layer, i) => {
          const isHalf = i === layers.length - 1
          return (
            <div key={layer.id} className="rounded-lg border border-gs-raised/70 bg-gs-deep/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="gs-number text-xs text-gs-mist">{isHalf ? t.halfSpace : `${t.layerN} ${i + 1}`}</span>
                {!isHalf && layers.length > 2 && (
                  <button type="button" onClick={() => remove(layer.id)} className="ml-auto text-xs text-gs-danger transition-colors hover:text-gs-danger/80">
                    {t.removeLayer}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <NumberField compact label="Vp" unit="m/s" value={layer.vp} onChange={(v) => patch(layer.id, 'vp', v)} error={errFor(`layer.${i}.vp`)} />
                <NumberField compact label="ρ" unit="kg/m³" value={layer.rho} onChange={(v) => patch(layer.id, 'rho', v)} error={errFor(`layer.${i}.rho`)} />
                <NumberField compact label={t.thickness} unit="m" value={layer.thickness} onChange={(v) => patch(layer.id, 'thickness', v)} disabled={isHalf} error={errFor(`layer.${i}.thickness`)} />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export function ReflTracePanel({ result, showGrid, showUnits, onReady, height = 300 }: { result: ReflResult; showGrid: boolean; showUnits: boolean; onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void; height?: number }) {
  const { d } = useI18n()
  const t = d.refl
  const { data, layout } = traceFigure(result.tMs, result.trace, {
    xTitle: t.amplitude,
    yTitle: `TWT${showUnits ? ' [ms]' : ''}`,
    showGrid,
    color: ACCENT,
  })
  return (
    <div>
      <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
      <p className="mt-1 text-xs text-gs-mist">{t.traceNote}</p>
    </div>
  )
}

export function ReflGatherPanel({
  result,
  wiggle,
  showGrid,
  showUnits,
  showNmo,
  onReady,
  onSvg,
  height = 430,
}: {
  result: ReflResult
  wiggle: boolean
  showGrid: boolean
  showUnits: boolean
  showNmo: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  onSvg?: (svg: SVGSVGElement) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.refl

  const annotations = useMemo(() => {
    if (!showNmo) return []
    const x0 = result.offsetsM[0]
    const x1 = result.offsetsM[result.offsetsM.length - 1]
    return result.picks.map((p) => {
      const points: Array<[number, number]> = []
      const nPts = 48
      for (let k = 0; k <= nPts; k++) {
        const x = x0 + ((x1 - x0) * k) / nPts
        points.push([x, Math.sqrt(p.twtMs * p.twtMs + ((x / p.vrms) * 1000) ** 2)])
      }
      return { points }
    })
  }, [result, showNmo])

  const plot = useMemo(() => {
    if (wiggle) return null
    const curves = showNmo
      ? result.picks.map((p, i) => ({ t0Ms: p.twtMs, vrms: p.vrms, color: BODY_COLORS[i % BODY_COLORS.length], name: `${t.interfaceN} ${p.index}` }))
      : []
    return gatherFigure(result.tMs, result.offsetsM, result.gather, curves, {
      xTitle: `${t.offset}${showUnits ? ' [m]' : ''}`,
      yTitle: `TWT${showUnits ? ' [ms]' : ''}`,
      showGrid,
      showUnits,
    })
  }, [result, wiggle, showNmo, showGrid, showUnits, t])

  if (wiggle) {
    return (
      <div>
        <WiggleRecord
          positions={result.offsetsM}
          tMs={result.tMs}
          traces={result.gather}
          xTitle={`${t.offset}${showUnits ? ' [m]' : ''}`}
          yTitle={`TWT${showUnits ? ' [ms]' : ''}`}
          timeScale="ms"
          showGrid={showGrid}
          annotations={annotations}
          height={height}
          onSvg={onSvg}
        />
        <p className="mt-1 text-xs leading-relaxed text-gs-mist">{t.gatherNote}</p>
      </div>
    )
  }

  return plot && <Plot data={plot.data} layout={plot.layout} onReady={onReady} style={{ minHeight: height }} />
}

export function ReflModelPanel({ input }: { input: ReflInput }) {
  const { d } = useI18n()
  const t = d.refl
  const velocities = input.layers.map((l) => l.vp)
  const vMin = Math.min(...velocities)
  const vMax = Math.max(...velocities)
  const total = input.layers.slice(0, -1).reduce((s, l) => s + Math.max(l.thickness, 0), 0)
  const dispDepth = Math.max(total * 1.15, 20)
  const shapes: SectionLayer[] = input.layers.map((l) => ({
    id: l.id,
    thickness: l.thickness,
    color: velocityColor(l.vp, vMin, vMax),
    label: `${fmt(l.vp, 0)} m/s · ρ ${fmt(l.rho, 0)}`,
  }))
  return (
    <Panel title={t.crossTitle}>
      <LayersSectionSvg layers={shapes} lineLength={Math.max(input.survey.maxOffsetM * 1.1, 100)} displayDepth={dispDepth} accent={ACCENT} labels={{ distance: d.wshared.distance, depth: d.wshared.depth, surface: d.wshared.surface }} />
    </Panel>
  )
}

export function ReflPicksPanel({ result, onExportCsv }: { result: ReflResult; onExportCsv: () => void }) {
  const { d } = useI18n()
  const t = d.refl
  return (
    <Panel title={t.picksTitle} actions={<Button size="sm" variant="ghost" onClick={onExportCsv}>{d.wshared.exportCsv}</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gs-raised/70 text-xs uppercase tracking-wide text-gs-mist">
              <th className="py-1.5 pr-3 font-medium">#</th>
              <th className="py-1.5 pr-3 font-medium">{t.depth}</th>
              <th className="py-1.5 pr-3 font-medium">TWT</th>
              <th className="py-1.5 pr-3 font-medium">{t.zAbove}</th>
              <th className="py-1.5 pr-3 font-medium">{t.zBelow}</th>
              <th className="py-1.5 pr-3 font-medium">R</th>
              <th className="py-1.5 pr-3 font-medium">{t.transmission}</th>
              <th className="py-1.5 pr-3 font-medium">{t.amplitude}</th>
              <th className="py-1.5 font-medium">Vrms</th>
            </tr>
          </thead>
          <tbody>
            {result.picks.map((p) => (
              <tr key={p.index} className="border-b border-gs-raised/40 text-xs text-gs-ice">
                <td className="gs-number py-1.5 pr-3 text-gs-mist">{p.index}</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.depthM, 1)} m</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.twtMs, 1)} ms</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.zAbove, 0)}</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.zBelow, 0)}</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.reflectionCoef, 3)}</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.transmission, 3)}</td>
                <td className="gs-number py-1.5 pr-3">{fmt(p.amplitude, 3)}</td>
                <td className="gs-number py-1.5">{fmt(p.vrms, 0)} m/s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.picksNote}</p>
    </Panel>
  )
}

export function ReflSummaryPanel({ result, errDict, showUnits }: { result: ReflResult; errDict: Record<string, string>; showUnits: boolean }) {
  const { d } = useI18n()
  const t = d.refl
  const dg = result.diagnostics
  return (
    <div className="space-y-5">
      <Panel title={t.diagTitle}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label={t.dt} value={fmt(dg.dtMs, 4)} unit={showUnits ? 'ms' : undefined} accent={ACCENT} />
          <Stat label={t.samples} value={fmt(dg.samples, 0)} />
          <Stat label={t.window} value={fmt(dg.timeWindowMs, 0)} unit={showUnits ? 'ms' : undefined} />
          <Stat label={t.vAvg} value={fmt(dg.vAvg, 0)} unit={showUnits ? 'm/s' : undefined} />
          <Stat label={t.wavelength} value={fmt(dg.wavelengthM, 1)} unit={showUnits ? 'm' : undefined} />
          <Stat label={t.resolution} value={fmt(dg.verticalResolutionM, 1)} unit={showUnits ? 'm' : undefined} />
        </div>
      </Panel>
      <WsWarningList warnings={dg.warnings} dict={errDict} />
    </div>
  )
}
