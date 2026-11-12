import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { copy, readInitialLang, storeLang, type Copy, type Lang } from './i18n.ts'

type LanguageValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Copy
}

const LanguageContext = createContext<LanguageValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)
  const t = copy[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', t.description)
  }, [lang, t.description])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      t,
      setLang: (next) => {
        storeLang(next)
        setLangState(next)
      },
    }),
    [lang, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}
