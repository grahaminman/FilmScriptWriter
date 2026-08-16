/**
 * Workspace settings: projects folder, autosave, spell check, and template.
 */

import { t } from '../../shared/i18n/locales'
import {
  AUTOSAVE_MINUTES_OPTIONS,
  type LocaleCode
} from '../../shared/constants/screenplay'
import {
  SPELLCHECK_LANGUAGE_IDS,
  type SpellcheckLanguageId
} from '../../shared/constants/spellcheck'

export interface WorkspaceSettingsState {
  projectsBaseFolder: string
  autosaveMinutes: number
  spellcheckEnabled: boolean
  spellcheckLanguages: SpellcheckLanguageId[]
  spellcheckDictionaryUrl: string
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
    autosaveMinutes: 5,
    spellcheckEnabled: true,
    spellcheckLanguages: ['en-GB'],
    spellcheckDictionaryUrl: ''
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

        <h3 class="settings-subhead" id="ws-spell-title">Spell check</h3>
        <p class="settings-hint" id="ws-spell-hint"></p>
        <label class="settings-check">
          <input type="checkbox" id="ws-spell-enabled" />
          <span id="ws-spell-enabled-label">Enable spell check</span>
        </label>
        <div class="settings-check-list">
          <label class="settings-check">
            <input type="checkbox" id="ws-spell-en-gb" data-spell-lang="en-GB" />
            <span id="ws-spell-en-gb-label">English (UK)</span>
          </label>
          <label class="settings-check">
            <input type="checkbox" id="ws-spell-en-us" data-spell-lang="en-US" />
            <span id="ws-spell-en-us-label">English (US)</span>
          </label>
          <label class="settings-check">
            <input type="checkbox" id="ws-spell-es" data-spell-lang="es-419" />
            <span id="ws-spell-es-label">Spanish (Latin America / Paraguay)</span>
          </label>
        </div>
        <label class="field-label" id="ws-spell-url-label">Dictionary download URL</label>
        <input type="url" id="ws-spell-url" class="settings-url-input" spellcheck="false" />
        <p class="settings-hint" id="ws-spell-url-hint"></p>
        <p class="settings-path" id="ws-spell-dir"></p>
        <p class="settings-hint" id="ws-spell-files"></p>
        <div class="settings-actions settings-actions-wrap">
          <button type="button" id="ws-spell-download">Download dictionaries</button>
          <button type="button" id="ws-spell-open">Open dictionaries folder</button>
        </div>
        <p class="settings-hint" id="ws-spell-note"></p>
        <p class="settings-status" id="ws-spell-status" hidden></p>

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
  const spellTitle = backdrop.querySelector('#ws-spell-title') as HTMLElement
  const spellHint = backdrop.querySelector('#ws-spell-hint') as HTMLElement
  const spellEnabled = backdrop.querySelector(
    '#ws-spell-enabled'
  ) as HTMLInputElement
  const spellEnabledLabel = backdrop.querySelector(
    '#ws-spell-enabled-label'
  ) as HTMLElement
  const spellEnGb = backdrop.querySelector('#ws-spell-en-gb') as HTMLInputElement
  const spellEnGbLabel = backdrop.querySelector(
    '#ws-spell-en-gb-label'
  ) as HTMLElement
  const spellEnUs = backdrop.querySelector('#ws-spell-en-us') as HTMLInputElement
  const spellEnUsLabel = backdrop.querySelector(
    '#ws-spell-en-us-label'
  ) as HTMLElement
  const spellEs = backdrop.querySelector('#ws-spell-es') as HTMLInputElement
  const spellEsLabel = backdrop.querySelector('#ws-spell-es-label') as HTMLElement
  const spellUrlLabel = backdrop.querySelector('#ws-spell-url-label') as HTMLElement
  const spellUrl = backdrop.querySelector('#ws-spell-url') as HTMLInputElement
  const spellUrlHint = backdrop.querySelector('#ws-spell-url-hint') as HTMLElement
  const spellDir = backdrop.querySelector('#ws-spell-dir') as HTMLElement
  const spellFiles = backdrop.querySelector('#ws-spell-files') as HTMLElement
  const spellDownload = backdrop.querySelector(
    '#ws-spell-download'
  ) as HTMLButtonElement
  const spellOpen = backdrop.querySelector('#ws-spell-open') as HTMLButtonElement
  const spellNote = backdrop.querySelector('#ws-spell-note') as HTMLElement
  const spellStatus = backdrop.querySelector('#ws-spell-status') as HTMLElement
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
    spellTitle.textContent = t(locale, 'settings.spellcheck')
    spellHint.textContent = t(locale, 'settings.spellcheckHint')
    spellEnabledLabel.textContent = t(locale, 'settings.spellcheckEnabled')
    spellEnGbLabel.textContent = t(locale, 'settings.spellcheckEnGB')
    spellEnUsLabel.textContent = t(locale, 'settings.spellcheckEnUS')
    spellEsLabel.textContent = t(locale, 'settings.spellcheckEs')
    spellUrlLabel.textContent = t(locale, 'settings.spellcheckUrl')
    spellUrlHint.textContent = t(locale, 'settings.spellcheckUrlHint')
    spellDownload.textContent = t(locale, 'settings.spellcheckDownload')
    spellOpen.textContent = t(locale, 'settings.spellcheckOpenFolder')
    spellNote.textContent = t(locale, 'settings.spellcheckHunspellNote')
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

