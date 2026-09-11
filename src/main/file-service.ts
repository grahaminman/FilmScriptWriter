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
import { getPreferences, setPreference } from './store'
import { loadTemplate, suggestedScriptsFolder } from './templates'

export interface DocumentState {
  filePath: string | null
  dirty: boolean
}

export interface ScriptFileInfo {
  name: string
  path: string
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
  missing: boolean
}> {
  const folder = getPreferences().scriptsFolder
  if (!folder) return { folder: '', files: [], missing: false }
  if (!(await pathExists(folder))) {
    return { folder, files: [], missing: true }
  }
  try {
    const names = await fs.readdir(folder)
    const files: ScriptFileInfo[] = []
    for (const name of names) {
      const ext = path.extname(name).toLowerCase()
      if (ext !== '.fountain' && ext !== '.txt') continue
      const full = path.join(folder, name)
      try {
        const stat = await fs.stat(full)
        if (stat.isFile()) files.push({ name, path: full })
      } catch {
        /* skip unreadable entries */
      }
    }
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    return { folder, files, missing: false }
  } catch {
    return { folder, files: [], missing: true }
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
let watchTimer: ReturnType<typeof setTimeout> | null = null
let watchCallback: (() => void) | null = null

export function setScriptsWatchHandler(cb: () => void): void {
  watchCallback = cb
}

export function restartScriptsWatcher(): void {
  if (scriptsWatcher) {
    scriptsWatcher.close()
    scriptsWatcher = null
  }
  const folder = getPreferences().scriptsFolder
  if (!folder || !watchCallback) return
  try {
    scriptsWatcher = watch(folder, () => {
      if (watchTimer) clearTimeout(watchTimer)
      watchTimer = setTimeout(() => watchCallback?.(), 300)
    })
    scriptsWatcher.on('error', () => {
      scriptsWatcher = null
    })
  } catch {
    scriptsWatcher = null
  }
}
