import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button.tsx'
import { SiteHeader } from '../components/SiteHeader.tsx'
import { LEVELS, type Level } from '../lib/filterLocations.ts'
import { useLanguage } from '../lib/LanguageProvider.tsx'
import { decodeLocations } from '../lib/sharePayload.ts'

function readUsed(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((item) => typeof item === 'string'))
  } catch {
    return new Set()
  }
}

export function MobilePage() {
  const { t } = useLanguage()
  const { payload = '' } = useParams()
  const decoded = useMemo(() => {
    try {
      return { ok: true as const, locations: decodeLocations(payload) }
    } catch {
      return { ok: false as const, locations: [] }
    }
  }, [payload])

  const storageKey = `imerco-used:${payload}`
  const [used, setUsed] = useState<Set<string>>(() => readUsed(storageKey))
  const [level, setLevel] = useState<Level | null>(null)
  const [index, setIndex] = useState(-1)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const seenKey = useRef(storageKey)

  if (seenKey.current !== storageKey) {
    seenKey.current = storageKey
    setUsed(readUsed(storageKey))
  }

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...used]))
    } catch {
      /* private mode */
    }
  }, [storageKey, used])

  const counts = useMemo(() => {
    return {
      '20': decoded.locations.filter((code) => code.endsWith('-20')).length,
      '30': decoded.locations.filter((code) => code.endsWith('-30')).length,
      '40': decoded.locations.filter((code) => code.endsWith('-40')).length,
    }
  }, [decoded.locations])

  const openCounts = useMemo(() => {
    const tally = { '20': 0, '30': 0, '40': 0 }
    for (const code of decoded.locations) {
      if (used.has(code)) continue
      if (code.endsWith('-20')) tally['20'] += 1
      else if (code.endsWith('-30')) tally['30'] += 1
      else if (code.endsWith('-40')) tally['40'] += 1
    }
    return tally
  }, [decoded.locations, used])

  const list = level ? decoded.locations.filter((code) => code.endsWith(`-${level}`)) : []
  const openTotal = openCounts['20'] + openCounts['30'] + openCounts['40']

  useEffect(() => {
    if (index < 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    itemRefs.current[index]?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [index, level])

  useEffect(() => {
    document.title = level ? t.levelDocumentTitle(level) : t.documentTitle
  }, [level, t])

  function openLevel(next: Level) {
    setLevel(next)
    setIndex(-1)
  }

  function toggleUsed(code: string) {
    setUsed((current) => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  if (!decoded.ok) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main id="indhold" className="mx-auto max-w-lg px-5 py-16">
          <h1 className="text-3xl font-medium tracking-[-0.03em]">{t.badLinkTitle}</h1>
          <p className="mt-3 border-l-2 border-brand pl-4 text-base font-normal leading-relaxed">{t.badLinkBody}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main id="indhold" className={`mx-auto max-w-lg ${level ? 'pb-36' : 'pb-10'}`}>
        {level ? (
          <>
            <div className="sticky top-16 z-10 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur">
              <div className="grid grid-cols-3 gap-2" role="group" aria-label={t.levelsGroup}>
                {LEVELS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={item === level}
                    onClick={() => openLevel(item)}
                    className={`pressable min-h-14 rounded-2xl px-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      item === level ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'
                    }`}
                  >
                    <span className="block text-base font-medium">{item}</span>
                    <span className={`mt-0.5 block text-xs ${item === level ? 'text-white/75' : 'text-muted'}`}>
                      <span className="font-mono text-sm">{openCounts[item]}</span> {t.availableLabel.toLowerCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <section aria-labelledby="list-heading" className="px-5 pt-6">
              <h1 id="list-heading" className="text-3xl font-medium tracking-[-0.03em]">
                {t.level(level)}
              </h1>
              <p className="mt-3 text-sm text-muted">
                <span className="font-mono text-2xl font-medium text-ink">{openCounts[level]}</span>
                <span className="ml-2">{t.availableLabel.toLowerCase()}</span>
                <span className="ml-2">{t.ofTotal(counts[level])}</span>
              </p>
              <p className="mt-2 text-sm text-muted">{t.markHint}</p>
              {list.length === 0 ? (
                <p className="mt-8 text-base">{t.emptyLevel}</p>
              ) : (
                <ol className="mt-4 overflow-hidden rounded-3xl bg-white">
                  {list.map((code, itemIndex) => {
                    const selected = itemIndex === index
                    const isUsed = used.has(code)
                    const aisle = code.slice(0, 2)
                    const showAisle = itemIndex === 0 || list[itemIndex - 1]?.slice(0, 2) !== aisle
                    return (
                      <li key={`${code}-${itemIndex}`}>
                        {showAisle ? (
                          <p className="bg-paper px-4 pt-4 pb-2 text-sm font-medium tracking-[0.14em] text-muted uppercase">
                            {t.aisle(aisle)}
                          </p>
                        ) : null}
                        <div className={`flex items-stretch ${selected ? '' : isUsed ? 'bg-[#f6f3ee]' : 'bg-white'}`}>
                          <button
                            type="button"
                            ref={(node) => {
                              itemRefs.current[itemIndex] = node
                            }}
                            aria-current={selected ? 'true' : undefined}
                            onClick={() => setIndex(itemIndex)}
                            className={`location-row pressable flex min-h-14 flex-1 items-center justify-between px-4 text-left font-mono text-xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
                              selected ? 'bg-ink text-white' : isUsed ? 'text-muted' : 'bg-white text-ink'
                            }`}
                          >
                            <span className={isUsed && !selected ? 'line-through decoration-1' : undefined}>{code}</span>
                            {selected ? (
                              <span className="font-sans text-sm tracking-[0.14em] text-brand uppercase">{t.selected}</span>
                            ) : isUsed ? (
                              <span className="font-sans text-sm tracking-[0.14em] uppercase">{t.markedUsed}</span>
                            ) : null}
                          </button>
                          <button
                            type="button"
                            aria-pressed={isUsed}
                            aria-label={isUsed ? t.unmarkUsed(code) : t.markUsed(code)}
                            onClick={() => toggleUsed(code)}
                            className={`pressable flex w-14 shrink-0 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
                              selected ? 'bg-ink' : 'bg-transparent'
                            }`}
                          >
                            <span
                              className={`grid h-7 w-7 place-items-center rounded-full border ${
                                isUsed
                                  ? 'border-brand bg-brand text-ink'
                                  : selected
                                    ? 'border-white/40 text-transparent'
                                    : 'border-ink/20 text-transparent'
                              }`}
                            >
                              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                                <path d="M3.5 8.2 6.4 11l6.1-6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
            <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <p className="mb-2 text-center font-mono text-sm text-muted" aria-live="polite">
                {index >= 0 ? t.position(index + 1, list.length) : t.chooseLocation}
              </p>
              <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
                <Button variant="ghost" className="px-2" disabled={index <= 0} onClick={() => setIndex((current) => Math.max(current - 1, 0))}>
                  {t.previous}
                </Button>
                <Button
                  className="px-2"
                  disabled={list.length === 0 || index >= list.length - 1}
                  onClick={() => setIndex((current) => Math.min(current + 1, list.length - 1))}
                >
                  {t.next}
                </Button>
                <Button
                  variant="ghost"
                  className="px-2"
                  onClick={() => {
                    setLevel(null)
                    setIndex(-1)
                  }}
                >
                  {t.levels}
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <section aria-labelledby="levels-heading" className="px-5 pt-8">
            <h1 id="levels-heading" className="text-[2.5rem] font-medium leading-none tracking-[-0.035em]">
              {t.mobileTitle}
            </h1>
            <p className="mt-4 max-w-xs border-l-2 border-brand pl-4">
              <span className="block font-mono text-3xl font-medium tracking-tight text-ink">{openTotal}</span>
              <span className="mt-1 block text-sm font-normal text-muted">
                {t.availableLabel.toLowerCase()} {t.ofTotal(decoded.locations.length)}
              </span>
            </p>
            <div className="mt-8 grid gap-3">
              {LEVELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => openLevel(item)}
                  className="pressable flex min-h-28 items-center justify-between rounded-3xl border-t-4 border-brand bg-white px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span>
                    <span className="block text-sm tracking-[0.14em] text-muted uppercase">{t.levelWord}</span>
                    <span className="mt-1 block text-4xl font-medium tracking-[-0.03em]">{item}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs tracking-[0.14em] text-muted uppercase">{t.availableLabel}</span>
                    <span className="mt-1 block font-mono text-4xl font-medium tracking-tight">{openCounts[item]}</span>
                    <span className="text-sm text-muted">{t.ofTotal(counts[item])}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
