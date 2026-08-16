/**
 * Workspace settings: projects base folder + autosave interval.
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

  const backdrop = document.createElement('div')
  backdrop.className = 'settings-backdrop hidden'
  backdrop.innerHTML = `
    <div class="settings-panel" role="dialog" aria-labelledby="ws-title">
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
    fillAutosave()
  }

  const sync = (): void => {
    folderInput.value = state.projectsBaseFolder
    fillAutosave()
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })
  backdrop.querySelector('.settings-panel')?.addEventListener('click', (e) => e.stopPropagation())
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

  function close(): void {
    backdrop.classList.add('hidden')
  }

  return {
    open: (next) => {
      state = { ...next }
      applyLocale()
      sync()
      backdrop.classList.remove('hidden')
    },
    close,
    setLocale: (next) => {
      locale = next
      if (!backdrop.classList.contains('hidden')) applyLocale()
    },
    destroy: () => backdrop.remove()
  }
}
