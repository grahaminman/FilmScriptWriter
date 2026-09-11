import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'
import { SUPPORTED_LOCALES, type LocaleCode } from '../shared/constants/screenplay'
import { t } from '../shared/i18n/locales'
import { IPC } from '../shared/constants/screenplay'
import { getPreferences, setPreference } from './store'

function send(win: BrowserWindow, action: string): void {
  win.webContents.send(IPC.MENU_ACTION, action)
}

export function buildApplicationMenu(win: BrowserWindow): void {
  const prefs = getPreferences()
  const loc = prefs.locale
  const isMac = process.platform === 'darwin'

  const languageItems: MenuItemConstructorOptions[] = SUPPORTED_LOCALES.map(
    (code) => ({
      label: t(loc, `menu.language.${code}` as const),
      type: 'radio',
      checked: prefs.locale === code,
      click: () => {
        setPreference('locale', code as LocaleCode)
        win.webContents.send(IPC.PREFS_CHANGED, getPreferences())
        buildApplicationMenu(win)
      }
    })
  )

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: t(loc, 'menu.help.about'),
                click: () => send(win, 'help:about')
              },
              { type: 'separator' },
              {
                label: t(loc, 'menu.settings.open'),
                accelerator: 'CmdOrCtrl+,',
                click: () => send(win, 'settings:open')
              },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit', label: t(loc, 'menu.file.quit') }
            ]
          } satisfies MenuItemConstructorOptions
        ]
      : []),
    {
      label: t(loc, 'menu.file'),
      submenu: [
        {
          label: t(loc, 'menu.file.newShort'),
          accelerator: 'CmdOrCtrl+N',
          click: () => send(win, 'file:new-short')
        },
        {
          label: t(loc, 'menu.file.newFeature'),
          click: () => send(win, 'file:new-feature')
        },
        {
          label: t(loc, 'menu.file.open'),
          accelerator: 'CmdOrCtrl+O',
          click: () => send(win, 'file:open')
        },
        { type: 'separator' },
        {
          label: t(loc, 'menu.file.save'),
          accelerator: 'CmdOrCtrl+S',
          click: () => send(win, 'file:save')
        },
        {
          label: t(loc, 'menu.file.saveAs'),
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => send(win, 'file:save-as')
        },
        { type: 'separator' },
        {
          label: t(loc, 'menu.export.fountain'),
          click: () => send(win, 'file:export-fountain')
        },
        {
          label: t(loc, 'menu.export.pdf'),
          click: () => send(win, 'file:export-pdf')
        },
        ...(!isMac
          ? [
              { type: 'separator' } as const,
              {
                label: t(loc, 'menu.file.quit'),
                accelerator: 'CmdOrCtrl+Q',
                role: 'quit'
              } as const
            ]
          : [])
      ]
    },
    {
      label: t(loc, 'menu.edit'),
      submenu: [
        {
          label: t(loc, 'menu.edit.undo'),
          accelerator: 'CmdOrCtrl+Z',
          click: () => send(win, 'edit:undo')
        },
        {
          label: t(loc, 'menu.edit.redo'),
          accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y',
          click: () => send(win, 'edit:redo')
        },
        { type: 'separator' },
        { role: 'cut', label: t(loc, 'menu.edit.cut') },
        { role: 'copy', label: t(loc, 'menu.edit.copy') },
        { role: 'paste', label: t(loc, 'menu.edit.paste') },
        { role: 'selectAll', label: t(loc, 'menu.edit.selectAll') },
        { type: 'separator' },
        {
          label: t(loc, 'menu.edit.find'),
          accelerator: 'CmdOrCtrl+F',
          click: () => send(win, 'edit:find')
        },
        {
          label: t(loc, 'menu.edit.findReplace'),
          accelerator: isMac ? 'Cmd+Alt+F' : 'Ctrl+H',
          click: () => send(win, 'edit:find-replace')
        }
      ]
    },
    {
      label: t(loc, 'menu.view'),
      submenu: [
        {
          label: t(loc, 'menu.view.files'),
          type: 'checkbox',
          checked: prefs.filesSidebarVisible,
          click: () => send(win, 'view:toggle-files')
        },
        {
          label: t(loc, 'menu.view.preview'),
          type: 'radio',
          checked: prefs.rightPaneMode === 'preview',
          click: () => send(win, 'view:preview')
        },
        {
          label: t(loc, 'menu.view.help'),
          type: 'radio',
          checked: prefs.rightPaneMode === 'help',
          click: () => send(win, 'view:help')
        },
        { type: 'separator' },
        {
          label: t(loc, 'menu.view.syntax'),
          type: 'checkbox',
          checked: prefs.syntaxHighlighting,
          click: () => send(win, 'view:toggle-syntax')
        },
        {
          label: t(loc, 'menu.view.syntaxColors'),
          click: () => send(win, 'settings:open')
        },
        { type: 'separator' },
        {
          label: t(loc, 'menu.view.fontIncrease'),
          accelerator: 'CmdOrCtrl+=',
          click: () => send(win, 'view:font-increase')
        },
        {
          label: t(loc, 'menu.view.fontDecrease'),
          accelerator: 'CmdOrCtrl+-',
          click: () => send(win, 'view:font-decrease')
        },
        {
          label: t(loc, 'menu.view.fontReset'),
          accelerator: 'CmdOrCtrl+0',
          click: () => send(win, 'view:font-reset')
        },
        { type: 'separator' },
        { role: 'reload', label: t(loc, 'menu.view.reload') },
        {
          role: 'toggleDevTools',
          label: t(loc, 'menu.view.toggleDevTools')
        }
      ]
    },
    {
      label: t(loc, 'menu.settings'),
      submenu: [
        {
          label: t(loc, 'menu.settings.open'),
          accelerator: isMac ? undefined : 'CmdOrCtrl+,',
          click: () => send(win, 'settings:open')
        },
        { type: 'separator' },
        {
          label: t(loc, 'menu.language'),
          submenu: languageItems
        },
        {
          label: t(loc, 'menu.theme'),
          submenu: [
            {
              label: t(loc, 'menu.theme.light'),
              type: 'radio',
              checked: prefs.theme === 'light',
              click: () => {
                setPreference('theme', 'light')
                win.webContents.send(IPC.PREFS_CHANGED, getPreferences())
                buildApplicationMenu(win)
              }
            },
            {
              label: t(loc, 'menu.theme.dark'),
              type: 'radio',
              checked: prefs.theme === 'dark',
              click: () => {
                setPreference('theme', 'dark')
                win.webContents.send(IPC.PREFS_CHANGED, getPreferences())
                buildApplicationMenu(win)
              }
            },
            {
              label: t(loc, 'menu.theme.system'),
              type: 'radio',
              checked: prefs.theme === 'system',
              click: () => {
                setPreference('theme', 'system')
                win.webContents.send(IPC.PREFS_CHANGED, getPreferences())
                buildApplicationMenu(win)
              }
            }
          ]
        }
      ]
    },
    {
      label: t(loc, 'menu.help'),
      submenu: [
        {
          label: t(loc, 'menu.help.fountain'),
          click: () => send(win, 'view:help')
        },
        {
          label: t(loc, 'menu.help.about'),
          click: () => send(win, 'help:about')
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
