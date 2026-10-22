import { useEffect, useRef } from 'react'
import { chartColors } from '../charts/plotTheme'

/**
 * Animated illustrative subsurface scene for the hero section.
 * Explicitly labelled as a schematic (not measured or simulated data):
 * it communicates that different physical properties produce different
 * geophysical measurements.
 *
 * Deterministic animation driven by a phase parameter; honours
 * prefers-reduced-motion by rendering a single static frame.
 */
export function HeroScene({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const start = performance.now()
    let W = 0
    let H = 0

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = wrap.clientWidth
      H = Math.max(250, Math.min(440, Math.round(W * 0.44)))
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const frame = (now: number) => {
      const phase = reduced ? 0.32 : (((now - start) / 1000) % 4) / 4
      drawScene(ctx, W, H, phase)
      if (!reduced) raf = requestAnimationFrame(frame)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) drawScene(ctx, W, H, 0.32)
    })
    ro.observe(wrap)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Illustrative animated geological cross-section with survey instruments, a buried dense body, a magnetic body, a cavity, and wave propagation"
        className="block h-full w-full rounded-2xl"
      />
    </div>
  )
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, phase: number) {
  ctx.clearRect(0, 0, w, h)
  const surfaceY = h * 0.3
  const groundH = h - surfaceY

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, surfaceY)
  sky.addColorStop(0, '#FFFFFF')
  sky.addColorStop(1, '#EEF3FB')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, surfaceY)

  // ground bands
  const bandColors = ['#F1E9DA', '#EADFCB', '#E2D4BA', '#EDF2F8']
  const bandFracs = [0.2, 0.24, 0.3, 0.26]
  let y = surfaceY
  const bandTops: number[] = [surfaceY]
  for (const f of bandFracs) {
    const bh = groundH * f
    ctx.fillStyle = bandColors[Math.min(bandTops.length - 1, 3)]
    ctx.fillRect(0, y, w, bh + 1)
    y += bh
    bandTops.push(y)
  }

  // dipping interface + fault
  const dipY = bandTops[1] + groundH * 0.02
  ctx.strokeStyle = 'rgba(37,37,37,0.22)'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(0, dipY + 14)
  ctx.lineTo(0.58 * w, dipY + 34)
  ctx.lineTo(0.58 * w, dipY + 46)
  ctx.lineTo(w, dipY + 42)
  ctx.stroke()

  // buried bodies
  drawEllipseBody(ctx, 0.22 * w, surfaceY + groundH * 0.62, w * 0.075, groundH * 0.1, chartColors.amber)
  drawRectBody(ctx, 0.63 * w, surfaceY + groundH * 0.7, w * 0.09, groundH * 0.16, chartColors.violet)
  // cavity
  ctx.beginPath()
  ctx.arc(0.43 * w, surfaceY + groundH * 0.52, Math.max(7, w * 0.01), 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(54,100,244,0.6)'
  ctx.setLineDash([3, 3])
  ctx.stroke()
  ctx.setLineDash([])

  // GPR wavefronts (clipped below the surface)
  const antennaX = 0.18 * w
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, surfaceY, w, groundH)
  ctx.clip()
  const maxR = w * 0.24
  for (let k = 0; k < 3; k++) {
    const r = ((phase + k / 3) % 1) * maxR
    if (r < 4) continue
    ctx.beginPath()
    ctx.arc(antennaX, surfaceY, r, 0, Math.PI * 2)
    const alpha = 0.5 * (1 - r / maxR)
    ctx.strokeStyle = `rgba(54,100,244,${alpha.toFixed(3)})`
    ctx.lineWidth = 1.6
    ctx.stroke()
  }
  ctx.restore()

  // seismic rays: source → reflector → receivers
  const srcX = 0.52 * w
  const reflX = 0.6 * w
  const reflY = surfaceY + groundH * 0.78
  const receivers = [0.575 * w, 0.645 * w]
  ctx.strokeStyle = 'rgba(232,83,83,0.65)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([7, 7])
  ctx.lineDashOffset = -phase * 60
  for (const rx of receivers) {
    ctx.beginPath()
    ctx.moveTo(srcX, surfaceY)
    ctx.lineTo(reflX, reflY)
    ctx.lineTo(rx, surfaceY)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(srcX, surfaceY)
  for (const rx of receivers) {
    ctx.moveTo(srcX + 8, surfaceY)
    ctx.lineTo(rx, surfaceY)
  }
  ctx.stroke()
  ctx.setLineDash([])
  ctx.lineDashOffset = 0

  // instruments
  ctx.strokeStyle = chartColors.cyan
  ctx.lineWidth = 1.6
  drawAntenna(ctx, antennaX, surfaceY)
  drawSource(ctx, srcX, surfaceY)
  ctx.fillStyle = chartColors.amber
  for (const rx of receivers) drawGeophone(ctx, rx, surfaceY)
  ctx.strokeStyle = 'rgba(96,203,255,0.95)'
  drawMagnetometer(ctx, 0.79 * w, surfaceY)
  ctx.strokeStyle = 'rgba(37,37,37,0.65)'
  drawGravimeter(ctx, 0.34 * w, surfaceY)

  // observation ticks
  ctx.fillStyle = 'rgba(37,37,37,0.28)'
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * w
    ctx.fillRect(x, surfaceY, 1.5, 7)
  }

  // surface line
  ctx.strokeStyle = 'rgba(37,37,37,0.85)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, surfaceY)
  ctx.lineTo(w, surfaceY)
  ctx.stroke()
}

