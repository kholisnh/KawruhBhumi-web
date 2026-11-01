import { Link } from 'react-router-dom'
import { HvsrDemo } from '../components/demos/HvsrDemo'
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

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5h12" />
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
                { value: '35', label: tr(site.landing.statChapters, lang), color: '#19708A' },
                { value: '7', label: tr(site.landing.statSolvers, lang), color: '#B23A3A' },
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
            <p className="mt-3 text-xs leading-relaxed text-gs-mist">{tr(site.landing.caption, lang)}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="grid gap-5 rounded-2xl border border-gs-cyan/25 bg-gradient-to-br from-gs-cyan/8 via-gs-panel/70 to-gs-teal/8 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge soft color="#3664F4">{d.learning.demoBadge}</Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-gs-ice sm:text-2xl">{d.learning.demoTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gs-mist">{d.learning.demoBody}</p>
          </div>
          <HvsrDemo />
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
        <div className="grid gap-6 overflow-hidden rounded-2xl border border-gs-cyan/25 bg-gradient-to-br from-gs-cyan/8 via-gs-panel/80 to-gs-teal/8 p-5 sm:p-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-9">
          <div>
            <Badge soft color="#19708A">{tr(site.landing.guideKicker, lang)}</Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-gs-ice sm:text-2xl">{tr(site.landing.guideTitle, lang)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gs-mist">{tr(site.landing.guideSub, lang)}</p>
            <ul className="mt-4 space-y-2">
              {site.landing.guidePoints.map((point) => (
                <li key={point.en} className="flex items-start gap-2 text-xs leading-relaxed text-gs-mist">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gs-cyan/10 text-[10px] font-bold text-gs-teal" aria-hidden="true">✓</span>
                  {tr(point, lang)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/75 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-wider text-gs-mist uppercase">{tr(site.landing.guideChoose, lang)}</p>
              <span className="rounded-md bg-gs-cyan/10 px-2 py-1 text-[10px] font-bold tracking-wider text-gs-teal">PDF</span>
            </div>
            <div className="mt-3 space-y-2.5">
              <a
                href={`${import.meta.env.BASE_URL}guides/kawruhbhumi-user-guide-en.pdf`}
                download
                className="group flex min-h-11 flex-col items-start gap-1 rounded-lg border border-black/10 bg-gs-raised px-3.5 py-2.5 text-sm font-semibold text-gs-ice transition-colors hover:border-gs-cyan/50 hover:text-gs-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-cyan focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="flex items-center gap-2"><DownloadIcon />{tr(site.landing.guideDownloadEn, lang)}</span>
                <span className="text-[10px] font-medium text-gs-mist">{tr(site.landing.guideMetaEn, lang)}</span>
              </a>
              <a
                href={`${import.meta.env.BASE_URL}guides/kawruhbhumi-user-guide-id.pdf`}
                download
                className="group flex min-h-11 flex-col items-start gap-1 rounded-lg border border-black/10 bg-gs-raised px-3.5 py-2.5 text-sm font-semibold text-gs-ice transition-colors hover:border-gs-cyan/50 hover:text-gs-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-cyan focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="flex items-center gap-2"><DownloadIcon />{tr(site.landing.guideDownloadId, lang)}</span>
                <span className="text-[10px] font-medium text-gs-mist">{tr(site.landing.guideMetaId, lang)}</span>
              </a>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-gs-mist">{tr(site.landing.guideNote, lang)}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-gs-ice sm:text-2xl">{tr(site.landing.methodsTitle, lang)}</h2>
          <Link to="/metode" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-gs-cyan hover:text-gs-ice">
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
                    style={{ backgroundColor: `${meta.accent}1a`, color: meta.ink }}
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
          <Link to="/disclaimer" className="inline-flex min-h-11 shrink-0 items-center font-semibold text-gs-cyan hover:text-gs-ice">
            {tr(site.landing.disclaimerLink, lang)}
          </Link>
        </div>
      </section>
    </>
  )
}
