import { describe, it, expect } from 'vitest'
import {
  formatDraftFileName,
  importAsCurrentDraftName,
  importAsNotesName,
  inspectDraft,
  isCurrentDraft,
  parseDraftDate,
  pickCurrentDraft,
  sanitizeProjectName,
  stripDraftDate,
  todayIso
} from '../src/shared/project/draft-name'

describe('draft filenames', () => {
  it('formats project-name-draft-date', () => {
    expect(formatDraftFileName('Lust For Life', '2026-08-16')).toBe(
      'Lust For Life-draft-2026-08-16.fountain'
    )
  })

  it('parses ISO and compact draft dates', () => {
    expect(parseDraftDate('Lust For Life-draft-2026-08-16.fountain')).toBe(
      '2026-08-16'
    )
    expect(parseDraftDate('script-draft-20260801.fountain')).toBe('2026-08-01')
    expect(parseDraftDate('notes.md')).toBeNull()
    expect(inspectDraft('old.fountain').date).toBeNull()
  })

  it('picks the newest dated fountain as current draft', () => {
    const files = [
      'Lust For Life.fountain',
      'Lust For Life-draft-2026-07-01.fountain',
      'Lust For Life-draft-2026-08-16.fountain',
      'Notes-lust for life.md'
    ]
    expect(pickCurrentDraft(files)).toBe(
      'Lust For Life-draft-2026-08-16.fountain'
    )
    expect(isCurrentDraft('Lust For Life-draft-2026-08-16.fountain', files)).toBe(
      true
    )
    expect(isCurrentDraft('Lust For Life.fountain', files)).toBe(false)
  })

  it('prefers any dated file over an undated one', () => {
    expect(
      pickCurrentDraft(['old-title.fountain', 'Title-draft-2020-01-01.fountain'])
    ).toBe('Title-draft-2020-01-01.fountain')
  })

  it('returns null when no fountain has a date', () => {
    expect(pickCurrentDraft(['a.fountain', 'b.fountain'])).toBeNull()
  })

  it('adds a date when importing as the current draft', () => {
    expect(importAsCurrentDraftName('Lust For Life', '2026-08-16')).toBe(
      'Lust For Life-draft-2026-08-16.fountain'
    )
  })

  it('strips dates when importing as notes', () => {
    expect(importAsNotesName('Lust For Life-draft-2026-01-02.fountain')).toBe(
      'Lust For Life.md'
    )
    expect(importAsNotesName('research.pdf')).toBe('research.pdf')
  })

  it('strips draft dates from mixed names', () => {
    expect(stripDraftDate('Foo-draft-2026-08-16.fountain')).toBe('Foo.fountain')
  })

  it('sanitises project names', () => {
    expect(sanitizeProjectName('  Lust / For : Life  ')).toBe('Lust For Life')
  })

  it('todayIso is a valid date', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
