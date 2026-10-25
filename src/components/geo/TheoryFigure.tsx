import type { ReactNode } from 'react'
import type { FigureId } from '../../content/cases'
import { figureMeta } from '../../content/cases'
import { useI18n } from '../../i18n'

const C = {
  ink: '#252525',
  mist: '#5C6470',
  grid: 'rgba(37,37,37,0.09)',
  blue: '#3664F4',
  sky: '#60CBFF',
  coral: '#E85353',
  teal: '#2E9FBF',
  sand: '#E9DFC8',
  clay: '#D8C7B8',
  peat: '#9A8B78',
  deep: '#F5F7FB',
  white: '#FFFFFF',
}

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 640 320" className="block h-auto w-full" role="img" aria-label={label}>
      <rect width="640" height="320" rx="16" fill={C.deep} />
      <g fontFamily="Cabin, ui-sans-serif, sans-serif">
        {children}
      </g>
    </svg>
  )
}

function Ground({ y = 96, layers = true }: { y?: number; layers?: boolean }) {
  return (
    <g>
      <line x1="28" y1={y} x2="612" y2={y} stroke={C.ink} strokeWidth="2" />
      {layers && (
        <>
          <rect x="28" y={y} width="584" height="64" fill={C.sand} opacity="0.7" />
          <rect x="28" y={y + 64} width="584" height="72" fill={C.clay} opacity="0.55" />
          <line x1="28" y1={y + 64} x2="612" y2={y + 64} stroke={C.mist} strokeOpacity="0.35" strokeDasharray="5 5" />
          <line x1="28" y1={y + 136} x2="612" y2={y + 136} stroke={C.mist} strokeOpacity="0.25" strokeDasharray="5 5" />
        </>
      )}
    </g>
  )
}

function Label({
  x,
  y,
  children,
  anchor = 'start',
  color = C.mist,
  size = 12,
  weight = 500,
  mono = false,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
  weight?: number
  mono?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={color}
      fontSize={size}
      fontWeight={weight}
      fontFamily={mono ? 'JetBrains Mono, ui-monospace, monospace' : undefined}
    >
      {children}
    </text>
  )
}

function Arrow({ x1, y1, x2, y2, color = C.coral, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const bx = x2 - ux * 9
  const by = y2 - uy * 9
  return (
    <g stroke={color} fill="none" strokeWidth="1.7" strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed ? '4 5' : undefined} />
      <path d={`M ${bx - uy * 4} ${by + ux * 4} L ${x2} ${y2} L ${bx + uy * 4} ${by - ux * 4}`} />
    </g>
  )
}

function GprAcquisition() {
  return (
    <Frame label="GPR acquisition schematic">
      <Ground y={112} />
      <rect x="70" y="78" width="76" height="28" rx="7" fill={C.ink} />
      <rect x="82" y="86" width="20" height="12" rx="2" fill={C.sky} opacity="0.85" />
      <Label x={108} y={96} color={C.white} size={12}>GPR</Label>
      <Arrow x1={158} y1={108} x2={210} y2={108} color={C.blue} />
      <Label x={184} y={100} anchor="middle" color={C.blue} size={12} mono>trace spacing</Label>
      {[190, 260, 330].map((x, i) => (
        <g key={x}>
          <path d={`M ${x} 112 A 34 34 0 0 1 ${x + 58} 112`} fill="none" stroke={C.blue} strokeOpacity={0.55 - i * 0.1} strokeWidth="1.6" />
          <line x1={x} y1="112" x2={x + 29} y2="168" stroke={C.blue} strokeOpacity="0.55" strokeDasharray="4 5" />
        </g>
      ))}
      <path d="M 218 176 C 260 146 300 146 342 176" fill="none" stroke={C.coral} strokeWidth="2" />
      <Label x={280} y={196} anchor="middle" color={C.coral} size={12}>reflection</Label>
      <path d="M 350 112 C 390 180 470 180 560 112" fill="none" stroke={C.teal} strokeWidth="2" opacity="0.7" />
      <Label x={462} y={202} anchor="middle" color={C.teal} size={12}>deeper interface</Label>
      <Label x={32} y={38} color={C.ink} size={14} weight={600}>Transmit, listen, move</Label>
      <Label x={32} y={58} color={C.mist} size={12}>two-way time is recorded at each trace</Label>
    </Frame>
  )
}

