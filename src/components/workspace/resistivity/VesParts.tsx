import { useMemo } from 'react'
import type { Data, Layout } from 'plotly.js'
import { useI18n } from '../../../i18n'
import { useFieldHelp } from '../../../content/fieldHelp'
import { fmt } from '../../../sim/core/format'
import type { FieldError } from '../../../sim/core/fieldError'
import type { VesInput, VesLayerInput, VesResult, VesSurvey } from '../../../sim/resistivity/model'
import { vesTotalDepth } from '../../../sim/resistivity/model'
import type { VesArrayType } from '../../../sim/resistivity/types'
import { VES_LIMITS } from '../../../sim/resistivity/validation'
import { Plot, type PlotlyModule } from '../../charts/Plot'
import { baseLayout, chartColors } from '../../charts/plotTheme'
import { AdvancedSection } from '../../ui/AdvancedSection'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { SelectField } from '../../ui/SelectField'
import { Stat } from '../../ui/Stat'
import { WsErrorList, useWsErrorFor } from '../common'

const ACCENT = '#B23A3A'

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Blue (conductive) → red (resistive) pastel fill from log-resistivity. */
export function rhoFill(rho: number): string {
  const t = clamp01((Math.log10(Math.max(rho, 0.1)) + 1) / 5)
  const hue = 220 - 212 * t
  return `hsl(${hue.toFixed(0)} 58% 82%)`
}

export function VesSurveyPanel({
  survey,
  array,
  errors,
  errDict,
  patch,
  setArray,
}: {
  survey: VesSurvey
  array: VesArrayType
  errors: FieldError[]
  errDict: Record<string, string>
  patch: (p: Partial<VesSurvey>) => void
  setArray: (value: VesArrayType) => void
}) {
  const { d } = useI18n()
  const help = useFieldHelp()
  const t = d.ves
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.surveyTitle}>
      <SelectField
        label={t.array}
        value={array}
        onChange={setArray}
        help={help('ves.array')}
        options={[
          { value: 'wenner', label: t.arrayWenner },
          { value: 'schlumberger', label: t.arraySchlumberger },
        ]}
      />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField label={t.spacingMin} unit="m" value={survey.spacingMinM} onChange={(v) => patch({ spacingMinM: v })} error={errFor('survey.spacingMinM')} />
        <NumberField label={t.spacingMax} unit="m" value={survey.spacingMaxM} onChange={(v) => patch({ spacingMaxM: v })} error={errFor('survey.spacingMaxM')} help={help('ves.spacing')} />
        <NumberField label={t.spacingCount} value={survey.spacingCount} onChange={(v) => patch({ spacingCount: Math.round(v) })} step={1} error={errFor('survey.spacingCount')} />
      </div>
      <AdvancedSection title={d.wshared.advancedSettings} hint={d.wshared.advancedHint}>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={t.mnHalf}
            unit="m"
            value={survey.mnHalfM}
            onChange={(v) => patch({ mnHalfM: v })}
            disabled={array === 'wenner'}
            error={errFor('survey.mnHalfM')}
          />
          <NumberField label={t.noise} unit="%" value={survey.noisePercent} onChange={(v) => patch({ noisePercent: v })} error={errFor('survey.noisePercent')} />
          <NumberField label={d.wshared.seed} value={survey.seed} onChange={(v) => patch({ seed: Math.round(v) })} step={1} />
        </div>
      </AdvancedSection>
      <p className="mt-1 text-xs leading-relaxed text-gs-mist">{array === 'wenner' ? t.wennerNote : t.schlumbergerNote}</p>
      <WsErrorList errors={errors} dict={errDict} />
    </Panel>
  )
}

