import { describe, it, expect } from 'vitest'
import {
  resolveSyntaxCoach,
  wordAtCursor
} from '../src/shared/fountain/syntax-coach'

function tip(
  lineText: string,
  extras: Partial<Parameters<typeof resolveSyntaxCoach>[0]> = {}
) {
  return resolveSyntaxCoach({
    lineText,
    lineKind: extras.lineKind ?? 'action',
    previousKind: extras.previousKind,
    prevBlank: extras.prevBlank ?? true,
    cursorCol: extras.cursorCol ?? lineText.length,
    isFountain: extras.isFountain ?? true
  })
}

describe('syntax coach', () => {
  it('reads the token left of the caret', () => {
    expect(wordAtCursor('Hello [[not', 11)).toBe('[[not')
    expect(wordAtCursor('/* cut', 2)).toBe('/*')
    expect(wordAtCursor('INT. ROOM', 3)).toBe('INT')
  })

  it('explains notes as soon as [[ is typed', () => {
    const t = tip('[[ remember this', { lineKind: 'note' })
    expect(t.id).toBe('note')
    expect(t.syntax).toContain('[[')
    expect(t.explanation.toLowerCase()).toMatch(/note|print/)
  })

  it('explains boneyard from /* or the word boneyard', () => {
    expect(tip('/* old scene').id).toBe('boneyard')
    expect(tip('I will put this in the boneyard later').id).toBe('boneyard')
  })

  it('coaches a scene heading from INT/EXT fragments', () => {
    expect(tip('INT', { prevBlank: true }).id).toBe('scene')
    expect(tip('EXT. STREET - NIGHT', { lineKind: 'scene' }).id).toBe('scene')
  })

  it('suggests dialogue after a character cue', () => {
    expect(
      tip('', { lineKind: 'empty', previousKind: 'character', prevBlank: true })
        .id
    ).toBe('dialogue')
  })

  it('treats a blank new line as ready-to-write', () => {
    expect(tip('', { lineKind: 'empty', prevBlank: true }).id).toBe('ready')
  })

  it('detects dual dialogue caret', () => {
    expect(tip('JON ^', { lineKind: 'character' }).id).toBe('dual')
  })

  it('stays quiet on non-fountain files', () => {
    expect(tip('# heading', { isFountain: false }).id).toBe('not-fountain')
  })

  it('maps classified kinds when no keyword is present', () => {
    expect(
      tip('Rain on the glass.', { lineKind: 'action', prevBlank: false }).id
    ).toBe('action')
  })
})
