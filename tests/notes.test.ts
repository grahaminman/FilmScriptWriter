import { describe, it, expect } from 'vitest'
import {
  ensureTokenSections,
  extractNoteTokens,
  notesFileName,
  parseNoteSections,
  starterNotesMarkdown,
  tokenToHeading,
  upsertNoteSection
} from '../src/shared/project/notes'
import { searchHelp } from '../src/shared/help/help-content'
import {
  buildScriptIndex,
  filterIndex
} from '../src/shared/project/index-outline'

describe('project notes', () => {
  it('names the notes file after the title', () => {
    expect(notesFileName('Lust For Life')).toBe('Notes-lust for life.md')
  })

  it('maps [[ Note 1]] to heading note 1', () => {
    expect(tokenToHeading(' Note 1')).toBe('note 1')
    expect(extractNoteTokens('Hello [[ Note 1]] and [[Note 1]] then [[Beat]]')).toEqual(
      ['note 1', 'beat']
    )
  })

  it('upserts an editable section without losing others', () => {
    const md = '# note 1\n\nOld.\n\n# beat\n\nKeep me.\n'
    const next = upsertNoteSection(md, 'note 1', 'New body from sidebar.')
    const sections = parseNoteSections(next)
    expect(sections.find((s) => s.heading === 'note 1')?.body).toBe(
      'New body from sidebar.'
    )
    expect(sections.find((s) => s.heading === 'beat')?.body).toBe('Keep me.')
  })

  it('creates missing token headings', () => {
    const next = ensureTokenSections('# notes\n\nIntro.\n', ['note 1', 'notes'])
    const headings = parseNoteSections(next).map((s) => s.heading)
    expect(headings).toContain('notes')
    expect(headings).toContain('note 1')
  })

  it('starts a notes file for a title', () => {
    expect(starterNotesMarkdown('Lust For Life')).toContain('# notes')
    expect(starterNotesMarkdown('Lust For Life')).toContain('Lust For Life')
  })
})

describe('index + help search', () => {
  it('indexes scenes, characters and note tokens', () => {
    const src = `Title: Demo

INT. KITCHEN - DAY

ALICE
Hello [[ Note 1]]

BOB
Hi.
`
    const index = buildScriptIndex(src)
    expect(index.some((e) => e.kind === 'scene' && /KITCHEN/.test(e.label))).toBe(
      true
    )
    expect(index.some((e) => e.kind === 'character' && e.label === 'ALICE')).toBe(
      true
    )
    expect(index.some((e) => e.kind === 'note' && e.label === 'note 1')).toBe(true)
    expect(filterIndex(index, 'alice', ['character'])).toHaveLength(1)
    expect(filterIndex(index, 'xyz')).toHaveLength(0)
  })

  it('searches help articles', () => {
    expect(searchHelp('autosave').length).toBeGreaterThan(0)
    expect(searchHelp('xyzzy-no-match')).toHaveLength(0)
    expect(searchHelp('').length).toBeGreaterThan(5)
  })
})