export function VesLayersPanel({
  layers,
  errors,
  errDict,
  patch,
  add,
  remove,
}: {
  layers: VesLayerInput[]
  errors: FieldError[]
  errDict: Record<string, string>
  patch: (id: string, key: 'resistivityOhmM' | 'thicknessM', value: number) => void
  add: () => void
  remove: (id: string) => void
}) {
  const { d } = useI18n()
  const t = d.ves
  const errFor = useWsErrorFor(errors, errDict)
  return (
    <Panel title={t.layersTitle} actions={layers.length < VES_LIMITS.maxLayers ? <Button size="sm" variant="ghost" onClick={add}>{t.addLayer}</Button> : undefined}>
      <div className="space-y-3">
        {layers.map((layer, i) => {
          const isHalf = i === layers.length - 1
          return (
            <div key={layer.id} className="rounded-lg border border-gs-raised/70 bg-gs-deep/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: rhoFill(layer.resistivityOhmM) }} aria-hidden />
                <span className="gs-number text-xs text-gs-mist">{isHalf ? t.halfSpace : `${t.layerN} ${i + 1}`}</span>
                {!isHalf && layers.length > VES_LIMITS.minLayers && (
                  <button type="button" onClick={() => remove(layer.id)} className="ml-auto inline-flex min-h-11 items-center px-2 text-xs text-gs-danger transition-colors hover:underline">
                    {t.removeLayer}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberField compact label="ρ" unit="Ω·m" value={layer.resistivityOhmM} onChange={(v) => patch(layer.id, 'resistivityOhmM', v)} error={errFor(`layer.${i}.resistivityOhmM`)} />
                <NumberField
                  compact
                  label={t.thickness}
                  unit="m"
                  value={layer.thicknessM ?? 0}
                  onChange={(v) => patch(layer.id, 'thicknessM', v)}
                  disabled={isHalf}
                  error={errFor(`layer.${i}.thicknessM`)}
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

export function VesCurvePlot({
  result,
  showGrid,
  showUnits,
  onReady,
  height = 380,
}: {
  result: VesResult
  showGrid: boolean
  showUnits: boolean
  onReady?: (el: HTMLDivElement, plotly: PlotlyModule) => void
  height?: number
}) {
  const { d } = useI18n()
  const t = d.ves
  const { data, layout } = useMemo(() => {
    const traces: Data[] = [
      {
        x: result.spacingsM,
        y: result.cleanOhmM,
        type: 'scatter',
        mode: 'lines',
        name: t.cleanCurve,
        line: { color: ACCENT, width: 2.2 },
        hovertemplate: `%{x:.3g} m · %{y:.3g} Ω·m<extra>${t.cleanCurve}</extra>`,
      },
      {
        x: result.spacingsM,
        y: result.observedOhmM,
        type: 'scatter',
        mode: 'markers',
        name: t.observed,
        marker: { color: '#252525', size: 5.5, symbol: 'circle-open', line: { width: 1.6 } },
        hovertemplate: `%{x:.3g} m · %{y:.3g} Ω·m<extra>${t.observed}</extra>`,
      },
    ]
    const lay = baseLayout({
      margin: { l: 68, r: 16, t: 10, b: 46 },
      showlegend: true,
      legend: { orientation: 'h', x: 0, y: 1.12, font: { size: 10.5 } },
      xaxis: {
        title: { text: `${t.spacingAxis}${showUnits ? ' [m]' : ''}` },
        type: 'log',
        gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)',
        zeroline: false,
      },
      yaxis: {
        title: { text: `${t.rhoAxis}${showUnits ? ' [Ω·m]' : ''}` },
        type: 'log',
        gridcolor: showGrid ? chartColors.grid : 'rgba(0,0,0,0)',
        zeroline: false,
      },
      hovermode: 'closest',
    }) as Partial<Layout>
    return { data: traces, layout: lay }
  }, [result, showGrid, showUnits, t])

  return <Plot data={data} layout={layout} onReady={onReady} style={{ minHeight: height }} />
}

export function VesModelSvg({ input, height = 330 }: { input: VesInput; height?: number }) {
  const { d } = useI18n()
  const t = d.ves
  const G = { left: 64, top: 92, right: 44, bottom: 34 }
  const W = 1000
  const H = 380
  const plotW = W - G.left - G.right
  const plotH = H - G.top - G.bottom
  const total = vesTotalDepth(input.layers)
  const displayDepth = Math.max(total * 1.3, 5)
  const tops = useMemo(() => {
    const out: number[] = [0]
    for (let i = 0; i < input.layers.length - 1; i++) out.push(out[i] + Math.max(input.layers[i].thicknessM ?? 0, 0))
    return out
  }, [input.layers])
  const yScale = (z: number) => G.top + (z / displayDepth) * plotH

  const cx = G.left + plotW / 2
  const electrodes =
    input.array === 'wenner'
      ? [
          { label: 'A', x: cx - 90 },
          { label: 'M', x: cx - 30 },
          { label: 'N', x: cx + 30 },
          { label: 'B', x: cx + 90 },
        ]
      : [
          { label: 'A', x: cx - 210 },
          { label: 'M', x: cx - 34 },
          { label: 'N', x: cx + 34 },
          { label: 'B', x: cx + 210 },
        ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label={t.modelTitle}>
      <text x={G.left} y={20} fontSize={12} fontFamily="JetBrains Mono, monospace" fill={chartColors.mist}>
        {t.modelTitle}
      </text>

      {electrodes.map((el, i) => {
        const isCurrent = el.label === 'A' || el.label === 'B'
        return (
          <g key={el.label}>
            <line x1={el.x} y1={58} x2={el.x} y2={G.top} stroke={isCurrent ? ACCENT : '#252525'} strokeWidth={isCurrent ? 2 : 1.4} />
            <rect x={el.x - 5} y={54} width={10} height={8} rx={1.5} fill={isCurrent ? ACCENT : '#252525'} />
            <text x={el.x} y={48} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={isCurrent ? ACCENT : '#252525'}>
              {el.label}
            </text>
            <text x={el.x} y={76} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={chartColors.mist}>
              {i < 2 ? (input.array === 'wenner' ? 'I' : i === 0 ? 'I' : 'V') : input.array === 'wenner' ? 'V' : i === 2 ? 'V' : 'I'}
            </text>
          </g>
        )
      })}

      <path
        d={`M ${electrodes[0].x} ${G.top} Q ${cx} ${G.top + plotH * 0.45} ${electrodes[3].x} ${G.top}`}
        fill="none"
        stroke={ACCENT}
        strokeOpacity={0.28}
        strokeWidth={1.6}
        strokeDasharray="5 5"
      />
      <path
        d={`M ${electrodes[0].x} ${G.top} Q ${cx} ${G.top + plotH * 0.72} ${electrodes[3].x} ${G.top}`}
        fill="none"
        stroke={ACCENT}
        strokeOpacity={0.18}
        strokeWidth={1.4}
        strokeDasharray="3 6"
      />

      {input.layers.map((layer, i) => {
        const top = tops[i]
        const isHalf = i === input.layers.length - 1
        const bottom = isHalf ? displayDepth : Math.min(tops[i + 1] ?? displayDepth, displayDepth)
        if (top >= displayDepth) return null
        const y = yScale(top)
        const h = yScale(bottom) - y
        return (
          <g key={layer.id}>
            <rect x={G.left} y={y} width={plotW} height={Math.max(h, 0)} fill={rhoFill(layer.resistivityOhmM)} stroke="rgba(37,37,37,0.18)" strokeWidth={0.8} />
            {h > 26 && (
              <text x={G.left + 10} y={y + 16} fontSize={12} fontFamily="JetBrains Mono, monospace" fill="#252525">
                {fmt(layer.resistivityOhmM, 3)} Ω·m
              </text>
            )}
            {!isHalf && (
              <text x={G.left + plotW - 10} y={yScale(bottom) - 6} textAnchor="end" fontSize={12} fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.65)">
                z = {fmt(bottom, 2)} m
              </text>
            )}
          </g>
        )
      })}

      <line x1={G.left} y1={G.top} x2={G.left + plotW} y2={G.top} stroke="#252525" strokeWidth={1.8} />
      <line x1={G.left} y1={G.top} x2={G.left} y2={G.top + plotH} stroke="rgba(37,37,37,0.35)" strokeWidth={1} />
      <text x={G.left - 8} y={G.top + plotH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={chartColors.mist} transform={`rotate(-90 ${G.left - 8} ${G.top + plotH / 2})`}>
        {d.wshared.depth} [m]
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={G.left - 4} y1={yScale(f * displayDepth)} x2={G.left} y2={yScale(f * displayDepth)} stroke="rgba(37,37,37,0.35)" />
          <text x={G.left - 8} y={yScale(f * displayDepth) + 3} textAnchor="end" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={chartColors.mist}>
            {Number((f * displayDepth).toFixed(1))}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function VesSummaryPanel({ result, input }: { result: VesResult; input: VesInput }) {
  const { d } = useI18n()
  const t = d.ves
  const tops = useMemo(() => {
    const out: number[] = [0]
    for (let i = 0; i < input.layers.length - 1; i++) out.push(out[i] + Math.max(input.layers[i].thicknessM ?? 0, 0))
    return out
  }, [input.layers])

  return (
    <div className="space-y-5">
      <Panel title={t.summaryTitle}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t.topRho} value={fmt(result.topResistivityOhmM, 3)} unit="Ω·m" accent={ACCENT} />
          <Stat label={t.bottomRho} value={fmt(result.bottomResistivityOhmM, 3)} unit="Ω·m" accent={ACCENT} />
          <Stat label={t.totalDepth} value={fmt(result.totalDepthM, 2)} unit="m" />
          <Stat label={t.apparentRange} value={`${fmt(result.minRhoOhmM, 2)} – ${fmt(result.maxRhoOhmM, 2)}`} unit="Ω·m" />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gs-mist">{input.array === 'wenner' ? t.wennerNote : t.schlumbergerNote}</p>
      </Panel>
      <Panel title={t.layersTable}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gs-raised/70 text-xs uppercase tracking-wide text-gs-mist">
                <th className="py-1.5 pr-3 font-medium">{t.layerN}</th>
                <th className="py-1.5 pr-3 font-medium">ρ [Ω·m]</th>
                <th className="py-1.5 pr-3 font-medium">{t.thickness}</th>
                <th className="py-1.5 font-medium">{t.depthRange}</th>
              </tr>
            </thead>
            <tbody>
              {input.layers.map((layer, i) => {
                const isHalf = i === input.layers.length - 1
                const top = tops[i]
                const bottom = isHalf ? null : tops[i + 1]
                return (
                  <tr key={layer.id} className="border-b border-gs-raised/40 text-xs text-gs-ice">
                    <td className="py-1.5 pr-3">{isHalf ? t.halfSpace : `${t.layerN} ${i + 1}`}</td>
                    <td className="gs-number py-1.5 pr-3">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full border border-black/10 align-middle" style={{ backgroundColor: rhoFill(layer.resistivityOhmM) }} />
                      {fmt(layer.resistivityOhmM, 3)}
                    </td>
                    <td className="gs-number py-1.5 pr-3">{isHalf ? '∞' : `${fmt(layer.thicknessM ?? 0, 2)} m`}</td>
                    <td className="gs-number py-1.5">
                      {fmt(top, 2)} {bottom === null ? '– ∞' : `– ${fmt(bottom, 2)}`} m
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.equivalenceNote}</p>
      </Panel>
    </div>
  )
}
