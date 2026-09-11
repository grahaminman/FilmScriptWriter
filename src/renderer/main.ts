import './styles/app.css'
import markUrl from './assets/toolbar-mark.png'
import logoUrl from './assets/FSW-LOGO.jpg'
import headerUrl from './assets/header-1.jpg'
import {
  AUTOSAVE_MINUTES_OPTIONS,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
  SUPPORTED_LOCALES,
  type LocaleCode,
  type ThemeMode
} from '../shared/constants/screenplay'
import { SPELLCHECK_LANGUAGE_IDS } from '../shared/constants/spellcheck'
import {
  SYNTAX_COLOR_KEYS,
  SYNTAX_PRESETS,
  applySyntaxPalette,
  resolvePalette,
  type SyntaxColorPresetId
} from '../shared/constants/syntax-colors'
import { countPages } from '../shared/fountain/page-counter'
import { t, type MessageKey } from '../shared/i18n/locales'
import { createEditor, type EditorHandle } from './editor/create-editor'
import { applyPageCssVars, createPreview, type PreviewHandle } from './preview/preview'
import { createFountainHelpPane, type FountainHelpHandle } from './ui/fountain-help'

const api = window.api

type AppPreferences = Awaited<ReturnType<typeof api.getPreferences>>

let prefs: AppPreferences
let editor: EditorHandle
let preview: PreviewHandle
let helpPane: FountainHelpHandle
let currentPath: string | null = null
let dirty = false
let autosaveTimer: number | null = null
let ignoreChanges = false
let version = '2.0.0-beta.1'

const els = {
  mark: document.getElementById('toolbar-mark') as HTMLImageElement,
  btnNew: document.getElementById('btn-new') as HTMLButtonElement,
  btnOpen: document.getElementById('btn-open') as HTMLButtonElement,
  btnSave: document.getElementById('btn-save') as HTMLButtonElement,
  btnSaveAs: document.getElementById('btn-save-as') as HTMLButtonElement,
  btnRight: document.getElementById('btn-right-toggle') as HTMLButtonElement,
  btnSettings: document.getElementById('btn-settings') as HTMLButtonElement,
  filesPane: document.getElementById('files-pane') as HTMLElement,
  filesTitle: document.getElementById('files-title') as HTMLElement,
  filesBody: document.getElementById('files-body') as HTMLElement,
  btnCollapseFiles: document.getElementById('btn-collapse-files') as HTMLButtonElement,
  btnExpandFiles: document.getElementById('btn-expand-files') as HTMLButtonElement,
  editorPane: document.getElementById('editor-pane') as HTMLElement,
  previewHost: document.getElementById('preview-host') as HTMLElement,
  fountainHelp: document.getElementById('fountain-help') as HTMLElement,
  statusFile: document.getElementById('status-file') as HTMLElement,
  statusPages: document.getElementById('status-pages') as HTMLElement,
  statusLocale: document.getElementById('status-locale') as HTMLElement,
  statusDirty: document.getElementById('status-dirty') as HTMLElement,
  settingsModal: document.getElementById('settings-modal') as HTMLElement,
  settingsCard: document.getElementById('settings-card') as HTMLElement,
  aboutModal: document.getElementById('about-modal') as HTMLElement,
  aboutCard: document.getElementById('about-card') as HTMLElement,
  newModal: document.getElementById('new-modal') as HTMLElement,
  newCard: document.getElementById('new-card') as HTMLElement
}

function resolvedTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(): void {
  const mode = resolvedTheme(prefs.theme)
  document.documentElement.dataset.theme = mode
  editor?.setTheme(mode === 'dark')
}

function loc(): LocaleCode {
  return prefs.locale
}

