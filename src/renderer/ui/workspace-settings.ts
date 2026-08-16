/**
 * Workspace settings: projects folder, autosave, and new-project template.
 */

import { t } from '../../shared/i18n/locales'
import {
  AUTOSAVE_MINUTES_OPTIONS,
  type LocaleCode
} from '../../shared/constants/screenplay'

export interface WorkspaceSettingsState {
  projectsBaseFolder: string
  autosaveMinutes: number
}

export interface WorkspaceSettingsHandle {
  open: (state: WorkspaceSettingsState) => void
  close: () => void
  setLocale: (locale: LocaleCode) => void
  destroy: () => void
}

export function createWorkspaceSettingsPanel(
  parent: HTMLElement,
  handlers: {
    onChooseFolder: () => Promise<string | null>
    onChange: (partial: Partial<WorkspaceSettingsState>) => void
  }
): WorkspaceSettingsHandle {
  let locale: LocaleCode = 'en_GB'
  let state: WorkspaceSettingsState = {
    projectsBaseFolder: '',
    autosaveMinutes: 5
  }
  let statusTimer: ReturnType<typeof setTimeout> | null = null

  const backdrop = document.createElement('div')
  backdrop.className = 'settings-backdrop hidden'
  backdrop.innerHTML = `
    <div class="settings-panel settings-panel-wide" role="dialog" aria-labelledby="ws-title">
      <header class="settings-header">
        <h2 id="ws-title">Settings</h2>
        <button type="button" class="settings-close" id="ws-close" aria-label="Close">×</button>
      </header>
      <div class="settings-body">
        <label class="field-label" id="ws-folder-label">Projects folder</label>
        <div class="folder-row">
          <input type="text" id="ws-folder" readonly />
          <button type="button" id="ws-browse">Change…</button>
        </div>
        <label class="settings-row" style="margin-top:16px">
          <span id="ws-autosave-label">Autosave</span>
          <select id="ws-autosave"></select>
        </label>

        <h3 class="settings-subhead" id="ws-template-title">New project template</h3>
        <p class="settings-hint" id="ws-template-hint"></p>
        <p class="settings-path" id="ws-template-path"></p>
        <textarea id="ws-template-editor" class="settings-template-editor" spellcheck="false"></textarea>
        <div class="settings-actions settings-actions-wrap">
          <button type="button" id="ws-template-select">Select all</button>
          <button type="button" id="ws-template-choose">Use my file…</button>
          <button type="button" id="ws-template-save">Save template</button>
          <button type="button" id="ws-template-revert">Revert to original</button>
        </div>
        <p class="settings-status" id="ws-template-status" hidden></p>
      </div>
    </div>
  `
  parent.appendChild(backdrop)

  const titleEl = backdrop.querySelector('#ws-title') as HTMLElement
  const folderLabel = backdrop.querySelector('#ws-folder-label') as HTMLElement
  const folderInput = backdrop.querySelector('#ws-folder') as HTMLInputElement
  const browseBtn = backdrop.querySelector('#ws-browse') as HTMLButtonElement
  const autosaveLabel = backdrop.querySelector('#ws-autosave-label') as HTMLElement
  const autosaveSel = backdrop.querySelector('#ws-autosave') as HTMLSelectElement
  const closeBtn = backdrop.querySelector('#ws-close') as HTMLButtonElement
  const tmplTitle = backdrop.querySelector('#ws-template-title') as HTMLElement
  const tmplHint = backdrop.querySelector('#ws-template-hint') as HTMLElement
  const tmplPath = backdrop.querySelector('#ws-template-path') as HTMLElement
  const tmplEditor = backdrop.querySelector('#ws-template-editor') as HTMLTextAreaElement
  const tmplSelect = backdrop.querySelector('#ws-template-select') as HTMLButtonElement
  const tmplChoose = backdrop.querySelector('#ws-template-choose') as HTMLButtonElement
  const tmplSave = backdrop.querySelector('#ws-template-save') as HTMLButtonElement
  const tmplRevert = backdrop.querySelector('#ws-template-revert') as HTMLButtonElement
  const tmplStatus = backdrop.querySelector('#ws-template-status') as HTMLElement
  const panel = backdrop.querySelector('.settings-panel') as HTMLElement
  let savedTemplate = ''
  let pointerDownOnBackdrop = false

  const fillAutosave = (): void => {
    autosaveSel.innerHTML = ''
    for (const n of AUTOSAVE_MINUTES_OPTIONS) {
      const opt = document.createElement('option')
      opt.value = String(n)
      opt.textContent =
        n === 0
          ? t(locale, 'settings.autosaveOff')
          : t(locale, 'settings.autosaveEvery').replace('{n}', String(n))
      if (n === state.autosaveMinutes) opt.selected = true
      autosaveSel.appendChild(opt)
    }
  }

  const applyLocale = (): void => {
    titleEl.textContent = t(locale, 'settings.title')
    folderLabel.textContent = t(locale, 'settings.baseFolder')
    browseBtn.textContent = t(locale, 'settings.changeFolder')
    autosaveLabel.textContent = t(locale, 'settings.autosave')
    tmplTitle.textContent = t(locale, 'settings.template')
    tmplHint.textContent = t(locale, 'settings.templateHint')
    tmplSelect.textContent = t(locale, 'settings.templateSelectAll')
    tmplChoose.textContent = t(locale, 'settings.templateChoose')
    tmplSave.textContent = t(locale, 'settings.templateSave')
    tmplRevert.textContent = t(locale, 'settings.templateRevert')
    fillAutosave()
  }

  const showStatus = (message: string): void => {
    tmplStatus.hidden = false
    tmplStatus.textContent = message
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = setTimeout(() => {
      tmplStatus.hidden = true
    }, 3500)
  }

  const applyTemplate = (info: {
    userPath: string
    content: string
  }): void => {
    tmplPath.textContent = info.userPath
    tmplEditor.value = info.content
    savedTemplate = info.content
  }

  const loadTemplate = async (): Promise<void> => {
    const result = await window.api.getTemplate()
    if (!result.cancelled && result.template) applyTemplate(result.template)
  }

  const sync = (): void => {
    folderInput.value = state.projectsBaseFolder
    fillAutosave()
    void loadTemplate()
  }

  // Close only when the press both starts and ends on the dimmed backdrop.
  // Dragging to select template text often ends outside the panel; that
  // must not dismiss Settings.
  backdrop.addEventListener('pointerdown', (e) => {
    pointerDownOnBackdrop = e.target === backdrop
  })
  backdrop.addEventListener('pointerup', (e) => {
    const dismiss = pointerDownOnBackdrop && e.target === backdrop
    pointerDownOnBackdrop = false
    if (dismiss) close()
  })
  panel.addEventListener('pointerdown', () => {
    pointerDownOnBackdrop = false
  })
  tmplEditor.addEventListener('keydown', (e) => {
    const accel = e.metaKey || e.ctrlKey
    if (accel && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      e.stopPropagation()
      tmplEditor.focus()
      tmplEditor.select()
      return
    }
    if (accel && e.key.toLowerCase() === 's') {
      e.preventDefault()
      e.stopPropagation()
      tmplSave.click()
    }
  })
  closeBtn.addEventListener('click', () => close())
  browseBtn.addEventListener('click', () => {
    void handlers.onChooseFolder().then((folder) => {
      if (!folder) return
      state.projectsBaseFolder = folder
      folderInput.value = folder
      handlers.onChange({ projectsBaseFolder: folder })
    })
  })
  autosaveSel.addEventListener('change', () => {
    const minutes = Number(autosaveSel.value)
    state.autosaveMinutes = minutes
    handlers.onChange({ autosaveMinutes: minutes })
  })
  tmplSelect.addEventListener('click', () => {
    tmplEditor.focus()
    tmplEditor.select()
  })
  tmplSave.addEventListener('click', () => {
    void window.api.saveTemplate(tmplEditor.value).then((result) => {
      if (result.cancelled || !result.template) return
      applyTemplate(result.template)
      showStatus(t(locale, 'settings.templateSaved'))
    })
  })
  tmplChoose.addEventListener('click', () => {
    void window.api.chooseTemplateFile().then((result) => {
      if (result.cancelled || !result.template) return
      applyTemplate(result.template)
      showStatus(t(locale, 'settings.templateSaved'))
    })
  })
  tmplRevert.addEventListener('click', () => {
    const ok = window.confirm(t(locale, 'settings.templateRevert') + '?')
    if (!ok) return
    void window.api.revertTemplate().then((result) => {
      if (result.cancelled || !result.template) return
      applyTemplate(result.template)
      showStatus(t(locale, 'settings.templateReverted'))
    })
  })

  function close(): void {
    if (tmplEditor.value !== savedTemplate) {
      const discard = window.confirm(t(locale, 'settings.templateUnsaved'))
      if (!discard) return
    }
    backdrop.classList.add('hidden')
  }

  return {
    open: (next) => {
      state = { ...next }
      applyLocale()
      sync()
      backdrop.classList.remove('hidden')
      queueMicrotask(() => tmplEditor.focus())
    },
    close,
    setLocale: (next) => {
      locale = next
      if (!backdrop.classList.contains('hidden')) applyLocale()
    },
    destroy: () => backdrop.remove()
  }
}
