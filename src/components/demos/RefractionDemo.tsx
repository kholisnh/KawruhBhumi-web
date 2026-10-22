import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import { useI18n } from '../../i18n'
import { fmt } from '../../sim/core/format'
import { Plot } from '../charts/Plot'
import { baseLayout, chartColors } from '../charts/plotTheme'
import { RangeField } from '../ui/RangeField'
import { Stat } from '../ui/Stat'

/**
 * Live demo: two-layer refraction travel times.
 *   direct:      t_d(x) = x/V₁
 *   head wave:   t_h(x) = t_i + x/V₂,  t_i = 2h·cos(i_c)/V₁,  sin i_c = V₁/V₂
 * Valid only for V₂ > V₁ — otherwise no critically refracted head wave exists.
 */
export function RefractionDemo() {
  const { d } = useI18n()
  const t = d.physics.methods.refraction.demo
  const [v1, setV1] = useState(500)
  const [v2, setV2] = useState(2000)
  const [h, setH] = useState(5)
  const [spread, setSpread] = useState(60)

  const valid = v2 > v1
  const ic = valid ? Math.asin(v1 / v2) : NaN
  const ti = valid ? (2 * h * Math.cos(ic)) / v1 : NaN
  const crossover = valid ? ti / (1 / v1 - 1 / v2) : NaN

  const { data, layout } = useMemo(() => {
    const xs: number[] = []
    const direct: number[] = []
    const head: number[] = []
    for (let x = 0; x <= spread + 1e-9; x += spread / 120) {
      xs.push(x)
      direct.push((x / v1) * 1000) // ms
      head.push(valid ? (ti + x / v2) * 1000 : NaN)
    }
    const data: Data[] = [
      { x: xs, y: direct, type: 'scatter', mode: 'lines', line: { color: chartColors.blue, width: 2 }, name: t.direct },
    ]
    if (valid) {
      data.push({ x: xs, y: head, type: 'scatter', mode: 'lines', line: { color: chartColors.amber, width: 2 }, name: t.head })
      data.push({
        x: [crossover],
        y: [(crossover / v1) * 1000],
        type: 'scatter',
        mode: 'markers',
        marker: { color: chartColors.ice, size: 9, symbol: 'x' },
        name: t.crossover,
      })
    }
    return {
      data,
      layout: baseLayout({
        margin: { l: 50, r: 12, t: 26, b: 40 },
        xaxis: { title: { text: d.physics.methods.refraction.demo.spread + ' [m]' }, gridcolor: chartColors.grid },
        yaxis: { title: { text: 't [ms]' }, gridcolor: chartColors.grid },
      }),
    }
  }, [v1, v2, spread, valid, ti, crossover, t, d])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <RangeField label={t.v1} value={v1} onChange={setV1} min={200} max={2000} step={25} unit="m/s" />
        <RangeField label={t.v2} value={v2} onChange={setV2} min={300} max={5000} step={50} unit="m/s" error={valid ? undefined : t.noCrit} />
        <div className="grid grid-cols-2 gap-3">
          <RangeField label={t.h} value={h} onChange={setH} min={1} max={25} step={0.5} unit="m" />
          <RangeField label={t.spread} value={spread} onChange={setSpread} min={10} max={150} step={5} unit="m" />
        </div>
        {valid && (
          <div className="grid grid-cols-3 gap-2">
            <Stat label={t.critical} value={fmt((ic * 180) / Math.PI, 2)} unit="°" accent={chartColors.blue} />
            <Stat label={t.intercept} value={fmt(ti * 1000, 3)} unit="ms" />
            <Stat label={t.crossover} value={fmt(crossover, 3)} unit="m" />
          </div>
        )}
      </div>
      <Plot data={data} layout={layout} style={{ height: 260 }} />
    </div>
  )
}