function applyI18n(): void {
  const L = loc()
  document.documentElement.lang = L.replace('_', '-')
  const map: Array<[HTMLElement, Parameters<typeof t>[1]]> = [
    [els.btnNew, 'toolbar.new'],
    [els.btnOpen, 'toolbar.open'],
    [els.btnSave, 'toolbar.save'],
    [els.btnSaveAs, 'toolbar.saveAs'],
    [els.btnSettings, 'toolbar.settings'],
    [els.filesTitle, 'files.title']
  ]
  for (const [el, key] of map) el.textContent = t(L, key)
  els.btnRight.textContent =
    prefs.rightPaneMode === 'help' ? t(L, 'toolbar.preview') : t(L, 'toolbar.help')
  els.btnCollapseFiles.title = t(L, 'files.collapse')
  els.btnExpandFiles.title = t(L, 'files.expand')
  editor?.setLocale(L)
  preview?.setLocale(L)
  helpPane?.setLocale(L)
  updateStatus()
}

function fileName(): string {
  if (!currentPath) return t(loc(), 'status.untitled')
  const parts = currentPath.split(/[/\\]/)
  return parts[parts.length - 1] || currentPath
}

function updateStatus(): void {
  const L = loc()
  els.statusFile.textContent = fileName() + (dirty ? ' •' : '')
  const pages = preview?.getPageCount() ?? countPages(editor?.getValue() ?? '')
  els.statusPages.textContent = `${pages} ${t(L, 'status.pages')}`
  els.statusLocale.textContent = t(L, `menu.language.${L}` as MessageKey)
  els.statusDirty.textContent = dirty ? t(L, 'status.modified') : t(L, 'status.ready')
  document.title = `${fileName()}${dirty ? '*' : ''} — FilmScriptWriter`
}

function applyRightPane(): void {
  const help = prefs.rightPaneMode === 'help'
  els.previewHost.classList.toggle('hidden', help)
  els.fountainHelp.classList.toggle('hidden', !help)
  if (help) helpPane.show()
  else helpPane.hide()
  els.btnRight.textContent = help ? t(loc(), 'toolbar.preview') : t(loc(), 'toolbar.help')
  els.btnRight.classList.toggle('active', help)
}

function applyFilesSidebar(): void {
  els.filesPane.classList.toggle('hidden', !prefs.filesSidebarVisible)
  els.btnExpandFiles.classList.toggle('hidden', prefs.filesSidebarVisible)
}

function applySyntax(): void {
  const palette = resolvePalette(prefs.syntaxColorPreset, prefs.syntaxColorsCustom)
  applySyntaxPalette(document.documentElement, palette)
  editor?.setSyntaxHighlighting(prefs.syntaxHighlighting)
}

function scheduleAutosave(): void {
  if (autosaveTimer != null) {
    window.clearInterval(autosaveTimer)
    autosaveTimer = null
  }
  const minutes = prefs.autosaveMinutes
  if (!minutes) return
  autosaveTimer = window.setInterval(() => {
    if (dirty && currentPath) void persist(false)
  }, minutes * 60_000)
}

async function refreshFileList(): Promise<void> {
  const list = await api.listScripts()
  const L = loc()
  els.filesBody.innerHTML = ''
  if (!list.folder) {
    const p = document.createElement('div')
    p.className = 'files-empty'
    p.textContent = t(L, 'files.choose')
    const use = document.createElement('button')
    use.type = 'button'
    use.className = 'primary'
    use.textContent = t(L, 'files.useDefault')
    use.addEventListener('click', async () => {
      await api.useDefaultScriptsFolder()
      prefs = await api.getPreferences()
      await refreshFileList()
    })
    els.filesBody.append(p, use)
    return
  }
  if (list.missing) {
    const p = document.createElement('div')
    p.className = 'files-empty'
    p.textContent = t(L, 'files.missingFolder')
    els.filesBody.append(p)
    return
  }
  if (list.files.length === 0) {
    const p = document.createElement('div')
    p.className = 'files-empty'
    p.textContent = t(L, 'files.empty')
    els.filesBody.append(p)
    return
  }
  for (const file of list.files) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'file-row' + (file.path === currentPath ? ' active' : '')
    btn.textContent = file.name
    btn.title = file.path
    btn.addEventListener('click', () => void openExisting(file.path))
    els.filesBody.append(btn)
  }
}

