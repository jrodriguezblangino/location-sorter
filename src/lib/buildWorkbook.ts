import type { Cell } from './filterLocations.ts'
import type { ProcessedFile } from './parseWorkbook.ts'

function safeSheetName(name: string): string {
  const clean = name.replace(/[\\/?*[\]:]/g, ' ').trim()
  return (clean || 'Ledige lokationer').slice(0, 31)
}

export async function buildWorkbook(file: ProcessedFile): Promise<Uint8Array> {
  const XLSX = await import('xlsx')
  const rows: Cell[][] = []
  if (file.title) rows.push(file.title)
  rows.push(file.headers)
  rows.push(...file.matches)

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = file.headers.map((_, index) => ({ wch: index === file.locationIndex ? 16 : 18 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName(file.sheetName))
  const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return out instanceof Uint8Array ? out : new Uint8Array(out as ArrayLike<number>)
}

export const DOWNLOAD_NAME = 'Ledige-lokationer.xlsx'
