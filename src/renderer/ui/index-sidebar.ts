/**
 * Expandable left index: project files + scenes / characters / notes.
 */

import { t } from '../../shared/i18n/locales'
import type { LocaleCode } from '../../shared/constants/screenplay'
import {
  filterIndex,
  type IndexEntry,
  type IndexKind
} from '../../shared/project/index-outline'

export interface IndexFileRow {
  path: string
  name: string
  isCurrentDraft: boolean
  isNotes: boolean
}

export interface IndexSidebarHandle {
  setLocale: (locale: LocaleCode) => void
  setVisible: (visible: boolean) => void
  render: (opts: {
    files: IndexFileRow[]
    entries: IndexEntry[]
    projectName: string
  }) => void
  destroy: () => void
}

export function createIndexSidebar(
  root: HTMLElement,
  handlers: {
    onOpenFile: (path: string) => void
    onJump: (entry: IndexEntry) => void
  }
): IndexSidebarHandle {
  let locale: LocaleCode = 'en_GB'
  let files: IndexFileRow[] = []
  let entries: IndexEntry[] = []
  let query = ''
  let kinds: IndexKind[] = []

  root.innerHTML = `
    <header class="sidebar-header">
      <strong id="index-title">Index</strong>
      <button type="button" class="sidebar-collapse" id="index-collapse" title="Hide">‹</button>
    </header>
    <input type="search" id="index-search" class="sidebar-search" placeholder="Search…" />
    <div class="index-filters" id="index-filters"></div>
    <div class="sidebar-body" id="index-body"></div>
  `

  const titleEl = root.querySelector('#index-title') as HTMLElement
  const searchEl = root.querySelector('#index-search') as HTMLInputElement
  const filtersEl = root.querySelector('#index-filters') as HTMLElement
  const bodyEl = root.querySelector('#index-body') as HTMLElement
  const collapseBtn = root.querySelector('#index-collapse') as HTMLButtonElement

  const applyLocale = (): void => {
    titleEl.textContent = t(locale, 'index.title')
    searchEl.placeholder = t(locale, 'index.search')
    renderFilters()
    paint()
  }

  const renderFilters = (): void => {
    const opts: { id: IndexKind | 'all'; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'scene', label: t(locale, 'index.scenes') },
      { id: 'character', label: t(locale, 'index.characters') },
      { id: 'note', label: t(locale, 'index.notes') }
    ]
    filtersEl.innerHTML = ''
    for (const opt of opts) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = opt.label
      const active =
        opt.id === 'all' ? kinds.length === 0 : kinds.length === 1 && kinds[0] === opt.id
      btn.className = active ? 'active' : ''
      btn.addEventListener('click', () => {
        kinds = opt.id === 'all' ? [] : [opt.id]
        renderFilters()
        paint()
      })
      filtersEl.appendChild(btn)
    }
  }

  const paint = (): void => {
    bodyEl.innerHTML = ''
    if (files.length > 0) {
      const h = document.createElement('h3')
      h.textContent = t(locale, 'index.files')
      bodyEl.appendChild(h)
      const ul = document.createElement('ul')
      for (const file of files) {
        const li = document.createElement('li')
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'index-file'
        btn.textContent = file.name
        if (file.isCurrentDraft) btn.classList.add('current')
        btn.addEventListener('click', () => handlers.onOpenFile(file.path))
        li.appendChild(btn)
        ul.appendChild(li)
      }
      bodyEl.appendChild(ul)
    }

    const filtered = filterIndex(entries, query, kinds.length ? kinds : undefined)
    const groups: { kind: IndexKind; label: string }[] = [
      { kind: 'scene', label: t(locale, 'index.scenes') },
      { kind: 'character', label: t(locale, 'index.characters') },
      { kind: 'note', label: t(locale, 'index.notes') }
    ]
    let any = false
    for (const g of groups) {
      const items = filtered.filter((e) => e.kind === g.kind)
      if (items.length === 0) continue
      any = true
      const h = document.createElement('h3')
      h.textContent = g.label
      bodyEl.appendChild(h)
      const ul = document.createElement('ul')
      for (const item of items) {
        const li = document.createElement('li')
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = item.detail ? `${item.label} (${item.detail})` : item.label
        btn.addEventListener('click', () => handlers.onJump(item))
        li.appendChild(btn)
        ul.appendChild(li)
      }
      bodyEl.appendChild(ul)
    }
    if (!any && files.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'sidebar-empty'
      empty.textContent = t(locale, 'index.empty')
      bodyEl.appendChild(empty)
    }
  }

  searchEl.addEventListener('input', () => {
    query = searchEl.value
    paint()
  })
  collapseBtn.addEventListener('click', () => {
    root.classList.toggle('collapsed')
  })

  applyLocale()

  return {
    setLocale: (next) => {
      locale = next
      applyLocale()
    },
    setVisible: (visible) => {
      root.classList.toggle('hidden', !visible)
    },
    render: (opts) => {
      files = opts.files
      entries = opts.entries
      paint()
    },
    destroy: () => {
      root.innerHTML = ''
    }
  }
}
