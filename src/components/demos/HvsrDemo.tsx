import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { hvsrScenarios } from '../../sim/hvsr/model'
import { runHvsrForward } from '../../sim/hvsr/solver'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const THICKNESS_STEPS = [2, 4, 8, 16, 24]
const FRAME_MS = 12_000

const CHART = { width: 360, height: 180, left: 34, right: 12, top: 12, bottom: 26 }

export function HvsrDemo() {
  const { d } = useI18n()
  const t = d.learning
  const steps = useMemo(() => {
    const base = hvsrScenarios[1]
    return THICKNESS_STEPS.map((thickness) => {
      const input = {
        model: {
          layers: [
            { id: 'demo-peat', thickness, vs: base.layers[0].vs },
            { id: 'demo-bedrock', thickness: 0, vs: base.layers[3].vs },
          ],
        },
        survey: { ...base.survey },
      }
      return { thickness, result: runHvsrForward(input) }
    })
  }, [])
  const reducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(!reducedMotion)

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % steps.length), FRAME_MS)
    return () => window.clearInterval(timer)
  }, [playing, steps.length])

  const chart = useMemo(() => {
    const frequencies = steps[0].result.frequencies
    const fMin = frequencies[0]
    const fMax = frequencies[frequencies.length - 1]
    const yMax = Math.max(3, Math.ceil(Math.max(...steps.flatMap((step) => step.result.hvsr)) * 1.15))
    const plotWidth = CHART.width - CHART.left - CHART.right
    const plotHeight = CHART.height - CHART.top - CHART.bottom
    const x = (f: number) => CHART.left + (Math.log10(f / fMin) / Math.log10(fMax / fMin)) * plotWidth
    const y = (value: number) => CHART.top + plotHeight - (value / yMax) * plotHeight
    const bottom = CHART.top + plotHeight
    const paths = steps.map((step) => {
      const points = step.result.frequencies.map((f, i) => `${i === 0 ? 'M' : 'L'}${x(f).toFixed(1)},${y(step.result.hvsr[i]).toFixed(1)}`).join(' ')
      return {
        ...step,
        path: points,
        area: `${points} L${x(fMax).toFixed(1)},${bottom.toFixed(1)} L${x(fMin).toFixed(1)},${bottom.toFixed(1)} Z`,
        f0x: x(step.result.diagnostics.f0),
        a0y: y(step.result.diagnostics.a0),
      }
    })
    return { fMin, fMax, yMax, x, y, bottom, paths, ticks: [0.5, 1, 2, 5, 10, 20].filter((f) => f >= fMin && f <= fMax) }
  }, [steps])

  const current = chart.paths[index]
  const yTicks = Array.from({ length: chart.yMax + 1 }, (_, value) => value)

  return (
    <div className="rounded-xl border border-black/10 bg-gs-navy/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge soft color="#3664F4">
          {t.demoLive}
        </Badge>
        <span className="gs-number text-xs text-gs-mist">
          {t.demoStep} {index + 1}/{steps.length}
        </span>
      </div>

      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="mt-2 w-full" role="img" aria-label={`${t.demoAria} ${current.thickness} m, f0 ${current.result.diagnostics.f0.toFixed(2)} Hz`}>
        <defs>
          <linearGradient id="hvsr-demo-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3664F4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3664F4" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((value) => (
          <g key={`y-${value}`}>
            <line x1={CHART.left} x2={CHART.width - CHART.right} y1={chart.y(value)} y2={chart.y(value)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <text x={CHART.left - 6} y={chart.y(value) + 3} textAnchor="end" fontSize="9" fill="var(--color-gs-mist)">
              {value}
            </text>
          </g>
        ))}
        {chart.ticks.map((f) => (
          <g key={`x-${f}`}>
            <line x1={chart.x(f)} x2={chart.x(f)} y1={CHART.top} y2={chart.bottom} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
            <text x={chart.x(f)} y={CHART.height - 10} textAnchor="middle" fontSize="9" fill="var(--color-gs-mist)">
              {f}
            </text>
          </g>
        ))}
        <text x={CHART.left} y={CHART.height - 1} fontSize="9" fill="var(--color-gs-mist)">
          f [Hz]
        </text>
        <path d={current.area} fill="url(#hvsr-demo-fill)" />
        <path d={current.path} fill="none" stroke="#3664F4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={current.f0x} x2={current.f0x} y1={current.a0y} y2={chart.bottom} stroke="#E85353" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={current.f0x} cy={current.a0y} r="3.5" fill="#E85353" />
        <text x={current.f0x + 6} y={current.a0y - 5} fontSize="9" fontWeight="600" fill="#E85353">
          f0
        </text>
      </svg>

      <div className="mt-2 flex gap-1" aria-hidden>
        {steps.map((step, stepIndex) => (
          <span key={step.thickness} className={`h-1 flex-1 rounded-full ${stepIndex <= index ? 'bg-gs-cyan' : 'bg-black/8'}`} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
        <div className="rounded-lg bg-gs-deep/70 px-2.5 py-2">
          <p className="text-[10px] font-semibold tracking-wide text-gs-mist uppercase">{t.demoThickness}</p>
          <p className="gs-number mt-0.5 text-sm font-semibold text-gs-ice">{current.thickness} m</p>
        </div>
        <div className="rounded-lg bg-gs-deep/70 px-2.5 py-2">
          <p className="text-[10px] font-semibold tracking-wide text-gs-mist uppercase">{t.demoF0}</p>
          <p className="gs-number mt-0.5 text-sm font-semibold text-gs-ice">{current.result.diagnostics.f0.toFixed(2)} Hz</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-gs-mist">{t.demoModelNote}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setPlaying((value) => !value)} aria-pressed={playing}>
          {playing ? t.demoPause : t.demoPlay}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIndex(0)
            setPlaying(true)
          }}
        >
          {t.demoRestart}
        </Button>
        <Link to="/simulator/hvsr" className="ml-auto">
          <Button size="sm" variant="primary">
            {t.demoOpen}
          </Button>
        </Link>
      </div>
    </div>
  )
}
