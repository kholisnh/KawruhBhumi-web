interface PipelineStagesProps {
  stages: Array<{ t: string; d: string }>
  /** Index of the stage currently highlighted; -1 = none. */
  activeIndex?: number
}

/** Visual separation of model → solver → synthetic → interpretation (spec §6). */
export function PipelineStages({ stages, activeIndex = 1 }: PipelineStagesProps) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage, i) => {
        const active = i === activeIndex
        return (
          <li
            key={stage.t}
            className={`relative rounded-xl border px-3 py-2.5 ${
              active ? 'border-gs-cyan/50 bg-gs-cyan/8' : 'border-black/10 bg-gs-deep/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`gs-number flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold ${
                  active ? 'bg-gs-cyan text-gs-navy' : 'bg-black/5 text-gs-mist'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-xs font-semibold ${active ? 'text-gs-cyan' : 'text-gs-ice'}`}>{stage.t}</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-gs-mist">{stage.d}</p>
          </li>
        )
      })}
    </ol>
  )
}
