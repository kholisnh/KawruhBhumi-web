import type { MethodId } from '../../content/methods'

interface MethodGlyphProps {
  id: MethodId
  accent: string
  className?: string
}

/**
 * Small signature graphic per method (schematic previews for the method cards).
 * Deterministic SVGs — no random or data-derived content.
 */
export function MethodGlyph({ id, accent, className = '' }: MethodGlyphProps) {
  const stroke = accent
  return (
    <svg viewBox="0 0 240 132" className={className} role="img" aria-hidden="true">
      <rect x="0" y="0" width="240" height="132" rx="10" fill="#F5F7FB" />
      {id === 'gpr' && <GprGlyph accent={stroke} />}
      {id === 'magnetic' && <MagneticGlyph accent={stroke} />}
      {id === 'gravity' && <GravityGlyph accent={stroke} />}
      {id === 'reflection' && <ReflectionGlyph accent={stroke} />}
      {id === 'refraction' && <RefractionGlyph accent={stroke} />}
      {id === 'resistivity' && <ResistivityGlyph accent={stroke} />}
      {id === 'hvsr' && <HvsrGlyph accent={stroke} />}
    </svg>
  )
}

function Surface({ y = 30, accent }: { y?: number; accent: string }) {
  return (
    <>
      <line x1="8" y1={y} x2="232" y2={y} stroke="rgba(37,37,37,0.75)" strokeWidth="1.6" />
      <line x1="8" y1={y} x2="232" y2={y + 40} stroke="rgba(37,37,37,0.1)" strokeWidth="1" />
      <line x1="8" y1={y + 22} x2="232" y2={y + 22} stroke="rgba(37,37,37,0.12)" strokeWidth="1" />
      <circle cx="34" cy={y - 12} r="3" fill={accent} />
      <line x1="34" y1={y - 12} x2="34" y2={y} stroke={accent} strokeWidth="1.2" />
    </>
  )
}

function GprGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} />
      {[14, 22, 30].map((r, i) => (
        <path
          key={r}
          d={`M ${34 - r} 30 A ${r} ${r} 0 0 1 ${34 + r} 30`}
          fill="none"
          stroke={accent}
          strokeOpacity={0.65 - i * 0.16}
          strokeWidth="1.3"
        />
      ))}
      <circle cx="120" cy="86" r="11" fill="rgba(232,83,83,0.15)" stroke="#E85353" strokeWidth="1.5" />
      <text x="120" y="90" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#E85353">
        ?
      </text>
      <path d="M 60 66 Q 120 34 180 66" fill="none" stroke={accent} strokeWidth="1.6" strokeDasharray="4 4" />
      <path d="M 78 76 Q 120 50 162 76" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="3 5" />
    </g>
  )
}

function MagneticGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} />
      <rect x="103" y="72" width="34" height="24" rx="4" fill={`${accent}22`} stroke={accent} strokeWidth="1.4" />
      <text x="120" y="88" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={accent}>
        m
      </text>
      {[
        [88, 84, 16],
        [152, 84, 16],
        [70, 84, 30],
        [170, 84, 30],
      ].map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="none" stroke={accent} strokeOpacity={0.5 - i * 0.08} strokeWidth="1.2" />
      ))}
      <path d="M 12 108 C 60 108 70 92 96 92 S 130 124 168 124 S 212 108 228 108" fill="none" stroke={accent} strokeWidth="1.6" />
      <circle cx="96" cy="92" r="2.2" fill={accent} />
      <circle cx="168" cy="124" r="2.2" fill={accent} opacity="0.6" />
    </g>
  )
}

function GravityGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} />
      <g stroke={accent} strokeWidth="1.4" fill={`${accent}18`}>
        <rect x="86" y="66" width="26" height="20" />
        <rect x="112" y="66" width="26" height="20" />
        <rect x="86" y="86" width="26" height="20" />
        <rect x="112" y="86" width="26" height="20" />
      </g>
      {[99, 125].map((x) => (
        <g key={x} stroke={accent} strokeOpacity="0.7" strokeWidth="1.2">
          <line x1={x} y1="112" x2={x} y2="122" />
          <path d={`M ${x - 3} 119 L ${x} 122 L ${x + 3} 119`} fill="none" />
        </g>
      ))}
      <path d="M 12 40 C 70 40 88 22 120 22 S 180 40 228 40" fill="none" stroke="#E85353" strokeWidth="1.5" opacity="0.85" />
    </g>
  )
}

function ReflectionGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} y={26} />
      <line x1="8" y1="70" x2="232" y2="70" stroke="#3664F4" strokeOpacity="0.4" strokeWidth="1.4" />
      <line x1="8" y1="96" x2="232" y2="96" stroke="#2E9FBF" strokeOpacity="0.4" strokeWidth="1.4" />
      {[
        [96, 34],
        [150, 22],
        [204, 34],
      ].map(([rx, ry]) => (
        <path key={rx} d={`M 56 26 L 120 70 L ${rx} ${ry}`} fill="none" stroke={accent} strokeWidth="1.4" />
      ))}
      <line x1="50" y1="20" x2="62" y2="20" stroke={accent} strokeWidth="2" />
      <circle cx="56" cy="24" r="3" fill="#E85353" />
      {[96, 150, 204].map((rx) => (
        <path key={rx} d={`M ${rx - 4} 30 L ${rx + 4} 30 L ${rx} 24 Z`} fill={accent} opacity="0.85" />
      ))}
      <path d="M 12 118 L 40 118 L 56 104 L 72 126 L 94 110 L 108 120 L 132 116 L 160 122 L 190 112 L 228 118" fill="none" stroke={accent} strokeWidth="1.5" />
    </g>
  )
}

function RefractionGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} y={26} />
      <line x1="8" y1="70" x2="232" y2="70" stroke="#3664F4" strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="222" y="64" textAnchor="end" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.8)">
        V₁
      </text>
      <text x="222" y="86" textAnchor="end" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.8)">
        V₂ &gt; V₁
      </text>
      <path d="M 30 26 L 96 70 L 160 70 L 210 30" fill="none" stroke={accent} strokeWidth="1.6" />
      <path d="M 30 26 L 210 30" fill="none" stroke="rgba(37,37,37,0.5)" strokeWidth="1.2" strokeDasharray="4 4" />
      <circle cx="30" cy="26" r="3" fill="#E85353" />
      <path d="M 204 34 L 216 26 L 210 38 Z" fill={accent} opacity="0.85" />
      <path d="M 12 118 L 228 116" stroke={accent} strokeWidth="1.6" fill="none" />
      <path d="M 12 122 L 120 122 L 228 108" stroke="rgba(37,37,37,0.6)" strokeWidth="1.3" fill="none" strokeDasharray="5 4" />
      <circle cx="120" cy="122" r="2.4" fill={accent} />
    </g>
  )
}

function ResistivityGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} y={30} />
      {[70, 92, 148, 170].map((x, i) => (
        <g key={x}>
          <path d={`M ${x - 5} 24 L ${x + 5} 24 L ${x} 33 Z`} fill={i === 0 || i === 3 ? accent : '#252525'} opacity={i === 0 || i === 3 ? 0.9 : 0.55} />
          <text x={x} y={46} textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.65)">
            {['A', 'M', 'N', 'B'][i]}
          </text>
        </g>
      ))}
      {[14, 24, 34].map((r, i) => (
        <path
          key={r}
          d={`M ${70 - r * 1.4} 30 Q 120 ${30 + r * 2.6} ${170 + r * 1.2} 30`}
          fill="none"
          stroke={accent}
          strokeOpacity={0.55 - i * 0.13}
          strokeWidth="1.3"
          strokeDasharray={i === 2 ? '3 4' : undefined}
        />
      ))}
      <path d="M 20 74 H 220" stroke="#E85353" strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M 20 100 H 220" stroke="#3664F4" strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M 28 116 L 62 112 L 96 108 L 128 104 L 160 112 L 196 94 L 224 84" fill="none" stroke={accent} strokeWidth="1.8" />
      <circle cx="128" cy="104" r="2.4" fill={accent} />
      <text x="222" y="72" textAnchor="end" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.6)">
        ρ₁
      </text>
      <text x="222" y="98" textAnchor="end" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.6)">
        ρ₂
      </text>
    </g>
  )
}

function HvsrGlyph({ accent }: { accent: string }) {
  return (
    <g>
      <Surface accent={accent} y={34} />
      <rect x="104" y="74" width="40" height="34" rx="6" fill={`${accent}18`} stroke={accent} strokeWidth="1.5" />
      <circle cx="124" cy="91" r="7" fill="none" stroke={accent} strokeWidth="1.5" />
      <path d="M 124 84 L 124 98 M 117 91 L 131 91" stroke={accent} strokeWidth="1" opacity="0.7" />
      <text x="124" y="122" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill={accent}>3C</text>
      {[56, 192].map((x, i) => (
        <path key={x} d={`M ${x} 34 C ${x + (i ? -18 : 18)} 62 ${x + (i ? -32 : 32)} 62 ${x + (i ? -46 : 46)} 34`} fill="none" stroke={accent} strokeWidth="1.2" opacity="0.5" />
      ))}
      <rect x="166" y="74" width="58" height="38" rx="7" fill="#FFFFFF" stroke="rgba(37,37,37,0.16)" />
      <path d="M 174 104 L 186 104 L 196 84 L 207 104 L 216 104" fill="none" stroke={accent} strokeWidth="1.8" />
      <line x1="196" y1="104" x2="196" y2="88" stroke="#E85353" strokeDasharray="2 3" />
      <text x="196" y="126" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="rgba(37,37,37,0.7)">H/V</text>
      <path d="M 12 116 L 228 114" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M 12 120 L 120 120 L 228 108" stroke="rgba(37,37,37,0.5)" strokeWidth="1.2" fill="none" strokeDasharray="5 4" />
    </g>
  )
}
