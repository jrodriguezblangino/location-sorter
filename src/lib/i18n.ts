export type Lang = 'da' | 'en'

export type FileErrorCode = 'xlsx' | 'size' | 'unreadable' | 'no-location-column' | 'no-data'

export type Copy = {
  languageLabel: string
  skip: string
  loading: string
  description: string
  documentTitle: string
  levelDocumentTitle: (level: string) => string
  eyebrow: string
  title: string
  intro: string
  dropAria: string
  dropTitle: string
  dropHint: string
  reading: string
  errors: Record<FileErrorCode, string>
  noMatches: string
  download: string
  downloadName: string
  showQr: string
  result: string
  level: (level: string) => string
  levelWord: string
  locationWord: (count: number) => string
  locationCount: (count: number) => string
  rowsRead: string
  excluded: string
  invalid: string
  duplicates: string
  aisle: (prefix: string) => string
  qrTitle: string
  qrBody: string
  qrTight: string
  qrFailed: string
  qrAlt: string
  link: string
  copied: string
  copyLink: string
  openMobile: string
  badLinkTitle: string
  badLinkBody: string
  mobileTitle: string
  emptyLevel: string
  chooseLocation: string
  position: (current: number, total: number) => string
  previous: string
  next: string
  levels: string
  selected: string
  levelsGroup: string
}

const da: Copy = {
  languageLabel: 'Sprog',
  skip: 'Gå til indhold',
  loading: 'Indlæser…',
  description: 'Filtrér ledige lokationer fra WMS og del listen med lageret.',
  documentTitle: 'Vis ledige lokationer · Imerco',
  levelDocumentTitle: (level) => `Niveau ${level} · Imerco`,
  eyebrow: '20.SA.10',
  title: 'Vis ledige lokationer',
  intro: 'Læg WMS-filen her. Appen beholder gange 11, 12, 13, 14 og 17 på niveau 20, 30 og 40, og laver en liste til gulvet.',
  dropAria: 'Vælg Excel-fil',
  dropTitle: 'Træk Excel-filen hertil',
  dropHint: 'eller klik for at vælge · kun .xlsx · højst 10 MB',
  reading: 'Læser filen…',
  errors: {
    xlsx: 'Kun .xlsx-filer understøttes.',
    size: 'Filen er større end 10 MB.',
    unreadable: 'Filen kunne ikke læses. Excel-filen er muligvis beskadiget.',
    'no-location-column': 'Kolonnen "Lokation" blev ikke fundet.',
    'no-data': 'Ingen datarækker fundet.',
  },
  noMatches: 'Ingen lokationer matchede filteret.',
  download: 'Hent filtreret Excel',
  downloadName: 'Ledige-lokationer.xlsx',
  showQr: 'Vis QR-kode',
  result: 'Resultat',
  level: (level) => `Niveau ${level}`,
  levelWord: 'Niveau',
  locationWord: (count) => (count === 1 ? 'lokation' : 'lokationer'),
  locationCount: (count) => (count === 1 ? '1 lokation' : `${count.toLocaleString('da-DK')} lokationer`),
  rowsRead: 'Rækker læst',
  excluded: 'Udeladt',
  invalid: 'Ugyldigt format',
  duplicates: 'Dubletter',
  aisle: (prefix) => `Gang ${prefix}`,
  qrTitle: 'Mobilvisning',
  qrBody: 'Scan koden med lagertelefonen. Linket indeholder kun lokationskoderne fra denne fil.',
  qrTight: 'QR-koden er tæt pakket og kan være svær at scanne. Kopiér linket, hvis telefonen ikke kan læse den.',
  qrFailed: 'QR-koden kunne ikke laves. Kopiér linket i stedet.',
  qrAlt: 'QR-kode til mobilvisningen',
  link: 'Link',
  copied: 'Kopieret',
  copyLink: 'Kopiér link',
  openMobile: 'Åbn mobilvisning',
  badLinkTitle: 'Linket kunne ikke læses',
  badLinkBody: 'QR-koden er ugyldig. Lav en ny fra computeren.',
  mobileTitle: 'Ledige lokationer',
  emptyLevel: 'Ingen lokationer på dette niveau.',
  chooseLocation: 'Vælg en lokation',
  position: (current, total) => `${current} af ${total}`,
  previous: 'Forrige',
  next: 'Næste',
  levels: 'Niveauer',
  selected: 'Valgt',
  levelsGroup: 'Niveauer',
}

