import { app, BrowserWindow, dialog } from 'electron'
import { watch, type FSWatcher } from 'fs'
import * as fs from 'fs/promises'
import * as path from 'path'
import {
  OPEN_FILTERS,
  SAVE_FOUNTAIN_FILTERS,
  SAVE_PDF_FILTERS
} from '../shared/constants/screenplay'
import { prepareFountainExport } from '../shared/export/fountain-export'
import { fountainToPdf } from '../shared/export/pdf'
import { t } from '../shared/i18n/locales'
import type { TemplateId } from '../shared/templates/text'
import { pathExists } from './path-exists'
import {
  listScriptsTree,
  type ScriptFileInfo,
  type ScriptTreeNode
} from './scripts-tree'
import { getPreferences, setPreference } from './store'
import { loadTemplate, suggestedScriptsFolder } from './templates'

export type { ScriptFileInfo, ScriptTreeNode }

export interface DocumentState {
  filePath: string | null
  dirty: boolean
}

export interface FileResult {
  cancelled: boolean
  content?: string
  path?: string | null
  error?: string
  fromTemplate?: boolean
  templateId?: TemplateId
}

let documentState: DocumentState = {
  filePath: null,
  dirty: false
}

export function getDocumentState(): DocumentState {
  return { ...documentState }
}

export function setDocumentDirty(dirty: boolean): DocumentState {
  documentState.dirty = dirty
  return getDocumentState()
}

export function setDocumentPath(filePath: string | null): DocumentState {
  documentState.filePath = filePath
  if (filePath) {
    setPreference('lastDirectory', path.dirname(filePath))
    setPreference('lastFilePath', filePath)
  }
  return getDocumentState()
}

export function resetDocument(): DocumentState {
  documentState = { filePath: null, dirty: false }
  return getDocumentState()
}

function locale(): ReturnType<typeof getPreferences>['locale'] {
  return getPreferences().locale
}

function defaultDir(): string {
  const prefs = getPreferences()
  if (prefs.scriptsFolder) return prefs.scriptsFolder
  if (prefs.lastDirectory) return prefs.lastDirectory
  return app.getPath('documents')
}

export async function getStartupDocument(): Promise<{
  content: string
  path: string | null
  fromTemplate: boolean
}> {
  const last = getPreferences().lastFilePath
  if (last && (await pathExists(last))) {
    try {
      const content = await fs.readFile(last, 'utf8')
      setDocumentPath(last)
      documentState.dirty = false
      return { content, path: last, fromTemplate: false }
    } catch (err) {
      console.warn('[startup] could not reopen last file:', err)
    }
  }
  resetDocument()
  return { content: '', path: null, fromTemplate: false }
}

export async function newFromTemplate(id: TemplateId): Promise<FileResult> {
  const content = await loadTemplate(id)
  resetDocument()
  return { cancelled: false, content, path: null, fromTemplate: true, templateId: id }
}