async function maybeDiscard(): Promise<boolean> {
  if (!dirty) return true
  const choice = await api.confirmDiscard()
  if (choice === 'cancel') return false
  if (choice === 'save') {
    const result = await persist(false)
    return Boolean(result)
  }
  return true
}

function loadBuffer(content: string, path: string | null, markDirty: boolean): void {
  ignoreChanges = true
  editor.setValue(content)
  ignoreChanges = false
  currentPath = path
  dirty = markDirty
  void api.setDirty(dirty)
  preview.render(content)
  updateStatus()
  void refreshFileList()
}

async function persist(forceSaveAs: boolean): Promise<boolean> {
  const result = forceSaveAs
    ? await api.saveFileAs(editor.getValue())
    : await api.saveFile(editor.getValue(), false)
  if (result.cancelled) return false
  if (result.error) {
    await api.showError(result.error)
    return false
  }
  currentPath = result.path ?? currentPath
  dirty = false
  void api.setDirty(false)
  updateStatus()
  els.statusDirty.textContent = t(loc(), 'status.saved')
  await refreshFileList()
  return true
}

async function openExisting(filePath: string): Promise<void> {
  if (filePath === currentPath) return
  if (!(await maybeDiscard())) return
  const result = await api.openPath(filePath)
  if (result.error) {
    await api.showError(result.error)
    return
  }
  loadBuffer(result.content ?? '', result.path ?? filePath, false)
}

async function openDialog(): Promise<void> {
  if (!(await maybeDiscard())) return
  const result = await api.openFile()
  if (result.cancelled) return
  if (result.error) {
    await api.showError(result.error)
    return
  }
  loadBuffer(result.content ?? '', result.path ?? null, false)
}

async function newFrom(id: 'short-daily' | 'feature'): Promise<void> {
  if (!(await maybeDiscard())) return
  const result = await api.getTemplate(id)
  if (result.error) {
    await api.showError(result.error)
    return
  }
  loadBuffer(result.content ?? '', null, true)
}

function showNewChooser(): void {
  const L = loc()
  els.newCard.innerHTML = `
    <h2>${t(L, 'menu.file.new')}</h2>
    <div class="template-choice">
      <button type="button" class="primary" id="new-short">${t(L, 'menu.file.newShort')}</button>
      <button type="button" id="new-feature">${t(L, 'menu.file.newFeature')}</button>
    </div>
    <div class="modal-actions">
      <button type="button" id="new-cancel">${t(L, 'common.cancel')}</button>
    </div>
  `
  els.newModal.classList.remove('hidden')
  els.newCard.querySelector('#new-short')?.addEventListener('click', () => {
    els.newModal.classList.add('hidden')
    void newFrom('short-daily')
  })
  els.newCard.querySelector('#new-feature')?.addEventListener('click', () => {
    els.newModal.classList.add('hidden')
    void newFrom('feature')
  })
  els.newCard.querySelector('#new-cancel')?.addEventListener('click', () => {
    els.newModal.classList.add('hidden')
  })
}

function showAbout(): void {
  const L = loc()
  els.aboutCard.innerHTML = `
    <img class="about-header" src="${headerUrl}" alt="" />
    <img class="about-logo" src="${logoUrl}" alt="" />
    <h2>FilmScriptWriter</h2>
    <p class="tagline">${t(L, 'app.tagline')}</p>
    <p>${t(L, 'dialog.about.title')} ${version}</p>
    <p>${t(L, 'app.community')}</p>
    <p>${t(L, 'app.freeNote')}</p>
    <p>${t(L, 'app.licence')}</p>
    <div class="modal-actions">
      <button type="button" class="primary" id="about-close">${t(L, 'common.close')}</button>
    </div>
  `
  els.aboutModal.classList.remove('hidden')
  els.aboutCard.querySelector('#about-close')?.addEventListener('click', () => {
    els.aboutModal.classList.add('hidden')
  })
}

