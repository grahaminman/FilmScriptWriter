export const SPELLCHECK_LANG_EN_GB = 'en-GB'
export const SPELLCHECK_LANG_EN_US = 'en-US'
export const SPELLCHECK_LANG_ES = 'es-419'
export const SPELLCHECK_LANG_DE = 'de-DE'
export const SPELLCHECK_LANG_FR = 'fr-FR'
export const SPELLCHECK_LANG_IT = 'it-IT'

export const SPELLCHECK_LANGUAGE_IDS = [
  SPELLCHECK_LANG_EN_GB,
  SPELLCHECK_LANG_EN_US,
  SPELLCHECK_LANG_ES,
  SPELLCHECK_LANG_DE,
  SPELLCHECK_LANG_FR,
  SPELLCHECK_LANG_IT
] as const

export type SpellcheckLanguageId = (typeof SPELLCHECK_LANGUAGE_IDS)[number]

export const DEFAULT_SPELLCHECK_LANGUAGES: SpellcheckLanguageId[] = [
  SPELLCHECK_LANG_EN_GB
]

export interface SpellcheckLanguageOption {
  id: SpellcheckLanguageId
  hunspellCodes: string[]
  dictionaryFiles: string[]
}

export const SPELLCHECK_LANGUAGE_OPTIONS: SpellcheckLanguageOption[] = [
  {
    id: SPELLCHECK_LANG_EN_GB,
    hunspellCodes: ['en-GB'],
    dictionaryFiles: ['en-GB']
  },
  {
    id: SPELLCHECK_LANG_EN_US,
    hunspellCodes: ['en-US'],
    dictionaryFiles: ['en-US']
  },
  {
    id: SPELLCHECK_LANG_ES,
    hunspellCodes: ['es-419', 'es', 'es-ES', 'es-MX'],
    dictionaryFiles: ['es-419', 'es', 'es-ES']
  },
  {
    id: SPELLCHECK_LANG_DE,
    hunspellCodes: ['de-DE', 'de'],
    dictionaryFiles: ['de-DE', 'de']
  },
  {
    id: SPELLCHECK_LANG_FR,
    hunspellCodes: ['fr-FR', 'fr'],
    dictionaryFiles: ['fr-FR', 'fr']
  },
  {
    id: SPELLCHECK_LANG_IT,
    hunspellCodes: ['it-IT', 'it'],
    dictionaryFiles: ['it-IT', 'it']
  }
]

export const DEFAULT_DICTIONARY_MIRRORS = [
  'https://redirector.gvt1.com/edgedl/chrome/dict/',
  'https://dl.google.com/edgedl/chrome/dict/',
  'https://raw.githubusercontent.com/cvsuser-chromium/third_party_hunspell_dictionaries/master/'
]

export const DICTIONARY_VERSION_SUFFIXES = [
  '',
  '-10-1',
  '-9-0',
  '-8-0',
  '-7-1',
  '-3-0'
]

const KNOWN = new Set<string>(SPELLCHECK_LANGUAGE_IDS)

export function isSpellcheckLanguageId(value: string): value is SpellcheckLanguageId {
  return KNOWN.has(value)
}

export function sanitizeSpellcheckLanguages(raw: unknown): SpellcheckLanguageId[] {
  const input = Array.isArray(raw) ? raw : []
  const seen = new Set<SpellcheckLanguageId>()
  const out: SpellcheckLanguageId[] = []
  for (const item of input) {
    if (typeof item !== 'string') continue
    const mapped = mapLooseLanguage(item.trim())
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped)
      out.push(mapped)
    }
  }
  return out.length > 0 ? out : [...DEFAULT_SPELLCHECK_LANGUAGES]
}

function mapLooseLanguage(code: string): SpellcheckLanguageId | null {
  const lower = code.toLowerCase().replace('_', '-')
  if (lower === 'en-gb' || lower === 'en-uk') return SPELLCHECK_LANG_EN_GB
  if (lower === 'en-us') return SPELLCHECK_LANG_EN_US
  if (
    lower === 'es-419' ||
    lower === 'es' ||
    lower === 'es-es' ||
    lower === 'es-py' ||
    lower === 'es-mx' ||
    lower === 'es-la'
  ) {
    return SPELLCHECK_LANG_ES
  }
  if (lower === 'de' || lower === 'de-de') return SPELLCHECK_LANG_DE
  if (lower === 'fr' || lower === 'fr-fr') return SPELLCHECK_LANG_FR
  if (lower === 'it' || lower === 'it-it') return SPELLCHECK_LANG_IT
  if (isSpellcheckLanguageId(code)) return code
  return null
}

export function sanitizeDictionaryUrl(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.href.endsWith('/') ? url.href : `${url.href}/`
  } catch {
    return ''
  }
}

export function hunspellCodesFor(ids: readonly string[]): string[] {
  const codes: string[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    const option = SPELLCHECK_LANGUAGE_OPTIONS.find((o) => o.id === id)
    const list = option?.hunspellCodes ?? [id]
    for (const code of list) {
      if (seen.has(code)) continue
      seen.add(code)
      codes.push(code)
    }
  }
  return codes
}

export function resolveSpellcheckLanguages(
  requested: readonly string[],
  available: readonly string[]
): string[] {
  const preferred = hunspellCodesFor(requested)
  if (available.length === 0) {
    return preferred.length > 0 ? preferred : [SPELLCHECK_LANG_EN_GB]
  }
  const avail = new Set(available)
  const matched: string[] = []
  const seen = new Set<string>()
  for (const id of requested) {
    const option = SPELLCHECK_LANGUAGE_OPTIONS.find((o) => o.id === id)
    const candidates = option?.hunspellCodes ?? [id]
    const hit = candidates.find((c) => avail.has(c))
    if (hit && !seen.has(hit)) {
      seen.add(hit)
      matched.push(hit)
    }
  }
  return matched.length > 0 ? matched : [SPELLCHECK_LANG_EN_GB]
}

export function dictionaryBasenamesFor(ids: readonly string[]): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    const option = SPELLCHECK_LANGUAGE_OPTIONS.find((o) => o.id === id)
    const list = option?.dictionaryFiles ?? [id]
    for (const name of list) {
      if (seen.has(name)) continue
      seen.add(name)
      names.push(name)
    }
  }
  return names
}
