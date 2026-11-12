export const PREFIXES = ['11', '12', '13', '14', '17'] as const
export const LEVELS = ['20', '30', '40'] as const

export type Prefix = (typeof PREFIXES)[number]
export type Level = (typeof LEVELS)[number]
export type Cell = string | number | boolean | null

export type Summary = {
  totalRecords: number
  level20: number
  level30: number
  level40: number
  byPrefix: Record<Prefix, number>
  excluded: number
  invalid: number
  duplicates: number
}

export type LocationClass =
  | { kind: 'invalid' }
  | { kind: 'excluded'; code: string }
  | { kind: 'match'; code: string; prefix: Prefix; level: Level }

const LOCATION_PATTERN = /^(\d{2})-(\d{2})-(\d{2})-(\d{2})$/

export function emptySummary(): Summary {
  return {
    totalRecords: 0,
    level20: 0,
    level30: 0,
    level40: 0,
    byPrefix: { '11': 0, '12': 0, '13': 0, '14': 0, '17': 0 },
    excluded: 0,
    invalid: 0,
    duplicates: 0,
  }
}

export function isRowEmpty(row: readonly unknown[] | undefined): boolean {
  if (!row || row.length === 0) return true
  return row.every((cell) => cell == null || cell === '')
}

function isPrefix(value: string): value is Prefix {
  return (PREFIXES as readonly string[]).includes(value)
}

function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value)
}

export function classifyLocation(value: unknown): LocationClass {
  if (typeof value !== 'string' && typeof value !== 'number') return { kind: 'invalid' }
  const code = String(value).trim()
  const match = LOCATION_PATTERN.exec(code)
  if (!match) return { kind: 'invalid' }
  const prefix = match[1] ?? ''
  const level = match[4] ?? ''
  if (!isPrefix(prefix) || !isLevel(level)) return { kind: 'excluded', code }
  return { kind: 'match', code, prefix, level }
}
