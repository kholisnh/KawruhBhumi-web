import { useEffect, useState } from 'react'
import type { EmLayer, GprTarget } from '../../sim/gpr/types'
import { PEC_EPS_R } from '../../sim/gpr/solver'
import { chartColors } from '../charts/plotTheme'

interface GeoCrossSectionProps {
  layers: EmLayer[]
  targets: GprTarget[]
  lineLength: number
  displayDepth: number
  accent?: string
  showGrid?: boolean
  showUnits?: boolean
  labels: { surface: string; transmitter: string; depth: string; distance: string }
  className?: string
}

function useNarrowViewport() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
  )
  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const onChange = () => setNarrow(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return narrow
}

/** Interpolated soil colour from εr (log scale 1 → 81, dark to teal). */
const EPS_STOPS: Array<[number, string]> = [
  [1, '#F2F6FB'],
  [4, '#E7EEF8'],
  [9, '#D9E6F4'],
  [16, '#C9DCF0'],
  [25, '#B8D1EB'],
  [36, '#A6C5E6'],
  [49, '#94B9E1'],
  [64, '#82ADDC'],
  [100, '#6FA0D6'],
]

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export function colorForEps(epsR: number): string {
  const x = Math.log10(Math.max(1, Math.min(100, epsR)))
  for (let i = 0; i < EPS_STOPS.length - 1; i++) {
    const [x1, c1] = EPS_STOPS[i]
    const [x2, c2] = EPS_STOPS[i + 1]
    const lx1 = Math.log10(x1)
    const lx2 = Math.log10(x2)
    if (x <= lx2 || i === EPS_STOPS.length - 2) {
      const t = Math.max(0, Math.min(1, (x - lx1) / (lx2 - lx1)))
      const a = hexToRgb(c1)
      const b = hexToRgb(c2)
      const mix = a.map((ch, k) => Math.round(ch + (b[k] - ch) * t))
      return `rgb(${mix[0]},${mix[1]},${mix[2]})`
    }
  }
  return EPS_STOPS[0][1]
}

function niceStep(range: number, targetTicks: number): number {
  const raw = range / targetTicks
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (raw <= pow * m) return pow * m
  }
  return pow * 10
}

/**
 * Stylised geological cross-section driven by the typed model.
 * Shared by the landing preview sandbox, the GPR workspace and (Phase 2) the
 * remaining workspaces — it always reflects the actual model state.
 */
