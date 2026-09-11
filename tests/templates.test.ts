import { describe, it, expect } from 'vitest'
import {
  FEATURE_TEMPLATE,
  SHORT_DAILY_TEMPLATE,
  fillTemplatePlaceholders,
  getTemplateSource
} from '../src/shared/templates/text'
import { paginateSource } from '../src/shared/fountain/page-counter'
import { fountainToPdf } from '../src/shared/export/pdf'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('templates', () => {
  it('daily template contains [[ DAILY PROMPT ]] and FADE IN', () => {
    expect(SHORT_DAILY_TEMPLATE).toContain('[[ DAILY PROMPT')
    expect(SHORT_DAILY_TEMPLATE).toContain('FADE IN:')
    const shipped = readFileSync(
      resolve(__dirname, '../resources/templates/short-daily.fountain'),
      'utf8'
    )
    expect(shipped).toContain('[[ DAILY PROMPT')
    expect(shipped).toContain('FADE IN:')
  })

  it('feature template has a three-act skeleton and no teaching essay', () => {
    expect(FEATURE_TEMPLATE).toContain('# ACT ONE')
    expect(FEATURE_TEMPLATE).toContain('# ACT TWO')
    expect(FEATURE_TEMPLATE).toContain('# ACT THREE')
    expect(FEATURE_TEMPLATE.toLowerCase()).not.toContain('10-sequence')
  })

  it('fills draft date without rewriting the instruction note tokens', () => {
    const filled = fillTemplatePlaceholders(FEATURE_TEMPLATE, {
      writer: 'Ada',
      date: '11 September 2026'
    })
    expect(filled).toContain('Draft date: 11 September 2026')
    expect(filled).toContain('Author: Ada')
    expect(filled).toContain('{Title}')
    expect(filled).toContain('{Email}')
  })

  it('getTemplateSource returns the daily template by default path', () => {
    const src = getTemplateSource('short-daily')
    expect(src).toContain('[[ DAILY PROMPT')
    expect(src).toContain('FADE IN:')
  })

  it('omits the DAILY PROMPT note from pagination and PDF', async () => {
    const result = paginateSource(SHORT_DAILY_TEMPLATE)
    const text = result.pages
      .flatMap((page) => page.lines.map((line) => line.text))
      .join('\n')
    expect(text).toContain('FADE IN')
    expect(text).not.toContain('DAILY PROMPT')
    expect(text).not.toContain('filmscriptwriter-3192')

    const buffer = await fountainToPdf(SHORT_DAILY_TEMPLATE)
    const pdf = buffer.toString('latin1')
    expect(pdf).not.toContain('DAILY PROMPT')
    expect(pdf).not.toContain('filmscriptwriter-3192')
  })
})
