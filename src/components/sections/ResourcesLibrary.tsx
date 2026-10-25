import { useMemo, useState } from 'react'
import { METHODS, type MethodId } from '../../content/methods'
import { references, type ReferenceType } from '../../content/references'
import { useI18n } from '../../i18n'
import { Badge } from '../ui/Badge'
import { SectionHeading } from '../ui/SectionHeading'
import { SelectField } from '../ui/SelectField'

type MethodFilter = MethodId | 'all'
type TypeFilter = ReferenceType | 'all'

export function ResourcesLibrary({ withHeading = true }: { withHeading?: boolean }) {
  const { d, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState<MethodFilter>('all')
  const [type, setType] = useState<TypeFilter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return references.filter((ref) => {
      if (method !== 'all' && !ref.methods.includes(method)) return false
      if (type !== 'all' && ref.type !== type) return false
      if (q) {
        const hay = `${ref.title} ${ref.authors} ${ref.venue}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [query, method, type])

  const typeColor: Record<ReferenceType, string> = {
    foundational: '#3664F4',
    teaching: '#2E9FBF',
    advanced: '#60CBFF',
    case: '#E85353',
  }

  return (
    <section id="resources" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {withHeading && <SectionHeading label={d.resources.label} title={d.resources.heading} subtitle={d.resources.sub} />}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-1 block text-xs font-medium text-gs-mist">{d.resources.searchPlaceholder}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={d.resources.searchPlaceholder}
              className="w-full rounded-xl border border-black/10 bg-gs-deep/80 px-3 py-2 text-xs text-gs-ice outline-none transition-colors placeholder:text-gs-mist/50 focus:border-gs-cyan/60"
            />
          </label>
          <div className="w-full sm:w-44">
            <SelectField
              label="Method"
              value={method}
              onChange={(v) => setMethod(v)}
              options={[
                { value: 'all', label: d.resources.allMethods },
                ...METHODS.map((m) => ({ value: m.id, label: `${d.methods.list[m.id].abbr} — ${d.methods.list[m.id].name}` })),
              ]}
            />
          </div>
          <div className="w-full sm:w-48">
            <SelectField
              label="Type"
              value={type}
              onChange={(v) => setType(v)}
              options={[
                { value: 'all', label: d.resources.allTypes },
                { value: 'foundational', label: d.resources.types.foundational },
                { value: 'teaching', label: d.resources.types.teaching },
                { value: 'advanced', label: d.resources.types.advanced },
                { value: 'case', label: d.resources.types.case },
              ]}
            />
          </div>
        </div>

        <p className="gs-number mt-3 text-xs text-gs-mist">
          {filtered.length} {d.resources.showing}
        </p>

        {filtered.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-black/10 bg-gs-deep/60 px-4 py-6 text-center text-xs text-gs-mist">
            {d.resources.noResults}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {filtered.map((ref) => (
              <li key={ref.id} className="rounded-2xl border border-black/10 bg-gs-panel/70 p-4 transition-colors hover:border-black/20">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gs-ice">{ref.title}</h3>
                    <p className="mt-0.5 text-xs text-gs-mist">
                      {ref.authors} — {ref.venue} ({ref.year})
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <Badge soft color={typeColor[ref.type]}>
                      {d.resources.types[ref.type]}
                    </Badge>
                    {ref.methods.map((m) =>
                      m === 'general' ? null : (
                        <Badge key={m} soft color={METHODS.find((x) => x.id === m)?.accent}>
                          {d.methods.list[m as MethodId].abbr}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gs-mist">{ref.relevance[lang]}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-gs-cyan underline decoration-gs-cyan/40 underline-offset-2 hover:text-gs-ice"
                  >
                    {d.resources.openSource} ↗
                  </a>
                  {ref.doi && <span className="gs-number text-xs text-gs-mist/80">doi:{ref.doi}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs leading-relaxed text-gs-mist/80">{d.resources.disclaimer}</p>
      </div>
    </section>
  )
}
