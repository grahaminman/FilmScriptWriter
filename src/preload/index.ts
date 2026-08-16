/**
 * Preload bridge — exposes a safe, typed API to the renderer via contextBridge.
 */

import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC } from '../shared/constants/screenplay'

export interface DocumentState {
  filePath: string | null
  dirty: boolean
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system'
  locale: 'en_GB' | 'es_PY' | 'fr_FR'
  lastDirectory: string
  lastFilePath: string
  previewVisible: boolean
  previewFollow: boolean
  typewriterMode: boolean
  syntaxHighlighting: boolean
  syntaxColorPreset: 'default' | 'highContrast' | 'soft' | 'custom'
  syntaxColorsCustom: Record<string, string>
  editorFontSize: number
  projectsBaseFolder: string
  hasCompletedFirstRun: boolean
  lastProjectPath: string
  autosaveMinutes: number
  indexVisible: boolean
  notesVisible: boolean
  syntaxCoachCollapsed: boolean
  rightPaneMode: 'preview' | 'help'
  fountainHelpIndexCollapsed: boolean
  windowBounds: { width: number; height: number; x?: number; y?: number }
}

export interface ProjectFileInfo {
  path: string
  name: string
  kind: 'fountain' | 'markdown' | 'pdf' | 'text' | 'other'
  isCurrentDraft: boolean
  isNotes: boolean
  date: string | null
}

export interface ProjectSnapshot {
  projectPath: string
  projectName: string
  files: ProjectFileInfo[]
  currentDraftPath: string | null
  notesPath: string | null
}

export interface FileResult {
  cancelled: boolean
  content?: string
  path?: string | null
  needsSave?: boolean
  then?: string
  error?: string
  fromTemplate?: boolean
}

export interface StartupDocument {
  content: string
  path: string | null
  fromTemplate: boolean
  templatePath: string
}

export interface ElectronAPI {
  getPreferences: () => Promise<AppPreferences>
  setPreferences: (partial: Partial<AppPreferences>) => Promise<AppPreferences>
  onPreferencesChanged: (cb: (prefs: AppPreferences) => void) => () => void

  getDocumentState: () => Promise<DocumentState>
  setDirty: (dirty: boolean) => Promise<DocumentState>

  getStartupDocument: () => Promise<StartupDocument>
  getTemplateDocument: () => Promise<StartupDocument>

  newFile: () => Promise<FileResult>
  openFile: () => Promise<FileResult>
  saveFile: (
    content: string,
    forceSaveAs?: boolean,
    explicitPath?: string | null
  ) => Promise<FileResult>
  saveFileAs: (content: string) => Promise<FileResult>
  exportFountain: (content: string) => Promise<FileResult>
  exportFdx: (content: string) => Promise<FileResult>
  exportPdf: (content: string) => Promise<FileResult>

  getProject: (projectPath?: string) => Promise<ProjectSnapshot | null>
  restoreProject: () => Promise<ProjectSnapshot | null>
  createProject: (
    name: string,
    base?: string
  ) => Promise<FileResult & { project?: ProjectSnapshot }>
  openProject: () => Promise<FileResult & { project?: ProjectSnapshot }>
  listRecentProjects: () => Promise<{ name: string; path: string }[]>
  chooseProjectsFolder: () => Promise<FileResult & { path?: string; defaultPath?: string }>
  importIntoProject: (
    projectPath: string,
    mode: 'draft' | 'notes'
  ) => Promise<FileResult & { project?: ProjectSnapshot }>
  readProjectFile: (filePath: string) => Promise<
    FileResult & {
      kind?: string
      binaryBase64?: string
    }
  >
  writeProjectFile: (filePath: string, content: string) => Promise<FileResult>
  openFileInTab: () => Promise<FileResult>

  getTemplate: () => Promise<
    FileResult & {
      template?: {
        userPath: string
        factoryPath: string
        content: string
        factoryAvailable: boolean
      }
    }
  >
  saveTemplate: (content: string) => Promise<
    FileResult & {
      template?: {
        userPath: string
        factoryPath: string
        content: string
        factoryAvailable: boolean
      }
    }
  >
  revertTemplate: () => Promise<
    FileResult & {
      template?: {
        userPath: string
        factoryPath: string
        content: string
        factoryAvailable: boolean
      }
    }
  >
  chooseTemplateFile: () => Promise<
    FileResult & {
      template?: {
        userPath: string
        factoryPath: string
        content: string
        factoryAvailable: boolean
      }
    }
  >

