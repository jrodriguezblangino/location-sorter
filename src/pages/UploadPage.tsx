import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '../components/Button.tsx'
import { DropZone } from '../components/DropZone.tsx'
import { QrPanel } from '../components/QrPanel.tsx'
import { SiteHeader } from '../components/SiteHeader.tsx'
import { SummaryCards } from '../components/SummaryCards.tsx'
import { buildWorkbook } from '../lib/buildWorkbook.ts'
import { useLanguage } from '../lib/LanguageProvider.tsx'
import { WorkbookError, parseWorkbook, type ProcessedFile } from '../lib/parseWorkbook.ts'
import { QR_WARN_URL_LENGTH, encodeLocations, shareUrlFor } from '../lib/sharePayload.ts'
import type { FileErrorCode } from '../lib/i18n.ts'

const MAX_BYTES = 10 * 1024 * 1024

type QrState = {
  payload: string
  imageUrl: string | null
  failed: boolean
}

type PageState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'error'; code: FileErrorCode }
  | { kind: 'ready'; fileName: string; result: ProcessedFile; qr: QrState | null }

export function UploadPage() {
  const { lang, t } = useLanguage()
  const [state, setState] = useState<PageState>({ kind: 'idle' })
  const summaryRef = useRef<HTMLDivElement>(null)
  const focusSummary = useRef(false)
  const qrPayload = state.kind === 'ready' ? (state.qr?.payload ?? null) : null
  const shareUrl = qrPayload ? shareUrlFor(qrPayload, lang) : null

  useEffect(() => {
    document.title = t.documentTitle
  }, [t.documentTitle])

  useEffect(() => {
    if (state.kind !== 'ready' || !focusSummary.current) return
    focusSummary.current = false
    const heading = summaryRef.current?.querySelector('h2')
    if (heading instanceof HTMLElement) heading.focus()
  }, [state])

  useEffect(() => {
    if (!shareUrl || !qrPayload) return
    let cancelled = false
    toQr(shareUrl)
      .then((imageUrl) => {
        if (cancelled) return
        setState((current) =>
          current.kind === 'ready' && current.qr?.payload === qrPayload
            ? { ...current, qr: { payload: qrPayload, imageUrl, failed: false } }
            : current,
        )
      })
      .catch(() => {
        if (cancelled) return
        setState((current) =>
          current.kind === 'ready' && current.qr?.payload === qrPayload
            ? { ...current, qr: { payload: qrPayload, imageUrl: null, failed: true } }
            : current,
        )
      })
    return () => {
      cancelled = true
    }
  }, [shareUrl, qrPayload])

  async function readFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setState({ kind: 'error', code: 'xlsx' })
      return
    }
    if (file.size > MAX_BYTES) {
      setState({ kind: 'error', code: 'size' })
      return
    }

    setState({ kind: 'reading' })
    await new Promise((resolve) => setTimeout(resolve, 40))

    try {
      const result = await parseWorkbook(await file.arrayBuffer())
      focusSummary.current = true
      setState({ kind: 'ready', fileName: file.name, result, qr: null })
    } catch (error) {
      const code = error instanceof WorkbookError ? error.code : 'unreadable'
      setState({ kind: 'error', code })
    }
  }

  async function download() {
    if (state.kind !== 'ready') return
    const bytes = await buildWorkbook(state.result)
    const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = t.downloadName
    link.click()
    URL.revokeObjectURL(url)
  }

  function generateQr() {
    if (state.kind !== 'ready' || state.result.matches.length === 0) return
    const result = state.result
    const codes = result.matches.map((row) => String(row[result.locationIndex] ?? ''))
    const payload = encodeLocations(codes)
    setState((current) =>
      current.kind === 'ready' && current.result === result ? { ...current, qr: { payload, imageUrl: null, failed: false } } : current,
    )
  }

  const ready = state.kind === 'ready' ? state : null

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main id="indhold" className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-2xl">
          <h1 className="text-[2.75rem] font-medium leading-[1.02] tracking-[-0.035em] text-balance sm:text-6xl">{t.title}</h1>
          <p className="mt-6 border-l-2 border-brand pl-4 text-lg font-normal leading-relaxed text-ink">{t.intro}</p>
        </div>

        <div className="mt-8">
          <DropZone disabled={state.kind === 'reading'} onFile={(file) => void readFile(file)} />
        </div>

        {state.kind === 'reading' ? (
          <p className="mt-6 text-base" role="status">
            {t.reading}
          </p>
        ) : null}

        {state.kind === 'error' ? (
          <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-base" role="alert">
            {t.errors[state.code]}
          </p>
        ) : null}

        {ready ? (
          <div ref={summaryRef}>
            {ready.result.matches.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-base" role="status">
                {t.noMatches}
              </p>
            ) : null}
            <SummaryCards summary={ready.result.summary} fileName={ready.fileName} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void download()}>{t.download}</Button>
              <Button variant="ghost" disabled={ready.result.matches.length === 0} onClick={generateQr}>
                {t.showQr}
              </Button>
            </div>
            {ready.qr && shareUrl ? (
              <QrPanel
                imageUrl={ready.qr.imageUrl}
                shareUrl={shareUrl}
                tooLong={shareUrl.length > QR_WARN_URL_LENGTH}
                failed={ready.qr.failed}
              />
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  )
}

async function toQr(url: string): Promise<string> {
  const options = { margin: 1, width: 640, color: { dark: '#141414', light: '#ffffff' } }
  try {
    return await QRCode.toDataURL(url, { ...options, errorCorrectionLevel: 'M' })
  } catch {
    return QRCode.toDataURL(url, { ...options, errorCorrectionLevel: 'L' })
  }
}
