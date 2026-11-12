import { useLanguage } from '../lib/LanguageProvider.tsx'

const options = [
  { code: 'da', label: 'Dansk' },
  { code: 'en', label: 'English' },
] as const

export function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div role="group" aria-label={t.languageLabel} className="flex shrink-0 rounded-full bg-white/10 p-1">
      {options.map((option) => {
        const active = lang === option.code
        return (
          <button
            key={option.code}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(option.code)}
            className={`min-h-11 rounded-full px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-4 sm:text-base ${
              active ? 'bg-brand text-ink' : 'text-white hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
