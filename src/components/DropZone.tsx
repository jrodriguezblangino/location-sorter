import { useRef, useState } from 'react'
import { useLanguage } from '../lib/LanguageProvider.tsx'

type Props = {
  disabled?: boolean
  onFile: (file: File) => void
}

export function DropZone({ disabled = false, onFile }: Props) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const depth = useRef(0)
  const [active, setActive] = useState(false)

  function take(file: File | undefined) {
    if (!file || disabled) return
    onFile(file)
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={t.dropAria}
      onClick={() => {
        if (!disabled) inputRef.current?.click()
      }}
      onKeyDown={(event) => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault()
        depth.current += 1
        setActive(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault()
        depth.current -= 1
        if (depth.current <= 0) {
          depth.current = 0
          setActive(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        depth.current = 0
        setActive(false)
        take(event.dataTransfer.files[0])
      }}
      className={`pressable flex min-h-52 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-6 py-10 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
        active ? 'border-brand bg-white' : 'border-ink/15 bg-white'
      } ${disabled ? 'cursor-wait opacity-70' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          take(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V5" strokeLinecap="round" />
          <path d="M8 8.5 12 4.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 16.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-xl font-medium tracking-tight">{t.dropTitle}</span>
      <span className="max-w-sm text-base font-normal leading-relaxed text-muted">{t.dropHint}</span>
    </div>
  )
}
