import {
  classifyLocation,
  emptySummary,
  isRowEmpty,
  type Cell,
  type Summary,
} from './filterLocations.ts'

export class WorkbookError extends Error {
  readonly code: 'no-location-column' | 'no-data' | 'unreadable'

  constructor(code: WorkbookError['code'], message: string) {
    super(message)
    this.name = 'WorkbookError'
    this.code = code
  }
}

export type ProcessedFile = {
  sheetName: string
  title: Cell[] | null
  headers: Cell[]
  locationIndex: number
  matches: Cell[][]
  summary: Summary
}

function asCell(value: unknown): Cell {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  return String(value)
}

function asRows(value: unknown): Cell[][] {
  if (!Array.isArray(value)) return []
  return value.map((row) => (Array.isArray(row) ? row.map(asCell) : []))
}

function findLocationHeader(rows: Cell[][]): { index: number; column: number } | null {
  for (let index = 0; index < rows.length; index += 1) {
    const column = (rows[index] ?? []).findIndex(
      (cell) => typeof cell === 'string' && cell.trim() === 'Lokation',
    )
    if (column >= 0) return { index, column }
  }
  return null
}

function pad(row: Cell[], width: number): Cell[] {
  const next = row.slice(0, width)
  while (next.length < width) next.push(null)
  return next
}

export async function parseWorkbook(data: ArrayBuffer | Uint8Array): Promise<ProcessedFile> {
  const XLSX = await import('xlsx')
  let workbook: ReturnType<typeof XLSX.read>
  try {
    workbook = XLSX.read(data, { type: 'array', cellDates: false })
  } catch {
    throw new WorkbookError('unreadable', 'Filen kunne ikke læses.')
  }

  const sheetName = workbook.SheetNames[0]
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined
  if (!sheetName || !sheet) throw new WorkbookError('unreadable', 'Filen kunne ikke læses.')

  const rows = asRows(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }))
  const header = findLocationHeader(rows)
  if (!header) throw new WorkbookError('no-location-column', 'Kolonnen "Lokation" blev ikke fundet.')

  const headers = rows[header.index] ?? []
  const width = Math.max(headers.length, 1)
  const summary = emptySummary()
  const matches: Cell[][] = []
  const seen = new Set<string>()
  let dataRows = 0

  for (const row of rows.slice(header.index + 1)) {
    if (isRowEmpty(row)) continue
    dataRows += 1
    const classified = classifyLocation(row[header.column])
    if (classified.kind === 'invalid') {
      summary.invalid += 1
      continue
    }
    if (classified.kind === 'excluded') {
      summary.excluded += 1
      continue
    }
    if (seen.has(classified.code)) summary.duplicates += 1
    seen.add(classified.code)
    summary.byPrefix[classified.prefix] += 1
    if (classified.level === '20') summary.level20 += 1
    if (classified.level === '30') summary.level30 += 1
    if (classified.level === '40') summary.level40 += 1
    const stored = pad(row, width)
    stored[header.column] = classified.code
    matches.push(stored)
  }

  if (dataRows === 0) throw new WorkbookError('no-data', 'Ingen datarækker fundet.')

  matches.sort((left, right) => {
    const a = String(left[header.column] ?? '')
    const b = String(right[header.column] ?? '')
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  summary.totalRecords = dataRows
  const titleRow = rows.slice(0, header.index).find((row) => !isRowEmpty(row))

  return {
    sheetName,
    title: titleRow ? pad(titleRow, width) : null,
    headers: pad(headers, width),
    locationIndex: header.column,
    matches,
    summary,
  }
}
