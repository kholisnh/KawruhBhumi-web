import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import { useI18n } from '../../i18n'
import { fmt } from '../../sim/core/format'
import { rickerWavelet } from '../../sim/gpr/solver'
import { Plot } from '../charts/Plot'
import { baseLayout, chartColors } from '../charts/plotTheme'
import { RangeField } from '../ui/RangeField'
import { Stat } from '../ui/Stat'

/**
 * Live demo: acoustic impedance Z = ρ·Vp, normal-incidence reflection
 * coefficient R = (Z2−Z1)/(Z2+Z1), and the two-layer synthetic trace
 * s(t) = w(t) * r(t) with a Ricker wavelet at the reflector time.
 */
export function ReflectionDemo() {
  const { d } = useI18n()
  const t = d.physics.methods.reflection.demo
  const [rho1, setRho1] = useState(2000)
  const [vp1, setVp1] = useState(2000)
  const [rho2, setRho2] = useState(2400)
  const [vp2, setVp2] = useState(2600)

  const z1 = rho1 * vp1
  const z2 = rho2 * vp2
  const R = (z2 - z1) / (z2 + z1)

  const { data, layout } = useMemo(() => {
    const dt = 0.002
    const t0 = 0.2
    const samples = 300
    const wavelet = rickerWavelet(25, dt)
    const half = (wavelet.length - 1) / 2
    const times: number[] = []
    const amps: number[] = []
    const centerIdx = t0 / dt
    for (let i = 0; i < samples; i++) {
      times.push(i * dt * 1000) // ms
      let acc = 0
      for (let j = 0; j < wavelet.length; j++) {
        const idx = i - j + half
        if (Math.abs(idx - centerIdx) < 0.5) acc += R * wavelet[j]
      }
      amps.push(acc)
    }
    const trace: Data = {
      x: times,
      y: amps,
      type: 'scatter',
      mode: 'lines',
      line: { color: chartColors.teal, width: 2 },
      name: t.trace,
    }
    return {
      data: [trace],
      layout: baseLayout({
        margin: { l: 50, r: 12, t: 10, b: 40 },
        showlegend: false,
        xaxis: { title: { text: 't [ms]' }, gridcolor: chartColors.grid },
        yaxis: { title: { text: 'a.u.' }, gridcolor: chartColors.grid, range: [-1.05 * Math.abs(R) - 0.05, 1.05 * Math.abs(R) + 0.05] },
      }),
    }
  }, [R, t])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <RangeField label={t.rho1} value={rho1} onChange={setRho1} min={1000} max={4000} step={50} unit="kg/m³" />
          <RangeField label={t.vp1} value={vp1} onChange={setVp1} min={500} max={6000} step={50} unit="m/s" />
          <RangeField label={t.rho2} value={rho2} onChange={setRho2} min={1000} max={4000} step={50} unit="kg/m³" />
          <RangeField label={t.vp2} value={vp2} onChange={setVp2} min={500} max={6000} step={50} unit="m/s" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label={t.impedance1} value={fmt(z1 / 1e6, 3)} unit="M·kg/m²/s" />
          <Stat label={t.impedance2} value={fmt(z2 / 1e6, 3)} unit="M·kg/m²/s" />
          <Stat label={t.coeff} value={fmt(R, 3)} accent={chartColors.teal} />
        </div>
        <p className="text-[11px] text-gs-mist">{t.polarityNote}</p>
      </div>
      <Plot data={data} layout={layout} style={{ height: 260 }} />
    </div>
  )
}
