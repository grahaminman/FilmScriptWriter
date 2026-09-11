import { app, BrowserWindow, ipcMain, screen, shell } from 'electron'
import { join } from 'path'
import {
  DEFAULT_WINDOW_BOUNDS,
  IPC,
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH
} from '../shared/constants/screenplay'
import {
  confirmDiscard,
  getDocumentState,
  restartScriptsWatcher,
  setScriptsWatchHandler
} from './file-service'
import { registerIpcHandlers } from './ipc'
import { buildApplicationMenu } from './menu'
import {
  applySpellcheckToSession,
  initSpellcheck,
  installSpellcheckContextMenu,
  registerHunspellPath
} from './spellcheck'
import { getPreferences, setPreference } from './store'

if (process.platform === 'linux') {
  app.disableHardwareAcceleration()
  app.commandLine.appendSwitch('disable-gpu')
  app.commandLine.appendSwitch('disable-gpu-sandbox')
}

let mainWindow: BrowserWindow | null = null
let skipClosePrompt = false
let appIsQuitting = false
let persistTimer: ReturnType<typeof setTimeout> | null = null

function clampBoundsToDisplay(b: {
  width: number
  height: number
  x?: number
  y?: number
}): { width: number; height: number; x?: number; y?: number } {
  const probe = {
    x: b.x ?? 0,
    y: b.y ?? 0,
    width: Math.max(MIN_WINDOW_WIDTH, b.width || DEFAULT_WINDOW_BOUNDS.width),
    height: Math.max(MIN_WINDOW_HEIGHT, b.height || DEFAULT_WINDOW_BOUNDS.height)
  }
  const work = screen.getDisplayMatching(probe).workArea
  const width = Math.min(Math.max(MIN_WINDOW_WIDTH, probe.width), work.width)
  const height = Math.min(Math.max(MIN_WINDOW_HEIGHT, probe.height), work.height)
  let x = typeof b.x === 'number' ? b.x : work.x
  let y = typeof b.y === 'number' ? b.y : work.y
  if (x + width < work.x + 80) x = work.x
  if (y + 40 < work.y) y = work.y
  if (x > work.x + work.width - 80) x = work.x + Math.max(0, work.width - width)
  if (y > work.y + work.height - 80) y = work.y + Math.max(0, work.height - height)
  return { width, height, x, y }
}

let lastNormalBounds: {
  width: number
  height: number
  x?: number
  y?: number
} | null = null

function captureNormalBounds(): typeof lastNormalBounds {
  if (!mainWindow || mainWindow.isDestroyed()) return lastNormalBounds
  if (mainWindow.isMinimized() || mainWindow.isMaximized() || mainWindow.isFullScreen()) {
    return lastNormalBounds
  }
  lastNormalBounds = clampBoundsToDisplay(mainWindow.getBounds())
  return lastNormalBounds
}

function persistNormalBounds(): void {
  const next = captureNormalBounds()
  if (!next) return
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    setPreference('windowBounds', next)
  }, 300)
}

function persistBoundsNow(): void {
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  const next = captureNormalBounds() ?? lastNormalBounds
  if (next) setPreference('windowBounds', next)
}

function createWindow(): void {
  const prefs = getPreferences()
  const bounds = clampBoundsToDisplay(prefs.windowBounds)

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    show: false,
    title: 'FilmScriptWriter',
    backgroundColor: '#F4F2EE',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('resize', persistNormalBounds)
  mainWindow.on('move', persistNormalBounds)
  mainWindow.on('unmaximize', persistNormalBounds)

  mainWindow.on('close', (e) => {
    persistBoundsNow()
    if (skipClosePrompt) return
    const state = getDocumentState()
    if (!state.dirty) return
    e.preventDefault()
    void (async () => {
      if (!mainWindow) return
      const choice = await confirmDiscard(mainWindow)
      if (choice === 'cancel') {
        appIsQuitting = false
        return
      }
      if (choice === 'save') {
        mainWindow.webContents.send(IPC.MENU_ACTION, 'file:save-then-quit')
        return
      }
      skipClosePrompt = true
      if (appIsQuitting) {
        app.quit()
      } else {
        mainWindow.destroy()
        skipClosePrompt = false
      }
    })()
  })

  buildApplicationMenu(mainWindow)
  applySpellcheckToSession(mainWindow.webContents.session)
  installSpellcheckContextMenu(mainWindow)

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

registerHunspellPath()

app.on('before-quit', () => {
  appIsQuitting = true
})

app.on('will-quit', () => {
  persistBoundsNow()
})

app.whenReady().then(() => {
  registerIpcHandlers()
  ipcMain.handle(IPC.APP_QUIT, () => {
    skipClosePrompt = true
    persistBoundsNow()
    if (appIsQuitting) {
      app.quit()
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy()
      skipClosePrompt = false
    }
  })
  ipcMain.handle(IPC.APP_ABORT_QUIT, () => {
    appIsQuitting = false
  })
  void initSpellcheck().catch((err) => {
    console.warn('[spellcheck] init failed:', err)
  })
  createWindow()
  setScriptsWatchHandler(() => {
    const win = mainWindow
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.FILE_SCRIPTS_CHANGED)
    }
  })
  restartScriptsWatcher()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const allowed =
      url.startsWith('http://localhost') ||
      url.startsWith('file://') ||
      Boolean(
        process.env.ELECTRON_RENDERER_URL &&
          url.startsWith(process.env.ELECTRON_RENDERER_URL)
      )
    if (!allowed) event.preventDefault()
  })
})
