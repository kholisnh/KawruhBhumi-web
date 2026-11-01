import { useI18n } from '../../../i18n'
import type { PresetCardItem } from './types'

const difficultyClass: Record<string, string> = {
  easy: 'border-gs-teal/40 bg-gs-teal/10 text-gs-teal',
  medium: 'border-gs-amber/40 bg-gs-amber/10 text-gs-amber',
  advanced: 'border-gs-danger/40 bg-gs-danger/10 text-gs-danger',
}

export function PresetCards({
  items,
  activeId,
  onSelect,
}: {
  items: PresetCardItem[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const { d } = useI18n()
  const r = d.wshared.r2

  return (
    <div className="mt-3 border-t border-black/8 pt-3" data-r2-presets>
      <p className="text-xs font-semibold text-gs-ice">{r.presetsTitle}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-gs-mist">{r.presetsSub}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              data-r2-preset={item.id}
              aria-pressed={active}
              onClick={() => onSelect(item.id)}
              className={`min-w-0 rounded-xl border p-2 text-left transition-colors ${
                active
                  ? 'border-gs-cyan/60 bg-gs-cyan/8 shadow-sm'
                  : 'border-black/10 bg-gs-deep/40 hover:border-gs-cyan/30 hover:bg-gs-deep/70'
              }`}
            >
              <div className="flex min-w-0 items-start gap-2">
                <div className="w-16 shrink-0">{item.thumbnail}</div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-gs-ice">{item.label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${difficultyClass[item.level] ?? difficultyClass.medium}`}>
                      {item.difficulty}
                    </span>
                    <span className="gs-number text-[9px] text-gs-mist">{r.expected}: {item.expected}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
