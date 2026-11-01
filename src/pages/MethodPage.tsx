import { Link, useParams } from 'react-router-dom'
import { CaseStudySection } from '../components/method/CaseStudyCard'
import { MethodGlyph } from '../components/method/MethodGlyph'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { METHODS, methodById, type MethodId } from '../content/methods'
import { site, tr } from '../content/site'
import { theoryByMethod } from '../content/theory'
import { useI18n } from '../i18n'

const isMethodId = (value: string | undefined): value is MethodId => METHODS.some((m) => m.id === value)

export function MethodPage() {
  const { d, lang } = useI18n()
  const { methodId } = useParams()
  if (!isMethodId(methodId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-gs-ice">Method not found</h1>
        <Link to="/metode" className="mt-4 inline-block text-sm font-semibold text-gs-cyan">
          {tr(site.methodPage.back, lang)}
        </Link>
      </div>
    )
  }

  const meta = methodById(methodId)
  const info = d.methods.list[methodId]
  const chapters = theoryByMethod[methodId].chapters

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/metode" className="inline-flex items-center gap-1.5 text-xs font-medium text-gs-mist transition-colors hover:text-gs-cyan">
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 10H4M9 5l-5 5 5 5" />
        </svg>
        {tr(site.methodPage.back, lang)}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="gs-number text-xs font-bold tracking-widest" style={{ color: meta.ink }}>
              {info.abbr}
            </span>
            <Badge soft color={meta.accent}>
              {chapters.length} {tr(site.methodsPage.chapters, lang)}
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gs-ice sm:text-4xl">{info.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-gs-mist sm:text-base">{info.short}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to={`/teori/${meta.id}/${chapters[0].id}`}>
              <Button variant="primary">{tr(site.methodPage.startChapter, lang)}</Button>
            </Link>
            <Link to={meta.route}>
              <Button variant="secondary">{tr(site.methodPage.openSimulator, lang)}</Button>
            </Link>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <MethodGlyph id={meta.id} accent={meta.accent} className="h-28 w-full" />
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="gs-label">{tr(site.methodPage.property, lang)}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gs-ice">{info.property}</p>
            <h2 className="gs-label mt-5">{tr(site.methodPage.mechanism, lang)}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gs-mist">{info.mechanism}</p>
          </Card>
          <Card className="p-5">
            <h2 className="gs-label">{tr(site.methodPage.applications, lang)}</h2>
            <ul className="mt-2 space-y-1.5">
              {info.apps.map((app) => (
                <li key={app} className="flex gap-2 text-xs leading-relaxed text-gs-mist">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.accent }} />
                  {app}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-gs-ice">{tr(site.methodPage.theoryTitle, lang)}</h2>
              <p className="mt-1 text-xs leading-relaxed text-gs-mist">{tr(site.methodPage.theorySub, lang)}</p>
            </div>
          </div>
          <ol className="mt-4 divide-y divide-black/8">
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link to={`/teori/${meta.id}/${chapter.id}`} className="group flex items-start gap-3 py-3">
                  <span className="gs-number mt-0.5 text-xs font-semibold text-gs-mist">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gs-ice group-hover:text-gs-cyan">{tr(chapter.title, lang)}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-gs-mist">{tr(chapter.summary, lang)}</span>
                  </span>
                  <span className="gs-number mt-0.5 text-xs text-gs-mist">{chapter.minutes}′</span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <CaseStudySection methodId={meta.id} />

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-gs-ice">{tr(site.methodPage.other, lang)}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {METHODS.filter((m) => m.id !== meta.id).map((m) => (
            <Link
              key={m.id}
              to={`/metode/${m.id}`}
              className="rounded-lg border border-black/10 bg-gs-panel/70 px-3 py-1.5 text-xs font-medium text-gs-mist transition-colors hover:border-black/20 hover:text-gs-ice"
            >
              {d.methods.list[m.id].name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
