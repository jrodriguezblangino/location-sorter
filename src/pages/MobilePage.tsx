import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button.tsx'
import { SiteHeader } from '../components/SiteHeader.tsx'
import { LEVELS, type Level } from '../lib/filterLocations.ts'
import { useLanguage } from '../lib/LanguageProvider.tsx'
import { decodeLocations } from '../lib/sharePayload.ts'

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

  const [level, setLevel] = useState<Level | null>(null)
  const [index, setIndex] = useState(-1)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const counts = useMemo(() => {
    return {
      '20': decoded.locations.filter((code) => code.endsWith('-20')).length,
      '30': decoded.locations.filter((code) => code.endsWith('-30')).length,
      '40': decoded.locations.filter((code) => code.endsWith('-40')).length,
    }
  }, [decoded.locations])

  const list = level ? decoded.locations.filter((code) => code.endsWith(`-${level}`)) : []

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

  if (!decoded.ok) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main id="indhold" className="mx-auto max-w-lg px-5 py-16">
          <h1 className="text-3xl font-medium tracking-tight">{t.badLinkTitle}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">{t.badLinkBody}</p>
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
                    className={`min-h-12 rounded-full text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      item === level ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'
                    }`}
                  >
                    {item}
                    <span className="ml-1 font-mono text-sm">{counts[item]}</span>
                  </button>
                ))}
              </div>
            </div>
            <section aria-labelledby="list-heading" className="px-5 pt-5">
              <h1 id="list-heading" className="text-3xl font-medium tracking-tight">
                {t.level(level)}
              </h1>
              <p className="mt-1 text-base text-muted">{t.locationCount(list.length)}</p>
              {list.length === 0 ? (
                <p className="mt-8 text-base">{t.emptyLevel}</p>
              ) : (
                <ol className="mt-4 overflow-hidden rounded-3xl bg-white">
                  {list.map((code, itemIndex) => {
                    const selected = itemIndex === index
                    const aisle = code.slice(0, 2)
                    const showAisle = itemIndex === 0 || list[itemIndex - 1]?.slice(0, 2) !== aisle
                    return (
                      <li key={`${code}-${itemIndex}`}>
                        {showAisle ? (
                          <p className="bg-paper px-4 pt-4 pb-2 text-sm font-medium tracking-[0.14em] text-muted uppercase">
                            {t.aisle(aisle)}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          ref={(node) => {
                            itemRefs.current[itemIndex] = node
                          }}
                          aria-current={selected ? 'true' : undefined}
                          onClick={() => setIndex(itemIndex)}
                          className={`location-row flex min-h-14 w-full items-center justify-between px-4 text-left font-mono text-xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
                            selected ? 'bg-ink text-white' : 'bg-white'
                          }`}
                        >
                          <span>{code}</span>
                          {selected ? (
                            <span className="font-sans text-sm tracking-[0.14em] text-brand uppercase">{t.selected}</span>
                          ) : null}
                        </button>
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
            <h1 id="levels-heading" className="text-4xl font-medium tracking-tight">
              {t.mobileTitle}
            </h1>
            <p className="mt-2 text-base text-muted">{t.locationCount(decoded.locations.length)}</p>
            <div className="mt-6 grid gap-3">
              {LEVELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => openLevel(item)}
                  className="flex min-h-28 items-center justify-between rounded-3xl border-t-4 border-brand bg-white px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span>
                    <span className="block text-sm tracking-[0.14em] text-muted uppercase">{t.levelWord}</span>
                    <span className="mt-1 block text-4xl font-medium">{item}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-4xl font-medium">{counts[item]}</span>
                    <span className="text-sm text-muted">{t.locationWord(counts[item])}</span>
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
