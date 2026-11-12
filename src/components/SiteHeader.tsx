import { LanguageSwitch } from './LanguageSwitch.tsx'
import { useLanguage } from '../lib/LanguageProvider.tsx'

export function SiteHeader() {
  const { t } = useLanguage()
  const logo = `${import.meta.env.BASE_URL}logo-on-dark.svg`

  return (
    <header className="sticky top-0 z-20 bg-ink text-white">
      <a className="skip-link" href="#indhold">
        {t.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-5">
        <img src={logo} alt="Imerco" className="h-6 w-auto sm:h-7" />
        <LanguageSwitch />
      </div>
    </header>
  )
}