  confirmDiscard: () => Promise<'save' | 'discard' | 'cancel'>
  showError: (message: string) => Promise<void>
  showAbout: () => Promise<void>
  getVersion: () => Promise<string>
  checkUpdates: () => Promise<void>

  onMenuAction: (cb: (action: string) => void) => () => void
  updateMenuState: (state: {
    dirty?: boolean
    hasPath?: boolean
    canUndo?: boolean
    canRedo?: boolean
  }) => void
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
  getTemplateDocument: () => ipcRenderer.invoke(IPC.FILE_GET_TEMPLATE),

  newFile: () => ipcRenderer.invoke(IPC.FILE_NEW),
  openFile: () => ipcRenderer.invoke(IPC.FILE_OPEN),
  saveFile: (content, forceSaveAs = false, explicitPath = null) =>
    ipcRenderer.invoke(IPC.FILE_SAVE, content, forceSaveAs, explicitPath),
  saveFileAs: (content) => ipcRenderer.invoke(IPC.FILE_SAVE_AS, content),
  exportFountain: (content) => ipcRenderer.invoke(IPC.FILE_EXPORT_FOUNTAIN, content),
  exportFdx: (content) => ipcRenderer.invoke(IPC.FILE_EXPORT_FDX, content),
  exportPdf: (content) => ipcRenderer.invoke(IPC.FILE_EXPORT_PDF, content),

  confirmDiscard: () => ipcRenderer.invoke(IPC.DIALOG_CONFIRM_DISCARD),
  showError: (message) => ipcRenderer.invoke(IPC.DIALOG_SHOW_ERROR, message),
  showAbout: () => ipcRenderer.invoke('help:about'),
  getVersion: () => ipcRenderer.invoke(IPC.APP_GET_VERSION),
  checkUpdates: () => ipcRenderer.invoke(IPC.APP_CHECK_UPDATES),

  onMenuAction: (cb) => {
    const listener = (_e: IpcRendererEvent, action: string): void => cb(action)
    ipcRenderer.on(IPC.MENU_ACTION, listener)
    return () => ipcRenderer.removeListener(IPC.MENU_ACTION, listener)
  },

  updateMenuState: (state) => {
    ipcRenderer.send('menu:update-state', state)
  },

  getProject: (projectPath) => ipcRenderer.invoke(IPC.PROJECT_GET, projectPath),
  restoreProject: () => ipcRenderer.invoke(IPC.PROJECT_RESTORE),
  createProject: (name, base) => ipcRenderer.invoke(IPC.PROJECT_CREATE, name, base),
  openProject: () => ipcRenderer.invoke(IPC.PROJECT_OPEN),
  listRecentProjects: () => ipcRenderer.invoke(IPC.PROJECT_LIST_RECENT),
  chooseProjectsFolder: () => ipcRenderer.invoke(IPC.PROJECT_CHOOSE_BASE),
  importIntoProject: (projectPath, mode) =>
    ipcRenderer.invoke(IPC.PROJECT_IMPORT, projectPath, mode),
  readProjectFile: (filePath) => ipcRenderer.invoke(IPC.PROJECT_READ_FILE, filePath),
  writeProjectFile: (filePath, content) =>
    ipcRenderer.invoke(IPC.PROJECT_WRITE_FILE, filePath, content),
  openFileInTab: () => ipcRenderer.invoke(IPC.PROJECT_OPEN_FILE),

  getTemplate: () => ipcRenderer.invoke(IPC.TEMPLATE_GET),
  saveTemplate: (content) => ipcRenderer.invoke(IPC.TEMPLATE_SAVE, content),
  revertTemplate: () => ipcRenderer.invoke(IPC.TEMPLATE_REVERT),
  chooseTemplateFile: () => ipcRenderer.invoke(IPC.TEMPLATE_CHOOSE)
}

contextBridge.exposeInMainWorld('api', api)
