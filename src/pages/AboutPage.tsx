import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { METHODS } from '../content/methods'
import { site } from '../content/site'
import { referenceById } from '../content/references'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'

const keyRefIds = ['nagy2000', 'koefoed1979', 'blakely1995', 'telford1990', 'jol2009', 'yilmaz2001']

export function AboutPage() {
  const { d } = useI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading label={d.about.label} title={d.about.heading} subtitle={d.about.sub} />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Panel title={d.about.missionTitle}>
          <p className="text-sm leading-relaxed text-gs-mist">{d.about.missionBody}</p>
        </Panel>
        <Panel title={d.about.whoTitle}>
          <p className="text-sm leading-relaxed text-gs-mist">{d.about.whoBody}</p>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title={d.about.scopeTitle}>
          <ul className="space-y-2.5">
            {d.about.scopeItems.map((item) => (
              <li key={item} className="flex gap-2 text-xs leading-relaxed text-gs-mist">
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gs-cyan/70" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={d.about.roadmapTitle}>
          <p className="text-xs leading-relaxed text-gs-mist">{d.about.roadmapBody}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {METHODS.map((meta) => (
              <Badge key={meta.id} soft color={meta.accent}>
                {d.methods.list[meta.id].abbr}
              </Badge>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title={d.about.techTitle}>
          <p className="text-xs leading-relaxed text-gs-mist">{d.about.techBody}</p>
        </Panel>
        <Panel title={d.footer.communityTitle}>
          <p className="text-xs leading-relaxed text-gs-mist">{d.footer.communityBody}</p>
          <a href={`mailto:${site.disclaimer.email}`} className="mt-2 inline-block text-xs font-semibold text-gs-cyan hover:text-gs-ice">
            {site.disclaimer.email}
          </a>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/resources">
              <Button variant="secondary" size="sm">
                {d.footer.docs[2].label}
              </Button>
            </Link>
            <Link to="/simulator">
              <Button variant="ghost" size="sm">
                {d.footer.docs[0].label}
              </Button>
            </Link>
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title={d.physics.reference}>
          <ul className="space-y-2">
            {keyRefIds.map((id) => {
              const ref = referenceById(id)
              if (!ref) return null
              return (
                <li key={id} className="text-xs text-gs-mist">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-gs-ice underline decoration-gs-cyan/40 underline-offset-2 hover:text-gs-cyan"
                  >
                    {ref.title}
                  </a>{' '}
                  — {ref.authors} ({ref.year})
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <p className="mt-6 rounded-2xl border border-gs-amber/25 bg-gs-amber/5 px-4 py-3 text-xs leading-relaxed text-gs-mist">
        <span className="gs-label mr-2 text-gs-amber">{d.footer.disclaimerTitle}</span>
        {d.footer.disclaimer}
      </p>
    </div>
  )
}
