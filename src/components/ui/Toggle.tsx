import { InfoTip } from './InfoTip'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  title?: string
  help?: string
}

export function Toggle({ label, checked, onChange, title, help }: ToggleProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-gs-mist">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        title={title}
        onClick={() => onChange(!checked)}
        className="group inline-flex items-center gap-2 hover:text-gs-ice"
      >
        <span
          className={`relative inline-block h-4.5 w-8 rounded-full transition-colors ${
            checked ? 'bg-gs-cyan' : 'bg-black/8'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-gs-navy transition-transform ${
              checked ? 'translate-x-3.5' : ''
            }`}
          />
        </span>
        {label}
      </button>
      {help && <InfoTip label={label}>{help}</InfoTip>}
    </span>
  )
}
