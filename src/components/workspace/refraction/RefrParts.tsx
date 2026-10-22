import { useMemo } from 'react'
import type { Data, Layout } from 'plotly.js'
import { useI18n } from '../../../i18n'
import { fmt } from '../../../sim/core/format'
import type { FieldError } from '../../../sim/core/fieldError'
import type { RefrInput, RefrLayer, RefrResult, RefrSurvey } from '../../../sim/refraction/types'
import { Plot, type PlotlyModule } from '../../charts/Plot'
import { baseLayout, chartColors, MONO_FONT } from '../../charts/plotTheme'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { Stat } from '../../ui/Stat'
import { BODY_COLORS, SEISMIC_COLORSCALE } from '../profile'
import { LayersSectionSvg, velocityColor, type SectionLayer } from '../sections'
import { WiggleRecord, type WiggleAnnotation } from '../seismicDisplay'
import { WsErrorList, WsWarningList, useWsErrorFor } from '../common'

const ACCENT = '#252525'

export function RefrSurveyPanel({ survey, errors, errDict, patch }: { survey: RefrSurvey; errors: FieldError[]; errDict: Record<string, string>; patch: (p: Partial<RefrSurvey>) => void }) {
  const { d } = useI18n()
  const t = d.refr
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.surveyTitle}>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label={t.spread} unit="m" value={survey.spreadLength} onChange={(v) => patch({ spreadLength: v })} error={errFor('survey.spreadLength')} />
        <NumberField label={d.wshared.spacing} unit="m" value={survey.geophoneSpacing} onChange={(v) => patch({ geophoneSpacing: v })} error={errFor('survey.geophoneSpacing')} />
        <NumberField label={d.wshared.noise} unit="ms" value={survey.noiseMs} onChange={(v) => patch({ noiseMs: v })} error={errFor('survey.noiseMs')} />
        <NumberField label={d.wshared.seed} value={survey.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} />
        <NumberField label={t.freq} unit="Hz" value={survey.waveletFreqHz} onChange={(v) => patch({ waveletFreqHz: v })} error={errFor('survey.waveletFreqHz')} />
        <NumberField label={t.traceNoise} unit="%" value={survey.traceNoisePercent} onChange={(v) => patch({ traceNoisePercent: v })} error={errFor('survey.traceNoisePercent')} />
      </div>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function RefrLayersPanel({
  layers,
  errors,
  errDict,
  patch,
  add,
  remove,
}: {
  layers: RefrLayer[]
  errors: FieldError[]
  errDict: Record<string, string>
  patch: (id: string, key: string, value: number) => void
  add: () => void
  remove: (id: string) => void
}) {
  const { d } = useI18n()
  const t = d.refr
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.layersTitle} actions={<Button size="sm" variant="ghost" onClick={add}>{t.addLayer}</Button>}>
      <div className="space-y-3">
        {layers.map((layer, i) => {
          const isHalf = i === layers.length - 1
          return (
            <div key={layer.id} className="rounded-lg border border-gs-raised/70 bg-gs-deep/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="gs-number text-[10.5px] text-gs-mist">{isHalf ? t.halfSpace : `${t.layerN} ${i + 1}`}</span>
                {!isHalf && layers.length > 2 && (
                  <button type="button" onClick={() => remove(layer.id)} className="ml-auto text-[11px] text-gs-danger transition-colors hover:text-gs-danger/80">
                    {t.removeLayer}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberField compact label="Vp" unit="m/s" value={layer.vp} onChange={(v) => patch(layer.id, 'vp', v)} error={errFor(`layer.${i}.vp`)} />
                <NumberField compact label={t.thickness} unit="m" value={layer.thickness} onChange={(v) => patch(layer.id, 'thickness', v)} disabled={isHalf} error={errFor(`layer.${i}.thickness`)} />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export function RefrTravelTimePlot({ result, showGrid, showUnits, onReady, height = 320 }: { result: RefrResult; showGrid: boolean; showUnits: boolean; onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void; height?: number }) {
  const { d } = useI18n()
  const t = d.refr
  const { data, layout } = useMemo(() => {
    const series: Data[] = result.branches
      .filter((b) => b.timesMs.length > 0)
      .map((b) => {
        const direct = b.index === 0
        const color = direct ? ACCENT : BODY_COLORS[b.index % BODY_COLORS.length]
        return {
          x: result.x,
          y: b.timesMs,
          type: 'scatter',
          mode: 'lines',
          name: direct ? t.direct : `${t.refractor} ${b.index}`,
          line: { color, width: direct ? 2 : 1.4, dash: direct ? 'solid' : 'dash' },
          hovertemplate: `x %{x:.3g} m · t %{y:.2f} ms<extra>${direct ? t.direct : `${t.refractor} ${b.index}`}</extra>`,
        }
      })
    series.push({
      x: result.x,
      y: result.firstArrivalMs,
      type: 'scatter',
      mode: 'lines+markers',
      name: t.firstArrivals,
      line: { color: '#E85353', width: 0 },
      marker: { color: '#E85353', size: 5 },
      hovertemplate: `x %{x:.3g} m · t %{y:.2f} ms<extra>${t.firstArrivals}</extra>`,
    })
    const crossovers: Data[] = result.branches
      .filter((b) => b.crossoverM !== null)
      .map((b) => ({
        x: [b.crossoverM as number],
        y: [(b.interceptMs + ((b.crossoverM as number) / b.velocity) * 1000)],
        type: 'scatter',
        mode: 'markers',
        name: `x_c ${b.index}`,
        marker: { color: BODY_COLORS[b.index % BODY_COLORS.length], size: 9, symbol: 'diamond-open', line: { width: 2 } },
        hovertemplate: `x_c %{x:.2f} m · t %{y:.2f} ms<extra></extra>`,
      }))
    const lay = baseLayout({
      margin: { l: 60, r: 16, t: 10, b: 44 },
      showlegend: true,
      legend: { orientation: 'h', x: 0, y: 1.14, font: { size: 10.5 } },
      xaxis: { title: { text: `${t.distance}${showUnits ? ' [m]' : ''}` }, gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
      yaxis: { title: { text: `t${showUnits ? ' [ms]' : ''}` }, gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
      hovermode: 'x unified',
    }) as Partial<Layout>
    return { data: [...series, ...crossovers], layout: lay }
  }, [result, showGrid, showUnits, t])

  return <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
}

export function RefrModelPanel({ input, result, showRays }: { input: RefrInput; result: RefrResult | null; showRays: boolean }) {
  const { d } = useI18n()
  const t = d.refr
  const velocities = input.layers.map((l) => l.vp)
  const vMin = Math.min(...velocities)
  const vMax = Math.max(...velocities)
  const tops = useMemo(() => {
    const t: number[] = [0]
    for (let i = 0; i < input.layers.length - 1; i++) t.push(t[i] + Math.max(input.layers[i].thickness, 0))
    return t
  }, [input.layers])
  const total = tops[tops.length - 1]
  const dispDepth = Math.max(total * 1.3 + 2, 10)
  const shapes: SectionLayer[] = input.layers.map((l) => ({
    id: l.id,
    thickness: l.thickness,
    color: velocityColor(l.vp, vMin, vMax),
    label: `${fmt(l.vp, 0)} m/s`,
  }))

  const rays = useMemo(() => {
    if (!showRays || !result) return []
    const step = Math.max(1, Math.floor(result.x.length / 7))
    const out: Array<Array<[number, number]>> = []
    for (let r = step; r < result.x.length; r += step) {
      const b = result.firstArrivalBranch[r]
      if (b < 0) continue
      const x = result.x[r]
      if (b === 0) {
        out.push([[0, 0], [x, 0]])
        continue
      }
      const branch = result.branches[b]
      const k = branch.interfaceIndex
      if (k === null) continue
      const zk = tops[k + 1]
      if (!Number.isFinite(zk) || zk <= 0) continue
      const sinC = Math.min(input.layers[0].vp / branch.velocity, 0.98)
      const xd = zk * (sinC / Math.sqrt(1 - sinC * sinC))
      if (x - 2 * xd <= 0) {
        out.push([[0, 0], [x, 0]])
        continue
      }
      out.push([[0, 0], [xd, zk], [x - xd, zk], [x, 0]])
    }
    return out
  }, [input.layers, result, showRays, tops])

  return (
    <Panel title={t.crossTitle}>
      <LayersSectionSvg
        layers={shapes}
        lineLength={input.survey.spreadLength}
        displayDepth={dispDepth}
        accent={ACCENT}
        rays={rays}
        labels={{ distance: d.wshared.distance, depth: d.wshared.depth, surface: d.wshared.surface }}
      />
    </Panel>
  )
}

/** Red interpretation lines: the travel-time segment where each branch is first arrival. */
function branchAnnotations(result: RefrResult): WiggleAnnotation[] {
  const out: WiggleAnnotation[] = []
  for (const b of result.branches) {
    const times = result.branchTimesMs[b.index]
    if (!times) continue
    let run: Array<[number, number]> = []
    const flush = () => {
      if (run.length >= 2) out.push({ points: run })
      run = []
    }
    for (let i = 0; i < result.x.length; i++) {
      const tt = times[i]
      if (result.firstArrivalBranch[i] === b.index && Number.isFinite(tt)) run.push([result.x[i], tt])
      else flush()
    }
    flush()
  }
  return out
}

export function RefrSeismogramPanel({
  result,
  wiggle,
  balance,
  showGrid,
  showUnits,
  showPicks,
  onReady,
  onSvg,
  height = 430,
}: {
  result: RefrResult
  wiggle: boolean
  balance: boolean
  showGrid: boolean
  showUnits: boolean
  showPicks: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  onSvg?: (svg: SVGSVGElement) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.refr
  const s = result.seismogram

  const annotations = useMemo(() => branchAnnotations(result), [result])

  const plot = useMemo(() => {
    if (wiggle) return null
    const n = result.x.length
    const maxColumns = 260
    const stride = Math.max(1, Math.ceil(n / maxColumns))
    const dispIdx: number[] = []
    for (let i = 0; i < n; i += stride) dispIdx.push(i)
    const xDisp = dispIdx.map((i) => result.x[i])

    const pickData: Data | null = showPicks
      ? {
          x: result.x,
          y: result.firstArrivalMs,
          type: 'scatter',
          mode: 'markers',
          name: t.firstBreaks,
          marker: { color: '#E85353', size: 4.5, symbol: 'circle-open', line: { width: 1.6 } },
          hovertemplate: `x %{x:.3g} m · t %{y:.2f} ms<extra>${t.firstBreaks}</extra>`,
        }
      : null

    const z = s.tMs.map((_, sample) => dispIdx.map((i) => s.traces[i][sample]))
    const heat: Data = {
      x: xDisp,
      y: s.tMs,
      z,
      type: 'heatmap',
      colorscale: SEISMIC_COLORSCALE,
      zmin: -1,
      zmax: 1,
      colorbar: {
        thickness: 10,
        len: 0.9,
        tickfont: { family: MONO_FONT, size: 9.5, color: chartColors.mist },
        outlinewidth: 0,
      },
      hovertemplate: `x %{x:.3g} m · t %{y:.1f} ms · amp %{z:.3f}<extra></extra>`,
      name: t.seismogramTitle,
    }
    const lay = baseLayout({
      margin: { l: 56, r: 46, t: 10, b: 44 },
      showlegend: showPicks,
      legend: { orientation: 'h', x: 0, y: 1.12, font: { size: 10.5 } },
      xaxis: { title: { text: `${t.distance}${showUnits ? ' [m]' : ''}` }, gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
      yaxis: { title: { text: `TWT${showUnits ? ' [ms]' : ''}` }, autorange: 'reversed' as const, gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)', zeroline: false },
    }) as Partial<Layout>
    return { data: [heat, ...(pickData ? [pickData] : [])], layout: lay }
  }, [result, s, wiggle, showGrid, showUnits, showPicks, t])

  return (
    <div>
      {wiggle ? (
        <WiggleRecord
          positions={result.x}
          tMs={s.tMs}
          traces={s.traces}
          xTitle={`${t.distance}${showUnits ? ' [m]' : ''}`}
          yTitle={`TWT${showUnits ? ' [s]' : ''}`}
          timeScale="s"
          showGrid={showGrid}
          showPicks={showPicks}
          picksMs={result.firstArrivalMs}
          annotations={annotations}
          normalizePerTrace={balance}
          height={height}
          onSvg={onSvg}
        />
      ) : (
        plot && <Plot data={plot.data} layout={plot.layout} onReady={onReady} style={{ minHeight: height }} />
      )}
      <p className="mt-1 text-[10.5px] leading-relaxed text-gs-mist">{t.seismogramNote}</p>
    </div>
  )
}

export function RefrSummaryPanel({ result, errDict, input }: { result: RefrResult; errDict: Record<string, string>; input: RefrInput }) {
  const { d } = useI18n()
  const t = d.refr
  const dg = result.diagnostics
  const tops: number[] = [0]
  for (let i = 0; i < input.layers.length - 1; i++) tops.push(tops[i] + Math.max(input.layers[i].thickness, 0))
  return (
    <div className="space-y-5">
      <Panel title={t.summaryTitle}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={d.wshared.receivers} value={fmt(dg.nReceivers, 0)} />
          <Stat label={t.nRefracted} value={fmt(dg.nRefractedFirstArrivals, 0)} accent={ACCENT} />
          <Stat label={t.depthEstimate} value={dg.firstRefractorDepthM === null ? '—' : `${fmt(dg.firstRefractorDepthM, 1)} m`} />
          <Stat label={t.vDirect} value={fmt(dg.vDirectMps, 0)} unit="m/s" />
        </div>
      </Panel>
      <Panel title={t.branchesTitle}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gs-raised/70 text-[10px] uppercase tracking-wide text-gs-mist">
                <th className="py-1.5 pr-3 font-medium">{t.branch}</th>
                <th className="py-1.5 pr-3 font-medium">{t.interfaceDepth}</th>
                <th className="py-1.5 pr-3 font-medium">{t.velocity}</th>
                <th className="py-1.5 pr-3 font-medium">{t.intercept}</th>
                <th className="py-1.5 pr-3 font-medium">{t.critical}</th>
                <th className="py-1.5 font-medium">{t.crossover}</th>
              </tr>
            </thead>
            <tbody>
              {result.branches.map((b) => (
                <tr key={b.index} className="border-b border-gs-raised/40 text-[11.5px] text-gs-ice">
                  <td className="py-1.5 pr-3">{b.index === 0 ? t.direct : `${t.refractor} ${b.index}`}</td>
                  <td className="gs-number py-1.5 pr-3">{b.interfaceIndex === null ? '—' : `${fmt(tops[b.interfaceIndex + 1] ?? 0, 1)} m`}</td>
                  <td className="gs-number py-1.5 pr-3">{fmt(b.velocity, 0)} m/s</td>
                  <td className="gs-number py-1.5 pr-3">{Number.isFinite(b.interceptMs) ? `${fmt(b.interceptMs, 2)} ms` : '—'}</td>
                  <td className="gs-number py-1.5 pr-3">{b.index === 0 ? '—' : `${fmt(b.criticalAngleDeg, 1)}°`}</td>
                  <td className="gs-number py-1.5">{b.crossoverM === null ? '—' : `${fmt(b.crossoverM, 1)} m`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-gs-mist">{t.branchesNote}</p>
      </Panel>
      <WsWarningList warnings={dg.warnings} dict={errDict} />
    </div>
  )
}
