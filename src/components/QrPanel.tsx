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
    <section aria-labelledby="qr-heading" className="mt-10 overflow-hidden rounded-3xl bg-white ring-1 ring-line">
      <div className="grid gap-0 lg:grid-cols-[18rem_1fr]">
        <div className="flex items-center justify-center border-b border-line bg-[#faf8f5] p-8 lg:border-r lg:border-b-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t.qrAlt}
              width={320}
              height={320}
              className="h-auto w-full max-w-[16rem] rounded-2xl bg-white p-3 shadow-[0_1px_0_rgba(20,20,20,0.06)]"
            />
          ) : (
            <div className="grid h-64 w-full max-w-[16rem] place-items-center rounded-2xl bg-white text-sm text-muted">QR</div>
          )}
        </div>
        <div className="p-5 sm:p-8">
          <h2 id="qr-heading" className="text-2xl font-medium tracking-[-0.03em]">
            {t.qrTitle}
          </h2>
          <p className="mt-3 max-w-xl text-base font-normal leading-relaxed text-muted">{t.qrBody}</p>
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
        </div>
      </div>
    </section>
  )
}
