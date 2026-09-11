import { BrowserWindow, app, ipcMain } from 'electron'
import { IPC } from '../shared/constants/screenplay'
import type { TemplateId } from '../shared/templates/text'
import {
  chooseScriptsFolder,
  confirmDiscard,
  exportFountain,
  exportPdf,
  getDocumentState,
  getStartupDocument,
  listScriptsFolder,
  newFromTemplate,
  openFileDialog,
  openPath,
  saveFile,
  setDocumentDirty,
  showError,
  useDefaultScriptsFolder
} from './file-service'
import { buildApplicationMenu } from './menu'
import {
  applySpellcheckToAllSessions,
  downloadSpellcheckDictionaries,
  getSpellcheckStatus,
  openDictionaryFolder
} from './spellcheck'
import { getPreferences, setPreferences } from './store'
import { suggestedScriptsFolder } from './templates'

function winFrom(event: Electron.IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.PREFS_GET, () => getPreferences())
  ipcMain.handle(IPC.PREFS_SET, (event, partial) => {
    const next = setPreferences(partial ?? {})
    const win = winFrom(event)
    if (win && !win.isDestroyed()) {
      buildApplicationMenu(win)
      win.webContents.send(IPC.PREFS_CHANGED, next)
    }
    if (
      partial &&
      (partial.spellcheckEnabled !== undefined ||
        partial.spellcheckLanguages !== undefined ||
        partial.spellcheckDictionaryUrl !== undefined)
    ) {
      applySpellcheckToAllSessions()
    }
    return next
  })

  ipcMain.handle(IPC.FILE_GET_STATE, () => getDocumentState())
  ipcMain.handle(IPC.FILE_SET_DIRTY, (_e, dirty: boolean) => setDocumentDirty(Boolean(dirty)))
  ipcMain.handle(IPC.FILE_GET_STARTUP, () => getStartupDocument())
  ipcMain.handle(IPC.FILE_GET_TEMPLATE, (_e, id: TemplateId) =>
    newFromTemplate(id === 'feature' ? 'feature' : 'short-daily')
  )
  ipcMain.handle(IPC.FILE_NEW, () => newFromTemplate('short-daily'))
  ipcMain.handle(IPC.FILE_OPEN, (event) => {
    const win = winFrom(event)
    if (!win) return { cancelled: true }
    return openFileDialog(win)
  })
  ipcMain.handle(IPC.FILE_OPEN_PATH, (_e, filePath: string) => openPath(filePath))
  ipcMain.handle(IPC.FILE_SAVE, (event, content: string, forceSaveAs?: boolean) => {
    const win = winFrom(event)
    if (!win) return { cancelled: true }
    return saveFile(win, content ?? '', Boolean(forceSaveAs))
  })
  ipcMain.handle(IPC.FILE_SAVE_AS, (event, content: string) => {
    const win = winFrom(event)
    if (!win) return { cancelled: true }
    return saveFile(win, content ?? '', true)
  })
  ipcMain.handle(IPC.FILE_EXPORT_FOUNTAIN, (event, content: string) => {
    const win = winFrom(event)
    if (!win) return { cancelled: true }
    return exportFountain(win, content ?? '')
  })
  ipcMain.handle(IPC.FILE_EXPORT_PDF, (event, content: string) => {
    const win = winFrom(event)
    if (!win) return { cancelled: true }
    return exportPdf(win, content ?? '')
  })
  ipcMain.handle(IPC.FILE_LIST_SCRIPTS, () => listScriptsFolder())

  ipcMain.handle(IPC.DIALOG_CONFIRM_DISCARD, (event) => {
    const win = winFrom(event)
    if (!win) return 'cancel'
    return confirmDiscard(win)
  })
  ipcMain.handle(IPC.DIALOG_SHOW_ERROR, (event, message: string) => {
    const win = winFrom(event)
    if (!win) return
    return showError(win, String(message ?? ''))
  })

  ipcMain.handle(IPC.APP_GET_VERSION, () => app.getVersion())
  ipcMain.handle(IPC.APP_GET_DEFAULT_SCRIPTS, () => suggestedScriptsFolder())

  ipcMain.handle(IPC.SCRIPTS_CHOOSE_FOLDER, (event) => {
    const win = winFrom(event)
    if (!win) return { cancelled: true }
    return chooseScriptsFolder(win)
  })
  ipcMain.handle(IPC.SCRIPTS_USE_DEFAULT, () => useDefaultScriptsFolder())

  ipcMain.handle(IPC.SPELLCHECK_STATUS, () => getSpellcheckStatus())
  ipcMain.handle(IPC.SPELLCHECK_DOWNLOAD, (_e, languages?: string[]) =>
    downloadSpellcheckDictionaries(languages)
  )
  ipcMain.handle(IPC.SPELLCHECK_OPEN_FOLDER, () => openDictionaryFolder())
}
