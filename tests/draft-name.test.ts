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
    expect(formatDraftFileName('MyScript', '2026-08-16')).toBe(
      'MyScript-draft-2026-08-16.fountain'
    )
  })

  it('parses ISO and compact draft dates', () => {
    expect(parseDraftDate('MyScript-draft-2026-08-16.fountain')).toBe(
      '2026-08-16'
    )
    expect(parseDraftDate('script-draft-20260801.fountain')).toBe('2026-08-01')
    expect(parseDraftDate('notes.md')).toBeNull()
    expect(inspectDraft('old.fountain').date).toBeNull()
  })

  it('picks the newest dated fountain as current draft', () => {
    const files = [
      'MyScript.fountain',
      'MyScript-draft-2026-07-01.fountain',
      'MyScript-draft-2026-08-16.fountain',
      'Notes-myscript.md'
    ]
    expect(pickCurrentDraft(files)).toBe(
      'MyScript-draft-2026-08-16.fountain'
    )
    expect(isCurrentDraft('MyScript-draft-2026-08-16.fountain', files)).toBe(
      true
    )
    expect(isCurrentDraft('MyScript.fountain', files)).toBe(false)
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
    expect(importAsCurrentDraftName('MyScript', '2026-08-16')).toBe(
      'MyScript-draft-2026-08-16.fountain'
    )
  })

  it('strips dates when importing as notes', () => {
    expect(importAsNotesName('MyScript-draft-2026-01-02.fountain')).toBe(
      'MyScript.md'
    )
    expect(importAsNotesName('research.pdf')).toBe('research.pdf')
  })

  it('strips draft dates from mixed names', () => {
    expect(stripDraftDate('Foo-draft-2026-08-16.fountain')).toBe('Foo.fountain')
  })

  it('sanitises project names', () => {
    expect(sanitizeProjectName('  My / Script : Name  ')).toBe('My Script Name')
  })

  it('todayIso is a valid date', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
