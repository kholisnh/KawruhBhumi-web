import { Link } from 'react-router-dom'
import { site, tr } from '../../content/site'
import { useI18n } from '../../i18n'
import { Logo } from './Logo'

export function Footer() {
  const { d, lang } = useI18n()
  return (
    <footer className="no-print mt-20 border-t border-black/10 bg-gs-deep/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-2 text-xs tracking-[0.18em] text-gs-mist/75">{tr(site.brand.tagline, lang)}</p>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-gs-mist">{d.footer.aboutBody}</p>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-gs-mist/60">{tr(site.disclaimer.devShort, lang)}</p>
        </div>
        <div>
          <h3 className="gs-label mb-3">{tr(site.footer.docs, lang)}</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/metode" className="text-xs text-gs-mist transition-colors hover:text-gs-cyan">
                {tr(site.nav.methods, lang)}
              </Link>
            </li>
            <li>
              <Link to="/teori" className="text-xs text-gs-mist transition-colors hover:text-gs-cyan">
                {tr(site.nav.theory, lang)}
              </Link>
            </li>
            <li>
              <Link to="/simulator" className="text-xs text-gs-mist transition-colors hover:text-gs-cyan">
                {tr(site.nav.simulator, lang)}
              </Link>
            </li>
            <li>
              <Link to="/resources" className="text-xs text-gs-mist transition-colors hover:text-gs-cyan">
                {tr(site.nav.resources, lang)}
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-xs text-gs-mist transition-colors hover:text-gs-cyan">
                {tr(site.nav.about, lang)}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="gs-label mb-3">{tr(site.footer.feedback, lang)}</h3>
          <p className="text-xs leading-relaxed text-gs-mist">{tr(site.disclaimer.feedbackBody, lang)}</p>
          <a href={`mailto:${site.disclaimer.email}`} className="mt-2 inline-block text-xs font-semibold text-gs-cyan hover:text-gs-ice">
            {site.disclaimer.email}
          </a>
        </div>
        <div>
          <h3 className="gs-label mb-3 text-gs-amber">
            <Link to="/disclaimer" className="hover:text-gs-ice">
              {tr(site.footer.disclaimer, lang)}
            </Link>
          </h3>
          <p className="text-xs leading-relaxed text-gs-mist">{d.footer.disclaimer}</p>
        </div>
      </div>
      <div className="border-t border-black/8 py-4">
        <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 text-xs text-gs-mist/70 sm:px-6">
          <span>{d.footer.copyright}</span>
          <span>{tr(site.footer.built, lang)}</span>
        </p>
      </div>
    </footer>
  )
}