async function showSettings(): Promise<void> {
  const L = loc()
  const status = await api.getSpellcheckStatus()
  const defaultFolder = await api.getDefaultScriptsFolder()
  const folder = prefs.scriptsFolder || defaultFolder
  const spellOptions = SPELLCHECK_LANGUAGE_IDS.map((id) => {
    const selected = prefs.spellcheckLanguages[0] === id ? 'selected' : ''
    return `<option value="${id}" ${selected}>${t(L, `spell.${id}` as MessageKey)}</option>`
  }).join('')
  const localeOptions = SUPPORTED_LOCALES.map((code) => {
    const selected = prefs.locale === code ? 'selected' : ''
    return `<option value="${code}" ${selected}>${t(L, `menu.language.${code}` as MessageKey)}</option>`
  }).join('')
  const autosaveOptions = AUTOSAVE_MINUTES_OPTIONS.map((n) => {
    const selected = prefs.autosaveMinutes === n ? 'selected' : ''
    const label =
      n === 0 ? t(L, 'settings.autosaveOff') : t(L, 'settings.autosaveEvery', { n })
    return `<option value="${n}" ${selected}>${label}</option>`
  }).join('')
  const files = status.files
    .map(
      (f) =>
        `<div>${f.language}: ${f.present ? t(L, 'settings.spellcheckReady') : t(L, 'settings.spellcheckMissing')}</div>`
    )
    .join('')
  const preset = prefs.syntaxColorPreset
  const palette = resolvePalette(preset, prefs.syntaxColorsCustom)
  const colors = SYNTAX_COLOR_KEYS.map(
    (key) =>
      `<label>${key}<input type="color" data-syn="${key}" value="${palette[key]}" /></label>`
  ).join('')

  els.settingsCard.innerHTML = `
    <h2>${t(L, 'settings.title')}</h2>
    <h3>${t(L, 'settings.scriptsFolder')}</h3>
    <div class="field-row">
      <input type="text" id="set-folder" readonly value="${folder.replace(/"/g, '&quot;')}" />
      <button type="button" id="set-choose">${t(L, 'settings.changeFolder')}</button>
      <button type="button" id="set-default">${t(L, 'settings.useDefault')}</button>
    </div>
    <h3>${t(L, 'settings.autosave')}</h3>
    <div class="field-row">
      <select id="set-autosave">${autosaveOptions}</select>
    </div>
    <h3>${t(L, 'settings.theme')}</h3>
    <div class="field-row">
      <select id="set-theme">
        <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>${t(L, 'menu.theme.light')}</option>
        <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>${t(L, 'menu.theme.dark')}</option>
        <option value="system" ${prefs.theme === 'system' ? 'selected' : ''}>${t(L, 'menu.theme.system')}</option>
      </select>
    </div>
    <h3>${t(L, 'settings.uiLanguage')}</h3>
    <div class="field-row">
      <select id="set-locale">${localeOptions}</select>
    </div>
    <h3>${t(L, 'settings.editorFont')}</h3>
    <div class="field-row">
      <input type="number" id="set-font" min="${FONT_SIZE_MIN}" max="${FONT_SIZE_MAX}" value="${prefs.editorFontSize}" />
    </div>
    <h3>${t(L, 'settings.spellcheck')}</h3>
    <label class="field-row"><input type="checkbox" id="set-spell-on" ${prefs.spellcheckEnabled ? 'checked' : ''} /> ${t(L, 'settings.spellcheckEnabled')}</label>
    <p class="hint">${t(L, 'settings.spellcheckHint')}</p>
    <div class="field-row">
      <select id="set-spell-lang">${spellOptions}</select>
    </div>
    <p class="hint">${t(L, 'settings.spellcheckHunspellNote')}</p>
    <div class="spell-files">${files}${status.lastError ? `<div>${status.lastError}</div>` : ''}</div>
    <div class="field-row">
      <button type="button" id="set-spell-dl">${t(L, 'settings.spellcheckDownload')}</button>
      <button type="button" id="set-spell-folder">${t(L, 'settings.spellcheckOpenFolder')}</button>
    </div>
    <label class="hint">${t(L, 'settings.spellcheckUrl')}</label>
    <div class="field-row">
      <input type="text" id="set-spell-url" value="${prefs.spellcheckDictionaryUrl.replace(/"/g, '&quot;')}" />
    </div>
    <p class="hint">${t(L, 'settings.spellcheckUrlHint')}</p>
    <h3>${t(L, 'settings.syntaxColors')}</h3>
    <label class="field-row"><input type="checkbox" id="set-syntax-on" ${prefs.syntaxHighlighting ? 'checked' : ''} /> ${t(L, 'settings.syntaxEnabled')}</label>
    <p class="hint">${t(L, 'settings.syntaxHint')}</p>
    <div class="field-row">
      <label>${t(L, 'settings.preset')}</label>
      <select id="set-preset">
        <option value="default" ${preset === 'default' ? 'selected' : ''}>default</option>
        <option value="highContrast" ${preset === 'highContrast' ? 'selected' : ''}>highContrast</option>
        <option value="soft" ${preset === 'soft' ? 'selected' : ''}>soft</option>
        <option value="custom" ${preset === 'custom' ? 'selected' : ''}>custom</option>
      </select>
      <button type="button" id="set-reset-colors">${t(L, 'settings.resetColors')}</button>
    </div>
    <div class="color-grid">${colors}</div>
    <div class="modal-actions">
      <button type="button" class="primary" id="set-close">${t(L, 'common.close')}</button>
    </div>
  `
  els.settingsModal.classList.remove('hidden')

  const savePartial = async (partial: Partial<AppPreferences>): Promise<void> => {
    prefs = await api.setPreferences(partial)
    applyTheme()
    applyI18n()
    applySyntax()
    editor.setFontSize(prefs.editorFontSize)
    editor.setSpellcheck(prefs.spellcheckEnabled, prefs.spellcheckLanguages)
    scheduleAutosave()
  }

  els.settingsCard.querySelector('#set-choose')?.addEventListener('click', async () => {
    const result = await api.chooseScriptsFolder()
    if (!result.cancelled) {
      prefs = await api.getPreferences()
      await refreshFileList()
      void showSettings()
    }
  })
  els.settingsCard.querySelector('#set-default')?.addEventListener('click', async () => {
    await api.useDefaultScriptsFolder()
    prefs = await api.getPreferences()
    await refreshFileList()
    void showSettings()
  })
  els.settingsCard.querySelector('#set-autosave')?.addEventListener('change', (e) => {
    const n = Number((e.target as HTMLSelectElement).value)
    void savePartial({ autosaveMinutes: n })
  })
  els.settingsCard.querySelector('#set-theme')?.addEventListener('change', (e) => {
    void savePartial({ theme: (e.target as HTMLSelectElement).value as ThemeMode })
  })
  els.settingsCard.querySelector('#set-locale')?.addEventListener('change', (e) => {
    void savePartial({ locale: (e.target as HTMLSelectElement).value as LocaleCode }).then(
      () => void showSettings()
    )
  })
  els.settingsCard.querySelector('#set-font')?.addEventListener('change', (e) => {
    void savePartial({ editorFontSize: Number((e.target as HTMLInputElement).value) })
  })
  els.settingsCard.querySelector('#set-spell-on')?.addEventListener('change', (e) => {
    void savePartial({ spellcheckEnabled: (e.target as HTMLInputElement).checked })
  })
  els.settingsCard.querySelector('#set-spell-lang')?.addEventListener('change', (e) => {
    const id = (e.target as HTMLSelectElement).value
    void savePartial({ spellcheckLanguages: [id as AppPreferences['spellcheckLanguages'][0]] })
  })
  els.settingsCard.querySelector('#set-spell-url')?.addEventListener('change', (e) => {
    void savePartial({ spellcheckDictionaryUrl: (e.target as HTMLInputElement).value })
  })
  els.settingsCard.querySelector('#set-spell-dl')?.addEventListener('click', async () => {
    await api.downloadSpellcheckDictionaries()
    void showSettings()
  })
  els.settingsCard.querySelector('#set-spell-folder')?.addEventListener('click', () => {
    void api.openSpellcheckFolder()
  })
  els.settingsCard.querySelector('#set-syntax-on')?.addEventListener('change', (e) => {
    void savePartial({ syntaxHighlighting: (e.target as HTMLInputElement).checked })
  })
  els.settingsCard.querySelector('#set-preset')?.addEventListener('change', (e) => {
    const next = (e.target as HTMLSelectElement).value as SyntaxColorPresetId
    const custom =
      next === 'custom' ? prefs.syntaxColorsCustom : { ...SYNTAX_PRESETS.default }
    void savePartial({ syntaxColorPreset: next, syntaxColorsCustom: custom })
  })
  els.settingsCard.querySelector('#set-reset-colors')?.addEventListener('click', () => {
    void savePartial({
      syntaxColorPreset: 'default',
      syntaxColorsCustom: { ...SYNTAX_PRESETS.default }
    }).then(() => void showSettings())
  })
  els.settingsCard.querySelectorAll<HTMLInputElement>('input[data-syn]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.syn as keyof typeof palette
      const next = { ...resolvePalette('custom', prefs.syntaxColorsCustom), [key]: input.value }
      void savePartial({ syntaxColorPreset: 'custom', syntaxColorsCustom: next })
    })
  })
  els.settingsCard.querySelector('#set-close')?.addEventListener('click', () => {
    els.settingsModal.classList.add('hidden')
  })
}

