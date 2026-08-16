/**
 * Searchable in-app help overlay.
 */

import { HELP_ARTICLES, searchHelp, type HelpArticle } from '../../shared/help/help-content'
import { t } from '../../shared/i18n/locales'
import type { LocaleCode } from '../../shared/constants/screenplay'

export interface HelpPanelHandle {
  open: (query?: string) => void
  close: () => void
  setLocale: (locale: LocaleCode) => void
  destroy: () => void
}

export function createHelpPanel(parent: HTMLElement): HelpPanelHandle {
  let locale: LocaleCode = 'en_GB'
  let selectedId = HELP_ARTICLES[0]?.id ?? ''

  const backdrop = document.createElement('div')
  backdrop.className = 'settings-backdrop hidden'
  backdrop.innerHTML = `
    <div class="help-panel" role="dialog" aria-labelledby="help-title">
      <header class="settings-header">
        <h2 id="help-title">Help</h2>
        <button type="button" class="settings-close" id="help-close" aria-label="Close">×</button>
      </header>
      <div class="help-layout">
        <div class="help-nav">
          <input type="search" id="help-search" placeholder="Search help…" />
          <ul id="help-list"></ul>
        </div>
        <article class="help-article" id="help-article"></article>
      </div>
    </div>
  `
  parent.appendChild(backdrop)

  const titleEl = backdrop.querySelector('#help-title') as HTMLElement
  const searchEl = backdrop.querySelector('#help-search') as HTMLInputElement
  const listEl = backdrop.querySelector('#help-list') as HTMLElement
  const articleEl = backdrop.querySelector('#help-article') as HTMLElement
  const closeBtn = backdrop.querySelector('#help-close') as HTMLButtonElement

  const renderArticle = (article: HelpArticle | undefined): void => {
    if (!article) {
      articleEl.innerHTML = `<p class="help-empty">${escapeHtml(t(locale, 'help.empty'))}</p>`
      return
    }
    const paras = article.body
      .trim()
      .split(/\n\n+/)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
      .join('')
    articleEl.innerHTML = `<h3>${escapeHtml(article.title)}</h3>${paras}`
  }

  const renderList = (query: string): void => {
    const hits = searchHelp(query)
    listEl.innerHTML = ''
    if (hits.length === 0) {
      listEl.innerHTML = `<li class="help-empty">${escapeHtml(t(locale, 'help.empty'))}</li>`
      renderArticle(undefined)
      return
    }
    if (!hits.some((h) => h.id === selectedId)) selectedId = hits[0].id
    for (const article of hits) {
      const li = document.createElement('li')
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = article.title
      btn.className = article.id === selectedId ? 'active' : ''
      btn.addEventListener('click', () => {
        selectedId = article.id
        renderList(searchEl.value)
      })
      li.appendChild(btn)
      listEl.appendChild(li)
    }
    renderArticle(hits.find((h) => h.id === selectedId) ?? hits[0])
  }

  const applyLocale = (): void => {
    titleEl.textContent = t(locale, 'help.title')
    searchEl.placeholder = t(locale, 'help.search')
    renderList(searchEl.value)
  }

  const open = (query = ''): void => {
    searchEl.value = query
    applyLocale()
    backdrop.classList.remove('hidden')
    searchEl.focus()
  }

  const close = (): void => {
    backdrop.classList.add('hidden')
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })
  closeBtn.addEventListener('click', close)
  searchEl.addEventListener('input', () => renderList(searchEl.value))
  backdrop.querySelector('.help-panel')?.addEventListener('click', (e) => e.stopPropagation())

  return {
    open,
    close,
    setLocale: (next) => {
      locale = next
      if (!backdrop.classList.contains('hidden')) applyLocale()
    },
    destroy: () => backdrop.remove()
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
