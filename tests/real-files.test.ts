import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildWorkbook } from '../src/lib/buildWorkbook.ts'
import { parseWorkbook } from '../src/lib/parseWorkbook.ts'

const files = [
  {
    path: 'C:/Users/jrodr/Downloads/20.SA.10 AvaLoc (23).xlsx',
    totalRecords: 2021,
    matches: 178,
    level20: 40,
    level30: 44,
    level40: 94,
    invalid: 745,
    excluded: 1098,
    byPrefix: { '11': 74, '12': 23, '13': 26, '14': 12, '17': 43 },
  },
  {
    path: 'C:/Users/jrodr/Downloads/20.SA.10 AvaLoc (24).xlsx',
    totalRecords: 1979,
    matches: 133,
    level20: 28,
    level30: 29,
    level40: 76,
    invalid: 753,
    excluded: 1093,
    byPrefix: { '11': 58, '12': 14, '13': 17, '14': 13, '17': 31 },
  },
]

describe('WMS sample files', () => {
  for (const sample of files) {
    it.skipIf(!existsSync(sample.path))(sample.path, async () => {
      const parsed = await parseWorkbook(readFileSync(sample.path))
      expect(parsed.summary.totalRecords).toBe(sample.totalRecords)
      expect(parsed.matches).toHaveLength(sample.matches)
      expect(parsed.summary.level20).toBe(sample.level20)
      expect(parsed.summary.level30).toBe(sample.level30)
      expect(parsed.summary.level40).toBe(sample.level40)
      expect(parsed.summary.invalid).toBe(sample.invalid)
      expect(parsed.summary.excluded).toBe(sample.excluded)
      expect(parsed.summary.byPrefix).toEqual(sample.byPrefix)
      expect(parsed.headers[0]).toBe('Lokation')
      expect(parsed.headers[4]).toBe('ABC Indikator')
      expect(String(parsed.title?.[0])).toContain('Vis Ledige Lokationer')

      const codes = parsed.matches.map((row) => String(row[0]))
      const sorted = [...codes].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      expect(codes).toEqual(sorted)

      const again = await parseWorkbook(await buildWorkbook(parsed))
      expect(again.matches).toHaveLength(sample.matches)
      expect(again.summary.excluded).toBe(0)
      expect(again.summary.invalid).toBe(0)
    })
  }
})