function wireResizer(el: HTMLElement, target: HTMLElement, side: 'left' | 'right'): void {
  let dragging = false
  el.addEventListener('mousedown', (e) => {
    e.preventDefault()
    dragging = true
    const onMove = (ev: MouseEvent): void => {
      if (!dragging) return
      const workspace = document.getElementById('workspace')
      if (!workspace) return
      const rect = workspace.getBoundingClientRect()
      if (side === 'left') {
        const w = Math.min(360, Math.max(160, ev.clientX - rect.left))
        target.style.width = `${w}px`
      } else {
        const w = Math.min(720, Math.max(280, rect.right - ev.clientX))
        target.style.width = `${w}px`
      }
    }
    const onUp = (): void => {
      dragging = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  })
}

function bumpFont(delta: number): void {
  const next = Math.min(
    FONT_SIZE_MAX,
    Math.max(FONT_SIZE_MIN, prefs.editorFontSize + delta)
  )
  void api.setPreferences({ editorFontSize: next }).then((p) => {
    prefs = p
    editor.setFontSize(prefs.editorFontSize)
  })
}

async function handleMenu(action: string): Promise<void> {
  switch (action) {
    case 'file:new-short':
      await newFrom('short-daily')
      break
    case 'file:new-feature':
      await newFrom('feature')
      break
    case 'file:open':
      await openDialog()
      break
    case 'file:save':
      await persist(false)
      break
    case 'file:save-as':
      await persist(true)
      break
    case 'file:save-then-quit':
      if (await persist(false)) window.close()
      break
    case 'file:export-fountain': {
      const result = await api.exportFountain(editor.getValue())
      if (result.error) await api.showError(result.error)
      break
    }
    case 'file:export-pdf': {
      const result = await api.exportPdf(editor.getValue())
      if (result.error) await api.showError(result.error)
      break
    }
    case 'edit:find':
      editor.openFind()
      break
    case 'edit:find-replace':
      editor.openFindReplace()
      break
    case 'view:toggle-files':
      prefs = await api.setPreferences({ filesSidebarVisible: !prefs.filesSidebarVisible })
      applyFilesSidebar()
      break
    case 'view:preview':
      prefs = await api.setPreferences({ rightPaneMode: 'preview' })
      applyRightPane()
      break
    case 'view:help':
      prefs = await api.setPreferences({ rightPaneMode: 'help' })
      applyRightPane()
      break
    case 'view:toggle-syntax':
      prefs = await api.setPreferences({ syntaxHighlighting: !prefs.syntaxHighlighting })
      applySyntax()
      break
    case 'view:font-increase':
      bumpFont(FONT_SIZE_STEP)
      break
    case 'view:font-decrease':
      bumpFont(-FONT_SIZE_STEP)
      break
    case 'view:font-reset':
      void api.setPreferences({ editorFontSize: FONT_SIZE_DEFAULT }).then((p) => {
        prefs = p
        editor.setFontSize(prefs.editorFontSize)
      })
      break
    case 'settings:open':
      void showSettings()
      break
    case 'help:about':
      showAbout()
      break
    default:
      break
  }
}

async function boot(): Promise<void> {
  els.mark.src = markUrl
  applyPageCssVars()
  prefs = await api.getPreferences()
  version = await api.getVersion()

  editor = createEditor({
    parent: els.editorPane,
    initialDoc: '',
    dark: resolvedTheme(prefs.theme) === 'dark',
    locale: prefs.locale,
    fontSize: prefs.editorFontSize,
    syntaxHighlighting: prefs.syntaxHighlighting,
    spellcheckEnabled: prefs.spellcheckEnabled,
    spellcheckLanguages: prefs.spellcheckLanguages,
    onChange: (text) => {
      if (ignoreChanges) return
      dirty = true
      void api.setDirty(true)
      preview.render(text)
      updateStatus()
    },
    onCursorLine: (line) => {
      if (prefs.previewFollow) preview.scrollToSourceLine(line)
    }
  })

  preview = createPreview(els.previewHost, prefs.locale)
  helpPane = createFountainHelpPane(els.fountainHelp, (collapsed) => {
    void api.setPreferences({ fountainHelpIndexCollapsed: collapsed })
  })
  helpPane.setCollapsed(prefs.fountainHelpIndexCollapsed)

  applyTheme()
  applyI18n()
  applySyntax()
  applyRightPane()
  applyFilesSidebar()
  scheduleAutosave()

  const startup = await api.getStartupDocument()
  loadBuffer(startup.content, startup.path, false)
  editor.focus()

  els.btnNew.addEventListener('click', () => showNewChooser())
  els.btnOpen.addEventListener('click', () => void openDialog())
  els.btnSave.addEventListener('click', () => void persist(false))
  els.btnSaveAs.addEventListener('click', () => void persist(true))
  els.btnRight.addEventListener('click', () => {
    const next = prefs.rightPaneMode === 'help' ? 'preview' : 'help'
    void api.setPreferences({ rightPaneMode: next }).then((p) => {
      prefs = p
      applyRightPane()
    })
  })
  els.btnSettings.addEventListener('click', () => void showSettings())
  els.btnCollapseFiles.addEventListener('click', () => {
    void api.setPreferences({ filesSidebarVisible: false }).then((p) => {
      prefs = p
      applyFilesSidebar()
    })
  })
  els.btnExpandFiles.addEventListener('click', () => {
    void api.setPreferences({ filesSidebarVisible: true }).then((p) => {
      prefs = p
      applyFilesSidebar()
    })
  })

  wireResizer(document.getElementById('resizer-files') as HTMLElement, els.filesPane, 'left')
  wireResizer(
    document.getElementById('resizer-right') as HTMLElement,
    document.getElementById('right-pane') as HTMLElement,
    'right'
  )

  api.onMenuAction((action) => {
    void handleMenu(action)
  })
  api.onPreferencesChanged((next) => {
    prefs = next
    applyTheme()
    applyI18n()
    applySyntax()
    applyRightPane()
    applyFilesSidebar()
    editor.setFontSize(prefs.editorFontSize)
    editor.setSpellcheck(prefs.spellcheckEnabled, prefs.spellcheckLanguages)
    scheduleAutosave()
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (prefs.theme === 'system') applyTheme()
  })

  for (const modal of [els.settingsModal, els.aboutModal, els.newModal]) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden')
    })
  }
}

void boot()
