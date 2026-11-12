import { classifyLocation } from './filterLocations.ts'

export const QR_WARN_URL_LENGTH = 1800

export function encodeLocations(codes: readonly string[]): string {
  const sorted = [...codes].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const bytes = new Uint8Array(sorted.length * 4)
  sorted.forEach((code, index) => {
    if (classifyLocation(code).kind !== 'match') throw new Error(`Cannot share ${code}`)
    const parts = code.split('-').map(Number)
    bytes[index * 4] = parts[0] ?? 0
    bytes[index * 4 + 1] = parts[1] ?? 0
    bytes[index * 4 + 2] = parts[2] ?? 0
    bytes[index * 4 + 3] = parts[3] ?? 0
  })
  return `1.${toBase64Url(bytes)}`
}

export function decodeLocations(payload: string): string[] {
  if (!payload.startsWith('1.')) throw new Error('bad payload')
  const bytes = fromBase64Url(payload.slice(2))
  if (bytes.length % 4 !== 0) throw new Error('bad payload')
  const codes: string[] = []
  for (let index = 0; index < bytes.length; index += 4) {
    const parts = [bytes[index], bytes[index + 1], bytes[index + 2], bytes[index + 3]]
    if (parts.some((part) => part === undefined || part > 99)) throw new Error('bad payload')
    const code = parts.map((part) => String(part).padStart(2, '0')).join('-')
    if (classifyLocation(code).kind !== 'match') throw new Error('bad payload')
    codes.push(code)
  }
  return codes
}

export function shareUrlFor(payload: string, lang: 'da' | 'en'): string {
  const current = new URL(window.location.href)
  current.hash = ''
  current.searchParams.set('lang', lang)
  return `${current.origin}${current.pathname}${current.search}#/m/${payload}`
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error('bad payload')
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  let binary = ''
  try {
    binary = atob(padded + pad)
  } catch {
    throw new Error('bad payload')
  }
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}