  const langBoxes: Record<SpellcheckLanguageId, HTMLInputElement> = {
    'en-GB': spellEnGb,
    'en-US': spellEnUs,
    'es-419': spellEs
  }

  const syncSpellcheck = (): void => {
    spellEnabled.checked = state.spellcheckEnabled
    for (const id of SPELLCHECK_LANGUAGE_IDS) {
      langBoxes[id].checked = state.spellcheckLanguages.includes(id)
    }
    spellUrl.value = state.spellcheckDictionaryUrl
    void refreshSpellStatus()
  }

  const refreshSpellStatus = async (): Promise<void> => {
    const status = await window.api.getSpellcheckStatus()
    spellDir.textContent = status.dictionaryDir
    const bits = status.files.map((file) => {
      const mark = file.present
        ? t(locale, 'settings.spellcheckReady')
        : t(locale, 'settings.spellcheckMissing')
      return `${file.language}: ${mark}`
    })
    spellFiles.textContent = bits.join(' · ')
  }

  const showSpellStatus = (message: string): void => {
    spellStatus.hidden = false
    spellStatus.textContent = message
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = setTimeout(() => {
      spellStatus.hidden = true
    }, 4000)
  }

  const emitSpellLanguages = (): void => {
    const next = SPELLCHECK_LANGUAGE_IDS.filter((id) => langBoxes[id].checked)
    state.spellcheckLanguages = next.length > 0 ? [...next] : ['en-GB']
    if (next.length === 0) langBoxes['en-GB'].checked = true
    handlers.onChange({ spellcheckLanguages: state.spellcheckLanguages })
  }

  const sync = (): void => {
    folderInput.value = state.projectsBaseFolder
    fillAutosave()
    syncSpellcheck()
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
  spellEnabled.addEventListener('change', () => {
    state.spellcheckEnabled = spellEnabled.checked
    handlers.onChange({ spellcheckEnabled: spellEnabled.checked })
  })
  for (const id of SPELLCHECK_LANGUAGE_IDS) {
    langBoxes[id].addEventListener('change', () => emitSpellLanguages())
  }
  const commitUrl = (): void => {
    state.spellcheckDictionaryUrl = spellUrl.value.trim()
    handlers.onChange({ spellcheckDictionaryUrl: state.spellcheckDictionaryUrl })
  }
  spellUrl.addEventListener('change', () => commitUrl())
  spellUrl.addEventListener('blur', () => commitUrl())
  spellDownload.addEventListener('click', () => {
    showSpellStatus(t(locale, 'settings.spellcheckDownloading'))
    void window.api
      .downloadSpellcheckDictionaries(state.spellcheckLanguages)
      .then((status) => {
        void refreshSpellStatus()
        showSpellStatus(
          status.lastError
            ? t(locale, 'settings.spellcheckDownloadFailed')
            : t(locale, 'settings.spellcheckDownloadDone')
        )
      })
      .catch(() => {
        showSpellStatus(t(locale, 'settings.spellcheckDownloadFailed'))
      })
  })
  spellOpen.addEventListener('click', () => {
    void window.api.openSpellcheckFolder()
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