function GprPeat() {
  return (
    <Frame label="Peat thickness radar schematic">
      <rect x="28" y="92" width="584" height="52" fill={C.peat} opacity="0.65" />
      <rect x="28" y="144" width="584" height="86" fill={C.sand} opacity="0.7" />
      <line x1="28" y1="144" x2="612" y2="144" stroke={C.ink} strokeWidth="2" />
      <rect x="70" y="54" width="66" height="26" rx="6" fill={C.ink} />
      <Label x={103} y={71} anchor="middle" color={C.white} size={12}>80 MHz</Label>
      <Arrow x1={110} y1={80} x2={110} y2={90} color={C.blue} />
      {[170, 260].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="60" x2={x} y2="260" stroke={C.coral} strokeWidth="1.6" strokeDasharray="5 4" />
          <circle cx={x} cy="260" r="3" fill={C.coral} />
          <Label x={x + 10} y={252} color={C.coral} size={12} mono>{i === 0 ? '0.8–1.1 m' : '3.8–4.2 m'}</Label>
        </g>
      ))}
      <Label x={32} y={82} color={C.ink} size={12} weight={600}>peat</Label>
      <Label x={32} y={170} color={C.mist} size={12}>mineral soil</Label>
      <g transform="translate(350 50)">
        <rect width="252" height="186" rx="10" fill={C.white} stroke="rgba(37,37,37,0.12)" />
        <Label x={14} y={22} color={C.mist} size={12} mono>DISTANCE</Label>
        <Label x={14} y={44} color={C.mist} size={12} mono>TWT</Label>
        <path d="M 14 60 C 60 96 92 96 132 62 S 210 108 238 64" fill="none" stroke={C.blue} strokeWidth="2" />
        <path d="M 14 112 C 60 150 100 148 142 114 S 210 156 238 118" fill="none" stroke={C.blue} strokeWidth="1.4" opacity="0.55" />
        <line x1="14" y1="148" x2="238" y2="148" stroke={C.coral} strokeWidth="1.4" strokeDasharray="4 4" />
        <Label x={14} y={170} color={C.coral} size={12}>calibrated with 3 boreholes</Label>
      </g>
    </Frame>
  )
}

function MagAcquisition() {
  return (
    <Frame label="Magnetic survey schematic">
      <Ground y={168} layers={false} />
      {[96, 176, 256, 336, 416, 496].map((x) => (
        <g key={x}>
          <line x1={x} y1="150" x2={x} y2="168" stroke={C.ink} strokeWidth="1.4" />
          <circle cx={x} cy="150" r="5" fill={C.coral} />
          <Label x={x} y={190} anchor="middle" color={C.mist} size={12} mono>{x === 96 ? '1' : x === 496 ? '55' : '•'}</Label>
        </g>
      ))}
      <rect x="252" y="112" width="72" height="36" rx="6" fill={C.white} stroke={C.ink} />
      <Label x={288} y={134} anchor="middle" color={C.ink} size={12}>G-856</Label>
      <path d="M 40 64 C 110 44 160 82 226 58 S 350 34 424 66 S 540 48 604 62" fill="none" stroke={C.blue} strokeWidth="2" />
      <Label x={40} y={36} color={C.blue} size={12} weight={600}>total field B(t)</Label>
      <Label x={40} y={84} color={C.mist} size={12}>diurnal drift must be removed</Label>
      <rect x="96" y="122" width="42" height="28" rx="4" fill={C.clay} opacity="0.8" />
      <Label x={117} y={222} anchor="middle" color={C.coral} size={12}>body</Label>
      <Arrow x1={500} y1={150} x2={500} y2={130} color={C.blue} />
      <Label x={510} y={138} color={C.blue} size={12} mono>5 m</Label>
    </Frame>
  )
}

