import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  soft?: boolean
  className?: string
}

function channel(v: number): number {
  const s = v / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function Badge({ children, color, soft = false, className = '' }: BadgeProps) {
  const style = color
    ? soft
      ? {
          color: `color-mix(in srgb, ${color} 50%, #252525)`,
          backgroundColor: `${color}14`,
          border: `1px solid ${color}33`,
        }
      : {
          color: contrast(color, '#252525') >= contrast(color, '#FFFFFF') ? '#252525' : '#FFFFFF',
          backgroundColor: color,
        }
    : { color: '#5C6470', backgroundColor: 'rgba(37,37,37,0.06)' }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
