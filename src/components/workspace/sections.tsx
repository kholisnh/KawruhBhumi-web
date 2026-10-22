import { useMemo } from 'react'
import { chartColors } from '../charts/plotTheme'

interface AxisLabels {
  distance: string
  depth: string
  surface: string
}

const VIEW_W = 1000
const VIEW_H = 400
const MARGIN = { left: 56, top: 34, right: 16, bottom: 36 }
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom

function niceStep(range: number, targetTicks: number): number {
  const raw = range / targetTicks
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (raw <= pow * m) return pow * m
  }
  return pow * 10
}

function Axes({
  xScale,
  yScale,
  lineLength,
  displayDepth,
  labels,
  showGrid,
  showUnits,
}: {
  xScale: (m: number) => number
  yScale: (z: number) => number
  lineLength: number
  displayDepth: number
  labels: AxisLabels
  showGrid: boolean
  showUnits: boolean
}) {
  const xStep = niceStep(lineLength, 7)
  const yStep = niceStep(displayDepth, 5)
  const xTicks: number[] = []
  for (let v = 0; v <= lineLength + 1e-9; v += xStep) xTicks.push(v)
  const yTicks: number[] = []
  for (let v = 0; v <= displayDepth + 1e-9; v += yStep) yTicks.push(v)
  return (
    <>
      {showGrid && (
        <g>
          {xTicks.map((v) => (
            <line key={`gx-${v}`} x1={xScale(v)} x2={xScale(v)} y1={MARGIN.top} y2={MARGIN.top + PLOT_H} stroke={chartColors.gridSoft} strokeWidth={0.7} />
          ))}
          {yTicks.map((v) => (
            <line key={`gy-${v}`} x1={MARGIN.left} x2={MARGIN.left + PLOT_W} y1={yScale(v)} y2={yScale(v)} stroke={chartColors.gridSoft} strokeWidth={0.7} />
          ))}
        </g>
      )}
      <line x1={MARGIN.left} x2={MARGIN.left + PLOT_W} y1={MARGIN.top} y2={MARGIN.top} stroke={chartColors.ice} strokeWidth={2} />
      <g fontFamily="JetBrains Mono, monospace" fontSize={10.5} fill={chartColors.mist}>
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
            <text x={MARGIN.left + PLOT_W / 2} y={VIEW_H - 4} textAnchor="middle" fill={chartColors.mist} fontSize={10}>
              {labels.distance} [m]
            </text>
            <text x={12} y={MARGIN.top + PLOT_H / 2} textAnchor="middle" fill={chartColors.mist} fontSize={10} transform={`rotate(-90 12 ${MARGIN.top + PLOT_H / 2})`}>
              {labels.depth} [m]
            </text>
          </>
        )}
      </g>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Magnetic / gravity bodies                                           */
/* ------------------------------------------------------------------ */

export interface AnomalyBodyShape {
  id: string
  kind: 'rect' | 'ellipse'
  /** Rect: horizontal + depth extent. Ellipse: centre + radii. */
  x1?: number
  x2?: number
  z1?: number
  z2?: number
  x?: number
  z?: number
  rx?: number
  rz?: number
  label: string
  color: string
  /** Body centre lies off the profile plane (y ≠ 0): drawn dashed. */
  offscreen?: boolean
}

