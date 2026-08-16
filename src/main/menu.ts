/**
 * Native application menu bar.
 *
 * Builds File / Edit / View / Export / Theme / Language / Settings / Help
 * menus with translated labels. Menu actions are forwarded to the renderer
 * via IPC (`menu:action`).
 */

import {
  app,
  BrowserWindow,
  Menu,
  shell,
  type MenuItemConstructorOptions
} from 'electron'
import { IPC, type LocaleCode, type ThemeMode } from '../shared/constants/screenplay'
import {
  SPELLCHECK_LANGUAGE_OPTIONS,
  type SpellcheckLanguageId
} from '../shared/constants/spellcheck'
import { t, type MessageKey } from '../shared/i18n/locales'
import { getPreferences, setPreference } from './store'
import {
  applySpellcheckToAllSessions,
  downloadSpellcheckDictionaries
} from './spellcheck'

export type MenuAction =
  | 'file:new'
  | 'file:new-project'
  | 'file:close-project'
  | 'file:open'
  | 'file:open-project'
  | 'file:import-draft'
  | 'file:import-notes'
  | 'file:save'
  | 'file:save-as'
  | 'file:export-fountain'
  | 'file:export-fdx'
  | 'file:export-pdf'
  | 'edit:undo'
  | 'edit:redo'
  | 'edit:cut'
  | 'edit:copy'
  | 'edit:paste'
  | 'edit:select-all'
  | 'edit:find'
  | 'edit:find-replace'
  | 'view:toggle-preview'
  | 'view:syntax-help'
  | 'view:toggle-index'
  | 'view:toggle-notes'
  | 'view:toggle-syntax-coach'
  | 'view:split-1'
  | 'view:split-2'
  | 'view:split-3'
  | 'view:preview-follow'
  | 'view:typewriter'
  | 'view:syntax'
  | 'view:syntax-colors'
  | 'view:font-increase'
  | 'view:font-decrease'
  | 'view:font-reset'
  | 'view:reload'
  | 'view:devtools'
  | 'theme:light'
  | 'theme:dark'
  | 'theme:system'
  | 'language:en_GB'
  | 'language:es_PY'
  | 'language:fr_FR'
  | 'help:about'
  | 'help:guide'
  | 'help:check-updates'
  | 'settings:workspace'

export interface MenuState {
  dirty: boolean
  hasPath: boolean
  canUndo: boolean
  canRedo: boolean
}

const defaultMenuState: MenuState = {
  dirty: false,
  hasPath: false,
  canUndo: false,
  canRedo: false
}

let currentMenuState: MenuState = { ...defaultMenuState }

function send(win: BrowserWindow | null, action: MenuAction): void {
  if (win && !win.isDestroyed()) {
    win.webContents.send(IPC.MENU_ACTION, action)
  }
}

function tr(key: MessageKey): string {
  return t(getPreferences().locale, key)
}

/**
 * Build and install the application menu for the given window.
 */
