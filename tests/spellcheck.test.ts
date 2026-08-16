import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SPELLCHECK_LANGUAGES,
  hunspellCodesFor,
  resolveSpellcheckLanguages,
  sanitizeDictionaryUrl,
  sanitizeSpellcheckLanguages
} from '../src/shared/constants/spellcheck'

describe('spellcheck language sanitisation', () => {
  it('defaults to British English', () => {
    expect(sanitizeSpellcheckLanguages(undefined)).toEqual(
      DEFAULT_SPELLCHECK_LANGUAGES
    )
    expect(sanitizeSpellcheckLanguages([])).toEqual(['en-GB'])
    expect(sanitizeSpellcheckLanguages(['nope'])).toEqual(['en-GB'])
  })

  it('accepts en-GB, en-US and Latin American Spanish aliases', () => {
    expect(sanitizeSpellcheckLanguages(['en-US', 'es_PY'])).toEqual([
      'en-US',
      'es-419'
    ])
    expect(sanitizeSpellcheckLanguages(['en_GB', 'es', 'es-MX'])).toEqual([
      'en-GB',
      'es-419'
    ])
  })

  it('deduplicates while keeping order', () => {
    expect(sanitizeSpellcheckLanguages(['en-GB', 'en-GB', 'en-US'])).toEqual([
      'en-GB',
      'en-US'
    ])
  })
})

describe('dictionary URL sanitisation', () => {
  it('allows http(s) and forces a trailing slash', () => {
    expect(sanitizeDictionaryUrl('https://example.com/dicts')).toBe(
      'https://example.com/dicts/'
    )
    expect(sanitizeDictionaryUrl('http://127.0.0.1:8080/hunspell/')).toBe(
      'http://127.0.0.1:8080/hunspell/'
    )
  })

  it('rejects non-http schemes and junk', () => {
    expect(sanitizeDictionaryUrl('file:///tmp/dicts')).toBe('')
    expect(sanitizeDictionaryUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeDictionaryUrl('not a url')).toBe('')
    expect(sanitizeDictionaryUrl('')).toBe('')
  })
})

describe('Hunspell language resolution', () => {
  it('expands Spanish to Latin American then generic tags', () => {
    expect(hunspellCodesFor(['es-419'])).toEqual([
      'es-419',
      'es',
      'es-ES',
      'es-MX'
    ])
  })

  it('picks the first available Hunspell tag per requested language', () => {
    expect(
      resolveSpellcheckLanguages(['en-GB', 'es-419'], ['en-US', 'es-ES', 'en-GB'])
    ).toEqual(['en-GB', 'es-ES'])
  })

  it('keeps preferred codes when the session list is empty', () => {
    expect(resolveSpellcheckLanguages(['en-GB'], [])).toEqual(['en-GB'])
  })
})