const en: Copy = {
  languageLabel: 'Language',
  skip: 'Skip to content',
  loading: 'Loading…',
  description: 'Filter available warehouse locations from the WMS export and share the list with the floor.',
  documentTitle: 'Available locations · Imerco',
  levelDocumentTitle: (level) => `Level ${level} · Imerco`,
  eyebrow: '20.SA.10',
  title: 'Available locations',
  intro: 'Drop the WMS file here. The app keeps aisles 11, 12, 13, 14 and 17 on levels 20, 30 and 40, and builds a list for the floor.',
  dropAria: 'Choose Excel file',
  dropTitle: 'Drop the Excel file here',
  dropHint: 'or click to choose · .xlsx only · max 10 MB',
  reading: 'Reading file…',
  errors: {
    xlsx: 'Only .xlsx files are supported.',
    size: 'The file is larger than 10 MB.',
    unreadable: 'The file could not be read. The Excel file may be damaged.',
    'no-location-column': 'Column "Lokation" was not found.',
    'no-data': 'No data rows found.',
  },
  noMatches: 'No locations matched the filter.',
  download: 'Download filtered Excel',
  downloadName: 'Available-locations.xlsx',
  showQr: 'Show QR code',
  result: 'Result',
  level: (level) => `Level ${level}`,
  levelWord: 'Level',
  locationWord: (count) => (count === 1 ? 'location' : 'locations'),
  locationCount: (count) => (count === 1 ? '1 location' : `${count.toLocaleString('en-GB')} locations`),
  rowsRead: 'Rows read',
  excluded: 'Excluded',
  invalid: 'Invalid format',
  duplicates: 'Duplicates',
  aisle: (prefix) => `Aisle ${prefix}`,
  qrTitle: 'Mobile view',
  qrBody: 'Scan the code with the warehouse phone. The link contains only the location codes from this file.',
  qrTight: 'The QR code is densely packed and may be hard to scan. Copy the link if the phone cannot read it.',
  qrFailed: 'The QR code could not be created. Copy the link instead.',
  qrAlt: 'QR code for the mobile view',
  link: 'Link',
  copied: 'Copied',
  copyLink: 'Copy link',
  openMobile: 'Open mobile view',
  badLinkTitle: 'The link could not be read',
  badLinkBody: 'The QR code is invalid. Create a new one from the computer.',
  mobileTitle: 'Available locations',
  emptyLevel: 'No locations on this level.',
  chooseLocation: 'Choose a location',
  position: (current, total) => `${current} of ${total}`,
  previous: 'Previous',
  next: 'Next',
  levels: 'Levels',
  selected: 'Selected',
  levelsGroup: 'Levels',
}

export const copy: Record<Lang, Copy> = { da, en }

const STORAGE_KEY = 'imerco-lang'

export function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'da'
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl === 'da' || fromUrl === 'en') return fromUrl
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'da' || stored === 'en') return stored
  } catch {
    /* private mode */
  }
  return 'da'
}

export function storeLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* private mode */
  }
  const url = new URL(window.location.href)
  if (url.searchParams.get('lang') === lang) return
  url.searchParams.set('lang', lang)
  window.history.replaceState(null, '', url)
}

export function numberLocale(lang: Lang): string {
  return lang === 'da' ? 'da-DK' : 'en-GB'
}