export function buildApplicationMenu(
  win: BrowserWindow | null,
  state: Partial<MenuState> = {}
): void {
  currentMenuState = { ...currentMenuState, ...state }
  const prefs = getPreferences()
  const isMac = process.platform === 'darwin'

  const fileMenu: MenuItemConstructorOptions = {
    label: tr('menu.file'),
    submenu: [
      {
        label: tr('menu.file.newProject'),
        accelerator: 'CmdOrCtrl+N',
        click: () => send(win, 'file:new-project')
      },
      {
        label: tr('menu.file.closeProject'),
        click: () => send(win, 'file:close-project')
      },
      {
        label: tr('menu.file.new'),
        accelerator: 'CmdOrCtrl+Shift+N',
        click: () => send(win, 'file:new')
      },
      {
        label: tr('menu.file.openProject'),
        accelerator: 'CmdOrCtrl+Shift+O',
        click: () => send(win, 'file:open-project')
      },
      {
        label: tr('menu.file.open'),
        accelerator: 'CmdOrCtrl+O',
        click: () => send(win, 'file:open')
      },
      {
        label: tr('menu.file.importDraft'),
        click: () => send(win, 'file:import-draft')
      },
      {
        label: tr('menu.file.importNotes'),
        click: () => send(win, 'file:import-notes')
      },
      { type: 'separator' },
      {
        label: tr('menu.file.save'),
        accelerator: 'CmdOrCtrl+S',
        enabled: true,
        click: () => send(win, 'file:save')
      },
      {
        label: tr('menu.file.saveAs'),
        accelerator: 'CmdOrCtrl+Shift+S',
        click: () => send(win, 'file:save-as')
      },
      { type: 'separator' },
      isMac
        ? { role: 'close', label: tr('common.close') }
        : {
            label: tr('menu.file.quit'),
            accelerator: 'Alt+F4',
            click: () => app.quit()
          }
    ]
  }

  const editMenu: MenuItemConstructorOptions = {
    label: tr('menu.edit'),
    submenu: [
      {
        label: tr('menu.edit.undo'),
        accelerator: 'CmdOrCtrl+Z',
        enabled: currentMenuState.canUndo,
        click: () => send(win, 'edit:undo')
      },
      {
        label: tr('menu.edit.redo'),
        accelerator: 'CmdOrCtrl+Shift+Z',
        enabled: currentMenuState.canRedo,
        click: () => send(win, 'edit:redo')
      },
      { type: 'separator' },
      {
        label: tr('menu.edit.cut'),
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: tr('menu.edit.copy'),
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: tr('menu.edit.paste'),
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: tr('menu.edit.selectAll'),
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll'
      },
      { type: 'separator' },
      {
        label: tr('menu.edit.find'),
        accelerator: 'CmdOrCtrl+F',
        click: () => send(win, 'edit:find')
      },
      {
        label: tr('menu.edit.findReplace'),
        accelerator: 'CmdOrCtrl+H',
        click: () => send(win, 'edit:find-replace')
      }
    ]
  }

  const viewMenu: MenuItemConstructorOptions = {
    label: tr('menu.view'),
    submenu: [
      {
        label: tr('menu.view.preview'),
        accelerator: 'CmdOrCtrl+P',
        click: () => send(win, 'view:toggle-preview')
      },
      {
        label: tr('menu.view.syntaxHelp'),
        accelerator: 'CmdOrCtrl+Shift+P',
        type: 'checkbox',
        checked: prefs.rightPaneMode === 'help',
        click: () => send(win, 'view:syntax-help')
      },
      {
        label: tr('menu.view.index'),
        type: 'checkbox',
        checked: prefs.indexVisible,
        click: () => {
          const next = !getPreferences().indexVisible
          setPreference('indexVisible', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:toggle-index')
        }
      },
      {
        label: tr('menu.view.notes'),
        type: 'checkbox',
        checked: prefs.notesVisible,
        click: () => {
          const next = !getPreferences().notesVisible
          setPreference('notesVisible', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:toggle-notes')
        }
      },
      {
        label: tr('menu.view.syntaxCoach'),
        type: 'checkbox',
        checked: !prefs.syntaxCoachCollapsed,
        click: () => {
          const next = !getPreferences().syntaxCoachCollapsed
          setPreference('syntaxCoachCollapsed', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:toggle-syntax-coach')
        }
      },
      { type: 'separator' },
      {
        label: tr('menu.view.split1'),
        accelerator: 'CmdOrCtrl+1',
        click: () => send(win, 'view:split-1')
      },
      {
        label: tr('menu.view.split2'),
        accelerator: 'CmdOrCtrl+2',
        click: () => send(win, 'view:split-2')
      },
      {
        label: tr('menu.view.split3'),
        accelerator: 'CmdOrCtrl+3',
        click: () => send(win, 'view:split-3')
      },
      { type: 'separator' },
      {
        label: tr('menu.view.previewFollow'),
        type: 'checkbox',
        checked: prefs.previewFollow,
        click: () => {
          const next = !getPreferences().previewFollow
          setPreference('previewFollow', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:preview-follow')
        }
      },
      {
        label: tr('menu.view.typewriter'),
        type: 'checkbox',
        checked: prefs.typewriterMode,
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          const next = !getPreferences().typewriterMode
          setPreference('typewriterMode', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:typewriter')
        }
      },
      {
        label: tr('menu.view.syntax'),
        type: 'checkbox',
        checked: prefs.syntaxHighlighting,
        click: () => {
          const next = !getPreferences().syntaxHighlighting
          setPreference('syntaxHighlighting', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:syntax')
        }
      },
      {
        label: tr('menu.view.syntaxColors'),
        click: () => send(win, 'view:syntax-colors')
      },
      { type: 'separator' },
      {
        label: tr('menu.view.fontIncrease'),
        accelerator: 'CmdOrCtrl+=',
        click: () => send(win, 'view:font-increase')
      },
      {
        label: tr('menu.view.fontDecrease'),
        accelerator: 'CmdOrCtrl+-',
        click: () => send(win, 'view:font-decrease')
      },
      {
        label: tr('menu.view.fontReset'),
        accelerator: 'CmdOrCtrl+0',
        click: () => send(win, 'view:font-reset')
      },
      { type: 'separator' },
      {
        label: tr('menu.view.reload'),
        accelerator: 'CmdOrCtrl+R',
        click: () => send(win, 'view:reload')
      },
      {
        label: tr('menu.view.toggleDevTools'),
        accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: () => {
          win?.webContents.toggleDevTools()
        }
      }
    ]
  }

  // Settings mirrors the most-used View toggles for discoverability.
  // Font size changes are applied in the renderer (single source of truth).
  const settingsMenu: MenuItemConstructorOptions = {
    label: tr('menu.settings'),
    submenu: [
      {
        label: tr('menu.view.fontIncrease'),
        click: () => send(win, 'view:font-increase')
      },
      {
        label: tr('menu.view.fontDecrease'),
        click: () => send(win, 'view:font-decrease')
      },
      {
        label: tr('menu.view.fontReset'),
        click: () => send(win, 'view:font-reset')
      },
      { type: 'separator' },
      {
        label: tr('menu.view.previewFollow'),
        type: 'checkbox',
        checked: prefs.previewFollow,
        click: () => {
          const next = !getPreferences().previewFollow
          setPreference('previewFollow', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:preview-follow')
        }
      },
      {
        label: tr('menu.view.typewriter'),
        type: 'checkbox',
        checked: prefs.typewriterMode,
        click: () => {
          const next = !getPreferences().typewriterMode
          setPreference('typewriterMode', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:typewriter')
        }
      },
      {
        label: tr('menu.view.syntax'),
        type: 'checkbox',
        checked: prefs.syntaxHighlighting,
        click: () => {
          const next = !getPreferences().syntaxHighlighting
          setPreference('syntaxHighlighting', next)
          buildApplicationMenu(win, currentMenuState)
          send(win, 'view:syntax')
        }
      },
      {
        label: tr('menu.view.syntaxColors'),
        click: () => send(win, 'view:syntax-colors')
      },
      { type: 'separator' },
      {
        label: tr('menu.settings.spellcheck'),
        submenu: [
          {
            label: tr('settings.spellcheckEnabled'),
            type: 'checkbox',
            checked: prefs.spellcheckEnabled,
            click: () => {
              setPreference(
                'spellcheckEnabled',
                !getPreferences().spellcheckEnabled
              )
              applySpellcheckToAllSessions()
              buildApplicationMenu(win, currentMenuState)
            }
          },
          { type: 'separator' },
          ...SPELLCHECK_LANGUAGE_OPTIONS.map((opt) => ({
            label: tr(spellcheckLabelKey(opt.id)),
            type: 'checkbox' as const,
            checked: prefs.spellcheckLanguages.includes(opt.id),
            click: () => {
              toggleSpellcheckLanguage(opt.id)
              applySpellcheckToAllSessions()
              buildApplicationMenu(win, currentMenuState)
            }
          })),
          { type: 'separator' },
          {
            label: tr('settings.spellcheckDownload'),
            click: () => {
              void downloadSpellcheckDictionaries()
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: tr('menu.settings.workspace'),
        click: () => send(win, 'settings:workspace')
      }
    ]
  }

  const exportMenu: MenuItemConstructorOptions = {
    label: tr('menu.export'),
    submenu: [
      {
        label: tr('menu.export.fountain'),
        click: () => send(win, 'file:export-fountain')
      },
      {
        label: tr('menu.export.fdx'),
        click: () => send(win, 'file:export-fdx')
      },
      {
        label: tr('menu.export.pdf'),
        click: () => send(win, 'file:export-pdf')
      }
    ]
  }

  const themeMenu: MenuItemConstructorOptions = {
    label: tr('menu.theme'),
    submenu: (
      [
        ['light', 'menu.theme.light'],
        ['dark', 'menu.theme.dark'],
        ['system', 'menu.theme.system']
      ] as [ThemeMode, MessageKey][]
    ).map(([mode, key]) => ({
      label: tr(key),
      type: 'radio' as const,
      checked: prefs.theme === mode,
      click: () => {
        setPreference('theme', mode)
        send(win, `theme:${mode}` as MenuAction)
      }
    }))
  }

  const languageMenu: MenuItemConstructorOptions = {
    label: tr('menu.language'),
    submenu: (
      [
        ['en_GB', 'menu.language.en_GB'],
        ['es_PY', 'menu.language.es_PY'],
        ['fr_FR', 'menu.language.fr_FR']
      ] as [LocaleCode, MessageKey][]
    ).map(([code, key]) => ({
      label: tr(key),
      type: 'radio' as const,
      checked: prefs.locale === code,
      click: () => {
        setPreference('locale', code)
        buildApplicationMenu(win, currentMenuState)
        send(win, `language:${code}` as MenuAction)
      }
    }))
  }

  const helpMenu: MenuItemConstructorOptions = {
    label: tr('menu.help'),
    submenu: [
      {
        label: tr('menu.help.guide'),
        accelerator: 'CmdOrCtrl+/',
        click: () => send(win, 'help:guide')
      },
      {
        label: tr('menu.help.about'),
        click: () => send(win, 'help:about')
      },
      {
        label: tr('menu.help.checkUpdates'),
        click: () => send(win, 'help:check-updates')
      },
      { type: 'separator' },
      {
        label: 'Fountain Syntax',
        click: () => {
          void shell.openExternal('https://fountain.io/syntax')
        }
      }
    ]
  }

  const template: MenuItemConstructorOptions[] = []

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  template.push(
    fileMenu,
    editMenu,
    viewMenu,
    settingsMenu,
    exportMenu,
    themeMenu,
    languageMenu,
    helpMenu
  )

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

/**
 * Update enable/disable states without a full preference change.
 */
export function updateMenuState(
  win: BrowserWindow | null,
  state: Partial<MenuState>
): void {
  buildApplicationMenu(win, state)
}

export function getMenuState(): MenuState {
  return { ...currentMenuState }
}

function spellcheckLabelKey(id: SpellcheckLanguageId): MessageKey {
  if (id === 'en-US') return 'settings.spellcheckEnUS'
  if (id === 'es-419') return 'settings.spellcheckEs'
  return 'settings.spellcheckEnGB'
}

function toggleSpellcheckLanguage(id: SpellcheckLanguageId): void {
  const current = getPreferences().spellcheckLanguages
  const next = current.includes(id)
    ? current.filter((code) => code !== id)
    : [...current, id]
  setPreference('spellcheckLanguages', next)
}
