/**
 * Searchable project index: scenes, characters, and note tokens.
 */

import { collectCharacters } from '../fountain/characters'
import { parseFountain } from '../fountain/parser'
import { extractNoteTokens } from './notes'

export type IndexKind = 'scene' | 'character' | 'note' | 'file'

export interface IndexEntry {
  kind: IndexKind
  label: string
  /** 1-based source line when known. */
  line?: number
  detail?: string
}

export function buildScriptIndex(source: string): IndexEntry[] {
  const doc = parseFountain(source)
  const entries: IndexEntry[] = []

  for (const el of doc.elements) {
    if (el.type === 'scene_heading' && el.text.trim()) {
      entries.push({
        kind: 'scene',
        label: el.text.trim(),
        line: el.lineIndex + 1
      })
    }
  }

  for (const ch of collectCharacters(doc)) {
    if (!ch.name) continue
    const first = doc.elements.find(
      (el) =>
        el.type === 'character' &&
        el.text.toUpperCase().includes(ch.name)
    )
    entries.push({
      kind: 'character',
      label: ch.name,
      line: first ? first.lineIndex + 1 : undefined,
      detail: ch.count > 0 ? `${ch.count}` : undefined
    })
  }

  for (const token of extractNoteTokens(source)) {
    const idx = source.toLowerCase().indexOf(`[[`)
    let line: number | undefined
    // Find first occurrence of this token
    const re = new RegExp(
      `\\[\\[\\s*${escapeRegExp(token)}\\s*\\]\\]`,
      'i'
    )
    const m = re.exec(source)
    if (m) {
      line = source.slice(0, m.index).split('\n').length
    } else if (idx >= 0) {
      line = undefined
    }
    entries.push({ kind: 'note', label: token, line })
  }

  return entries
}

export function filterIndex(
  entries: IndexEntry[],
  query: string,
  kinds?: IndexKind[]
): IndexEntry[] {
  const q = query.trim().toLowerCase()
  return entries.filter((e) => {
    if (kinds && kinds.length > 0 && !kinds.includes(e.kind)) return false
    if (!q) return true
    return e.label.toLowerCase().includes(q) || (e.detail ?? '').toLowerCase().includes(q)
  })
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
