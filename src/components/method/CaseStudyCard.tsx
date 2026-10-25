import { Link } from 'react-router-dom'
import { caseStudiesByMethod } from '../../content/cases'
import type { MethodId } from '../../content/methods'
import { referenceById } from '../../content/references'
import { site, tr } from '../../content/site'
import { useI18n } from '../../i18n'
import { TheoryFigure } from '../geo/TheoryFigure'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export function CaseStudySection({ methodId }: { methodId: MethodId }) {
  const { d, lang } = useI18n()
  const cases = caseStudiesByMethod(methodId)
  if (cases.length === 0) return null
  const route = `/simulator/${methodId}`

  return (
    <section className="mt-10" aria-labelledby="field-case-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="gs-label text-gs-cyan">{tr(site.methodPage.caseTitle, lang)}</p>
          <h2 id="field-case-heading" className="mt-1 text-xl font-semibold text-gs-ice">
            {d.methods.list[methodId].name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gs-mist">{tr(site.methodPage.caseSub, lang)}</p>
        </div>
        <Link to={route} className="text-xs font-semibold text-gs-cyan hover:text-gs-ice">
          {tr(site.methodPage.caseOpen, lang)} →
        </Link>
      </div>

      <div className={`mt-4 grid gap-5 ${cases.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {cases.map((item) => {
          const source = referenceById(item.sourceId)
          return (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
                <Badge soft color="#2E9FBF">
                  {item.year} · {tr(item.place, lang)}
                </Badge>
                <span className="text-xs font-medium text-gs-mist">{tr(site.methodPage.caseFigure, lang)}</span>
              </div>
              <h3 className="px-4 pt-2 text-base font-semibold text-gs-ice">{tr(item.title, lang)}</h3>
              <div className="mt-3">
                <TheoryFigure figureId={item.figureId} />
              </div>
              <dl className="space-y-3 px-4 py-4">
                <div>
                  <dt className="gs-label">{tr(site.methodPage.caseQuestion, lang)}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-gs-ice">{tr(item.question, lang)}</dd>
                </div>
                <div>
                  <dt className="gs-label">{tr(site.methodPage.caseSetup, lang)}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-gs-mist">{tr(item.setup, lang)}</dd>
                </div>
                <div>
                  <dt className="gs-label">{tr(site.methodPage.caseFinding, lang)}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-gs-mist">{tr(item.finding, lang)}</dd>
                </div>
                <div className="rounded-lg border border-gs-cyan/15 bg-gs-cyan/5 p-3">
                  <dt className="gs-label text-gs-cyan">{tr(site.methodPage.caseLesson, lang)}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-gs-ice">{tr(item.lesson, lang)}</dd>
                </div>
                <div>
                  <dt className="gs-label">{tr(site.methodPage.caseTry, lang)}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-gs-mist">{tr(item.tryIt, lang)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center gap-3 border-t border-black/8 px-4 py-3">
                {source && (
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gs-cyan hover:text-gs-ice">
                    {tr(site.methodPage.caseSource, lang)} · {source.authors.split(',')[0]} {source.year}
                  </a>
                )}
                <Link to={route} className="ml-auto text-xs font-semibold text-gs-mist hover:text-gs-ice">
                  {d.methods.list[methodId].abbr} workspace →
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
