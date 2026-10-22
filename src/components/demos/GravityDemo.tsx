import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import { useI18n } from '../../i18n'
import { G_CONST } from '../../sim/core/constants'
import { fmt } from '../../sim/core/format'
import { Plot } from '../charts/Plot'
import { baseLayout, chartColors } from '../charts/plotTheme'
import { RangeField } from '../ui/RangeField'
import { Stat } from '../ui/Stat'

/**
 * Live demo: vertical gravity anomaly of a buried sphere (point-mass limit):
 *   Δg_z(x) = (4/3)·π·G·Δρ·a³·z / (x² + z²)^{3/2}
 * Displayed in mGal (1 mGal = 1e-5 m/s²).
 */
export function GravityDemo() {
  const { d } = useI18n()
  const t = d.physics.methods.gravity.demo
  const [deltaRho, setDeltaRho] = useState(500)
  const [radius, setRadius] = useState(10)
  const [depth, setDepth] = useState(30)

  const { data, layout, peakMGal } = useMemo(() => {
    const volume = (4 / 3) * Math.PI * radius ** 3
    const mass = deltaRho * volume
    const span = Math.max(4 * depth, 40)
    const xs: number[] = []
    const gs: number[] = []
    for (let x = -span; x <= span + 1e-9; x += span / 120) {
      const gz = (G_CONST * mass * depth) / Math.pow(x * x + depth * depth, 1.5)
      xs.push(x)
      gs.push(gz / 1e-5) // mGal
    }
    const peak = (G_CONST * mass) / (depth * depth) / 1e-5
    const trace: Data = {
      x: xs,
      y: gs,
      type: 'scatter',
      mode: 'lines',
      line: { color: chartColors.amber, width: 2 },
      name: t.anomaly,
    }
    return {
      data: [trace],
      peakMGal: peak,
      layout: baseLayout({
        margin: { l: 54, r: 12, t: 10, b: 40 },
        showlegend: false,
        xaxis: { title: { text: 'x [m]' }, gridcolor: chartColors.grid },
        yaxis: { title: { text: 'Δgz [mGal]' }, gridcolor: chartColors.grid },
      }),
    }
  }, [deltaRho, radius, depth, t])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <RangeField label={t.deltaRho} value={deltaRho} onChange={setDeltaRho} min={50} max={1000} step={10} unit="kg/m³" />
        <RangeField label={t.radius} value={radius} onChange={setRadius} min={2} max={50} step={1} unit="m" />
        <RangeField label={t.depth} value={depth} onChange={setDepth} min={5} max={150} step={1} unit="m" />
        <Stat label="Δgz max" value={fmt(peakMGal, 3)} unit="mGal" accent={chartColors.amber} />
      </div>
      <Plot data={data} layout={layout} style={{ height: 260 }} />
    </div>
  )
}
