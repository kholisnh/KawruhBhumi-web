import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { site, tr } from '../content/site'
import { useI18n } from '../i18n'

export function DisclaimerPage() {
  const { lang } = useI18n()
  const copy = site.disclaimer

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SectionHeading label={tr(copy.label, lang)} title={tr(copy.title, lang)} subtitle={tr(copy.sub, lang)} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {copy.points.map((point, index) => (
          <Card key={tr(point.title, lang)} className="p-5">
            <span className="gs-number text-xs font-semibold text-gs-cyan">0{index + 1}</span>
            <h2 className="mt-1.5 text-sm font-semibold text-gs-ice">{tr(point.title, lang)}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-gs-mist">{tr(point.body, lang)}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-gs-cyan/20 p-6">
        <p className="gs-label text-gs-cyan">{tr(copy.devLabel, lang)}</p>
        <h2 className="mt-1.5 text-lg font-semibold text-gs-ice">{tr(copy.devTitle, lang)}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gs-mist">{tr(copy.devBody, lang)}</p>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-gs-ice">{tr(copy.feedbackTitle, lang)}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gs-mist">{tr(copy.feedbackBody, lang)}</p>
        <a
          href={`mailto:${copy.email}`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gs-cyan px-4 py-2 text-sm font-semibold text-gs-white transition-colors hover:bg-[#2952D6]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          {copy.email}
        </a>
        <p className="mt-4 text-xs text-gs-mist/80">{tr(copy.thanks, lang)}</p>
      </Card>
    </div>
  )
}
