import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import { useI18n } from '../../i18n'
import { MU0 } from '../../sim/core/constants'
import { fmt } from '../../sim/core/format'
import { Plot } from '../charts/Plot'
import { baseLayout, chartColors } from '../charts/plotTheme'
import { RangeField } from '../ui/RangeField'
import { Stat } from '../ui/Stat'

/**
 * Live demo: magnetic dipole field
 *   B(r) = (μ₀/4πr³)[3(m·r̂)r̂ − m]
 * Observed as the total-field anomaly ΔT = B·û for an induced dipole
 * aligned with the ambient field of inclination i.
 */
export function MagneticDemo() {
  const { d } = useI18n()
  const t = d.physics.methods.magnetic.demo
  const [momentExp, setMomentExp] = useState(4.7) // |m| = 10^exp A·m²
  const [depth, setDepth] = useState(10)
  const [inclination, setInclination] = useState(60)

  const moment = Math.pow(10, momentExp)
  const inc = (inclination * Math.PI) / 180

  const { data, layout, peakNT } = useMemo(() => {
    const xs: number[] = []
    const dts: number[] = []
    const ux = Math.cos(inc)
    const uz = Math.sin(inc)
    // induced magnetization: m = |m|·û (û = ambient field unit vector)
    const mx = moment * ux
    const mz = moment * uz
    const k = MU0 / (4 * Math.PI)
    for (let x = -100; x <= 100.001; x += 2) {
      // vector from dipole (0, depth) to observation (x, 0); z axis downward
      const rx = x
      const rz = -depth
      const r = Math.hypot(rx, rz)
      const rhatx = rx / r
      const rhatz = rz / r
      const mDotR = mx * rhatx + mz * rhatz
      const bx = (k / r ** 3) * (3 * mDotR * rhatx - mx)
      const bz = (k / r ** 3) * (3 * mDotR * rhatz - mz)
      const dt = (bx * ux + bz * uz) * 1e9 // nT
      xs.push(x)
      dts.push(dt)
    }
    let peak = 0
    for (const v of dts) if (Math.abs(v) > Math.abs(peak)) peak = v
    const trace: Data = {
      x: xs,
      y: dts,
      type: 'scatter',
      mode: 'lines',
      line: { color: chartColors.violet, width: 2 },
      name: t.anomaly,
    }
    return {
      data: [trace],
      peakNT: peak,
      layout: baseLayout({
        margin: { l: 58, r: 12, t: 10, b: 40 },
        showlegend: false,
        xaxis: { title: { text: 'x [m]' }, gridcolor: chartColors.grid },
        yaxis: { title: { text: 'ΔT [nT]' }, gridcolor: chartColors.grid },
      }),
    }
  }, [moment, inc, depth, t])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <RangeField label={t.moment} value={momentExp} onChange={setMomentExp} min={1} max={6} step={0.1} format={(v) => fmt(Math.pow(10, v), 3)} unit="A·m²" />
        <RangeField label={t.depth} value={depth} onChange={setDepth} min={1} max={50} step={0.5} unit="m" />
        <RangeField label={t.inclination} value={inclination} onChange={setInclination} min={0} max={90} step={1} unit="°" />
        <Stat label="ΔT max" value={fmt(peakNT, 3)} unit="nT" accent={chartColors.violet} />
      </div>
      <Plot data={data} layout={layout} style={{ height: 260 }} />
    </div>
  )
}