function MagProfile() {
  return (
    <Frame label="Magnetic anomaly profile schematic">
      <Ground y={124} layers={false} />
      <rect x="252" y="180" width="136" height="72" rx="8" fill={C.clay} stroke={C.mist} />
      <Label x={320} y={220} anchor="middle" color={C.ink} size={12}>magnetized body</Label>
      <path d="M 40 80 C 130 80 190 110 250 110 S 390 110 450 80 S 560 80 604 80" fill="none" stroke={C.grid} strokeWidth="18" strokeLinecap="round" />
      <path d="M 40 72 C 150 72 210 126 320 126 S 490 72 604 72" fill="none" stroke={C.blue} strokeWidth="2.4" />
      <line x1="320" y1="72" x2="320" y2="126" stroke={C.coral} strokeDasharray="4 4" />
      <Label x={320} y={62} anchor="middle" color={C.coral} size={12}>peak</Label>
      <Label x={40} y={44} color={C.ink} size={14} weight={600}>Anomaly shape, not rock name</Label>
      <Label x={440} y={160} color={C.mist} size={12}>depth ↑ width ↑ amplitude ↓</Label>
      <Label x={40} y={272} color={C.mist} size={12} mono>distance →</Label>
    </Frame>
  )
}

function GravityAcquisition() {
  return (
    <Frame label="Gravity survey schematic">
      <Ground y={142} layers={false} />
      {[110, 220, 330, 440, 550].map((x, i) => (
        <g key={x}>
          <rect x={x - 13} y={110} width="26" height="32" rx="4" fill={i === 2 ? C.blue : C.white} stroke={C.ink} />
          <circle cx={x} cy={126} r="5" fill={i === 2 ? C.white : C.coral} />
          <line x1={x} y1={142} x2={x} y2={156} stroke={C.ink} />
          <Label x={x} y={178} anchor="middle" color={C.mist} size={12} mono>{i + 1}</Label>
        </g>
      ))}
      <path d="M 50 58 C 160 72 260 108 330 108 S 500 62 600 54" fill="none" stroke={C.blue} strokeWidth="1.6" strokeDasharray="5 5" />
      <Label x={50} y={40} color={C.blue} size={12} weight={600}>regional field</Label>
      <rect x="286" y="204" width="88" height="54" rx="7" fill={C.mist} opacity="0.22" />
      <Label x={330} y={236} anchor="middle" color={C.ink} size={12}>low density</Label>
      <Label x={32} y={292} color={C.mist} size={12}>drift • tide • elevation • terrain corrections</Label>
    </Frame>
  )
}

function GravityBasin() {
  return (
    <Frame label="Gravity basin schematic">
      <path d="M 28 98 L 180 98 C 260 98 290 220 330 248 C 370 220 400 98 480 98 L 612 98 L 612 292 L 28 292 Z" fill={C.sand} opacity="0.45" />
      <path d="M 180 98 C 260 98 290 220 330 248 C 370 220 400 98 480 98" fill="none" stroke={C.ink} strokeWidth="2.2" />
      <rect x="300" y="130" width="60" height="80" rx="8" fill={C.teal} opacity="0.28" />
      <Label x={330} y={174} anchor="middle" color={C.teal} size={12}>basin fill</Label>
      <Label x={110} y={124} color={C.ink} size={12}>basement</Label>
      <rect x="370" y="48" width="238" height="130" rx="10" fill={C.white} stroke="rgba(37,37,37,0.12)" />
      <path d="M 386 92 C 430 92 452 142 490 142 S 552 92 592 92" fill="none" stroke={C.coral} strokeWidth="2.2" />
      <line x1="386" y1="142" x2="592" y2="142" stroke={C.grid} />
      <Label x={386} y={70} color={C.mist} size={12} mono>Δg</Label>
      <Label x={490} y={166} anchor="middle" color={C.coral} size={12}>broad negative</Label>
      <Label x={32} y={38} color={C.ink} size={14} weight={600}>A basin is a mass deficit</Label>
      <Label x={32} y={68} color={C.mist} size={12}>amplitude + width trade off against depth</Label>
    </Frame>
  )
}

