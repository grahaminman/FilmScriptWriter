import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC, type LocaleCode, type ThemeMode } from '../shared/constants/screenplay'
import type { SyntaxColorPalette, SyntaxColorPresetId } from '../shared/constants/syntax-colors'
import type { SpellcheckLanguageId } from '../shared/constants/spellcheck'
import type { TemplateId } from '../shared/templates/text'

export type RightPaneMode = 'preview' | 'help'

export interface AppPreferences {
  theme: ThemeMode
  locale: LocaleCode
  lastDirectory: string
  lastFilePath: string
  scriptsFolder: string
  filesSidebarVisible: boolean
  previewFollow: boolean
  syntaxHighlighting: boolean
  syntaxColorPreset: SyntaxColorPresetId
  syntaxColorsCustom: SyntaxColorPalette
  editorFontSize: number
  autosaveMinutes: number
  rightPaneMode: RightPaneMode
  fountainHelpIndexCollapsed: boolean
  spellcheckEnabled: boolean
  spellcheckLanguages: SpellcheckLanguageId[]
  spellcheckDictionaryUrl: string
  windowBounds: {
    width: number
    height: number
    x?: number
    y?: number
  }
}

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

export interface SpellcheckFileStatus {
  language: string
  present: boolean
  path: string
}

export interface SpellcheckStatus {
  enabled: boolean
  languages: string[]
  appliedLanguages: string[]
  availableLanguages: string[]
  dictionaryDir: string
  dictionaryUrl: string
  usesHunspell: boolean
  files: SpellcheckFileStatus[]
  lastError: string
}

export interface StartupDocument {
  content: string
  path: string | null
  fromTemplate: boolean
}

export interface ScriptsList {
  folder: string
  files: ScriptFileInfo[]
  missing: boolean
}

export interface ElectronAPI {
  getPreferences: () => Promise<AppPreferences>
  setPreferences: (partial: Partial<AppPreferences>) => Promise<AppPreferences>
  onPreferencesChanged: (cb: (prefs: AppPreferences) => void) => () => void

  getDocumentState: () => Promise<DocumentState>
  setDirty: (dirty: boolean) => Promise<DocumentState>

  getStartupDocument: () => Promise<StartupDocument>
  getTemplate: (id: TemplateId) => Promise<FileResult>

  newFile: () => Promise<FileResult>
  openFile: () => Promise<FileResult>
  openPath: (filePath: string) => Promise<FileResult>
  saveFile: (content: string, forceSaveAs?: boolean) => Promise<FileResult>
  saveFileAs: (content: string) => Promise<FileResult>
  exportFountain: (content: string) => Promise<FileResult>
  exportPdf: (content: string) => Promise<FileResult>
  listScripts: () => Promise<ScriptsList>

  confirmDiscard: () => Promise<'save' | 'discard' | 'cancel'>
  showError: (message: string) => Promise<void>
  getVersion: () => Promise<string>
  getDefaultScriptsFolder: () => Promise<string>

  chooseScriptsFolder: () => Promise<FileResult>
  useDefaultScriptsFolder: () => Promise<FileResult>

  onMenuAction: (cb: (action: string) => void) => () => void
  onScriptsChanged: (cb: () => void) => () => void
  quit: () => Promise<void>
  abortQuit: () => Promise<void>

  getSpellcheckStatus: () => Promise<SpellcheckStatus>
  downloadSpellcheckDictionaries: (languages?: string[]) => Promise<SpellcheckStatus>
  openSpellcheckFolder: () => Promise<void>
}

const api: ElectronAPI = {
  getPreferences: () => ipcRenderer.invoke(IPC.PREFS_GET),
  setPreferences: (partial) => ipcRenderer.invoke(IPC.PREFS_SET, partial),
  onPreferencesChanged: (cb) => {
    const listener = (_e: IpcRendererEvent, prefs: AppPreferences): void => cb(prefs)
    ipcRenderer.on(IPC.PREFS_CHANGED, listener)
    return () => ipcRenderer.removeListener(IPC.PREFS_CHANGED, listener)
  },

  getDocumentState: () => ipcRenderer.invoke(IPC.FILE_GET_STATE),
  setDirty: (dirty) => ipcRenderer.invoke(IPC.FILE_SET_DIRTY, dirty),

  getStartupDocument: () => ipcRenderer.invoke(IPC.FILE_GET_STARTUP),
  getTemplate: (id) => ipcRenderer.invoke(IPC.FILE_GET_TEMPLATE, id),

  newFile: () => ipcRenderer.invoke(IPC.FILE_NEW),
  openFile: () => ipcRenderer.invoke(IPC.FILE_OPEN),
  openPath: (filePath) => ipcRenderer.invoke(IPC.FILE_OPEN_PATH, filePath),
  saveFile: (content, forceSaveAs = false) =>
    ipcRenderer.invoke(IPC.FILE_SAVE, content, forceSaveAs),
  saveFileAs: (content) => ipcRenderer.invoke(IPC.FILE_SAVE_AS, content),
  exportFountain: (content) => ipcRenderer.invoke(IPC.FILE_EXPORT_FOUNTAIN, content),
  exportPdf: (content) => ipcRenderer.invoke(IPC.FILE_EXPORT_PDF, content),
  listScripts: () => ipcRenderer.invoke(IPC.FILE_LIST_SCRIPTS),

  confirmDiscard: () => ipcRenderer.invoke(IPC.DIALOG_CONFIRM_DISCARD),
  showError: (message) => ipcRenderer.invoke(IPC.DIALOG_SHOW_ERROR, message),
  getVersion: () => ipcRenderer.invoke(IPC.APP_GET_VERSION),
  getDefaultScriptsFolder: () => ipcRenderer.invoke(IPC.APP_GET_DEFAULT_SCRIPTS),

  chooseScriptsFolder: () => ipcRenderer.invoke(IPC.SCRIPTS_CHOOSE_FOLDER),
  useDefaultScriptsFolder: () => ipcRenderer.invoke(IPC.SCRIPTS_USE_DEFAULT),

  onMenuAction: (cb) => {
    const listener = (_e: IpcRendererEvent, action: string): void => cb(action)
    ipcRenderer.on(IPC.MENU_ACTION, listener)
    return () => ipcRenderer.removeListener(IPC.MENU_ACTION, listener)
  },
  onScriptsChanged: (cb) => {
    const listener = (): void => cb()
    ipcRenderer.on(IPC.FILE_SCRIPTS_CHANGED, listener)
    return () => ipcRenderer.removeListener(IPC.FILE_SCRIPTS_CHANGED, listener)
  },
  quit: () => ipcRenderer.invoke(IPC.APP_QUIT),
  abortQuit: () => ipcRenderer.invoke(IPC.APP_ABORT_QUIT),

  getSpellcheckStatus: () => ipcRenderer.invoke(IPC.SPELLCHECK_STATUS),
  downloadSpellcheckDictionaries: (languages) =>
    ipcRenderer.invoke(IPC.SPELLCHECK_DOWNLOAD, languages),
  openSpellcheckFolder: () => ipcRenderer.invoke(IPC.SPELLCHECK_OPEN_FOLDER)
}

contextBridge.exposeInMainWorld('api', api)
