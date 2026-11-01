export type PresetMethod = 'gpr' | 'magnetic' | 'gravity' | 'reflection' | 'refraction' | 'resistivity'

export function PresetThumbnail({ method }: { method: PresetMethod }) {
  return (
    <svg viewBox="0 0 96 48" className="h-12 w-full text-gs-cyan" fill="none" stroke="currentColor" aria-hidden>
      <rect x="0.5" y="0.5" width="95" height="47" rx="7" className="fill-gs-deep/60 stroke-black/10" />
      {method === 'gpr' && (
        <>
          <path d="M8 18h80M8 28h80M8 38h80" className="stroke-gs-mist/35" strokeWidth="0.8" />
          <path d="M20 15c8 10 16 10 24 0M42 15c8 10 16 10 24 0" className="stroke-gs-cyan" strokeWidth="1.5" />
          <path d="M15 9h66" className="stroke-gs-amber" strokeWidth="1.2" strokeDasharray="3 2" />
        </>
      )}
      {method === 'magnetic' && (
        <>
          <path d="M8 32h80" className="stroke-gs-mist/35" strokeWidth="0.8" />
          <path d="M10 32c12 0 14-17 26-17s15 17 26 17 14-12 24-12" className="stroke-gs-cyan" strokeWidth="1.6" />
          <path d="M38 15v17" className="stroke-gs-amber" strokeWidth="1.2" strokeDasharray="3 2" />
        </>
      )}
      {method === 'gravity' && (
        <>
          <path d="M8 32h80" className="stroke-gs-mist/35" strokeWidth="0.8" />
          <path d="M10 32c16 0 17-19 38-19s22 19 38 19" className="stroke-gs-cyan" strokeWidth="1.6" />
          <ellipse cx="48" cy="33" rx="17" ry="5" className="stroke-gs-amber/80" strokeWidth="1" strokeDasharray="3 2" />
        </>
      )}
      {method === 'reflection' && (
        <>
          <path d="M8 8v32M24 8v32M40 8v32M56 8v32M72 8v32M88 8v32" className="stroke-gs-mist/20" strokeWidth="0.8" />
          <path d="M16 10l2 5-2 5 2 5-2 5 2 5M32 10l-2 6 2 4-2 7 2 3-2 5M48 10l2 4-2 7 2 4-2 5 2 5" className="stroke-gs-cyan" strokeWidth="1.4" />
          <path d="M8 24h80" className="stroke-gs-amber" strokeWidth="1" strokeDasharray="3 2" />
        </>
      )}
      {method === 'refraction' && (
        <>
          <path d="M8 40h80M8 40V8" className="stroke-gs-mist/35" strokeWidth="0.8" />
          <path d="M10 37l70-24M30 33l50-10" className="stroke-gs-cyan" strokeWidth="1.6" />
          <path d="M10 37l70-24" className="stroke-gs-amber" strokeWidth="1.1" strokeDasharray="3 2" />
        </>
      )}
      {method === 'resistivity' && (
        <>
          <path d="M8 40h80M8 40V8" className="stroke-gs-mist/35" strokeWidth="0.8" />
          <path d="M10 14c18 0 18 20 36 20s22-12 40-12" className="stroke-gs-cyan" strokeWidth="1.6" />
          <circle cx="28" cy="19" r="1.5" className="fill-gs-cyan" />
          <circle cx="48" cy="33" r="1.5" className="fill-gs-cyan" />
          <circle cx="68" cy="25" r="1.5" className="fill-gs-cyan" />
        </>
      )}
    </svg>
  )
}
