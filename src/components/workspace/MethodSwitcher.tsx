import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { METHODS } from '../../content/methods'

export function MethodSwitcher({ active }: { active: string }) {
  const { d } = useI18n()
  return (
    <nav className="no-print -mt-2 mb-4 flex items-center gap-1.5 overflow-x-auto pb-1" aria-label={d.wshared.switchMethod}>
      <Link
        to="/simulator"
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gs-mist transition-colors hover:bg-black/5 hover:text-gs-ice"
      >
        {d.wshared.allMethods}
      </Link>
      {METHODS.map((m) => (
        <Link
          key={m.id}
          to={m.route}
          title={d.methods.list[m.id].name}
          aria-current={active === m.id ? 'page' : undefined}
          className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
            active === m.id ? 'text-gs-navy' : 'text-gs-mist hover:bg-black/5 hover:text-gs-ice'
          }`}
          style={active === m.id ? { backgroundColor: m.accent } : undefined}
        >
          {d.methods.list[m.id].abbr}
        </Link>
      ))}
    </nav>
  )
}
