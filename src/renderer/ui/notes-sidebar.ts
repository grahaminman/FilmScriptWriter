/**
 * Expandable notes sidebar. [[ Note 1]] in the editor maps to # note 1.
 * Section bodies are edited here so the script stays uncluttered.
 */

import { t } from '../../shared/i18n/locales'
import type { LocaleCode } from '../../shared/constants/screenplay'
import {
  ensureTokenSections,
  extractNoteTokens,
  parseNoteSections,
  serializeNoteSections,
  type NoteSection,
  upsertNoteSection
} from '../../shared/project/notes'

export interface NotesSidebarHandle {
  setLocale: (locale: LocaleCode) => void
  setVisible: (visible: boolean) => void
  setTitle: (projectTitle: string) => void
  /**
   * Sync from the current draft (tokens) + notes markdown.
   * Returns the notes markdown after ensuring token headings exist.
   */
  syncFromScript: (script: string, notesMarkdown: string) => string
  getMarkdown: () => string
  destroy: () => void
}

export function createNotesSidebar(
  root: HTMLElement,
  handlers: {
    onChange: (markdown: string) => void
  }
): NotesSidebarHandle {
  let locale: LocaleCode = 'en_GB'
  let projectTitle = ''
  let sections: NoteSection[] = []

  root.innerHTML = `
    <header class="sidebar-header">
      <strong id="notes-title">Notes</strong>
      <button type="button" class="sidebar-collapse" id="notes-collapse" title="Hide">‹</button>
    </header>
    <p class="sidebar-sub" id="notes-sub"></p>
    <div class="sidebar-body" id="notes-body"></div>
    <button type="button" class="sidebar-add" id="notes-add">Add note</button>
  `

  const titleEl = root.querySelector('#notes-title') as HTMLElement
  const subEl = root.querySelector('#notes-sub') as HTMLElement
  const bodyEl = root.querySelector('#notes-body') as HTMLElement
  const addBtn = root.querySelector('#notes-add') as HTMLButtonElement
  const collapseBtn = root.querySelector('#notes-collapse') as HTMLButtonElement

  const applyLocale = (): void => {
    titleEl.textContent = t(locale, 'notes.title')
    addBtn.textContent = t(locale, 'notes.add')
    updateSub()
  }

  const updateSub = (): void => {
    subEl.textContent = projectTitle
      ? `${t(locale, 'notes.title')} — ${projectTitle}`
      : t(locale, 'notes.title')
  }

  const emit = (): void => {
    handlers.onChange(serializeNoteSections(sections))
  }

  const paint = (): void => {
    bodyEl.innerHTML = ''
    if (sections.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'sidebar-empty'
      empty.textContent = t(locale, 'notes.empty')
      bodyEl.appendChild(empty)
      return
    }
    for (const section of sections) {
      const wrap = document.createElement('article')
      wrap.className = 'note-card'
      const heading = document.createElement('h3')
      heading.textContent = `# ${section.title || section.heading}`
      const area = document.createElement('textarea')
      area.value = section.body
      area.rows = Math.max(3, section.body.split('\n').length + 1)
      area.addEventListener('input', () => {
        section.body = area.value
        emit()
      })
      wrap.appendChild(heading)
      wrap.appendChild(area)
      bodyEl.appendChild(wrap)
    }
  }

  addBtn.addEventListener('click', () => {
    const n = sections.length + 1
    const heading = `note ${n}`
    const md = upsertNoteSection(serializeNoteSections(sections), heading, '')
    sections = parseNoteSections(md)
    paint()
    emit()
  })

  collapseBtn.addEventListener('click', () => {
    root.classList.toggle('collapsed')
  })

  applyLocale()

  return {
    setLocale: (next) => {
      locale = next
      applyLocale()
      paint()
    },
    setVisible: (visible) => {
      root.classList.toggle('hidden', !visible)
    },
    setTitle: (title) => {
      projectTitle = title
      updateSub()
    },
    syncFromScript: (script, notesMarkdown) => {
      const tokens = extractNoteTokens(script)
      const next = ensureTokenSections(notesMarkdown, tokens)
      sections = parseNoteSections(next)
      paint()
      return next
    },
    getMarkdown: () => serializeNoteSections(sections),
    destroy: () => {
      root.innerHTML = ''
    }
  }
}
