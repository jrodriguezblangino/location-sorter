import * as XLSX from 'xlsx'
import { describe, expect, it } from 'vitest'
import { buildWorkbook } from './buildWorkbook.ts'
import { classifyLocation } from './filterLocations.ts'
import { parseWorkbook, WorkbookError } from './parseWorkbook.ts'
import { decodeLocations, encodeLocations } from './sharePayload.ts'

function sheetBuffer(rows: unknown[][]): Uint8Array {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, '20.SA.10 AvaLoc')
  const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return out instanceof Uint8Array ? out : new Uint8Array(out as ArrayLike<number>)
}

const header = [
  'Lokation',
  'Lagerområde',
  'Lager del-område',
  null,
  'ABC Indikator',
  'Længde',
  'Bredde',
  'Højde',
  'Volumen',
  'Lokationstype',
]

function dataRow(location: string, abc = 'C'): unknown[] {
  return [location, 'Buffer', 'Buffer', null, abc, 121, 81, 182, 1783, 1]
}

describe('classifyLocation', () => {
  it('keeps aisles 11, 12, 13, 14 and 17 on levels 20, 30 and 40', () => {
    expect(classifyLocation('11-10-02-40').kind).toBe('match')
    expect(classifyLocation('17-01-01-20')).toMatchObject({ kind: 'match', prefix: '17', level: '20' })
    expect(classifyLocation(' 12-02-03-30 ').kind).toBe('match')
  })

  it('excludes other aisles and levels, and rejects non-codes', () => {
    expect(classifyLocation('21-01-01-20').kind).toBe('excluded')
    expect(classifyLocation('11-10-02-35').kind).toBe('excluded')
    expect(classifyLocation('BR01B-01-002-2').kind).toBe('invalid')
    expect(classifyLocation(121).kind).toBe('invalid')
    expect(classifyLocation(null).kind).toBe('invalid')
  })
})

describe('parseWorkbook', () => {
  const rows = [
    ['20.SA.10 Vis Ledige Lokationer'],
    header,
    dataRow('14-01-01-40', 'B'),
    dataRow('17-01-01-20', 'A'),
    dataRow('11-10-02-35', 'B'),
    dataRow('21-01-01-20', 'B'),
    dataRow('BR01B-01-002-2'),
    dataRow('12-02-03-30', 'A'),
    dataRow('11-10-02-40'),
    dataRow('11-10-02-40'),
    dataRow('13-04-02-20', 'A'),
  ]

  it('filters, counts, keeps duplicates and sorts by location', async () => {
    const parsed = await parseWorkbook(sheetBuffer(rows))
    const codes = parsed.matches.map((row) => row[0])

    expect(codes).toEqual([
      '11-10-02-40',
      '11-10-02-40',
      '12-02-03-30',
      '13-04-02-20',
      '14-01-01-40',
      '17-01-01-20',
    ])
    expect(parsed.summary).toMatchObject({
      totalRecords: 9,
      level20: 2,
      level30: 1,
      level40: 3,
      excluded: 2,
      invalid: 1,
      duplicates: 1,
      byPrefix: { '11': 2, '12': 1, '13': 1, '14': 1, '17': 1 },
    })
    expect(parsed.headers[3]).toBeNull()
    expect(parsed.headers[4]).toBe('ABC Indikator')
    expect(parsed.title?.[0]).toBe('20.SA.10 Vis Ledige Lokationer')
    expect(parsed.matches[0]?.[4]).toBe('C')
  })

  it('finds Lokation when it is not the first column', async () => {
    const parsed = await parseWorkbook(
      sheetBuffer([
        ['titel'],
        [],
        ['Andet', 'Lokation'],
        ['x', '17-03-02-40'],
        ['y', '11-01-01-05'],
      ]),
    )
    expect(parsed.locationIndex).toBe(1)
    expect(parsed.matches.map((row) => row[1])).toEqual(['17-03-02-40'])
    expect(parsed.summary.excluded).toBe(1)
  })

  it('writes only the matching rows and keeps the blank column', async () => {
    const parsed = await parseWorkbook(sheetBuffer(rows))
    const again = await parseWorkbook(await buildWorkbook(parsed))
    expect(again.matches.map((row) => row[0])).toEqual(parsed.matches.map((row) => row[0]))
    expect(again.summary.excluded).toBe(0)
    expect(again.summary.invalid).toBe(0)
    expect(again.headers[4]).toBe('ABC Indikator')
    expect(String(again.title?.[0])).toContain('Vis Ledige Lokationer')
  })

  it('reports a missing Lokation column and an empty file', async () => {
    await expect(parseWorkbook(sheetBuffer([['Titel'], ['Navn'], ['A']]))).rejects.toMatchObject({
      code: 'no-location-column',
    })
    await expect(parseWorkbook(sheetBuffer([['Titel'], header]))).rejects.toMatchObject({
      code: 'no-data',
    })
    await expect(parseWorkbook(new Uint8Array([1, 2, 3]))).rejects.toBeInstanceOf(WorkbookError)
  })
})

describe('sharePayload', () => {
  it('round-trips location codes in sorted order', () => {
    const payload = encodeLocations(['17-01-01-20', '11-10-02-40', '11-10-02-40'])
    expect(decodeLocations(payload)).toEqual(['11-10-02-40', '11-10-02-40', '17-01-01-20'])
    expect(decodeLocations('1.')).toEqual([])
    expect(encodeLocations([])).toBe('1.')
  })

  it('rejects codes outside the filter and broken payloads', () => {
    expect(() => encodeLocations(['21-01-01-20'])).toThrow()
    expect(() => decodeLocations('nej')).toThrow()
    expect(() => decodeLocations('1.!!!!')).toThrow()
    const outside = `1.${btoa(String.fromCharCode(21, 1, 1, 20)).replace(/=+$/g, '')}`
    expect(() => decodeLocations(outside)).toThrow()
  })
})
