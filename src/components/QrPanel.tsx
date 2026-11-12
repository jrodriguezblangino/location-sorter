import { useState } from 'react'
import { useLanguage } from '../lib/LanguageProvider.tsx'
import { Button } from './Button.tsx'
import { controlClass } from './controls.ts'

type Props = {
  imageUrl: string | null
  shareUrl: string
  tooLong: boolean
  failed: boolean
}

export function QrPanel({ imageUrl, shareUrl, tooLong, failed }: Props) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section aria-labelledby="qr-heading" className="mt-8 rounded-3xl bg-white p-5 sm:p-8">
      <h2 id="qr-heading" className="text-2xl font-medium tracking-tight">
        {t.qrTitle}
      </h2>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">{t.qrBody}</p>
      {tooLong ? (
        <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-sm leading-relaxed" role="status">
          {t.qrTight}
        </p>
      ) : null}
      {failed ? (
        <p className="mt-4 text-base" role="alert">
          {t.qrFailed}
        </p>
      ) : null}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={t.qrAlt}
          width={320}
          height={320}
          className="mt-6 h-auto w-full max-w-xs rounded-2xl border border-line bg-white"
        />
      ) : null}
      <label className="mt-6 block text-sm text-muted" htmlFor="share-link">
        {t.link}
      </label>
      <input
        id="share-link"
        readOnly
        value={shareUrl}
        onFocus={(event) => event.target.select()}
        className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 font-mono text-sm"
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => void copyLink()}>{copied ? t.copied : t.copyLink}</Button>
        <a className={controlClass('ghost')} href={shareUrl} target="_blank" rel="noreferrer">
          {t.openMobile}
        </a>
      </div>
    </section>
  )
}
