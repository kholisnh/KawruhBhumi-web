import { Link } from 'react-router-dom'
import { MethodGlyph } from '../components/method/MethodGlyph'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { METHODS } from '../content/methods'
import { site, tr } from '../content/site'
import { theoryByMethod } from '../content/theory'
import { useI18n } from '../i18n'

export function MethodsPage() {
  const { d, lang } = useI18n()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading label={tr(site.methodsPage.label, lang)} title={tr(site.methodsPage.title, lang)} subtitle={tr(site.methodsPage.sub, lang)} />

      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {METHODS.map((meta) => {
          const info = d.methods.list[meta.id]
          const chapters = theoryByMethod[meta.id]?.chapters.length ?? 0
          return (
            <Card key={meta.id} hover accent={meta.accent} className="flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-4 pb-2">
                <div>
                  <h2 className="text-base font-semibold text-gs-ice"><Link to={`/metode/${meta.id}`} className="inline-flex min-h-11 items-center hover:text-gs-cyan">{info.name}</Link></h2>
                  <p className="gs-number mt-0.5 text-xs font-semibold tracking-widest" style={{ color: meta.ink }}>
                    {info.abbr}
                  </p>
                </div>
                <Badge soft color={meta.accent}>
                  {chapters} {tr(site.methodsPage.chapters, lang)}
                </Badge>
              </div>

              <div className="px-4">
                <MethodGlyph id={meta.id} accent={meta.accent} className="h-24 w-full" />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs leading-relaxed text-gs-mist">{info.short}</p>
                <div className="mt-3 space-y-2 border-t border-black/8 pt-3">
                  <div>
                    <p className="gs-label">{tr(site.methodsPage.property, lang)}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gs-mist">{info.property}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/teori/${meta.id}/${theoryByMethod[meta.id].chapters[0].id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-gs-raised px-3 py-1.5 text-xs font-semibold text-gs-ice transition-colors hover:bg-gs-deep"
                  >
                    {tr(site.methodsPage.theory, lang)}
                  </Link>
                  <Link
                    to={meta.route}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-gs-cyan px-3 py-1.5 text-xs font-semibold text-gs-white transition-colors hover:bg-[#2952D6]"
                  >
                    {tr(site.methodsPage.simulator, lang)}
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
