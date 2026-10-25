import { Link } from 'react-router-dom'
import { HeroScene } from '../components/geo/HeroScene'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { METHODS } from '../content/methods'
import { site, tr } from '../content/site'
import { useI18n } from '../i18n'

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

export function LandingPage() {
  const { d, lang } = useI18n()

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 12% 0%, rgba(54,100,244,0.10) 0%, transparent 60%), radial-gradient(40% 35% at 88% 10%, rgba(96,203,255,0.12) 0%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <Badge soft color="#3664F4">
              {tr(site.landing.badge, lang)}
            </Badge>
            <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-gs-ice sm:text-5xl">
              {tr(site.landing.title1, lang)}
              <br />
              <span className="bg-gradient-to-r from-gs-cyan via-gs-teal to-gs-ice bg-clip-text text-transparent">
                {tr(site.landing.title2, lang)}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-gs-mist sm:text-base">{tr(site.landing.subtitle, lang)}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/metode">
                <Button variant="primary" size="lg">
                  {tr(site.landing.ctaPrimary, lang)}
                </Button>
              </Link>
              <Link to="/teori">
                <Button variant="secondary" size="lg">
                  {tr(site.landing.ctaSecondary, lang)}
                </Button>
              </Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                { value: '7', label: tr(site.landing.statMethods, lang), color: '#3664F4' },
                { value: '35', label: tr(site.landing.statChapters, lang), color: '#2E9FBF' },
                { value: '7', label: tr(site.landing.statSolvers, lang), color: '#E85353' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-black/8 bg-gs-panel/70 px-3 py-2.5">
                  <dt className="text-xs font-semibold tracking-wider text-gs-mist uppercase">{stat.label}</dt>
                  <dd className="gs-number mt-1 text-xl font-semibold" style={{ color: stat.color }}>
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-gs-deep/70 shadow-panel">
              <HeroScene className="aspect-[16/11] w-full" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gs-mist/80">{tr(site.landing.caption, lang)}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="grid gap-5 rounded-2xl border border-gs-cyan/25 bg-gradient-to-br from-gs-cyan/8 via-gs-panel/70 to-gs-teal/8 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge soft color="#3664F4">{d.learning.demoBadge}</Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-gs-ice sm:text-2xl">{d.learning.demoTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gs-mist">{d.learning.demoBody}</p>
            <Link to="/simulator/hvsr" className="mt-4 inline-flex">
              <Button variant="primary" size="lg">{d.learning.demoCta}</Button>
            </Link>
          </div>
          <ol className="space-y-2">
            {d.learning.demoSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-black/10 bg-gs-panel/70 p-3 text-xs leading-relaxed text-gs-mist">
                <span className="gs-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gs-cyan/10 font-semibold text-gs-cyan">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 pb-14 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-gs-ice sm:text-2xl">{tr(site.landing.pathsTitle, lang)}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gs-mist">{tr(site.landing.pathsSub, lang)}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {site.landing.paths.map((path, index) => (
            <Link key={path.to} to={path.to} className="group">
              <Card hover className="flex h-full flex-col p-5">
                <span className="gs-number text-xs font-semibold text-gs-cyan">0{index + 1}</span>
                <h3 className="mt-2 text-base font-semibold text-gs-ice">{tr(path.title, lang)}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gs-mist">{tr(path.body, lang)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gs-cyan">
                  {tr(path.cta, lang)}
                  <Arrow />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-gs-ice sm:text-2xl">{tr(site.landing.methodsTitle, lang)}</h2>
          <Link to="/metode" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gs-cyan hover:text-gs-ice">
            {tr(site.nav.methods, lang)}
            <Arrow />
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map((meta) => {
            const info = d.methods.list[meta.id]
            return (
              <Link key={meta.id} to={`/metode/${meta.id}`} className="group">
                <div className="flex h-full items-start gap-3 rounded-xl border border-black/10 bg-gs-panel/60 p-4 transition-colors hover:border-black/20 hover:bg-gs-panel">
                  <span
                    className="mt-0.5 flex h-9 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-wider"
                    style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
                  >
                    {info.abbr}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gs-ice">{info.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gs-mist">{info.short}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-gs-amber/25 bg-gs-amber/5 px-4 py-3 text-xs leading-relaxed text-gs-mist sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">
            <span className="gs-label mr-2 text-gs-amber">!</span>
            {tr(site.landing.disclaimer, lang)}
          </p>
          <Link to="/disclaimer" className="shrink-0 font-semibold text-gs-cyan hover:text-gs-ice">
            {tr(site.landing.disclaimerLink, lang)}
          </Link>
        </div>
      </section>
    </>
  )
}
