import { LEVELS, PREFIXES, type Summary } from '../lib/filterLocations.ts'
import { numberLocale } from '../lib/i18n.ts'
import { useLanguage } from '../lib/LanguageProvider.tsx'

type Props = {
  summary: Summary
  fileName: string
}

export function SummaryCards({ summary, fileName }: Props) {
  const { lang, t } = useLanguage()
  const locale = numberLocale(lang)
  const levels = [
    { level: LEVELS[0], count: summary.level20 },
    { level: LEVELS[1], count: summary.level30 },
    { level: LEVELS[2], count: summary.level40 },
  ]

  return (
    <section aria-labelledby="summary-heading" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="summary-heading" tabIndex={-1} className="text-2xl font-medium tracking-[-0.03em] focus:outline-none">
          {t.result}
        </h2>
        <p className="rounded-full bg-white px-3 py-1.5 font-mono text-sm text-muted">{fileName}</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {levels.map((item) => (
          <article key={item.level} className="rounded-3xl border-t-4 border-brand bg-white px-5 py-5">
            <p className="text-sm tracking-[0.14em] text-muted uppercase">{t.levelWord}</p>
            <p className="mt-1 text-4xl font-medium tracking-[-0.03em]">{item.level}</p>
            <p className="mt-4 text-sm text-muted">
              <span className="font-mono text-2xl font-medium tracking-tight text-ink">{item.count.toLocaleString(locale)}</span>
              <span className="ml-2">{t.locationWord(item.count)}</span>
            </p>
          </article>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:grid-cols-4">
        <Fact label={t.rowsRead} value={summary.totalRecords} locale={locale} />
        <Fact label={t.excluded} value={summary.excluded} locale={locale} />
        <Fact label={t.invalid} value={summary.invalid} locale={locale} />
        <Fact label={t.duplicates} value={summary.duplicates} locale={locale} />
      </dl>
      <ul className="mt-3 flex flex-wrap gap-2">
        {PREFIXES.map((prefix) => (
          <li key={prefix} className="rounded-full bg-white px-3 py-2 text-sm">
            {t.aisle(prefix)}
            <span className="ml-2 font-mono">{summary.byPrefix[prefix].toLocaleString(locale)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Fact({ label, value, locale }: { label: string; value: number; locale: string }) {
  return (
    <div className="bg-white px-4 py-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-medium tracking-tight">{value.toLocaleString(locale)}</dd>
    </div>
  )
}
