/**
 * Renderer entry — project workspace, tabs, split panes, notes, index,
 * autosave, first-run, plus the existing editor / preview / i18n chrome.
 */

import './styles/app.css'
import { createEditor, type EditorHandle } from './editor/create-editor'
import { createPreview, applyPageCssVars, type PreviewHandle } from './preview/preview'
import { createSyntaxSettingsPanel, type SyntaxSettingsHandle } from './ui/syntax-settings'
import { createHelpPanel, type HelpPanelHandle } from './ui/help-panel'
import { createWorkspaceSettingsPanel } from './ui/workspace-settings'
import { createNewProjectDialog } from './ui/new-project-dialog'
import { createIndexSidebar } from './ui/index-sidebar'
import { createNotesSidebar } from './ui/notes-sidebar'
import { createSyntaxCoachBar } from './ui/syntax-coach-bar'
import { createFountainHelpPane } from './ui/fountain-help-pane'
import { COACH_TO_TOPIC } from '../shared/fountain/syntax-reference'
import { classifyDocumentLines } from './editor/fountain-line-highlighter'
import {
  resolveSyntaxCoach,
  type CoachLineKind
} from '../shared/fountain/syntax-coach'
import { t } from '../shared/i18n/locales'
import {
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
  type LocaleCode,
  type ThemeMode
} from '../shared/constants/screenplay'
import {
  SYNTAX_PRESET_DEFAULT,
  applySyntaxPalette,
  resolvePalette,
  type SyntaxColorPalette,
  type SyntaxColorPresetId
} from '../shared/constants/syntax-colors'
import { undo, redo } from '@codemirror/commands'
import { buildScriptIndex } from '../shared/project/index-outline'

interface ProjectFileInfo {
  path: string
  name: string
  kind: 'fountain' | 'markdown' | 'pdf' | 'text' | 'other'
  isCurrentDraft: boolean
  isNotes: boolean
  date: string | null
}

interface ProjectSnapshot {
  projectPath: string
  projectName: string
  files: ProjectFileInfo[]
  currentDraftPath: string | null
  notesPath: string | null
}

// ---------------------------------------------------------------------------
// Document / pane model
// ---------------------------------------------------------------------------

type DocKind = 'fountain' | 'markdown' | 'pdf' | 'text' | 'other'

interface OpenDoc {
  id: string
  path: string | null
  name: string
  content: string
  dirty: boolean
  kind: DocKind
  isCurrentDraft: boolean
  pdfBase64?: string
}

interface FilePane {
  id: string
  docId: string
  root: HTMLElement
  editorHost: HTMLElement
  pdfHost: HTMLElement
  editor: EditorHandle
  fountainMode: boolean
}

let docs: OpenDoc[] = []
let panes: FilePane[] = []
let focusedPaneId = ''
let splitCount = 1
let project: ProjectSnapshot | null = null
let notesDocId: string | null = null
let autosaveTimer: ReturnType<typeof setInterval> | null = null
let autosaveMinutes = 5

