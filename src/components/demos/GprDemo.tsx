import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import { useI18n } from '../../i18n'
import { C0 } from '../../sim/core/constants'
import { fmt } from '../../sim/core/format'
import { Plot } from '../charts/Plot'
import { baseLayout, chartColors } from '../charts/plotTheme'
import { RangeField } from '../ui/RangeField'
import { Stat } from '../ui/Stat'

/** Live demo: v = c/√εr and t_TWT = 2z/v for a constant-εr medium. */
export function GprDemo() {
  const { d } = useI18n()
  const t = d.physics.methods.gpr.demo
  const [epsR, setEpsR] = useState(9)
  const [depth, setDepth] = useState(2)

  const v = C0 / Math.sqrt(epsR)
  const twtNs = (2 * depth) / v * 1e9

  const { data, layout } = useMemo(() => {
    const zs: number[] = []
    const ts: number[] = []
    for (let z = 0; z <= 10.0001; z += 0.1) {
      zs.push(z)
      ts.push((2 * z) / v * 1e9)
    }
    const trace: Data = {
      x: zs,
      y: ts,
      type: 'scatter',
      mode: 'lines',
      line: { color: chartColors.cyan, width: 2 },
      name: t.curve,
    }
    const marker: Data = {
      x: [depth],
      y: [twtNs],
      type: 'scatter',
      mode: 'markers',
      marker: { color: chartColors.amber, size: 10, symbol: 'diamond' },
      name: t.twt,
    }
    return {
      data: [trace, marker],
      layout: baseLayout({
        margin: { l: 52, r: 12, t: 10, b: 40 },
        showlegend: false,
        xaxis: { title: { text: `${t.depth} [m]` }, gridcolor: chartColors.grid },
        yaxis: { title: { text: `${t.twt} [ns]` }, gridcolor: chartColors.grid },
      }),
    }
  }, [v, depth, twtNs, t])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <RangeField label={t.epsR} value={epsR} onChange={setEpsR} min={1} max={81} step={0.5} />
        <RangeField label={t.depth} value={depth} onChange={setDepth} min={0.5} max={10} step={0.1} unit="m" />
        <div className="grid grid-cols-2 gap-2">
          <Stat label={t.velocity} value={fmt(v / 1e9, 4)} unit="m/ns" accent={chartColors.cyan} hint={`${fmt(v, 4)} m/s`} />
          <Stat label={t.twt} value={fmt(twtNs, 4)} unit="ns" accent={chartColors.amber} />
        </div>
      </div>
      <Plot data={data} layout={layout} style={{ height: 260 }} />
    </div>
  )
}
