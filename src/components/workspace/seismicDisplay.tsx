import { useId, useMemo } from 'react'

export interface WiggleAnnotation {
  /** Polyline in data coordinates: [x (m), time (ms)]. */
  points: Array<[number, number]>
  color?: string
  width?: number
}

export interface WiggleRecordProps {
  /** Trace x positions along the profile [m]. */
  positions: number[]
  /** Sample times [ms] (ascending). */
  tMs: number[]
  /** traces[i][j] — amplitude of trace i at sample j. */
  traces: number[][]
  /** Maximum displayed time [ms]; default = tMs[last]. */
  clipMs?: number
  xTitle: string
  yTitle: string
  timeScale?: 's' | 'ms'
  showGrid?: boolean
  /** First-arrival markers (ms per trace, one per position). */
  showPicks?: boolean
  picksMs?: number[]
  annotations?: WiggleAnnotation[]
  /** Positive-lobe fill threshold relative to the per-trace peak (0–1). */
  fillThreshold?: number
  /** Normalize each trace to its own peak (AGC-like); false uses one global scale. */
  normalizePerTrace?: boolean
  height?: number
  onSvg?: (svg: SVGSVGElement) => void
}

const VIEW_W = 1060
const MARGIN = { l: 68, r: 26, t: 34, b: 46 }
const PAPER = '#ffffff'
const INK = '#16181d'
const GRID = 'rgba(22,24,29,0.10)'
const AXIS = '#2a2d34'
const ANNOT = '#E85353'
const PICK = '#2952D6'

function niceStep(span: number): number {
  const raw = span / 8
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return step * mag
}

function fmtTick(tMs: number, scale: 's' | 'ms'): string {
  if (scale === 's') {
    const v = tMs / 1000
    return v >= 1 ? v.toFixed(2).replace(/\.?0+$/, '') : v.toFixed(2)
  }
  return `${Math.round(tMs)}`
}

function fmtDist(v: number): string {
  const a = Math.abs(v)
  if (a >= 1000) return `${(v / 1000).toFixed(a % 1000 === 0 ? 0 : 1)}k`
  return `${Math.round(v)}`
}

/**
 * Classic paper-style seismic display: black wiggle traces with variable-area
 * fill of positive lobes on white background, red annotation overlays for
 * interpreted traveltime branches.
 */
