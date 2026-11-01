import { useMemo } from 'react'
import type { Data, Layout } from 'plotly.js'
import { useI18n } from '../../../i18n'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { Plot } from '../../charts/Plot'
import { baseLayout, chartColors } from '../../charts/plotTheme'
import { formatMetricDelta, formatMetricValue, metricDelta } from './sweep'
import type { CompareMetric, ComparePlotSpec, CompareSeries, ComparisonSnapshot } from './types'

interface ComparePanelProps {
  pinned: ComparisonSnapshot | null
  currentMetrics: CompareMetric[]
  currentSeries: CompareSeries[]
  plot: ComparePlotSpec | null
  currentScenarioLabel: string
  canPin: boolean
  stale?: boolean
  onPin: () => void
  onClear: () => void
}

export function ComparePanel({
  pinned,
  currentMetrics,
  currentSeries,
  plot,
  currentScenarioLabel,
  canPin,
  stale = false,
  onPin,
  onClear,
}: ComparePanelProps) {
  const { d } = useI18n()
  const r = d.wshared.r2
  const hasCurrent = currentMetrics.length > 0

  return (
    <Panel
      data-r2-panel="compare"
      title={r.compareTitle}
      actions={
        <span className="flex items-center gap-1.5">
          {pinned && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              {r.compareClear}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onPin} disabled={!canPin}>
            {pinned ? r.compareReplace : r.comparePin}
          </Button>
        </span>
      }
    >
      <p className="text-xs leading-relaxed text-gs-mist">{r.compareSub}</p>
      {!hasCurrent ? (
        <p className="mt-3 rounded-lg border border-black/10 bg-gs-deep/40 px-3 py-2 text-xs text-gs-mist">{r.compareNoCurrent}</p>
      ) : !pinned ? (
        <p className="mt-3 rounded-lg border border-dashed border-gs-cyan/30 bg-gs-cyan/5 px-3 py-2 text-xs text-gs-mist">
          {stale ? r.compareStale : r.compareEmpty}
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gs-mist">
            <span>
              <span className="font-semibold text-gs-ice">A</span> · {pinned.scenarioLabel}
            </span>
            <span>
              <span className="font-semibold text-gs-ice">B</span> · {currentScenarioLabel}
            </span>
            {stale && <span className="text-gs-amber">{r.compareStale}</span>}
          </div>
          <div className="mt-2 overflow-x-auto">
            <table data-r2-compare-table className="w-full min-w-[300px] border-collapse text-xs">
              <caption className="sr-only">{r.compareTitle}</caption>
              <thead>
                <tr className="border-b border-black/10 text-[10px] uppercase tracking-wide text-gs-mist">
                  <th scope="col" className="py-1.5 pr-2 text-left font-semibold">
                    {r.compareMetric}
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    A
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                    B
                  </th>
                  <th scope="col" className="py-1.5 pl-2 text-right font-semibold">
                    Δ
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentMetrics.map((metric) => {
                  const previous = pinned.metrics.find((item) => item.id === metric.id)
                  const delta = previous ? metricDelta(metric.value, previous.value) : Number.NaN
                  return (
                    <tr key={metric.id} className="border-b border-black/5 last:border-0">
                      <th scope="row" className="py-1.5 pr-2 text-left font-normal text-gs-mist">
                        {metric.label}
                        {metric.unit ? <span className="text-gs-mist"> ({metric.unit})</span> : null}
                      </th>
                      <td className="gs-number px-2 py-1.5 text-right text-gs-mist">
                        {previous ? formatMetricValue(previous.value, metric.format) : '—'}
                      </td>
                      <td className="gs-number px-2 py-1.5 text-right text-gs-ice">{formatMetricValue(metric.value, metric.format)}</td>
                      <td className={`gs-number py-1.5 pl-2 text-right ${delta === 0 || Number.isNaN(delta) ? 'text-gs-mist' : 'text-gs-cyan'}`}>
                        {formatMetricDelta(delta, metric.format)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {plot && pinned.series.length > 0 && currentSeries.length > 0 && (
            <div data-r2-compare-plot>
              <ComparePlot pinned={pinned} currentSeries={currentSeries} plot={plot} />
            </div>
          )}
        </>
      )}
    </Panel>
  )
}

function ComparePlot({
  pinned,
  currentSeries,
  plot,
}: {
  pinned: ComparisonSnapshot
  currentSeries: CompareSeries[]
  plot: ComparePlotSpec
}) {
  const { d } = useI18n()
  const r = d.wshared.r2
  const data = useMemo<Data[]>(() => {
    const previous = pinned.series.map(
      (series, index) =>
        ({
          type: 'scatter',
          mode: 'lines',
          name: `A · ${series.name}`,
          x: series.x,
          y: series.y,
          line: {
            color: chartColors.mist,
            width: 1.5,
            dash: index === 0 ? 'dash' : 'dot',
          },
          opacity: 0.85,
        }) as Data,
    )
    const current = currentSeries.map(
      (series, index) =>
        ({
          type: 'scatter',
          mode: 'lines',
          name: `B · ${series.name}`,
          x: series.x,
          y: series.y,
          line: {
            color: index === 0 ? chartColors.cyan : chartColors.violet,
            width: 2,
            dash: 'solid',
          },
        }) as Data,
    )
    return [...previous, ...current]
  }, [pinned, currentSeries])

  const layout = useMemo<Partial<Layout>>(
    () =>
      baseLayout({
        margin: { l: 56, r: 18, t: 34, b: 46 },
        xaxis: {
          title: { text: plot.xTitle },
          type: plot.xType ?? 'linear',
          gridcolor: chartColors.grid,
        },
        yaxis: {
          title: { text: plot.yTitle },
          type: plot.yType ?? 'linear',
          gridcolor: chartColors.grid,
        },
      }),
    [plot],
  )

  return <Plot data={data} layout={layout} style={{ height: 280 }} ariaLabel={`${r.compareTitle}: A ${pinned.scenarioLabel}, B`} />
}
