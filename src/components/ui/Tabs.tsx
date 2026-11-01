interface TabsProps<T extends string> {
  tabs: Array<{ id: T; label: string; disabled?: boolean }>
  active: T
  onChange: (id: T) => void
  className?: string
}

export function Tabs<T extends string>({ tabs, active, onChange, className = '' }: TabsProps<T>) {
  return (
    <div role="tablist" className={`inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-gs-deep/70 p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={active === tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={`min-h-11 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            active === tab.id
              ? 'bg-gs-raised text-gs-ice shadow'
              : 'text-gs-mist hover:bg-black/4 hover:text-gs-ice disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
