import type { Data, Layout } from 'plotly.js'
import { Plot } from '../../charts/Plot'
import { baseLayout, chartColors } from '../../charts/plotTheme'
import type { ChallengeCurve } from './types'

export function ChallengePlot({
  target,
  current,
  targetLabel,
  currentLabel,
}: {
  target: ChallengeCurve
  current: ChallengeCurve | null
  targetLabel: string
  currentLabel: string
}) {
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      name: targetLabel,
      x: target.x,
      y: target.y,
      line: { color: chartColors.cyan, width: 2.6 },
    },
  ]
  if (current) {
    data.push({
      type: 'scatter',
      mode: 'lines',
      name: currentLabel,
      x: current.x,
      y: current.y,
      line: { color: chartColors.amber, width: 2, dash: 'dash' },
    })
  }
  const base = baseLayout()
  const layout: Partial<Layout> = {
    ...base,
    xaxis: {
      ...base.xaxis,
      title: { text: target.xTitle, font: { family: 'Cabin, sans-serif', size: 12, color: chartColors.mist } },
      type: target.xType ?? 'linear',
    },
    yaxis: {
      ...base.yaxis,
      title: { text: target.yTitle, font: { family: 'Cabin, sans-serif', size: 12, color: chartColors.mist } },
      type: target.yType ?? 'linear',
    },
  }
  return (
    <div data-r3-challenge-plot>
      <Plot data={data} layout={layout} className="w-full" ariaLabel={`${targetLabel} and ${currentLabel}`} style={{ minHeight: 300 }} />
    </div>
  )
}