function ReflectionAcquisition() {
  return (
    <Frame label="Seismic reflection acquisition schematic">
      <Ground y={100} layers={false} />
      <path d="M 28 186 L 612 186" stroke={C.mist} strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M 28 236 L 612 224" stroke={C.mist} strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="80" cy="94" r="10" fill={C.coral} />
      <path d="M 70 94 L 90 94 M 80 84 L 80 104" stroke={C.white} strokeWidth="2" />
      <Label x={80} y={74} anchor="middle" color={C.coral} size={12}>source</Label>
      {[160, 240, 320, 400, 480, 560].map((x, i) => (
        <g key={x}>
          <path d={`M ${x - 8} 94 L ${x + 8} 94 L ${x} 84 Z`} fill={C.blue} />
          <line x1={x} y1="94" x2={x} y2="100" stroke={C.ink} />
          <Label x={x} y={118} anchor="middle" color={C.mist} size={9} mono>{`R${i + 1}`}</Label>
        </g>
      ))}
      {[160, 320, 480].map((x) => (
        <g key={x}>
          <line x1="80" y1="100" x2={x} y2="186" stroke={C.blue} strokeWidth="1.3" opacity="0.7" />
          <line x1={x} y1="186" x2={x} y2="94" stroke={C.sky} strokeWidth="1.3" opacity="0.7" strokeDasharray="4 4" />
        </g>
      ))}
      <Label x={330} y={208} anchor="middle" color={C.blue} size={12}>reflection point</Label>
      <path d="M 500 258 C 530 246 560 246 590 258" fill="none" stroke={C.coral} strokeWidth="2" />
      <Label x={545} y={282} anchor="middle" color={C.coral} size={12}>NMO → stack</Label>
    </Frame>
  )
}

function ReflectionFold() {
  return (
    <Frame label="Anticline and syncline schematic">
      <defs>
        <linearGradient id="foldFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.sand} stopOpacity="0.7" />
          <stop offset="1" stopColor={C.clay} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <path d="M 20 260 L 620 260 L 620 308 L 20 308 Z" fill={C.mist} opacity="0.14" />
      {[0, 26, 52, 78].map((off, i) => (
        <path
          key={off}
          d={`M 20 ${214 - off} C 120 ${214 - off} 160 ${166 - off} 230 ${166 - off} C 300 ${166 - off} 320 ${238 - off} 390 ${238 - off} C 460 ${238 - off} 500 ${166 - off} 620 ${166 - off}`}
          fill="none"
          stroke={i === 0 ? C.blue : C.mist}
          strokeOpacity={i === 0 ? 0.9 : 0.45}
          strokeWidth={i === 0 ? 2.4 : 1.4}
        />
      ))}
      <path d="M 20 260 L 620 260 L 620 294 L 20 294 Z" fill="url(#foldFill)" />
      <Label x={142} y={146} color={C.ink} size={12} weight={600}>anticline</Label>
      <Label x={390} y={262} color={C.ink} size={12} weight={600}>syncline</Label>
      <Arrow x1={230} y1={136} x2={230} y2={158} color={C.blue} />
      <Label x={238} y={136} color={C.blue} size={12} mono>crest</Label>
      <Label x={32} y={38} color={C.ink} size={14} weight={600}>Folds bend the reflections</Label>
      <Label x={32} y={58} color={C.mist} size={12}>time sections also stretch with velocity</Label>
    </Frame>
  )
}

function ReflectionTarakan() {
  return (
    <Frame label="Rollover fold above mobile shale schematic">
      <path d="M 28 100 C 180 100 220 140 300 140 C 380 140 420 100 612 100" fill="none" stroke={C.ink} strokeWidth="2" />
      <path d="M 28 194 C 180 194 220 220 300 220 C 380 220 420 194 612 194" fill="none" stroke={C.mist} strokeWidth="1.8" />
      <path d="M 28 244 C 180 244 220 266 300 266 C 380 266 420 244 612 244" fill="none" stroke={C.mist} strokeWidth="1.8" />
      <path d="M 28 270 C 180 270 220 286 300 286 C 380 286 420 270 612 270" fill="none" stroke={C.mist} strokeWidth="1.8" />
      <path d="M 206 96 C 250 140 282 186 338 206" fill="none" stroke={C.coral} strokeWidth="2.6" />
      <path d="M 338 206 C 300 244 260 266 210 286" fill="none" stroke={C.coral} strokeWidth="2.6" />
      <circle cx="338" cy="206" r="4" fill={C.coral} />
      <Label x={372} y={214} color={C.coral} size={12}>detachment</Label>
      <path d="M 244 108 C 280 118 288 136 282 154" fill="none" stroke={C.blue} strokeWidth="2" />
      <Label x={294} y={112} color={C.blue} size={12}>rollover</Label>
      <rect x="336" y="122" width="58" height="30" rx="5" fill={C.white} stroke={C.mist} />
      <Label x={365} y={141} anchor="middle" color={C.mist} size={9}>graben</Label>
      <rect x="28" y="288" width="584" height="20" fill={C.peat} opacity="0.55" />
      <Label x={44} y={303} color={C.ink} size={12}>mobile shale</Label>
      <Label x={32} y={38} color={C.ink} size={14} weight={600}>Rollover, not buckle</Label>
      <Label x={32} y={58} color={C.mist} size={12}>slip on a listric fault bends the hanging wall</Label>
    </Frame>
  )
}

