/**
 * Modal to name a new project. Electron does not reliably support window.prompt.
 */

import { t } from '../../shared/i18n/locales'
import type { LocaleCode } from '../../shared/constants/screenplay'

export interface NewProjectSpec {
  name: string
  folder: string
}

export interface NewProjectDialogHandle {
  ask: (opts: { folder: string; locale: LocaleCode }) => Promise<NewProjectSpec | null>
  setLocale: (locale: LocaleCode) => void
  destroy: () => void
}

export function createNewProjectDialog(parent: HTMLElement): NewProjectDialogHandle {
  let locale: LocaleCode = 'en_GB'
  let resolveAsk: ((value: NewProjectSpec | null) => void) | null = null

  const backdrop = document.createElement('div')
  backdrop.className = 'settings-backdrop hidden'
  backdrop.innerHTML = `
    <div class="settings-panel" role="dialog" aria-labelledby="np-title">
      <header class="settings-header">
        <h2 id="np-title">New project</h2>
        <button type="button" class="settings-close" id="np-close" aria-label="Close">×</button>
      </header>
      <div class="settings-body">
        <label class="field-label" id="np-folder-label">Projects folder</label>
        <div class="folder-row">
          <input type="text" id="np-folder" readonly />
          <button type="button" id="np-browse">Choose folder…</button>
        </div>
        <label class="field-label" for="np-name" id="np-name-label">Project name</label>
        <input type="text" id="np-name" placeholder="MyScript" />
        <p class="settings-hint" id="np-hint"></p>
        <div class="settings-actions settings-actions-wrap">
          <button type="button" class="primary" id="np-create">Create project</button>
          <button type="button" id="np-cancel">Cancel</button>
        </div>
      </div>
    </div>
  `
  parent.appendChild(backdrop)

  const titleEl = backdrop.querySelector('#np-title') as HTMLElement
  const folderLabel = backdrop.querySelector('#np-folder-label') as HTMLElement
  const folderInput = backdrop.querySelector('#np-folder') as HTMLInputElement
  const browseBtn = backdrop.querySelector('#np-browse') as HTMLButtonElement
  const nameLabel = backdrop.querySelector('#np-name-label') as HTMLElement
  const nameInput = backdrop.querySelector('#np-name') as HTMLInputElement
  const hintEl = backdrop.querySelector('#np-hint') as HTMLElement
  const createBtn = backdrop.querySelector('#np-create') as HTMLButtonElement
  const cancelBtn = backdrop.querySelector('#np-cancel') as HTMLButtonElement
  const closeBtn = backdrop.querySelector('#np-close') as HTMLButtonElement

  const applyLocale = (): void => {
    titleEl.textContent = t(locale, 'menu.file.newProject').replace('…', '')
    folderLabel.textContent = t(locale, 'settings.baseFolder')
    browseBtn.textContent = t(locale, 'firstRun.chooseFolder')
    nameLabel.textContent = t(locale, 'firstRun.projectName')
    createBtn.textContent = t(locale, 'firstRun.create')
    cancelBtn.textContent = t(locale, 'common.cancel')
    hintEl.textContent = t(locale, 'dialog.newProject.hint')
  }

  const finish = (value: NewProjectSpec | null): void => {
    backdrop.classList.add('hidden')
    const r = resolveAsk
    resolveAsk = null
    r?.(value)
  }

  const submit = (): void => {
    const name = nameInput.value.trim()
    const folder = folderInput.value.trim()
    if (!name) {
      nameInput.focus()
      return
    }
    if (!folder) {
      void window.api.chooseProjectsFolder().then((picked) => {
        if (picked.cancelled || !picked.path) return
        folderInput.value = picked.path
        finish({ name, folder: picked.path })
      })
      return
    }
    finish({ name, folder })
  }

  browseBtn.addEventListener('click', () => {
    void window.api.chooseProjectsFolder().then((picked) => {
      if (!picked.cancelled && picked.path) folderInput.value = picked.path
    })
  })
  createBtn.addEventListener('click', submit)
  cancelBtn.addEventListener('click', () => finish(null))
  closeBtn.addEventListener('click', () => finish(null))
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      finish(null)
    }
  })
  backdrop.addEventListener('pointerdown', (e) => {
    if (e.target === backdrop) finish(null)
  })
  backdrop.querySelector('.settings-panel')?.addEventListener('click', (e) => e.stopPropagation())

  applyLocale()

  return {
    ask: ({ folder, locale: next }) => {
      locale = next
      applyLocale()
      folderInput.value = folder
      nameInput.value = ''
      backdrop.classList.remove('hidden')
      queueMicrotask(() => nameInput.focus())
      return new Promise((resolve) => {
        resolveAsk = resolve
      })
    },
    setLocale: (next) => {
      locale = next
      applyLocale()
    },
    destroy: () => backdrop.remove()
  }
}
