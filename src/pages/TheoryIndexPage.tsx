import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { METHODS } from '../content/methods'
import { site, tr } from '../content/site'
import { theoryByMethod } from '../content/theory'
import { useI18n } from '../i18n'

export function TheoryIndexPage() {
  const { d, lang } = useI18n()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading label={tr(site.theoryPage.label, lang)} title={tr(site.theoryPage.title, lang)} subtitle={tr(site.theoryPage.sub, lang)} />

      <div className="mt-9 space-y-5">
        {METHODS.map((meta) => {
          const info = d.methods.list[meta.id]
          const chapters = theoryByMethod[meta.id].chapters
          return (
            <Card key={meta.id} className="overflow-hidden" accent={meta.accent}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-10 items-center justify-center rounded-md text-xs font-bold tracking-wider"
                    style={{ backgroundColor: `${meta.accent}1a`, color: meta.ink }}
                  >
                    {info.abbr}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-gs-ice">{info.name}</h2>
                    <p className="text-xs text-gs-mist">
                      {chapters.length} {tr(site.theoryPage.chapters, lang)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/teori/${meta.id}/${chapters[0].id}`} className="inline-flex min-h-11 items-center text-xs font-semibold text-gs-cyan hover:text-gs-ice">
                    {tr(site.theoryPage.start, lang)}
                  </Link>
                  <Link to={`/metode/${meta.id}`} className="inline-flex min-h-11 items-center text-xs text-gs-mist hover:text-gs-ice">
                    {tr(site.methodPage.overview, lang)}
                  </Link>
                </div>
              </div>
              <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((chapter, index) => (
                  <li key={chapter.id} className="border-b border-black/6 last:border-b-0 sm:border-r">
                    <Link to={`/teori/${meta.id}/${chapter.id}`} className="group flex h-full flex-col px-4 py-3 transition-colors hover:bg-gs-deep/60">
                      <span className="gs-number text-xs font-semibold text-gs-mist">{String(index + 1).padStart(2, '0')}</span>
                      <span className="mt-0.5 text-xs font-semibold text-gs-ice group-hover:text-gs-cyan">{tr(chapter.title, lang)}</span>
                      <span className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-gs-mist">{tr(chapter.summary, lang)}</span>
                      <span className="mt-2 text-xs text-gs-mist">
                        {chapter.minutes} {tr(site.methodPage.minutes, lang)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-gs-mist">
        <Badge soft color="#3664F4">
          {tr(site.theoryPage.chapters, lang)}
        </Badge>
        {tr(site.chapterPage.simulatorNote, lang)}
      </div>
    </div>
  )
}