export function GeoCrossSection({
  layers,
  targets,
  lineLength,
  displayDepth,
  showGrid = true,
  showUnits = true,
  labels,
  className = '',
}: GeoCrossSectionProps) {
  const narrow = useNarrowViewport()
  const VIEW_W = narrow ? 420 : 1000
  const VIEW_H = narrow ? 360 : 420
  const MARGIN = narrow
    ? { left: 44, top: 34, right: 10, bottom: 34 }
    : { left: 56, top: 40, right: 16, bottom: 38 }
  const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right
  const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom
  const FONT_SIZE = narrow ? 14 : 12

  const tops: number[] = [0]
  for (let i = 0; i < layers.length - 1; i++) tops.push(tops[i] + Math.max(layers[i].thickness, 0))
  const xScale = (m: number) => MARGIN.left + (m / Math.max(lineLength, 1e-9)) * PLOT_W
  const yScale = (z: number) => MARGIN.top + (z / Math.max(displayDepth, 1e-9)) * PLOT_H

  const xStep = niceStep(lineLength, narrow ? 4 : 7)
  const yStep = niceStep(displayDepth, narrow ? 4 : 5)
  const xTicks: number[] = []
  for (let v = 0; v <= lineLength + 1e-9; v += xStep) xTicks.push(v)
  const yTicks: number[] = []
  for (let v = 0; v <= displayDepth + 1e-9; v += yStep) yTicks.push(v)

  const antennaX = MARGIN.left + 0.08 * PLOT_W
  const surfaceY = MARGIN.top
  const crossSectionLabel = `${labels.surface}; ${labels.distance} 0–${lineLength} m; ${labels.depth} 0–${displayDepth} m; εr ${layers.map((layer) => layer.epsR).join(', ')}; ${targets.length} targets`

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={{ width: '100%', height: 'auto', aspectRatio: `${VIEW_W} / ${VIEW_H}`, display: 'block' }}
      role="img"
      aria-label={crossSectionLabel}
      className={className}
    >
      <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill={chartColors.deep} rx={6} />

      {/* layers */}
      {layers.map((layer, i) => {
        const depthTop = tops[i]
        if (depthTop > displayDepth) return null
        const isHalf = i === layers.length - 1
        const depthBottom = isHalf ? displayDepth : Math.min(tops[i + 1] ?? displayDepth, displayDepth)
        const y = yScale(depthTop)
        const hPx = yScale(depthBottom) - y
        const thicknessLabel = isHalf ? '∞' : `${Math.max(layer.thickness, 0).toFixed(2)} m`
        return (
          <g key={layer.id}>
            <rect x={MARGIN.left} y={y} width={PLOT_W} height={Math.max(hPx, 0)} fill={colorForEps(layer.epsR)} opacity={0.92} />
            {!isHalf && (
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + PLOT_W}
                y1={yScale(depthBottom)}
                y2={yScale(depthBottom)}
                stroke={chartColors.cyan}
                strokeOpacity={0.35}
                strokeWidth={1.2}
              />
            )}
            {hPx > 26 && (
              <>
                <text x={MARGIN.left + 8} y={y + 15} fontSize={FONT_SIZE} fontFamily="JetBrains Mono, monospace" fill={chartColors.ice} opacity={0.92}>
                  L{i + 1} · εr {layer.epsR.toFixed(layer.epsR >= 100 ? 0 : 1)} · σ {layer.sigma} mS/m
                </text>
                <text x={MARGIN.left + 8} y={y + 30} fontSize={FONT_SIZE} fontFamily="JetBrains Mono, monospace" fill={chartColors.mist} opacity={0.85}>
                  h = {thicknessLabel}
                </text>
              </>
            )}
          </g>
        )
      })}

      {/* targets */}
      {targets.map((target, i) => {
        if (!Number.isFinite(target.x) || !Number.isFinite(target.z) || target.z > displayDepth) return null
        const cx = xScale(target.x)
        const cy = yScale(target.z)
        const pxPerMx = PLOT_W / Math.max(lineLength, 1e-9)
        const pxPerMy = PLOT_H / Math.max(displayDepth, 1e-9)
        const rx = Math.max(5, target.radius * pxPerMx)
        const ry = Math.max(4, target.radius * pxPerMy)
        const isMetal = target.epsR >= PEC_EPS_R / 10
        const stroke = isMetal ? chartColors.ice : chartColors.amber
        return (
          <g key={target.id}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={isMetal ? 'rgba(37,37,37,0.25)' : 'rgba(232,83,83,0.15)'} stroke={stroke} strokeWidth={1.6} />
            <line x1={cx - rx - 4} x2={cx + rx + 4} y1={cy} y2={cy} stroke={stroke} strokeOpacity={0.6} strokeWidth={0.8} />
            <line x1={cx} x2={cx} y1={cy - ry - 4} y2={cy + ry + 4} stroke={stroke} strokeOpacity={0.6} strokeWidth={0.8} />
            <text x={cx} y={cy - ry - 7} textAnchor="middle" fontSize={FONT_SIZE} fontFamily="JetBrains Mono, monospace" fill={stroke}>
              T{i + 1}
            </text>
          </g>
        )
      })}

      {/* grid */}
      {showGrid && (
        <g>
          {xTicks.map((v) => (
            <line
              key={`gx-${v}`}
              x1={xScale(v)}
              x2={xScale(v)}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_H}
              stroke={chartColors.gridSoft}
              strokeWidth={0.7}
            />
          ))}
          {yTicks.map((v) => (
            <line
              key={`gy-${v}`}
              x1={MARGIN.left}
              x2={MARGIN.left + PLOT_W}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke={chartColors.gridSoft}
              strokeWidth={0.7}
            />
          ))}
        </g>
      )}

      {/* surface + trace ticks */}
      <line x1={MARGIN.left} x2={MARGIN.left + PLOT_W} y1={surfaceY} y2={surfaceY} stroke={chartColors.ice} strokeWidth={2} />
      {Array.from({ length: 13 }, (_, i) => {
        const x = MARGIN.left + (i / 12) * PLOT_W
        return <line key={`tick-${i}`} x1={x} x2={x} y1={surfaceY} y2={surfaceY + 6} stroke={chartColors.mist} strokeWidth={1} opacity={0.5} />
      })}

      {/* antenna glyph */}
      <g transform={`translate(${antennaX}, ${surfaceY})`}>
        <path d="M -10 0 L 10 0 L 5 -9 L -5 -9 Z" fill="none" stroke={chartColors.cyan} strokeWidth={1.4} />
        <line x1={0} x2={0} y1={-9} y2={-17} stroke={chartColors.cyan} strokeWidth={1.4} />
        <circle cx={0} cy={-19} r={2.2} fill={chartColors.cyan} />
        {[1, 2].map((k) => (
          <path
            key={k}
            d={`M ${-8 - k * 6} 0 A ${8 + k * 6} ${14 + k * 7} 0 0 1 ${8 + k * 6} 0`}
            fill="none"
            stroke={chartColors.cyan}
            strokeOpacity={0.5 - k * 0.15}
            strokeWidth={1.2}
          />
        ))}
        <text x={0} y={-26} textAnchor="middle" fontSize={FONT_SIZE} fontFamily="JetBrains Mono, monospace" fill={chartColors.cyan}>
          {labels.transmitter}
        </text>
      </g>

      {/* axes */}
      <g fontFamily="JetBrains Mono, monospace" fontSize={FONT_SIZE} fill={chartColors.mist}>
        {xTicks.map((v) => (
          <text key={`xt-${v}`} x={xScale(v)} y={VIEW_H - MARGIN.bottom + 16} textAnchor="middle">
            {Number(v.toFixed(2))}
          </text>
        ))}
        {yTicks.map((v) => (
          <text key={`yt-${v}`} x={MARGIN.left - 8} y={yScale(v) + 3.5} textAnchor="end">
            {Number(v.toFixed(2))}
          </text>
        ))}
        {showUnits && (
          <>
            <text x={MARGIN.left + PLOT_W / 2} y={VIEW_H - 4} textAnchor="middle" fill={chartColors.mist} fontSize={FONT_SIZE}>
              {labels.distance} [m]
            </text>
            <text x={12} y={MARGIN.top + PLOT_H / 2} textAnchor="middle" fill={chartColors.mist} fontSize={FONT_SIZE} transform={`rotate(-90 12 ${MARGIN.top + PLOT_H / 2})`}>
              {labels.depth} [m]
            </text>
          </>
        )}
      </g>
    </svg>
  )
}