function RefractionAcquisition() {
  return (
    <Frame label="Seismic refraction schematic">
      <Ground y={92} layers={false} />
      <rect x="28" y="92" width="584" height="54" fill={C.sand} opacity="0.65" />
      <rect x="28" y="146" width="584" height="70" fill={C.clay} opacity="0.5" />
      <line x1="28" y1="146" x2="612" y2="146" stroke={C.ink} strokeWidth="2" />
      <circle cx="74" cy="86" r="9" fill={C.coral} />
      <Label x={74} y={70} anchor="middle" color={C.coral} size={12}>hammer</Label>
      {[140, 210, 280, 350, 420, 490, 560].map((x) => (
        <g key={x}>
          <path d={`M ${x - 7} 92 L ${x + 7} 92 L ${x} 82 Z`} fill={C.blue} />
          <line x1={x} y1="92" x2={x} y2="100" stroke={C.ink} />
        </g>
      ))}
      <path d="M 74 92 L 560 92" stroke={C.mist} strokeWidth="1.4" strokeDasharray="4 4" />
      <path d="M 74 92 L 420 146 L 560 92" fill="none" stroke={C.blue} strokeWidth="1.8" />
      <Label x={250} y={136} color={C.blue} size={12}>head wave</Label>
      <Label x={36} y={122} color={C.ink} size={12} mono>V₁</Label>
      <Label x={36} y={180} color={C.ink} size={12} mono>V₂ &gt; V₁</Label>
      <g transform="translate(390 196)">
        <rect width="216" height="94" rx="8" fill={C.white} stroke="rgba(37,37,37,0.12)" />
        <path d="M 16 74 L 78 58 L 126 34 L 196 22" fill="none" stroke={C.blue} strokeWidth="2" />
        <line x1="16" y1="80" x2="196" y2="80" stroke={C.grid} />
        <Label x={16} y={16} color={C.mist} size={9} mono>time</Label>
        <Label x={196} y={88} anchor="end" color={C.mist} size={9} mono>offset</Label>
        <Label x={140} y={54} color={C.blue} size={9}>slope = 1/V₂</Label>
      </g>
    </Frame>
  )
}

function RefractionAirport() {
  return (
    <Frame label="Airport refraction and MASW schematic">
      <rect x="28" y="70" width="584" height="26" fill={C.mist} opacity="0.55" />
      <Label x={44} y={88} color={C.white} size={12}>taxiway</Label>
      <rect x="28" y="96" width="584" height="58" fill={C.sand} opacity="0.7" />
      <rect x="28" y="154" width="584" height="76" fill={C.clay} opacity="0.55" />
      <line x1="28" y1="154" x2="612" y2="154" stroke={C.blue} strokeWidth="1.6" strokeDasharray="6 5" />
      <Label x={40} y={174} color={C.blue} size={12}>groundwater table (Vp/Vs)</Label>
      <path d="M 28 210 C 180 210 300 222 420 206 S 560 196 612 204" fill="none" stroke={C.ink} strokeWidth="2" />
      <Label x={40} y={230} color={C.ink} size={12}>stiffer material</Label>
      <circle cx="92" cy="62" r="8" fill={C.coral} />
      {[180, 250, 320, 390, 460, 530].map((x) => (
        <path key={x} d={`M ${x - 6} 70 L ${x + 6} 70 L ${x} 60 Z`} fill={C.blue} />
      ))}
      <path d="M 92 70 L 320 154 L 530 70" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.7" />
      <g transform="translate(420 82)">
        <rect width="186" height="64" rx="8" fill={C.white} stroke="rgba(37,37,37,0.12)" />
        <Label x={12} y={20} color={C.mist} size={9} mono>Vs profile</Label>
        <path d="M 12 32 L 54 32 L 54 46 L 110 46 L 110 58 L 174 58" fill="none" stroke={C.teal} strokeWidth="2" />
      </g>
    </Frame>
  )
}

