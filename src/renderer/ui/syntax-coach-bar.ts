/**
 * Retractable Fountain syntax coach under the app toolbar.
 */

import type { SyntaxCoachTip } from '../../shared/fountain/syntax-coach'

export interface SyntaxCoachBarHandle {
  update: (tip: SyntaxCoachTip) => void
  setCollapsed: (collapsed: boolean) => void
  isCollapsed: () => boolean
  destroy: () => void
}

export function createSyntaxCoachBar(
  root: HTMLElement,
  onToggle: (collapsed: boolean) => void
): SyntaxCoachBarHandle {
  let collapsed = false
  let currentId = ''

  root.classList.add('syntax-coach')
  root.innerHTML = `
    <button type="button" class="syntax-coach-toggle" id="syntax-coach-toggle" title="Hide Fountain help" aria-expanded="true">▾</button>
    <div class="syntax-coach-body" id="syntax-coach-body">
      <div class="syntax-coach-heading">
        <span class="syntax-coach-kicker">Fountain</span>
        <strong class="syntax-coach-title" id="syntax-coach-title">Ready to write</strong>
      </div>
      <p class="syntax-coach-explain" id="syntax-coach-explain"></p>
      <pre class="syntax-coach-syntax" id="syntax-coach-syntax"></pre>
      <p class="syntax-coach-next" id="syntax-coach-next"></p>
    </div>
    <div class="syntax-coach-mini" id="syntax-coach-mini" hidden>
      <span class="syntax-coach-kicker">Fountain</span>
      <span id="syntax-coach-mini-title">Ready to write</span>
    </div>
  `

  const toggle = root.querySelector('#syntax-coach-toggle') as HTMLButtonElement
  const titleEl = root.querySelector('#syntax-coach-title') as HTMLElement
  const explainEl = root.querySelector('#syntax-coach-explain') as HTMLElement
  const syntaxEl = root.querySelector('#syntax-coach-syntax') as HTMLElement
  const nextEl = root.querySelector('#syntax-coach-next') as HTMLElement
  const miniTitle = root.querySelector('#syntax-coach-mini-title') as HTMLElement

  const applyCollapsed = (): void => {
    root.classList.toggle('collapsed', collapsed)
    toggle.textContent = collapsed ? '▸' : '▾'
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
    toggle.title = collapsed ? 'Show Fountain help' : 'Hide Fountain help'
  }

  toggle.addEventListener('click', () => {
    collapsed = !collapsed
    applyCollapsed()
    onToggle(collapsed)
  })

  applyCollapsed()

  return {
    update: (tip) => {
      titleEl.textContent = tip.title
      miniTitle.textContent = tip.title
      explainEl.textContent = tip.explanation
      syntaxEl.textContent = tip.syntax
      syntaxEl.hidden = !tip.syntax
      nextEl.textContent = tip.next ?? ''
      nextEl.hidden = !tip.next
      if (tip.id !== currentId) {
        currentId = tip.id
        root.classList.remove('flash')
        void root.offsetWidth
        root.classList.add('flash')
      }
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