export function WiggleRecord({
  positions,
  tMs,
  traces,
  clipMs,
  xTitle,
  yTitle,
  timeScale = 'ms',
  showGrid = true,
  showPicks = false,
  picksMs,
  annotations = [],
  fillThreshold = 0.035,
  normalizePerTrace = true,
  height = 430,
  onSvg,
}: WiggleRecordProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const innerW = VIEW_W - MARGIN.l - MARGIN.r
  const innerH = height - MARGIN.t - MARGIN.b

  const { fillPath, strokePath, pickNodes, annotationNodes, xTicks, yTicks, x0, x1, tMax } = useMemo(() => {
    const n = positions.length
    const tEnd = clipMs ?? tMs[tMs.length - 1]
    let jEnd = tMs.length
    while (jEnd > 1 && tMs[jEnd - 1] > tEnd) jEnd--
    const x0 = positions[0]
    const x1 = positions[n - 1]
    const xSpan = x1 - x0 || 1

    let minSpacing = Infinity
    for (let i = 1; i < n; i++) {
      const d = positions[i] - positions[i - 1]
      if (d > 0 && d < minSpacing) minSpacing = d
    }
    if (!Number.isFinite(minSpacing)) minSpacing = xSpan / Math.max(n - 1, 1)

    const pxOf = (x: number) => MARGIN.l + ((x - x0) / xSpan) * innerW
    const pyOf = (t: number) => MARGIN.t + (t / tEnd) * innerH
    const ampScale = Math.max(2, 0.48 * (minSpacing / xSpan) * innerW)

    let globalPeak = 1e-12
    if (!normalizePerTrace) {
      for (let i = 0; i < n; i++) {
        const tr = traces[i]
        if (!tr) continue
        for (let j = 0; j < jEnd; j++) globalPeak = Math.max(globalPeak, Math.abs(tr[j]))
      }
    }

    const fillSegs: string[] = []
    const strokeSegs: string[] = []
    for (let i = 0; i < n; i++) {
      const tr = traces[i]
      if (!tr) continue
      let peak = globalPeak
      if (normalizePerTrace) {
        peak = 1e-12
        for (let j = 0; j < jEnd; j++) peak = Math.max(peak, Math.abs(tr[j]))
      }
      const g = ampScale / peak
      const px = pxOf(positions[i])

      let d = `M ${px.toFixed(2)} ${pyOf(tMs[0]).toFixed(2)}`
      for (let j = 1; j < jEnd; j++) {
        d += ` L ${(px + tr[j] * g).toFixed(2)} ${pyOf(tMs[j]).toFixed(2)}`
      }
      strokeSegs.push(d)

      let run: number[] = []
      const flush = () => {
        if (!run.length) return
        const first = run[0]
        const last = run[run.length - 1]
        let seg = `M ${px.toFixed(2)} ${pyOf(tMs[first]).toFixed(2)}`
        for (const j of run) seg += ` L ${(px + tr[j] * g).toFixed(2)} ${pyOf(tMs[j]).toFixed(2)}`
        seg += ` L ${px.toFixed(2)} ${pyOf(tMs[last]).toFixed(2)} Z`
        fillSegs.push(seg)
        run = []
      }
      for (let j = 0; j < jEnd; j++) {
        if (tr[j] >= fillThreshold) run.push(j)
        else flush()
      }
      flush()
    }

    const pickNodes =
      showPicks && picksMs
        ? picksMs
            .map((t, i) => ({ t, x: positions[i] }))
            .filter((p) => p.t > 0 && p.t <= tEnd)
            .map((p, k) => <circle key={k} cx={pxOf(p.x)} cy={pyOf(p.t)} r={3} fill={PICK} stroke="#fff" strokeWidth={0.8} />)
        : []

    const annotationNodes = annotations
      .filter((a) => a.points.length >= 2)
      .map((a, k) => {
        let d = `M ${pxOf(a.points[0][0]).toFixed(2)} ${pyOf(a.points[0][1]).toFixed(2)}`
        for (let i = 1; i < a.points.length; i++) {
          d += ` L ${pxOf(a.points[i][0]).toFixed(2)} ${pyOf(a.points[i][1]).toFixed(2)}`
        }
        return (
          <g key={k} className="wiggle-annot">
            <path d={d} fill="none" stroke={PAPER} strokeWidth={(a.width ?? 2.2) + 2.6} strokeOpacity={0.85} strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke={a.color ?? ANNOT} strokeWidth={a.width ?? 2.2} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        )
      })

    const stepX = niceStep(xSpan)
    const xTicks: number[] = []
    for (let x = Math.ceil(x0 / stepX) * stepX; x <= x1 + 1e-9; x += stepX) xTicks.push(x)
    const stepY = niceStep(tEnd)
    const yTicks: number[] = []
    for (let t = 0; t <= tEnd + 1e-9; t += stepY) yTicks.push(t)

    return {
      fillPath: fillSegs.join(' '),
      strokePath: strokeSegs.join(' '),
      pickNodes,
      annotationNodes,
      xTicks,
      yTicks,
      x0,
      x1,
      tMax: tEnd,
    }
  }, [positions, tMs, traces, clipMs, annotations, showPicks, picksMs, innerW, innerH, fillThreshold, normalizePerTrace])

  return (
    <svg
      ref={(el) => {
        if (el && onSvg) onSvg(el)
      }}
      viewBox={`0 0 ${VIEW_W} ${height}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label={yTitle}
      className="wiggle-record"
    >
      <defs>
        <clipPath id={`wigclip-${uid}`}>
          <rect x={MARGIN.l} y={MARGIN.t} width={innerW} height={innerH} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={VIEW_W} height={height} fill={PAPER} rx={6} />

      {showGrid &&
        xTicks.map((x, k) => (
          <line key={`gx${k}`} x1={MARGIN.l + ((x - x0) / (x1 - x0 || 1)) * innerW} y1={MARGIN.t} x2={MARGIN.l + ((x - x0) / (x1 - x0 || 1)) * innerW} y2={MARGIN.t + innerH} stroke={GRID} strokeWidth={1} />
        ))}
      {showGrid &&
        yTicks.map((t, k) => (
          <line key={`gy${k}`} x1={MARGIN.l} y1={MARGIN.t + (t / (tMax || 1)) * innerH} x2={MARGIN.l + innerW} y2={MARGIN.t + (t / (tMax || 1)) * innerH} stroke={GRID} strokeWidth={1} />
        ))}

      <g clipPath={`url(#wigclip-${uid})`}>
        <path d={fillPath} fill={INK} stroke="none" fillRule="nonzero" />
        <path d={strokePath} fill="none" stroke={INK} strokeWidth={0.75} strokeLinejoin="round" />
        {annotationNodes}
        {pickNodes}
      </g>

      <rect x={MARGIN.l} y={MARGIN.t} width={innerW} height={innerH} fill="none" stroke={AXIS} strokeWidth={1.1} />

      {xTicks.map((x, k) => {
        const px = MARGIN.l + ((x - x0) / (x1 - x0 || 1)) * innerW
        return (
          <g key={`tx${k}`}>
            <line x1={px} y1={MARGIN.t - 4} x2={px} y2={MARGIN.t} stroke={AXIS} strokeWidth={1} />
            <text x={px} y={MARGIN.t - 9} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={AXIS}>
              {fmtDist(x)}
            </text>
          </g>
        )
      })}
      {yTicks.map((t, k) => {
        const py = MARGIN.t + (t / (tMax || 1)) * innerH
        return (
          <g key={`ty${k}`}>
            <line x1={MARGIN.l - 4} y1={py} x2={MARGIN.l} y2={py} stroke={AXIS} strokeWidth={1} />
            <text x={MARGIN.l - 7} y={py + 3.5} textAnchor="end" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={AXIS}>
              {fmtTick(t, timeScale)}
            </text>
          </g>
        )
      })}

      <text x={MARGIN.l + innerW / 2} y={14} textAnchor="middle" fontSize={12} fontFamily="Inter, sans-serif" fill={AXIS}>
        {xTitle}
      </text>
      <text x={16} y={MARGIN.t + innerH / 2} textAnchor="middle" fontSize={12} fontFamily="Inter, sans-serif" fill={AXIS} transform={`rotate(-90 16 ${MARGIN.t + innerH / 2})`}>
        {yTitle}
      </text>
    </svg>
  )
}