function drawAntenna(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.moveTo(x - 9, y - 2)
  ctx.lineTo(x + 9, y - 2)
  ctx.lineTo(x + 5, y - 11)
  ctx.lineTo(x - 5, y - 11)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y - 11)
  ctx.lineTo(x, y - 18)
  ctx.stroke()
}

function drawSource(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.strokeStyle = chartColors.amber
  ctx.beginPath()
  ctx.arc(x, y - 6, 4, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a) * 7, y - 6 + Math.sin(a) * 7)
    ctx.lineTo(x + Math.cos(a) * (i % 2 === 0 ? 12 : 10), y - 6 + Math.sin(a) * (i % 2 === 0 ? 12 : 10))
    ctx.stroke()
  }
  ctx.restore()
}

function drawGeophone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.moveTo(x - 5, y)
  ctx.lineTo(x + 5, y)
  ctx.lineTo(x, y - 10)
  ctx.closePath()
  ctx.fill()
}

function drawMagnetometer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y - 16)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y - 20, 4, 0, Math.PI * 2)
  ctx.stroke()
}

function drawGravimeter(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y - 14)
  ctx.stroke()
  ctx.strokeRect(x - 5, y - 20, 10, 6)
}

function drawEllipseBody(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = `${color}26`
  ctx.fill()
  ctx.strokeStyle = `${color}aa`
  ctx.lineWidth = 1.5
  ctx.stroke()
  // hatch
  ctx.strokeStyle = `${color}55`
  ctx.lineWidth = 1
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(x + i * rx * 0.5 - 6, y + ry * 0.35)
    ctx.lineTo(x + i * rx * 0.5 + 6, y - ry * 0.35)
    ctx.stroke()
  }
}

function drawRectBody(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.beginPath()
  ctx.rect(x - w / 2, y - h / 2, w, h)
  ctx.fillStyle = `${color}22`
  ctx.fill()
  ctx.strokeStyle = `${color}aa`
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.strokeStyle = `${color}55`
  ctx.lineWidth = 1
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(x - w / 2 + (i * w) / 3, y + h / 2)
    ctx.lineTo(x - w / 2 + (i * w) / 3, y - h / 2)
    ctx.stroke()
  }
}