function ResistivityAcquisition() {
  return (
    <Frame label="Four electrode resistivity array schematic">
      <Ground y={120} />
      {[
        { x: 100, label: 'A', fill: C.coral },
        { x: 240, label: 'M', fill: C.ink },
        { x: 400, label: 'N', fill: C.ink },
        { x: 540, label: 'B', fill: C.coral },
      ].map((e) => (
        <g key={e.label}>
          <path d={`M ${e.x - 9} 112 L ${e.x + 9} 112 L ${e.x} 126 Z`} fill={e.fill} />
          <line x1={e.x} y1="126" x2={e.x} y2="152" stroke={e.fill} strokeWidth="2" />
          <Label x={e.x} y={104} anchor="middle" color={e.fill} size={12} weight={600}>{e.label}</Label>
        </g>
      ))}
      <path d="M 100 120 C 170 204 470 204 540 120" fill="none" stroke={C.coral} strokeWidth="1.6" strokeDasharray="5 5" />
      <path d="M 240 120 C 300 176 340 176 400 120" fill="none" stroke={C.blue} strokeWidth="1.6" />
      <Label x={320} y={214} anchor="middle" color={C.coral} size={12}>current flow</Label>
      <Label x={320} y={244} anchor="middle" color={C.mist} size={12}>ρa = K · ΔV / I</Label>
      <Label x={32} y={38} color={C.ink} size={14} weight={600}>Push current, measure voltage</Label>
      <Label x={32} y={58} color={C.mist} size={12}>the geometric factor K turns ΔV into apparent resistivity</Label>
    </Frame>
  )
}

function ResistivityAquifer() {
  return (
    <Frame label="Shallow aquifer resistivity schematic">
      <rect x="28" y="84" width="584" height="54" fill={C.sand} opacity="0.65" />
      <rect x="28" y="138" width="584" height="58" fill={C.sky} opacity="0.22" />
      <rect x="28" y="196" width="584" height="64" fill={C.clay} opacity="0.6" />
      <line x1="28" y1="138" x2="612" y2="138" stroke={C.blue} strokeWidth="1.6" strokeDasharray="6 5" />
      <line x1="28" y1="196" x2="612" y2="196" stroke={C.ink} strokeWidth="1.8" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={180 + i * 44} cy={166 + (i % 2) * 10} r="4" fill={C.blue} opacity={0.7} />
      ))}
      <Label x={40} y={110} color={C.ink} size={12}>dry overburden</Label>
      <Label x={40} y={166} color={C.blue} size={12} weight={600}>saturated aquifer</Label>
      <Label x={40} y={232} color={C.ink} size={12}>clay basement</Label>
      <g transform="translate(370 74)">
        <rect width="238" height="202" rx="10" fill={C.white} stroke="rgba(37,37,37,0.12)" />
        <Label x={14} y={20} color={C.mist} size={9} mono>apparent resistivity</Label>
        <path d="M 14 44 L 58 44 L 58 90 L 126 90 L 126 146 L 222 146" fill="none" stroke={C.blue} strokeWidth="2.2" />
        <Label x={64} y={82} color={C.blue} size={9}>low: water</Label>
        <Label x={132} y={164} color={C.mist} size={9}>higher: clay?</Label>
        <Label x={14} y={188} color={C.mist} size={9} mono>log spacing →</Label>
      </g>
    </Frame>
  )
}

function HvsrAcquisition() {
  return (
    <Frame label="Three component microtremor station schematic">
      <Ground y={150} />
      <rect x="260" y="104" width="120" height="46" rx="8" fill={C.ink} />
      <circle cx="320" cy="127" r="8" fill={C.sky} />
      <Label x={320} y={92} anchor="middle" color={C.ink} size={12} weight={600}>3C seismometer</Label>
      <Label x={320} y={174} anchor="middle" color={C.mist} size={12}>N · E · Z</Label>
      {[80, 160, 480, 560].map((x, i) => (
        <path key={x} d={`M ${x} 150 C ${x + (i < 2 ? 30 : -30)} 118 ${x + (i < 2 ? 60 : -60)} 118 ${x + (i < 2 ? 86 : -86)} 150`} fill="none" stroke={C.blue} strokeWidth="1.4" opacity="0.55" />
      ))}
      <g transform="translate(40 210)">
        <rect width="260" height="82" rx="8" fill={C.white} stroke="rgba(37,37,37,0.12)" />
        <path d="M 14 48 C 50 28 86 66 122 42 S 190 24 246 46" fill="none" stroke={C.teal} strokeWidth="1.8" />
        <path d="M 14 64 C 50 54 86 72 122 58 S 190 48 246 66" fill="none" stroke={C.mist} strokeWidth="1.4" opacity="0.7" />
        <Label x={14} y={18} color={C.mist} size={9} mono>ambient vibration</Label>
      </g>
      <g transform="translate(360 210)">
        <rect width="240" height="82" rx="8" fill={C.white} stroke="rgba(37,37,37,0.12)" />
        <path d="M 14 64 L 64 64 L 98 26 L 132 64 L 214 64" fill="none" stroke={C.coral} strokeWidth="2.2" />
        <line x1="98" y1="64" x2="98" y2="34" stroke={C.coral} strokeDasharray="3 3" />
        <Label x={98} y={20} anchor="middle" color={C.coral} size={12} mono>f0</Label>
        <Label x={14} y={18} color={C.mist} size={9} mono>H/V</Label>
      </g>
    </Frame>
  )
}