export async function openFileDialog(win: BrowserWindow): Promise<FileResult> {
  const result = await dialog.showOpenDialog(win, {
    title: t(locale(), 'menu.file.open'),
    defaultPath: defaultDir(),
    filters: OPEN_FILTERS,
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) {
    return { cancelled: true }
  }
  return openPath(result.filePaths[0])
}

export async function openPath(filePath: string): Promise<FileResult> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    setDocumentPath(filePath)
    documentState.dirty = false
    return { cancelled: false, content, path: filePath }
  } catch (err) {
    return {
      cancelled: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export async function saveFile(
  win: BrowserWindow,
  content: string,
  forceSaveAs = false
): Promise<FileResult> {
  let target = forceSaveAs ? null : documentState.filePath
  if (!target) {
    const result = await dialog.showSaveDialog(win, {
      title: t(locale(), forceSaveAs ? 'menu.file.saveAs' : 'menu.file.save'),
      defaultPath: path.join(defaultDir(), 'Untitled.fountain'),
      filters: SAVE_FOUNTAIN_FILTERS
    })
    if (result.canceled || !result.filePath) return { cancelled: true }
    target = result.filePath
  }
  try {
    const body = prepareFountainExport(content)
    await fs.writeFile(target, body, 'utf8')
    setDocumentPath(target)
    documentState.dirty = false
    return { cancelled: false, path: target, content: body }
  } catch (err) {
    return {
      cancelled: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export async function exportFountain(
  win: BrowserWindow,
  content: string
): Promise<FileResult> {
  const result = await dialog.showSaveDialog(win, {
    title: t(locale(), 'menu.export.fountain'),
    defaultPath: path.join(defaultDir(), 'screenplay.fountain'),
    filters: SAVE_FOUNTAIN_FILTERS
  })
  if (result.canceled || !result.filePath) return { cancelled: true }
  try {
    const body = prepareFountainExport(content)
    await fs.writeFile(result.filePath, body, 'utf8')
    return { cancelled: false, path: result.filePath }
  } catch (err) {
    return {
      cancelled: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export async function exportPdf(
  win: BrowserWindow,
  content: string
): Promise<FileResult> {
  const result = await dialog.showSaveDialog(win, {
    title: t(locale(), 'menu.export.pdf'),
    defaultPath: path.join(defaultDir(), 'screenplay.pdf'),
    filters: SAVE_PDF_FILTERS
  })
  if (result.canceled || !result.filePath) return { cancelled: true }
  try {
    const buffer = await fountainToPdf(content)
    await fs.writeFile(result.filePath, buffer)
    return { cancelled: false, path: result.filePath }
  } catch (err) {
    return {
      cancelled: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export async function confirmDiscard(
  win: BrowserWindow
): Promise<'save' | 'discard' | 'cancel'> {
  const loc = locale()
  const result = await dialog.showMessageBox(win, {
    type: 'question',
    buttons: [
      t(loc, 'dialog.unsaved.save'),
      t(loc, 'dialog.unsaved.discard'),
      t(loc, 'dialog.unsaved.cancel')
    ],
    defaultId: 0,
    cancelId: 2,
    title: t(loc, 'dialog.unsaved.title'),
    message: t(loc, 'dialog.unsaved.message'),
    noLink: true
  })
  if (result.response === 0) return 'save'
  if (result.response === 1) return 'discard'
  return 'cancel'
}

export async function showError(win: BrowserWindow, message: string): Promise<void> {
  await dialog.showMessageBox(win, {
    type: 'error',
    title: t(locale(), 'dialog.error.title'),
    message,
    buttons: [t(locale(), 'common.ok')]
  })
}

export async function listScriptsFolder(): Promise<{
  folder: string
  files: ScriptFileInfo[]
  tree: ScriptTreeNode[]
  missing: boolean
}> {
  const folder = getPreferences().scriptsFolder
  if (!folder) return { folder: '', files: [], tree: [], missing: false }
  if (!(await pathExists(folder))) {
    return { folder, files: [], tree: [], missing: true }
  }
  try {
    const listed = await listScriptsTree(folder)
    syncScriptsWatchDirs(listed.dirs)
    return { folder, files: listed.files, tree: listed.tree, missing: false }
  } catch {
    return { folder, files: [], tree: [], missing: true }
  }
}

export async function chooseScriptsFolder(win: BrowserWindow): Promise<FileResult> {
  const result = await dialog.showOpenDialog(win, {
    title: t(locale(), 'settings.scriptsFolder'),
    defaultPath: getPreferences().scriptsFolder || suggestedScriptsFolder(),
    properties: ['openDirectory', 'createDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) {
    return { cancelled: true }
  }
  const folder = result.filePaths[0]
  setPreference('scriptsFolder', folder)
  restartScriptsWatcher()
  return { cancelled: false, path: folder }
}

export async function useDefaultScriptsFolder(): Promise<FileResult> {
  const folder = suggestedScriptsFolder()
  await fs.mkdir(folder, { recursive: true })
  setPreference('scriptsFolder', folder)
  restartScriptsWatcher()
  return { cancelled: false, path: folder }
}

let scriptsWatcher: FSWatcher | null = null
let extraWatchers = new Map<string, FSWatcher>()
let watchRecursive = false
let watchTimer: ReturnType<typeof setTimeout> | null = null
let watchCallback: (() => void) | null = null

export function setScriptsWatchHandler(cb: () => void): void {
  watchCallback = cb
}

function notifyScriptsChanged(): void {
  if (watchTimer) clearTimeout(watchTimer)
  watchTimer = setTimeout(() => watchCallback?.(), 300)
}

function closeExtraWatchers(): void {
  for (const w of extraWatchers.values()) {
    try {
      w.close()
    } catch {
      /* already closed */
    }
  }
  extraWatchers.clear()
}

function watchDir(dir: string): FSWatcher | null {
  try {
    const w = watch(dir, notifyScriptsChanged)
    w.on('error', () => {
      extraWatchers.delete(path.resolve(dir))
    })
    return w
  } catch {
    return null
  }
}

function syncScriptsWatchDirs(dirs: string[]): void {
  if (watchRecursive || !watchCallback) return
  const root = path.resolve(getPreferences().scriptsFolder || '')
  const wanted = new Set(
    dirs.map((d) => path.resolve(d)).filter((d) => d !== root)
  )
  for (const [p, w] of extraWatchers) {
    if (wanted.has(p)) continue
    try {
      w.close()
    } catch {
      /* already closed */
    }
    extraWatchers.delete(p)
  }
  for (const p of wanted) {
    if (extraWatchers.has(p)) continue
    const w = watchDir(p)
    if (w) extraWatchers.set(p, w)
  }
}

export function restartScriptsWatcher(): void {
  if (scriptsWatcher) {
    scriptsWatcher.close()
    scriptsWatcher = null
  }
  closeExtraWatchers()
  watchRecursive = false
  const folder = getPreferences().scriptsFolder
  if (!folder || !watchCallback) return
  try {
    scriptsWatcher = watch(folder, { recursive: true }, notifyScriptsChanged)
    watchRecursive = true
  } catch {
    try {
      scriptsWatcher = watch(folder, notifyScriptsChanged)
    } catch {
      scriptsWatcher = null
      return
    }
  }
  scriptsWatcher.on('error', () => {
    scriptsWatcher = null
    watchRecursive = false
  })
}
