import { useMemo, useState } from 'react'
import type { Data, Layout } from 'plotly.js'
import { useI18n } from '../../../i18n'
import { fillTemplate, fmt } from '../../../sim/core/format'
import { Plot } from '../../charts/Plot'
import { baseLayout, chartColors } from '../../charts/plotTheme'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { SelectField } from '../../ui/SelectField'
import { sweepValues } from './sweep'
import type { SweepMetric, SweepParameter } from './types'

interface SweepPanelProps<TInput, TResult> {
  input: TInput
  disabled?: boolean
  parameters: SweepParameter<TInput>[]
  metrics: SweepMetric<TResult>[]
  run: (input: TInput) => TResult
  prepare: (input: TInput) => TInput
}

interface SweepPoint {
  value: number
  responses: number[]
}

export function SweepPanel<TInput, TResult>({ input, disabled = false, parameters, metrics, run, prepare }: SweepPanelProps<TInput, TResult>) {
  const { d } = useI18n()
  const r = d.wshared.r2
  const [parameterId, setParameterId] = useState(parameters[0]?.id ?? '')
  const [rangePct, setRangePct] = useState(40)
  const [steps, setSteps] = useState(9)
  const parameter = parameters.find((item) => item.id === parameterId) ?? parameters[0]

  const points = useMemo<SweepPoint[]>(() => {
    if (disabled || !parameter) return []
    const values = sweepValues(parameter.get(input), rangePct, steps, parameter.min, parameter.max)
    const result: SweepPoint[] = []
    for (const value of values) {
      try {
        const next = parameter.apply(prepare(input), value)
        const response = run(next)
        result.push({ value, responses: metrics.map((metric) => metric.get(response)) })
      } catch {
        /* skip invalid sweep points */
      }
    }
    return result
  }, [disabled, input, parameter, rangePct, steps, metrics, run, prepare])

  const currentValue = parameter ? parameter.get(input) : Number.NaN
  const hasSweep = points.length >= 2 && metrics.length > 0

  return (
    <Panel
      data-r2-panel="sweep"
      title={r.sweepTitle}
      actions={
        parameter && Number.isFinite(currentValue) ? (
          <span className="gs-number text-xs text-gs-mist">
            {r.sweepCurrent}: {fmt(currentValue, 3)} {parameter.unit ?? ''}
          </span>
        ) : undefined
      }
    >
      <p className="text-xs leading-relaxed text-gs-mist">{r.sweepSub}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <SelectField
          label={r.sweepParam}
          value={parameter?.id ?? ''}
          onChange={setParameterId}
          options={parameters.map((item) => ({ value: item.id, label: `${item.label}${item.unit ? ` (${item.unit})` : ''}` }))}
        />
        <NumberField label={r.sweepRange} value={rangePct} onChange={(value) => setRangePct(Number.isFinite(value) ? value : 0)} unit="%" step={5} />
        <NumberField label={r.sweepSteps} value={steps} onChange={(value) => setSteps(Number.isFinite(value) ? value : 2)} step={1} />
      </div>
      {parameter && (
        <p className="mt-1 text-[11px] text-gs-mist">
          {fillTemplate(r.sweepGuard, {
            min: fmt(parameter.min, 3),
            max: fmt(parameter.max, 3),
            unit: parameter.unit ?? '',
          })}
        </p>
      )}
      {!hasSweep ? (
        <p className="mt-3 rounded-lg border border-black/10 bg-gs-deep/40 px-3 py-2 text-xs text-gs-mist">{r.sweepEmpty}</p>
      ) : (
        <>
          <div data-r2-sweep-plot>
            <SweepPlot points={points} parameter={parameter!} metrics={metrics} />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-gs-mist">{r.sweepNote}</p>
        </>
      )}
    </Panel>
  )
}

function SweepPlot<TInput, TResult>({
  points,
  parameter,
  metrics,
}: {
  points: SweepPoint[]
  parameter: SweepParameter<TInput>
  metrics: SweepMetric<TResult>[]
}) {
  const { d } = useI18n()
  const r = d.wshared.r2
  const data = useMemo<Data[]>(
    () =>
      metrics.map((metric, index) => ({
        type: 'scatter',
        mode: 'lines+markers',
        name: `${metric.label}${metric.unit ? ` (${metric.unit})` : ''}`,
        x: points.map((point) => point.value),
        y: points.map((point) => point.responses[index]),
        yaxis: index === 1 ? 'y2' : 'y',
        line: { color: index === 0 ? chartColors.cyan : chartColors.amber, width: 2 },
        marker: { size: 4 },
      })) as Data[],
    [points, metrics],
  )

  const layout = useMemo<Partial<Layout>>(
    () =>
      baseLayout({
        margin: { l: 56, r: metrics.length > 1 ? 58 : 18, t: 36, b: 48 },
        xaxis: {
          title: { text: `${parameter.label}${parameter.unit ? ` (${parameter.unit})` : ''}` },
          gridcolor: chartColors.grid,
        },
        yaxis: {
          title: { text: `${metrics[0]?.label ?? ''}${metrics[0]?.unit ? ` (${metrics[0].unit})` : ''}` },
          gridcolor: chartColors.grid,
        },
        ...(metrics[1]
          ? {
              yaxis2: {
                title: { text: `${metrics[1].label}${metrics[1].unit ? ` (${metrics[1].unit})` : ''}` },
                overlaying: 'y',
                side: 'right',
                gridcolor: 'rgba(0,0,0,0)',
              },
            }
          : {}),
      }),
    [parameter, metrics],
  )

  return <Plot data={data} layout={layout} style={{ height: 300 }} ariaLabel={`${r.sweepTitle}: ${parameter.label}`} />
}