function HvsrCurve() {
  return (
    <Frame label="Reading an H/V spectral ratio curve">
      <g transform="translate(70 36)">
        <line x1="0" y1="220" x2="470" y2="220" stroke={C.ink} strokeWidth="1.4" />
        <line x1="0" y1="0" x2="0" y2="220" stroke={C.ink} strokeWidth="1.4" />
        <path d="M 10 198 C 80 196 136 154 184 92 C 218 48 242 42 278 86 C 320 140 380 184 462 190" fill="none" stroke={C.blue} strokeWidth="2.6" />
        <line x1="222" y1="220" x2="222" y2="54" stroke={C.coral} strokeWidth="1.3" strokeDasharray="5 5" />
        <line x1="0" y1="54" x2="222" y2="54" stroke={C.coral} strokeWidth="1.3" strokeDasharray="5 5" />
        <circle cx="222" cy="54" r="4.5" fill={C.coral} />
        <Label x={222} y={242} anchor="middle" color={C.coral} size={12} mono>f0</Label>
        <Label x={-14} y={54} anchor="end" color={C.coral} size={12} mono>A0</Label>
        <Label x={-14} y={224} anchor="end" color={C.mist} size={12} mono>1</Label>
        <Label x={470} y={244} anchor="end" color={C.mist} size={12}>frequency (log)</Label>
        <Label x={-34} y={-8} color={C.mist} size={12} mono>H/V</Label>
      </g>
      <Label x={70} y={30} color={C.ink} size={14} weight={600}>The peak is a resonance, not a layer boundary</Label>
      <Label x={70} y={300} color={C.mist} size={12}>f0 ≈ Vs / 4H for a single layer; A0 grows with impedance contrast</Label>
    </Frame>
  )
}

export function TheoryFigure({ figureId }: { figureId: FigureId }) {
  const { lang } = useI18n()
  const meta = figureMeta[figureId]
  return (
    <figure className="overflow-hidden rounded-xl border border-black/10 bg-gs-panel">
      {figureId === 'gpr-acquisition' && <GprAcquisition />}
      {figureId === 'gpr-peat' && <GprPeat />}
      {figureId === 'mag-acquisition' && <MagAcquisition />}
      {figureId === 'mag-profile' && <MagProfile />}
      {figureId === 'gravity-acquisition' && <GravityAcquisition />}
      {figureId === 'gravity-basin' && <GravityBasin />}
      {figureId === 'reflection-acquisition' && <ReflectionAcquisition />}
      {figureId === 'reflection-fold' && <ReflectionFold />}
      {figureId === 'reflection-tarakan' && <ReflectionTarakan />}
      {figureId === 'refraction-acquisition' && <RefractionAcquisition />}
      {figureId === 'refraction-airport' && <RefractionAirport />}
      {figureId === 'resistivity-acquisition' && <ResistivityAcquisition />}
      {figureId === 'resistivity-aquifer' && <ResistivityAquifer />}
      {figureId === 'hvsr-acquisition' && <HvsrAcquisition />}
      {figureId === 'hvsr-curve' && <HvsrCurve />}
      <figcaption className="border-t border-black/8 px-4 py-2.5 text-xs leading-relaxed text-gs-mist">
        <span className="font-semibold text-gs-ice">{meta.title[lang]}.</span> {meta.caption[lang]}
      </figcaption>
    </figure>
  )
}