function uid(): string {
  return `d${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function kindFromPath(p: string | null): DocKind {
  if (!p) return 'fountain'
  const ext = p.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'fountain') return 'fountain'
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'txt') return 'text'
  return 'other'
}

function displayName(doc: OpenDoc): string {
  if (doc.name) return doc.name
  if (!doc.path) return t(locale, 'status.untitled')
  return doc.path.split(/[/\\]/).pop() || t(locale, 'status.untitled')
}

// ---------------------------------------------------------------------------
// App chrome state
// ---------------------------------------------------------------------------

let preview: PreviewHandle
let locale: LocaleCode = 'en_GB'
let theme: ThemeMode = 'system'
let previewVisible = true
let rightPaneMode: 'preview' | 'help' = 'preview'
let fountainHelp: ReturnType<typeof createFountainHelpPane>
let previewFollow = true
let typewriterMode = false
let syntaxHighlighting = true
let syntaxColorPreset: SyntaxColorPresetId = 'default'
let syntaxColorsCustom: SyntaxColorPalette = { ...SYNTAX_PRESET_DEFAULT }
let editorFontSize = FONT_SIZE_DEFAULT
let suppressDirty = false
let welcomeDismissed = false
let syntaxSettings: SyntaxSettingsHandle
let helpPanel: HelpPanelHandle
let workspaceSettings: ReturnType<typeof createWorkspaceSettingsPanel>
let newProjectDialog: ReturnType<typeof createNewProjectDialog>
let indexSidebar: ReturnType<typeof createIndexSidebar>
let notesSidebar: ReturnType<typeof createNotesSidebar>
let indexVisible = true
let notesVisible = true
let syntaxCoach: ReturnType<typeof createSyntaxCoachBar>
let coachTimer: ReturnType<typeof setTimeout> | null = null

let statsTimer: ReturnType<typeof setTimeout> | null = null
let followTimer: ReturnType<typeof setTimeout> | null = null
const STATS_DEBOUNCE_MS = 120
const FOLLOW_DEBOUNCE_MS = 80

const el = {
  previewPane: document.getElementById('preview-pane') as HTMLElement,
  previewHost: document.getElementById('preview-host') as HTMLElement,
  fountainHelp: document.getElementById('fountain-help') as HTMLElement,
  workspace: document.getElementById('workspace') as HTMLElement,
  splitPanes: document.getElementById('split-panes') as HTMLElement,
  tabBar: document.getElementById('tab-bar') as HTMLElement,
  docTitle: document.getElementById('doc-title') as HTMLElement,
  projectLabel: document.getElementById('project-label') as HTMLElement,
  statusWords: document.getElementById('status-words') as HTMLElement,
  statusPages: document.getElementById('status-pages') as HTMLElement,
  statusState: document.getElementById('status-state') as HTMLElement,
  statusPath: document.getElementById('status-path') as HTMLElement,
  statusFontLabel: document.getElementById('status-font-label') as HTMLElement,
  statusFontValue: document.getElementById('status-font-value') as HTMLElement,
  fontSizeLabel: document.getElementById('font-size-label') as HTMLElement,
  btnPreview: document.getElementById('btn-toggle-preview') as HTMLButtonElement,
  btnSyntaxHelp: document.getElementById('btn-toggle-syntax-help') as HTMLButtonElement,
  btnIndex: document.getElementById('btn-toggle-index') as HTMLButtonElement,
  btnNotes: document.getElementById('btn-toggle-notes') as HTMLButtonElement,
  btnSyntaxColors: document.getElementById('btn-syntax-colors') as HTMLButtonElement,
  btnTheme: document.getElementById('btn-theme') as HTMLButtonElement,
  btnFind: document.getElementById('btn-find') as HTMLButtonElement,
  btnReplace: document.getElementById('btn-replace') as HTMLButtonElement,
  btnFontInc: document.getElementById('btn-font-inc') as HTMLButtonElement,
  btnFontDec: document.getElementById('btn-font-dec') as HTMLButtonElement,
  btnSettings: document.getElementById('btn-settings') as HTMLButtonElement,
  btnHelp: document.getElementById('btn-help') as HTMLButtonElement,
  btnSplit1: document.getElementById('btn-split-1') as HTMLButtonElement,
  btnSplit2: document.getElementById('btn-split-2') as HTMLButtonElement,
  btnSplit3: document.getElementById('btn-split-3') as HTMLButtonElement,
  statusFind: document.getElementById('status-find') as HTMLButtonElement,
  statusReplace: document.getElementById('status-replace') as HTMLButtonElement,
  statusFontInc: document.getElementById('status-font-inc') as HTMLButtonElement,
  statusFontDec: document.getElementById('status-font-dec') as HTMLButtonElement,
  welcome: document.getElementById('welcome-overlay') as HTMLElement,
  welcomeTitle: document.getElementById('welcome-title') as HTMLElement,
  welcomeBody: document.getElementById('welcome-body') as HTMLElement,
  welcomeNew: document.getElementById('welcome-new') as HTMLButtonElement,
  welcomeOpen: document.getElementById('welcome-open') as HTMLButtonElement,
  welcomeOpenFile: document.getElementById('welcome-open-file') as HTMLButtonElement,
  welcomeDismiss: document.getElementById('welcome-dismiss') as HTMLButtonElement,
  firstRunFields: document.getElementById('first-run-fields') as HTMLElement,
  firstRunFolder: document.getElementById('first-run-folder') as HTMLInputElement,
  firstRunBrowse: document.getElementById('first-run-browse') as HTMLButtonElement,
  firstRunName: document.getElementById('first-run-name') as HTMLInputElement,
  firstRunFolderLabel: document.getElementById('first-run-folder-label') as HTMLElement,
  firstRunNameLabel: document.getElementById('first-run-name-label') as HTMLElement,
  resizer: document.getElementById('pane-resizer') as HTMLElement,
  indexRoot: document.getElementById('index-sidebar') as HTMLElement,
  notesRoot: document.getElementById('notes-sidebar') as HTMLElement,
  syntaxCoach: document.getElementById('syntax-coach') as HTMLElement
}

// ---------------------------------------------------------------------------
// Theme / font / locale
// ---------------------------------------------------------------------------

function resolveDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(mode: ThemeMode): void {
  theme = mode
  const dark = resolveDark(mode)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  for (const pane of panes) pane.editor.setTheme(dark)
}

function applyFontSize(px: number, persist = true): void {
  editorFontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(px)))
  for (const pane of panes) pane.editor.setFontSize(editorFontSize)
  const uiScale = editorFontSize / FONT_SIZE_DEFAULT
  document.documentElement.style.setProperty('--ui-scale', String(uiScale))
  preview?.setZoom(uiScale)
  if (el.fontSizeLabel) el.fontSizeLabel.textContent = String(editorFontSize)
  if (el.statusFontValue) el.statusFontValue.textContent = String(editorFontSize)
  if (persist) void window.api.setPreferences({ editorFontSize })
}

function bumpFont(delta: number): void {
  applyFontSize(editorFontSize + delta, true)
}

function applyLocale(next: LocaleCode): void {
  locale = next
  document.documentElement.lang = next.replace('_', '-')
  for (const pane of panes) pane.editor.setLocale(next)
  preview?.setLocale(next)
  el.btnPreview.textContent = t(locale, 'menu.view.preview')
  if (el.btnSyntaxHelp) el.btnSyntaxHelp.textContent = t(locale, 'menu.view.syntaxHelp')
  el.btnIndex.textContent = t(locale, 'index.title')
  el.btnNotes.textContent = t(locale, 'notes.title')
  if (el.btnSyntaxColors) {
    el.btnSyntaxColors.textContent = t(locale, 'menu.view.syntaxColors').replace('…', '')
  }
  el.btnTheme.textContent = t(locale, 'menu.theme')
  el.btnFind.textContent = t(locale, 'status.find')
  el.btnReplace.textContent = t(locale, 'status.replace')
  el.btnSettings.textContent = t(locale, 'menu.settings')
  el.btnHelp.textContent = t(locale, 'help.title')
  el.statusFind.textContent = t(locale, 'status.find')
  el.statusReplace.textContent = t(locale, 'status.replace')
  el.statusFontLabel.textContent = t(locale, 'status.font')
  el.welcomeNew.textContent = t(locale, 'menu.file.newProject')
  el.welcomeOpen.textContent = t(locale, 'menu.file.openProject')
  el.welcomeOpenFile.textContent = t(locale, 'menu.file.open')
  el.welcomeDismiss.textContent = t(locale, 'common.close')
  el.firstRunBrowse.textContent = t(locale, 'firstRun.chooseFolder')
  el.firstRunFolderLabel.textContent = t(locale, 'settings.baseFolder')
  el.firstRunNameLabel.textContent = t(locale, 'firstRun.projectName')
  syntaxSettings?.setLocale(locale)
  helpPanel?.setLocale(locale)
  workspaceSettings?.setLocale(locale)
  newProjectDialog?.setLocale(locale)
  indexSidebar?.setLocale(locale)
  notesSidebar?.setLocale(locale)
  updateWelcomeCopy()
  updateTitle()
  updateStatusLabels()
  renderTabs()
}

function updateWelcomeCopy(): void {
  const first = needsFirstRun()
  el.welcomeTitle.textContent = first ? t(locale, 'firstRun.title') : t(locale, 'welcome.title')
  el.welcomeBody.textContent = first ? t(locale, 'firstRun.body') : t(locale, 'welcome.body')
}

function applySyntaxColors(
  preset: SyntaxColorPresetId,
  custom: SyntaxColorPalette,
  persist = false
): void {
  syntaxColorPreset = preset
  syntaxColorsCustom = { ...SYNTAX_PRESET_DEFAULT, ...custom }
  const palette = resolvePalette(preset, syntaxColorsCustom)
  applySyntaxPalette(document.documentElement, palette)
  if (persist) {
    void window.api.setPreferences({
      syntaxColorPreset: preset,
      syntaxColorsCustom
    })
  }
}

function focusedDoc(): OpenDoc | undefined {
  const pane = panes.find((p) => p.id === focusedPaneId) ?? panes[0]
  return docs.find((d) => d.id === pane?.docId)
}

function currentDraftDoc(): OpenDoc | undefined {
  return docs.find((d) => d.isCurrentDraft && d.kind === 'fountain')
}

function anyDirty(): boolean {
  return docs.some((d) => d.dirty)
}

function updateTitle(): void {
  const doc = focusedDoc()
  const name = doc ? displayName(doc) : t(locale, 'status.untitled')
  const dirty = doc?.dirty ?? false
  el.docTitle.innerHTML = dirty
    ? `${escapeHtml(name)}<span class="dirty-dot">•</span>`
    : escapeHtml(name)
  document.title = `${dirty ? '• ' : ''}${name} — ${t(locale, 'app.name')}`
  el.projectLabel.textContent = project ? project.projectName : ''
}

function updateStatusLabels(): void {
  const words = preview?.getWordCount() ?? 0
  const pages = preview?.getPageCount() ?? 1
  el.statusWords.innerHTML = `<strong>${words}</strong> ${t(locale, 'status.words')}`
  el.statusPages.innerHTML = `<strong>${pages}</strong> ${t(locale, 'status.pages')}`
  el.statusState.textContent = anyDirty()
    ? t(locale, 'status.modified')
    : t(locale, 'status.ready')
  el.statusPath.textContent = focusedDoc()?.path ?? ''
  if (el.statusFontValue) el.statusFontValue.textContent = String(editorFontSize)
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function markDirty(doc: OpenDoc, dirty: boolean): void {
  if (suppressDirty) return
  doc.dirty = dirty
  window.api.updateMenuState({ dirty: anyDirty(), hasPath: Boolean(doc.path) })
  void window.api.setDirty(anyDirty())
  updateTitle()
  updateStatusLabels()
  renderTabs()
}

function scheduleStats(): void {
  if (statsTimer) clearTimeout(statsTimer)
  statsTimer = setTimeout(() => {
    refreshPreviewAndIndex()
  }, STATS_DEBOUNCE_MS)
}

function scheduleFollow(line: number): void {
  if (!previewFollow) return
  if (followTimer) clearTimeout(followTimer)
  followTimer = setTimeout(() => {
    preview.scrollToSourceLine(line)
  }, FOLLOW_DEBOUNCE_MS)
}

function scheduleSyntaxCoach(): void {
  if (coachTimer) clearTimeout(coachTimer)
  coachTimer = setTimeout(() => refreshSyntaxCoach(), 50)
}

function refreshSyntaxCoach(): void {
  if (!syntaxCoach) return
  const doc = focusedDoc()
  const pane = panes.find((p) => p.id === focusedPaneId) ?? panes[0]
  const isFountain = doc?.kind === 'fountain'
  if (!pane || !isFountain) {
    syntaxCoach.update(
      resolveSyntaxCoach({
        lineText: '',
        lineKind: 'unknown',
        prevBlank: true,
        cursorCol: 0,
        isFountain: false
      })
    )
    return
  }
  const state = pane.editor.view.state
  const pos = state.selection.main.head
  const line = state.doc.lineAt(pos)
  const kinds = classifyDocumentLines(state.doc)
  const prevText = line.number > 1 ? state.doc.line(line.number - 1).text : ''
  const tip = resolveSyntaxCoach({
    lineText: line.text,
    lineKind: (kinds[line.number] ?? 'unknown') as CoachLineKind,
    previousKind:
      line.number > 1
        ? ((kinds[line.number - 1] ?? 'unknown') as CoachLineKind)
        : 'unknown',
    prevBlank: line.number === 1 || prevText.trim() === '',
    cursorCol: pos - line.from,
    isFountain: true
  })
  syntaxCoach.update(tip)
  if (rightPaneMode === 'help' && fountainHelp) {
    const topic = COACH_TO_TOPIC[tip.id]
    if (topic) fountainHelp.highlight(topic)
  }
}

function refreshPreviewAndIndex(): void {
  const draft = currentDraftDoc()
  const helpOn = rightPaneMode === 'help'
  const showPages = !helpOn && Boolean(draft) && previewVisible
  const showPane = helpOn || showPages
  el.previewPane.classList.toggle('hidden', !showPane)
  el.workspace.classList.toggle('preview-hidden', !showPane)
  el.previewHost.classList.toggle('hidden', helpOn)
  if (fountainHelp) {
    if (helpOn) fountainHelp.show()
    else fountainHelp.hide()
  }
  if (draft) {
    preview.render(draft.content)
    if (previewFollow) {
      const pane = panes.find((p) => p.docId === draft.id)
      if (pane) preview.scrollToSourceLine(pane.editor.getCursorLine())
    }
    const files = (project?.files ?? []).map((f) => ({
      path: f.path,
      name: f.name,
      isCurrentDraft: f.isCurrentDraft,
      isNotes: f.isNotes
    }))
    indexSidebar.render({
      files,
      entries: buildScriptIndex(draft.content),
      projectName: project?.projectName ?? ''
    })
    if (notesDocId) {
      const notes = docs.find((d) => d.id === notesDocId)
      if (notes) {
        const next = notesSidebar.syncFromScript(draft.content, notes.content)
        if (next !== notes.content) {
          notes.content = next
          notes.dirty = true
        }
      }
    }
  } else {
    preview.render('')
    indexSidebar.render({
      files: (project?.files ?? []).map((f) => ({
        path: f.path,
        name: f.name,
        isCurrentDraft: f.isCurrentDraft,
        isNotes: f.isNotes
      })),
      entries: [],
      projectName: project?.projectName ?? ''
    })
  }
  updateStatusLabels()
}

// ---------------------------------------------------------------------------
// Tabs + split panes
// ---------------------------------------------------------------------------

function flushPane(pane: FilePane): void {
  const doc = docs.find((d) => d.id === pane.docId)
  if (!doc || doc.kind === 'pdf') return
  doc.content = pane.editor.getValue()
}

function loadDocIntoPane(pane: FilePane, doc: OpenDoc): void {
  flushPane(pane)
  pane.docId = doc.id
  const wantFountain = doc.kind === 'fountain'
  if (doc.kind === 'pdf') {
    pane.editorHost.classList.add('hidden')
    pane.pdfHost.classList.remove('hidden')
    const iframe = pane.pdfHost.querySelector('iframe') as HTMLIFrameElement
    if (doc.pdfBase64) {
      const bytes = Uint8Array.from(atob(doc.pdfBase64), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'application/pdf' })
      iframe.src = URL.createObjectURL(blob)
    }
  } else {
    pane.pdfHost.classList.add('hidden')
    pane.editorHost.classList.remove('hidden')
    if (pane.fountainMode !== wantFountain) {
      pane.editor.destroy()
      pane.editor = makeEditor(pane.editorHost, wantFountain, doc.content)
      pane.fountainMode = wantFountain
    } else {
      suppressDirty = true
      pane.editor.setValue(doc.content)
      suppressDirty = false
    }
  }
  focusedPaneId = pane.id
  updatePaneFocus()
  renderTabs()
  updateTitle()
  updateStatusLabels()
  refreshPreviewAndIndex()
}

function makeEditor(parent: HTMLElement, fountainMode: boolean, initial: string): EditorHandle {
  const handle = createEditor({
    parent,
    initialDoc: initial,
    dark: resolveDark(theme),
    locale,
    fontSize: editorFontSize,
    syntaxHighlighting,
    typewriterMode,
    fountainMode,
    onChange: (text) => {
      const pane = panes.find((p) => p.editorHost === parent || p.editor === handle)
      const doc = docs.find((d) => d.id === pane?.docId)
      if (!doc) return
      doc.content = text
      markDirty(doc, true)
      if (doc.isCurrentDraft) scheduleStats()
      scheduleSyntaxCoach()
    },
    onCursorLine: (line) => {
      const pane = panes.find((p) => p.editor === handle)
      const doc = docs.find((d) => d.id === pane?.docId)
      if (doc?.isCurrentDraft) scheduleFollow(line)
      scheduleSyntaxCoach()
    }
  })
  return handle
}

function createPane(doc: OpenDoc): FilePane {
  const root = document.createElement('section')
  root.className = 'file-pane'
  const editorHost = document.createElement('div')
  editorHost.className = 'pane-editor'
  const pdfHost = document.createElement('div')
  pdfHost.className = 'pane-pdf hidden'
  pdfHost.innerHTML = '<iframe title="PDF"></iframe>'
  root.appendChild(editorHost)
  root.appendChild(pdfHost)
  el.splitPanes.appendChild(root)
  const fountainMode = doc.kind === 'fountain'
  const editor = makeEditor(editorHost, fountainMode, doc.kind === 'pdf' ? '' : doc.content)
  const pane: FilePane = {
    id: uid(),
    docId: doc.id,
    root,
    editorHost,
    pdfHost,
    editor,
    fountainMode
  }
  root.addEventListener('mousedown', () => {
    focusedPaneId = pane.id
    updatePaneFocus()
    renderTabs()
    updateTitle()
  })
  if (doc.kind === 'pdf') loadDocIntoPane(pane, doc)
  return pane
}

function setSplitCount(n: number): void {
  splitCount = Math.min(3, Math.max(1, n))
  while (panes.length > splitCount) {
    const extra = panes.pop()
    if (!extra) break
    extra.editor.destroy()
    extra.root.remove()
  }
  while (panes.length < splitCount) {
    const fallback =
      docs[panes.length] ?? docs[docs.length - 1] ?? docs[0]
    if (!fallback) break
    panes.push(createPane(fallback))
  }
  if (!panes.some((p) => p.id === focusedPaneId) && panes[0]) {
    focusedPaneId = panes[0].id
  }
  updatePaneFocus()
}

function updatePaneFocus(): void {
  for (const pane of panes) {
    pane.root.classList.toggle('focused', pane.id === focusedPaneId)
  }
  scheduleSyntaxCoach()
}

function renderTabs(): void {
  const show = docs.length > 1
  el.tabBar.classList.toggle('hidden', !show)
  el.tabBar.innerHTML = ''
  if (!show) return
  const activeId = focusedDoc()?.id
  for (const doc of docs) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `tab-btn${doc.id === activeId ? ' active' : ''}`
    btn.setAttribute('role', 'tab')
    const label = document.createElement('span')
    label.textContent = `${displayName(doc)}${doc.dirty ? ' •' : ''}`
    const close = document.createElement('span')
    close.className = 'tab-close'
    close.textContent = '×'
    close.addEventListener('click', (e) => {
      e.stopPropagation()
      void closeDoc(doc.id)
    })
    btn.appendChild(label)
    btn.appendChild(close)
    btn.addEventListener('click', () => {
      const pane = panes.find((p) => p.id === focusedPaneId) ?? panes[0]
      if (pane) loadDocIntoPane(pane, doc)
    })
    el.tabBar.appendChild(btn)
  }
}

function addDoc(partial: Omit<OpenDoc, 'id'> & { id?: string }): OpenDoc {
  const existing = partial.path
    ? docs.find((d) => d.path && d.path === partial.path)
    : undefined
  if (existing) {
    existing.content = partial.content
    existing.isCurrentDraft = partial.isCurrentDraft
    existing.pdfBase64 = partial.pdfBase64
    existing.kind = partial.kind
    existing.name = partial.name
    return existing
  }
  const doc: OpenDoc = { ...partial, id: partial.id ?? uid() }
  docs.push(doc)
  if (panes.length === 0) {
    panes.push(createPane(doc))
    focusedPaneId = panes[0].id
  }
  return doc
}

async function openPath(filePath: string, opts?: { currentDraft?: boolean }): Promise<OpenDoc | null> {
  const result = await window.api.readProjectFile(filePath)
  if (result.cancelled || !result.path) return null
  const kind = (result.kind as DocKind) || kindFromPath(result.path)
  const name = result.path.split(/[/\\]/).pop() || result.path
  const isCurrent =
    opts?.currentDraft ??
    Boolean(project && project.currentDraftPath === result.path)
  const doc = addDoc({
    path: result.path,
    name,
    content: result.content ?? '',
    dirty: false,
    kind,
    isCurrentDraft: isCurrent && kind === 'fountain',
    pdfBase64: result.binaryBase64
  })
  if (project && result.path === project.notesPath) notesDocId = doc.id
  const pane = panes.find((p) => p.id === focusedPaneId) ?? panes[0]
  if (pane) loadDocIntoPane(pane, doc)
  renderTabs()
  return doc
}

async function closeDoc(id: string): Promise<void> {
  const doc = docs.find((d) => d.id === id)
  if (!doc) return
  if (doc.dirty) {
    const choice = await window.api.confirmDiscard()
    if (choice === 'cancel') return
    if (choice === 'save') {
      const ok = await saveDoc(doc)
      if (!ok) return
    }
  }
  docs = docs.filter((d) => d.id !== id)
  if (notesDocId === id) notesDocId = null
  if (docs.length === 0) {
    const untitled = addDoc({
      path: null,
      name: t(locale, 'status.untitled'),
      content: '',
      dirty: false,
      kind: 'fountain',
      isCurrentDraft: false
    })
    for (const pane of panes) loadDocIntoPane(pane, untitled)
  } else {
    for (const pane of panes) {
      if (pane.docId === id) loadDocIntoPane(pane, docs[0])
    }
  }
  renderTabs()
  refreshPreviewAndIndex()
}

// ---------------------------------------------------------------------------
// File / project operations
// ---------------------------------------------------------------------------

function needsFirstRun(): boolean {
  return !el.firstRunFolder.value
}

async function doNewUntitled(): Promise<void> {
  const result = await window.api.getTemplateDocument()
  const doc = addDoc({
    path: null,
    name: t(locale, 'status.untitled'),
    content: result.content ?? '',
    dirty: false,
    kind: 'fountain',
    isCurrentDraft: false
  })
  const pane = panes[0]
  if (pane) loadDocIntoPane(pane, doc)
  showWelcome(false)
}

async function confirmLeaveWorkspace(): Promise<boolean> {
  if (!anyDirty()) return true
  const choice = await window.api.confirmDiscard()
  if (choice === 'cancel') return false
  if (choice === 'save') {
    for (const doc of docs.filter((d) => d.dirty)) {
      const ok = await saveDoc(doc)
      if (!ok) return false
    }
  }
  return true
}

async function resetWorkspace(): Promise<void> {
  project = null
  notesDocId = null
  docs = []
  notesSidebar.setTitle('')
  const untitled = addDoc({
    path: null,
    name: t(locale, 'status.untitled'),
    content: '',
    dirty: false,
    kind: 'fountain',
    isCurrentDraft: false
  })
  const pane = panes[0]
  if (pane) loadDocIntoPane(pane, untitled)
  while (panes.length > 1) {
    const extra = panes.pop()
    if (!extra) break
    extra.editor.destroy()
    extra.root.remove()
  }
  splitCount = 1
  void window.api.setPreferences({ lastProjectPath: '' })
  renderTabs()
  refreshPreviewAndIndex()
  updateTitle()
}

async function doNewProject(): Promise<void> {
  let folder = el.firstRunFolder.value.trim()
  if (!folder) {
    const picked = await window.api.chooseProjectsFolder()
    if (picked.cancelled || !picked.path) return
    folder = picked.path
    el.firstRunFolder.value = folder
  }
  const spec = await newProjectDialog.ask({ folder, locale })
  if (!spec) return
  el.firstRunFolder.value = spec.folder
  el.firstRunName.value = ''
  if (!(await confirmLeaveWorkspace())) return
  const result = await window.api.createProject(spec.name, spec.folder)
  if (result.cancelled || !result.project) return
  await loadProject(result.project)
  showWelcome(false)
}

async function doCloseProject(): Promise<void> {
  if (!(await confirmLeaveWorkspace())) return
  await resetWorkspace()
  showWelcome(true, true)
}

async function doOpenProject(): Promise<void> {
  if (!(await confirmLeaveWorkspace())) return
  const result = await window.api.openProject()
  if (result.cancelled || !result.project) return
  await loadProject(result.project)
  showWelcome(false)
}

async function doOpenFile(): Promise<void> {
  const result = await window.api.openFileInTab()
  if (result.cancelled) return
  if (result.path) {
    await openPath(result.path, { currentDraft: false })
  } else {
    const doc = addDoc({
      path: null,
      name: t(locale, 'status.untitled'),
      content: result.content ?? '',
      dirty: false,
      kind: 'fountain',
      isCurrentDraft: false
    })
    const pane = panes.find((p) => p.id === focusedPaneId) ?? panes[0]
    if (pane) loadDocIntoPane(pane, doc)
  }
  showWelcome(false)
}

async function loadProject(snap: ProjectSnapshot): Promise<void> {
  project = snap
  notesSidebar.setTitle(snap.projectName)
  docs = []
  notesDocId = null
  if (snap.currentDraftPath) {
    await openPath(snap.currentDraftPath, { currentDraft: true })
  }
  if (snap.notesPath) {
    const notes = await openPath(snap.notesPath, { currentDraft: false })
    if (notes) notesDocId = notes.id
    // Keep focus on the current draft after opening notes
    const draft = currentDraftDoc()
    const pane = panes[0]
    if (draft && pane) loadDocIntoPane(pane, draft)
  }
  if (docs.length === 0) {
    await doNewUntitled()
  }
  renderTabs()
  refreshPreviewAndIndex()
}

async function saveDoc(doc: OpenDoc, forceSaveAs = false): Promise<boolean> {
  if (doc.kind === 'pdf') return true
  const pane = panes.find((p) => p.docId === doc.id)
  if (pane) doc.content = pane.editor.getValue()
  const result =
    doc.path && !forceSaveAs
      ? await window.api.writeProjectFile(doc.path, doc.content)
      : forceSaveAs
        ? await window.api.saveFileAs(doc.content)
        : await window.api.saveFile(doc.content, false, doc.path)
  if (result.cancelled) return false
  doc.path = result.path ?? doc.path
  if (doc.path) doc.name = doc.path.split(/[/\\]/).pop() || doc.name
  doc.dirty = false
  markDirty(doc, false)
  el.statusState.textContent = t(locale, 'status.saved')
  setTimeout(() => updateStatusLabels(), 1500)
  return true
}

async function doSave(forceSaveAs = false): Promise<boolean> {
  const doc = focusedDoc()
  if (!doc) return false
  return saveDoc(doc, forceSaveAs)
}

async function doExport(kind: 'fountain' | 'fdx' | 'pdf'): Promise<void> {
  const doc = focusedDoc()
  if (!doc) return
  const content = doc.content
  const result =
    kind === 'fountain'
      ? await window.api.exportFountain(content)
      : kind === 'fdx'
        ? await window.api.exportFdx(content)
        : await window.api.exportPdf(content)
  if (!result.cancelled && result.path) {
    el.statusState.textContent = t(locale, 'status.saved')
    setTimeout(() => updateStatusLabels(), 1500)
  }
}

async function doImport(mode: 'draft' | 'notes'): Promise<void> {
  if (!project) {
    await window.api.showError('Open or create a project before importing.')
    return
  }
  const result = await window.api.importIntoProject(project.projectPath, mode)
  if (result.cancelled || !result.project) return
  project = result.project
  if (result.path) {
    await openPath(result.path, { currentDraft: mode === 'draft' })
    if (mode === 'draft') {
      for (const d of docs) {
        d.isCurrentDraft = d.path === result.path && d.kind === 'fountain'
      }
    }
  }
  refreshPreviewAndIndex()
}

function showWelcome(show: boolean, force = false): void {
  if (show && (force || !welcomeDismissed)) {
    if (force) welcomeDismissed = false
    el.welcome.classList.remove('hidden')
  } else {
    el.welcome.classList.add('hidden')
  }
}

function setPreviewVisible(visible: boolean): void {
  previewVisible = visible
  if (visible) rightPaneMode = 'preview'
  void window.api.setPreferences({
    previewVisible: visible,
    rightPaneMode: visible ? 'preview' : rightPaneMode
  })
  refreshPreviewAndIndex()
}

function setRightPaneMode(mode: 'preview' | 'help'): void {
  rightPaneMode = mode
  if (mode === 'preview') previewVisible = true
  void window.api.setPreferences({ rightPaneMode: mode, previewVisible })
  refreshPreviewAndIndex()
}

function setPreviewFollow(enabled: boolean, persist = true): void {
  previewFollow = enabled
  if (enabled) {
    const draft = currentDraftDoc()
    const pane = panes.find((p) => p.docId === draft?.id)
    if (pane) preview.scrollToSourceLine(pane.editor.getCursorLine())
  }
  if (persist) void window.api.setPreferences({ previewFollow: enabled })
}

function setTypewriter(enabled: boolean, persist = true): void {
  typewriterMode = enabled
  for (const pane of panes) pane.editor.setTypewriterMode(enabled)
  if (persist) void window.api.setPreferences({ typewriterMode: enabled })
}

function setSyntax(enabled: boolean, persist = true): void {
  syntaxHighlighting = enabled
  for (const pane of panes) pane.editor.setSyntaxHighlighting(enabled)
  if (persist) void window.api.setPreferences({ syntaxHighlighting: enabled })
}

function setIndexVisible(visible: boolean, persist = true): void {
  indexVisible = visible
  indexSidebar.setVisible(visible)
  if (persist) void window.api.setPreferences({ indexVisible: visible })
}

function setNotesVisible(visible: boolean, persist = true): void {
  notesVisible = visible
  notesSidebar.setVisible(visible)
  if (persist) void window.api.setPreferences({ notesVisible: visible })
}

function setupResizer(): void {
  let dragging = false
  el.resizer.addEventListener('mousedown', (e) => {
    dragging = true
    el.resizer.classList.add('active')
    e.preventDefault()
  })
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return
    const rect = el.workspace.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.min(70, Math.max(24, (1 - x / rect.width) * 100))
    el.previewPane.style.width = `${pct}%`
  })
  window.addEventListener('mouseup', () => {
    dragging = false
    el.resizer.classList.remove('active')
  })
}

function armAutosave(minutes: number): void {
  autosaveMinutes = minutes
  if (autosaveTimer) {
    clearInterval(autosaveTimer)
    autosaveTimer = null
  }
  if (!minutes || minutes <= 0) return
  autosaveTimer = setInterval(() => {
    void autosaveAll()
  }, minutes * 60 * 1000)
}

async function autosaveAll(): Promise<void> {
  let saved = 0
  for (const doc of docs) {
    if (!doc.dirty || !doc.path || doc.kind === 'pdf') continue
    const pane = panes.find((p) => p.docId === doc.id)
    if (pane) doc.content = pane.editor.getValue()
    const result = await window.api.writeProjectFile(doc.path, doc.content)
    if (!result.cancelled) {
      doc.dirty = false
      saved += 1
    }
  }
  if (saved > 0) {
    void window.api.setDirty(anyDirty())
    el.statusState.textContent = t(locale, 'status.autosaved')
    renderTabs()
    updateTitle()
    setTimeout(() => updateStatusLabels(), 1500)
  }
}

function focusedEditor(): EditorHandle | undefined {
  return (panes.find((p) => p.id === focusedPaneId) ?? panes[0])?.editor
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function handleMenuAction(action: string): void {
  switch (action) {
    case 'file:new-project':
      void doNewProject()
      break
    case 'file:close-project':
      void doCloseProject()
      break
    case 'file:new':
      void doNewUntitled()
      break
    case 'file:open-project':
      void doOpenProject()
      break
    case 'file:open':
      void doOpenFile()
      break
    case 'file:import-draft':
      void doImport('draft')
      break
    case 'file:import-notes':
      void doImport('notes')
      break
    case 'file:save':
      void doSave(false)
      break
    case 'file:save-as':
      void doSave(true)
      break
    case 'file:save-then-quit':
      void (async () => {
        for (const doc of docs.filter((d) => d.dirty)) {
          const ok = await saveDoc(doc)
          if (!ok) return
        }
        window.close()
      })()
      break
    case 'file:export-fountain':
      void doExport('fountain')
      break
    case 'file:export-fdx':
      void doExport('fdx')
      break
    case 'file:export-pdf':
      void doExport('pdf')
      break
    case 'edit:undo': {
      const ed = focusedEditor()
      if (ed) undo(ed.view)
      break
    }
    case 'edit:redo': {
      const ed = focusedEditor()
      if (ed) redo(ed.view)
      break
    }
    case 'edit:find':
      focusedEditor()?.openFind()
      break
    case 'edit:find-replace':
      focusedEditor()?.openFindReplace()
      break
    case 'view:toggle-preview':
      if (rightPaneMode === 'help') setRightPaneMode('preview')
      else setPreviewVisible(!previewVisible)
      break
    case 'view:syntax-help':
      setRightPaneMode(rightPaneMode === 'help' ? 'preview' : 'help')
      break
    case 'view:toggle-index':
      void window.api.getPreferences().then((p) => setIndexVisible(p.indexVisible, false))
      break
    case 'view:toggle-notes':
      void window.api.getPreferences().then((p) => setNotesVisible(p.notesVisible, false))
      break
    case 'view:toggle-syntax-coach':
      void window.api.getPreferences().then((p) => {
        syntaxCoach?.setCollapsed(p.syntaxCoachCollapsed)
      })
      break
    case 'view:split-1':
      setSplitCount(1)
      break
    case 'view:split-2':
      setSplitCount(2)
      break
    case 'view:split-3':
      setSplitCount(3)
      break
    case 'view:preview-follow':
      void window.api.getPreferences().then((p) => setPreviewFollow(p.previewFollow, false))
      break
    case 'view:typewriter':
      void window.api.getPreferences().then((p) => setTypewriter(p.typewriterMode, false))
      break
    case 'view:syntax':
      void window.api.getPreferences().then((p) => setSyntax(p.syntaxHighlighting, false))
      break
    case 'view:syntax-colors':
      syntaxSettings?.open()
      break
    case 'view:font-increase':
      bumpFont(FONT_SIZE_STEP)
      break
    case 'view:font-decrease':
      bumpFont(-FONT_SIZE_STEP)
      break
    case 'view:font-reset':
      applyFontSize(FONT_SIZE_DEFAULT, true)
      break
    case 'view:reload':
      location.reload()
      break
    case 'theme:light':
    case 'theme:dark':
    case 'theme:system': {
      const mode = action.split(':')[1] as ThemeMode
      applyTheme(mode)
      void window.api.setPreferences({ theme: mode })
      break
    }
    case 'language:en_GB':
    case 'language:es_PY':
    case 'language:fr_FR': {
      const loc = action.split(':')[1] as LocaleCode
      applyLocale(loc)
      void window.api.setPreferences({ locale: loc })
      break
    }
    case 'settings:workspace':
      workspaceSettings.open({
        projectsBaseFolder: el.firstRunFolder.value,
        autosaveMinutes
      })
      break
    case 'help:guide':
      helpPanel.open()
      break
    case 'help:about':
      void window.api.showAbout()
      break
    case 'help:check-updates':
      void window.api.checkUpdates()
      break
    default:
      break
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
  applyPageCssVars()

  const prefs = await window.api.getPreferences()
  locale = prefs.locale
  theme = prefs.theme
  previewVisible = prefs.previewVisible
  previewFollow = prefs.previewFollow
  typewriterMode = prefs.typewriterMode
  syntaxHighlighting = prefs.syntaxHighlighting
  syntaxColorPreset = (prefs.syntaxColorPreset as SyntaxColorPresetId) || 'default'
  syntaxColorsCustom = {
    ...SYNTAX_PRESET_DEFAULT,
    ...(prefs.syntaxColorsCustom as SyntaxColorPalette)
  }
  editorFontSize = prefs.editorFontSize ?? FONT_SIZE_DEFAULT
  indexVisible = prefs.indexVisible !== false
  notesVisible = prefs.notesVisible !== false
  autosaveMinutes = prefs.autosaveMinutes ?? 5
  el.firstRunFolder.value = prefs.projectsBaseFolder || ''
  if (prefs.hasCompletedFirstRun && prefs.projectsBaseFolder) {
    el.firstRunFields.classList.add('hidden')
  }

  const dark = resolveDark(theme)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  applySyntaxColors(syntaxColorPreset, syntaxColorsCustom, false)

  preview = createPreview(el.previewHost, locale)
  fountainHelp = createFountainHelpPane(el.fountainHelp, (collapsed) => {
    void window.api.setPreferences({ fountainHelpIndexCollapsed: collapsed })
  })
  fountainHelp.setCollapsed(Boolean(prefs.fountainHelpIndexCollapsed))
  rightPaneMode = prefs.rightPaneMode === 'help' ? 'help' : 'preview'
  syntaxSettings = createSyntaxSettingsPanel(
    document.getElementById('app') as HTMLElement,
    {
      preset: syntaxColorPreset,
      custom: syntaxColorsCustom,
      highlightingEnabled: syntaxHighlighting
    },
    (next) => applySyntaxColors(next.preset, next.custom, true)
  )
  helpPanel = createHelpPanel(document.getElementById('app') as HTMLElement)
  newProjectDialog = createNewProjectDialog(document.getElementById('app') as HTMLElement)
  workspaceSettings = createWorkspaceSettingsPanel(document.getElementById('app') as HTMLElement, {
    onChooseFolder: async () => {
      const r = await window.api.chooseProjectsFolder()
      if (r.cancelled || !r.path) return null
      el.firstRunFolder.value = r.path
      return r.path
    },
    onChange: (partial) => {
      if (partial.projectsBaseFolder !== undefined) {
        el.firstRunFolder.value = partial.projectsBaseFolder
        void window.api.setPreferences({ projectsBaseFolder: partial.projectsBaseFolder })
      }
      if (partial.autosaveMinutes !== undefined) {
        void window.api.setPreferences({ autosaveMinutes: partial.autosaveMinutes })
        armAutosave(partial.autosaveMinutes)
      }
    }
  })
  indexSidebar = createIndexSidebar(el.indexRoot, {
    onOpenFile: (path) => {
      void openPath(path)
    },
    onJump: (entry) => {
      const draft = currentDraftDoc()
      if (!draft || !entry.line) return
      let pane = panes.find((p) => p.docId === draft.id)
      if (!pane) {
        pane = panes[0]
        if (pane) loadDocIntoPane(pane, draft)
      }
      pane?.editor.setCursorLine(entry.line)
    }
  })
  notesSidebar = createNotesSidebar(el.notesRoot, {
    onChange: (markdown) => {
      const notes = notesDocId ? docs.find((d) => d.id === notesDocId) : undefined
      if (!notes) return
      notes.content = markdown
      markDirty(notes, true)
    }
  })

  syntaxCoach = createSyntaxCoachBar(el.syntaxCoach, (collapsed) => {
    void window.api.setPreferences({ syntaxCoachCollapsed: collapsed })
  })
  syntaxCoach.setCollapsed(Boolean(prefs.syntaxCoachCollapsed))

  applyLocale(locale)
  applyFontSize(editorFontSize, false)
  setIndexVisible(indexVisible, false)
  setNotesVisible(notesVisible, false)
  setupResizer()
  armAutosave(autosaveMinutes)

  const restored = await window.api.restoreProject()
  if (restored) {
    await loadProject(restored)
    showWelcome(false)
  } else {
    const startup = await window.api.getStartupDocument()
    const doc = addDoc({
      path: startup.path,
      name: startup.path
        ? startup.path.split(/[/\\]/).pop() || 'Untitled'
        : t(locale, 'status.untitled'),
      content: startup.content,
      dirty: false,
      kind: kindFromPath(startup.path),
      isCurrentDraft: Boolean(startup.path && startup.path.endsWith('.fountain'))
    })
    if (panes.length === 0) {
      panes.push(createPane(doc))
      focusedPaneId = panes[0].id
    }
    refreshPreviewAndIndex()
    const first = !prefs.hasCompletedFirstRun || !prefs.projectsBaseFolder
    showWelcome(first || Boolean(startup.fromTemplate))
  }

  el.btnPreview.addEventListener('click', () => {
    if (rightPaneMode === 'help') setRightPaneMode('preview')
    else setPreviewVisible(!previewVisible)
  })
  el.btnSyntaxHelp.addEventListener('click', () => {
    setRightPaneMode(rightPaneMode === 'help' ? 'preview' : 'help')
  })
  el.btnIndex.addEventListener('click', () => setIndexVisible(!indexVisible))
  el.btnNotes.addEventListener('click', () => setNotesVisible(!notesVisible))
  el.btnSyntaxColors?.addEventListener('click', () => syntaxSettings?.open())
  el.btnSettings.addEventListener('click', () =>
    workspaceSettings.open({
      projectsBaseFolder: el.firstRunFolder.value,
      autosaveMinutes
    })
  )
  el.btnHelp.addEventListener('click', () => helpPanel.open())
  el.btnSplit1.addEventListener('click', () => setSplitCount(1))
  el.btnSplit2.addEventListener('click', () => setSplitCount(2))
  el.btnSplit3.addEventListener('click', () => setSplitCount(3))
  el.btnTheme.addEventListener('click', () => {
    const order: ThemeMode[] = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    applyTheme(next)
    void window.api.setPreferences({ theme: next })
  })
  el.btnFind.addEventListener('click', () => focusedEditor()?.openFind())
  el.btnReplace.addEventListener('click', () => focusedEditor()?.openFindReplace())
  el.btnFontInc.addEventListener('click', () => bumpFont(FONT_SIZE_STEP))
  el.btnFontDec.addEventListener('click', () => bumpFont(-FONT_SIZE_STEP))
  el.statusFind.addEventListener('click', () => focusedEditor()?.openFind())
  el.statusReplace.addEventListener('click', () => focusedEditor()?.openFindReplace())
  el.statusFontInc.addEventListener('click', () => bumpFont(FONT_SIZE_STEP))
  el.statusFontDec.addEventListener('click', () => bumpFont(-FONT_SIZE_STEP))

  el.firstRunBrowse.addEventListener('click', () => {
    void window.api.chooseProjectsFolder().then((r) => {
      if (!r.cancelled && r.path) el.firstRunFolder.value = r.path
    })
  })
  el.welcomeNew.addEventListener('click', () => {
    welcomeDismissed = true
    void doNewProject()
  })
  el.welcomeOpen.addEventListener('click', () => {
    welcomeDismissed = true
    void doOpenProject()
  })
  el.welcomeOpenFile.addEventListener('click', () => {
    welcomeDismissed = true
    void doOpenFile()
  })
  el.welcomeDismiss.addEventListener('click', () => {
    welcomeDismissed = true
    showWelcome(false)
    focusedEditor()?.focus()
  })

  window.api.onMenuAction(handleMenuAction)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme === 'system') applyTheme('system')
  })
  window.api.onPreferencesChanged((p) => {
    if (p.locale !== locale) applyLocale(p.locale)
    if (p.theme !== theme) applyTheme(p.theme)
    if (p.previewVisible !== previewVisible) {
      previewVisible = p.previewVisible
      refreshPreviewAndIndex()
    }
    if (p.rightPaneMode && p.rightPaneMode !== rightPaneMode) {
      rightPaneMode = p.rightPaneMode
      refreshPreviewAndIndex()
    }
    if (p.previewFollow !== previewFollow) setPreviewFollow(p.previewFollow, false)
    if (p.typewriterMode !== typewriterMode) setTypewriter(p.typewriterMode, false)
    if (p.syntaxHighlighting !== syntaxHighlighting) setSyntax(p.syntaxHighlighting, false)
    if (p.indexVisible !== indexVisible) setIndexVisible(p.indexVisible, false)
    if (p.notesVisible !== notesVisible) setNotesVisible(p.notesVisible, false)
    if (p.syntaxCoachCollapsed !== syntaxCoach.isCollapsed()) {
      syntaxCoach.setCollapsed(p.syntaxCoachCollapsed)
    }
    if (p.autosaveMinutes !== autosaveMinutes) armAutosave(p.autosaveMinutes)
    if (p.projectsBaseFolder && p.projectsBaseFolder !== el.firstRunFolder.value) {
      el.firstRunFolder.value = p.projectsBaseFolder
    }
    if (p.editorFontSize !== editorFontSize) applyFontSize(p.editorFontSize, false)
  })

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      helpPanel.open()
    }
  })

  focusedEditor()?.focus()
  refreshSyntaxCoach()
}

void bootstrap()
