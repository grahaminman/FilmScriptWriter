import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import {
  DEFAULT_WINDOW_BOUNDS,
  IPC,
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH
} from '../shared/constants/screenplay'
import { confirmDiscard, getDocumentState } from './file-service'
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
let quitting = false

function createWindow(): void {
  const prefs = getPreferences()
  const bounds = prefs.windowBounds

  mainWindow = new BrowserWindow({
    width: bounds.width || DEFAULT_WINDOW_BOUNDS.width,
    height: bounds.height || DEFAULT_WINDOW_BOUNDS.height,
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

  const persistBounds = (): void => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const b = mainWindow.getBounds()
    setPreference('windowBounds', b)
  }
  mainWindow.on('resize', persistBounds)
  mainWindow.on('move', persistBounds)

  mainWindow.on('close', (e) => {
    if (quitting) return
    const state = getDocumentState()
    if (!state.dirty) return
    e.preventDefault()
    void (async () => {
      if (!mainWindow) return
      const choice = await confirmDiscard(mainWindow)
      if (choice === 'cancel') return
      if (choice === 'save') {
        mainWindow.webContents.send(IPC.MENU_ACTION, 'file:save-then-quit')
        return
      }
      quitting = true
      mainWindow.destroy()
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

app.whenReady().then(() => {
  registerIpcHandlers()
  void initSpellcheck().catch((err) => {
    console.warn('[spellcheck] init failed:', err)
  })
  createWindow()

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
