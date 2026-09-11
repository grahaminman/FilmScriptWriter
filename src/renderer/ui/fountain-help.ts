import {
  FOUNTAIN_SYNTAX_TOPICS,
  SYNTAX_GROUPS,
  type FountainSyntaxTopic
} from '../../shared/fountain/syntax-reference'
import { t, type MessageKey } from '../../shared/i18n/locales'
import type { LocaleCode } from '../../shared/constants/screenplay'

export interface FountainHelpHandle {
  show: () => void
  hide: () => void
  setLocale: (locale: LocaleCode) => void
  setCollapsed: (collapsed: boolean) => void
  isCollapsed: () => boolean
  destroy: () => void
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function createFountainHelpPane(
  root: HTMLElement,
  onToggleIndex: (collapsed: boolean) => void
): FountainHelpHandle {
  let collapsed = false
  let selected = FOUNTAIN_SYNTAX_TOPICS[0]?.id ?? 'what'
  let locale: LocaleCode = 'en_GB'

  root.classList.add('fountain-help')
  root.innerHTML = `
    <div class="fountain-help-doc" id="fh-doc"></div>
    <aside class="fountain-help-index" id="fh-index">
      <header class="fountain-help-index-head">
        <strong data-i18n="help.title"></strong>
        <button type="button" class="sidebar-collapse" id="fh-collapse">›</button>
      </header>
      <nav class="fountain-help-index-list" id="fh-list"></nav>
    </aside>
  `

  const docEl = root.querySelector('#fh-doc') as HTMLElement
  const indexEl = root.querySelector('#fh-index') as HTMLElement
  const listEl = root.querySelector('#fh-list') as HTMLElement
  const collapseBtn = root.querySelector('#fh-collapse') as HTMLButtonElement

  const renderDoc = (): void => {
    const parts: string[] = [
      `<header class="fountain-help-intro"><h2>${escapeHtml(t(locale, 'help.title'))}</h2><p>${escapeHtml(t(locale, 'help.intro'))}</p></header>`
    ]
    for (const group of SYNTAX_GROUPS) {
      const topics = FOUNTAIN_SYNTAX_TOPICS.filter((topic) => topic.group === group.id)
      if (topics.length === 0) continue
      parts.push(`<h3 class="fountain-help-group">${escapeHtml(group.label)}</h3>`)
      for (const topic of topics) {
        parts.push(renderTopic(topic))
      }
    }
    docEl.innerHTML = parts.join('')
  }

  const renderTopic = (topic: FountainSyntaxTopic): string => {
    const paras = topic.body
      .trim()
      .split(/\n\n+/)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
      .join('')
    const syn = topic.syntax
      ? `<pre class="fountain-help-syntax">${escapeHtml(topic.syntax)}</pre>`
      : ''
    return `<article class="fountain-help-topic" id="fh-topic-${topic.id}" data-id="${topic.id}">
      <h4>${escapeHtml(topic.title)}</h4>
      ${syn}
      ${paras}
    </article>`
  }

  const renderIndex = (): void => {
    listEl.innerHTML = ''
    for (const group of SYNTAX_GROUPS) {
      const topics = FOUNTAIN_SYNTAX_TOPICS.filter((topic) => topic.group === group.id)
      if (topics.length === 0) continue
      const h = document.createElement('h3')
      h.textContent = group.label
      listEl.appendChild(h)
      const ul = document.createElement('ul')
      for (const topic of topics) {
        const li = document.createElement('li')
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = topic.id === selected ? 'active' : ''
        btn.innerHTML = `<span class="fh-opt">${escapeHtml(topic.title)}</span><code>${escapeHtml(topic.syntax)}</code>`
        btn.addEventListener('click', () => select(topic.id))
        li.appendChild(btn)
        ul.appendChild(li)
      }
      listEl.appendChild(ul)
    }
  }

  const select = (id: string): void => {
    selected = id
    renderIndex()
    const target = docEl.querySelector(`#fh-topic-${id}`)
    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' })
      docEl.querySelectorAll('.fountain-help-topic').forEach((n) => {
        n.classList.toggle('active', (n as HTMLElement).dataset.id === id)
      })
    }
  }

  const applyCollapsed = (): void => {
    indexEl.classList.toggle('collapsed', collapsed)
    collapseBtn.textContent = collapsed ? '‹' : '›'
  }

  collapseBtn.addEventListener('click', () => {
    collapsed = !collapsed
    applyCollapsed()
    onToggleIndex(collapsed)
  })

  renderDoc()
  renderIndex()
  applyCollapsed()

  return {
    show: () => root.classList.remove('hidden'),
    hide: () => root.classList.add('hidden'),
    setLocale: (next) => {
      locale = next
      const title = root.querySelector('[data-i18n="help.title"]')
      if (title) title.textContent = t(locale, 'help.title' as MessageKey)
      renderDoc()
    },
    setCollapsed: (next) => {
      collapsed = next
      applyCollapsed()
    },
    isCollapsed: () => collapsed,
    destroy: () => {
      root.innerHTML = ''
    }
  }
}
