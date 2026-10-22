import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { site, tr } from '../../content/site'
import { useI18n } from '../../i18n'
import { Button } from '../ui/Button'
import { Logo } from './Logo'

export function Navbar() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)

  const links = [
    { label: tr(site.nav.home, lang), to: '/' },
    { label: tr(site.nav.methods, lang), to: '/metode' },
    { label: tr(site.nav.theory, lang), to: '/teori' },
    { label: tr(site.nav.simulator, lang), to: '/simulator' },
    { label: tr(site.nav.resources, lang), to: '/resources' },
    { label: tr(site.nav.about, lang), to: '/about' },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
      isActive ? 'bg-gs-deep text-gs-ice' : 'text-gs-mist hover:bg-black/4 hover:text-gs-ice'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-gs-navy/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-black/10 p-0.5 sm:flex" role="group" aria-label={tr(site.nav.language, lang)}>
            {(['en', 'id'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`gs-number rounded-md px-2 py-1 text-[11px] font-semibold uppercase transition-colors ${
                  lang === code ? 'bg-gs-raised text-gs-ice' : 'text-gs-mist hover:text-gs-ice'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <Link to="/simulator" className="hidden sm:block">
            <Button variant="primary" size="sm">
              {tr(site.nav.launch, lang)}
            </Button>
          </Link>
          <button
            type="button"
            className="rounded-lg border border-black/10 p-2 text-gs-mist hover:text-gs-ice lg:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-black/10 bg-gs-navy px-4 pt-2 pb-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <Link to="/simulator" className="mt-2" onClick={() => setOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                {tr(site.nav.launch, lang)}
              </Button>
            </Link>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gs-mist">{tr(site.nav.language, lang)}:</span>
              {(['en', 'id'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={`gs-number rounded-md border px-2 py-1 text-[11px] font-semibold uppercase ${
                    lang === code ? 'border-gs-cyan/60 text-gs-cyan' : 'border-black/10 text-gs-mist'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
