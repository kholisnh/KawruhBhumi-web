import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { en, type Dict } from './en'
import { id } from './id'

export type Lang = 'en' | 'id'

const dicts: Record<Lang, Dict> = { en, id }
const STORAGE_KEY = 'kawruhbhumi.lang'
const LEGACY_STORAGE_KEY = 'geosim.lang'

interface I18nValue {
  d: Dict
  lang: Lang
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nValue | null>(null)

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (stored === 'id' || stored === 'en') return stored
  } catch {
    /* storage unavailable (SSR/privacy mode) */
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nValue>(() => ({ d: dicts[lang], lang, setLang }), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