export function AnomalySectionSvg({
  bodies,
  lineLength,
  displayDepth,
  labels,
  accent,
  showGrid = true,
  showUnits = true,
  height = 300,
}: {
  bodies: AnomalyBodyShape[]
  lineLength: number
  displayDepth: number
  labels: AxisLabels
  accent: string
  showGrid?: boolean
  showUnits?: boolean
  height?: number
}) {
  const { xScale, yScale } = useMemo(
    () => ({
      xScale: (m: number) => MARGIN.left + (m / Math.max(lineLength, 1e-9)) * PLOT_W,
      yScale: (z: number) => MARGIN.top + (z / Math.max(displayDepth, 1e-9)) * PLOT_H,
    }),
    [lineLength, displayDepth],
  )

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label="Model cross-section">
      <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill={chartColors.deep} rx={6} />
      <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill={accent} opacity={0.04} />
      {bodies.map((b) => {
        if (b.kind === 'rect') {
          const x = xScale(Math.max(b.x1 ?? 0, 0))
          const w = xScale(Math.min(b.x2 ?? 0, lineLength)) - x
          const y = yScale(Math.max(b.z1 ?? 0, 0))
          const h = yScale(Math.min(b.z2 ?? displayDepth, displayDepth)) - y
          return (
            <g key={b.id}>
              <rect
                x={x}
                y={y}
                width={Math.max(w, 2)}
                height={Math.max(h, 2)}
                fill={b.color}
                opacity={b.offscreen ? 0.12 : 0.28}
                stroke={b.color}
                strokeWidth={1.6}
                strokeDasharray={b.offscreen ? '6 4' : undefined}
              />
              <text x={x + Math.max(w, 2) / 2} y={y + 14} textAnchor="middle" fontSize={10.5} fontFamily="JetBrains Mono, monospace" fill={b.color}>
                {b.label}
              </text>
            </g>
          )
        }
        const cx = xScale(b.x ?? 0)
        const cy = yScale(b.z ?? 0)
        const rx = Math.max(6, ((b.rx ?? 1) / Math.max(lineLength, 1e-9)) * PLOT_W)
        const ry = Math.max(5, ((b.rz ?? 1) / Math.max(displayDepth, 1e-9)) * PLOT_H)
        return (
          <g key={b.id}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={b.color}
              opacity={b.offscreen ? 0.1 : 0.22}
              stroke={b.color}
              strokeWidth={1.6}
              strokeDasharray={b.offscreen ? '6 4' : undefined}
            />
            <text x={cx} y={cy - ry - 6} textAnchor="middle" fontSize={10.5} fontFamily="JetBrains Mono, monospace" fill={b.color}>
              {b.label}
            </text>
          </g>
        )
      })}
      <Axes xScale={xScale} yScale={yScale} lineLength={lineLength} displayDepth={displayDepth} labels={labels} showGrid={showGrid} showUnits={showUnits} />
      <text x={MARGIN.left} y={MARGIN.top - 10} fontSize={10} fontFamily="JetBrains Mono, monospace" fill={chartColors.mist}>
        {labels.surface}
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Layered sections (reflection / refraction)                          */
/* ------------------------------------------------------------------ */

/** Colour ramp for velocity displays: slow (blue) → fast (warm). */
export function velocityColor(v: number, vMin: number, vMax: number): string {
  const t = vMax > vMin ? Math.min(Math.max((v - vMin) / (vMax - vMin), 0), 1) : 0.5
  const a = [62, 111, 168]
  const b = [224, 154, 70]
  const c = a.map((av, i) => Math.round(av + (b[i] - av) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export interface SectionLayer {
  id: string
  /** Thickness in metres; the last layer is drawn to the display depth. */
  thickness: number
  color: string
  label: string
}

export function LayersSectionSvg({
  layers,
  lineLength,
  displayDepth,
  labels,
  accent,
  rays = [],
  showGrid = true,
  showUnits = true,
  height = 300,
}: {
  layers: SectionLayer[]
  lineLength: number
  displayDepth: number
  labels: AxisLabels
  accent: string
  /** Optional ray polylines in model coordinates [[x, z], …] (refraction). */
  rays?: Array<Array<[number, number]>>
  showGrid?: boolean
  showUnits?: boolean
  height?: number
}) {
  const { tops, xScale, yScale } = useMemo(() => {
    const t: number[] = [0]
    for (let i = 0; i < layers.length - 1; i++) t.push(t[i] + Math.max(layers[i].thickness, 0))
    return {
      tops: t,
      xScale: (m: number) => MARGIN.left + (m / Math.max(lineLength, 1e-9)) * PLOT_W,
      yScale: (z: number) => MARGIN.top + (z / Math.max(displayDepth, 1e-9)) * PLOT_H,
    }
  }, [layers, lineLength, displayDepth])

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label="Layered model cross-section">
      <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill={chartColors.deep} rx={6} />
      {layers.map((layer, i) => {
        const depthTop = tops[i]
        if (depthTop > displayDepth) return null
        const isHalf = i === layers.length - 1
        const depthBottom = isHalf ? displayDepth : Math.min(tops[i + 1] ?? displayDepth, displayDepth)
        const y = yScale(depthTop)
        const hPx = yScale(depthBottom) - y
        return (
          <g key={layer.id}>
            <rect x={MARGIN.left} y={y} width={PLOT_W} height={Math.max(hPx, 0)} fill={layer.color} opacity={0.85} />
            {!isHalf && <line x1={MARGIN.left} x2={MARGIN.left + PLOT_W} y1={yScale(depthBottom)} y2={yScale(depthBottom)} stroke={chartColors.ice} strokeOpacity={0.25} strokeWidth={1.2} />}
            {hPx > 22 && (
              <text x={MARGIN.left + 8} y={y + 14} fontSize={11} fontFamily="JetBrains Mono, monospace" fill={chartColors.ice} opacity={0.95}>
                {layer.label}
              </text>
            )}
          </g>
        )
      })}
      {rays.map((poly, i) => (
        <polyline
          key={`ray-${i}`}
          points={poly.map(([px, pz]) => `${xScale(px)},${yScale(pz)}`).join(' ')}
          fill="none"
          stroke={accent}
          strokeWidth={1.3}
          strokeOpacity={0.75}
        />
      ))}
      <Axes xScale={xScale} yScale={yScale} lineLength={lineLength} displayDepth={displayDepth} labels={labels} showGrid={showGrid} showUnits={showUnits} />
    </svg>
  )
}
