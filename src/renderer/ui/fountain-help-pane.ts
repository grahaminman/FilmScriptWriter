/**
 * Full Fountain syntax help — sits in the right pane in place of preview.
 * Retractable index on the right lists every option and its syntax.
 */

import {
  FOUNTAIN_SYNTAX_TOPICS,
  SYNTAX_GROUPS,
  type FountainSyntaxTopic
} from '../../shared/fountain/syntax-reference'

export { COACH_TO_TOPIC } from '../../shared/fountain/syntax-reference'

export interface FountainHelpPaneHandle {
  show: () => void
  hide: () => void
  setCollapsed: (collapsed: boolean) => void
  isCollapsed: () => boolean
  select: (id: string) => void
  highlight: (id: string) => void
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
): FountainHelpPaneHandle {
  let collapsed = false
  let selected = FOUNTAIN_SYNTAX_TOPICS[0]?.id ?? 'what'

  root.classList.add('fountain-help')
  root.innerHTML = `
    <div class="fountain-help-doc" id="fh-doc"></div>
    <aside class="fountain-help-index" id="fh-index" aria-label="Fountain syntax index">
      <header class="fountain-help-index-head">
        <strong>Syntax</strong>
        <button type="button" class="sidebar-collapse" id="fh-collapse" title="Hide syntax list">›</button>
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
      '<header class="fountain-help-intro"><h2>Fountain syntax</h2><p>A complete reference. Click an item in the list on the right to jump. You can leave this open while you write — switch back to Preview any time.</p></header>'
    ]
    for (const group of SYNTAX_GROUPS) {
      const topics = FOUNTAIN_SYNTAX_TOPICS.filter((t) => t.group === group.id)
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
      const topics = FOUNTAIN_SYNTAX_TOPICS.filter((t) => t.group === group.id)
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
    collapseBtn.title = collapsed ? 'Show syntax list' : 'Hide syntax list'
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
    show: () => {
      root.classList.remove('hidden')
    },
    hide: () => {
      root.classList.add('hidden')
    },
    setCollapsed: (next) => {
      collapsed = next
      applyCollapsed()
    },
    isCollapsed: () => collapsed,
    select,
    highlight: (id: string) => {
      if (!FOUNTAIN_SYNTAX_TOPICS.some((t) => t.id === id)) return
      selected = id
      renderIndex()
      docEl.querySelectorAll('.fountain-help-topic').forEach((n) => {
        n.classList.toggle('active', (n as HTMLElement).dataset.id === id)
      })
    },
    destroy: () => {
      root.innerHTML = ''
    }
  }
}


