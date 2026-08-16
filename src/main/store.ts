/**
 * Persistent application preferences via electron-store.
 *
 * Remembers last open/save directory, theme, locale, window bounds,
 * preview options, font size, and editor behaviour between sessions.
 */

import Store from 'electron-store'
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  type LocaleCode,
  type ThemeMode
} from '../shared/constants/screenplay'
import {
  SYNTAX_PRESET_DEFAULT,
  type SyntaxColorPalette,
  type SyntaxColorPresetId
} from '../shared/constants/syntax-colors'
import {
  DEFAULT_SPELLCHECK_LANGUAGES,
  sanitizeDictionaryUrl,
  sanitizeSpellcheckLanguages,
  type SpellcheckLanguageId
} from '../shared/constants/spellcheck'

export interface AppPreferences {
  theme: ThemeMode
  locale: LocaleCode
  lastDirectory: string
  /**
   * Absolute path of the last successfully opened or saved screenplay.
   * Restored on next launch when the file still exists.
   * Never points at the protected starter template.
   */
  lastFilePath: string
  previewVisible: boolean
  /** Keep preview scrolled to the line under the editor cursor. */
  previewFollow: boolean
  /** Keep the caret vertically centred while typing. */
  typewriterMode: boolean
  /** Colour Fountain syntax in the editor. */
  syntaxHighlighting: boolean
  /** Preset id, or "custom" when using syntaxColorsCustom. */
  syntaxColorPreset: SyntaxColorPresetId
  /** User-defined palette when preset is "custom". */
  syntaxColorsCustom: SyntaxColorPalette
  /** Editor body font size in CSS pixels. */
  editorFontSize: number
  /**
   * Absolute folder that holds every project directory.
   * Empty until first-run (or Settings) chooses one.
   */
  projectsBaseFolder: string
  /** True after the user has chosen a projects base folder. */
  hasCompletedFirstRun: boolean
  /** Last opened project directory. */
  lastProjectPath: string
  /**
   * Autosave interval in minutes. 0 = off. Default 5.
   */
  autosaveMinutes: number
  /** Index sidebar visible. */
  indexVisible: boolean
  /** Notes sidebar visible. */
  notesVisible: boolean
  /** Fountain syntax coach bar is retracted to a single line. */
  syntaxCoachCollapsed: boolean
  /** Right pane shows the page preview or the full Fountain syntax help. */
  rightPaneMode: 'preview' | 'help'
  /** Retractable syntax index inside the Fountain help pane. */
  fountainHelpIndexCollapsed: boolean
  /** Chromium spellchecker is on. */
  spellcheckEnabled: boolean
  /**
   * Hunspell language ids: en-GB (default), en-US, es-419.
   * Independent of the UI locale.
   */
  spellcheckLanguages: SpellcheckLanguageId[]
  /**
   * Optional http(s) base URL for self-hosted .bdic files.
   * Empty = built-in Google CDN + GitHub Hunspell mirrors.
   */
  spellcheckDictionaryUrl: string
  windowBounds: {
    width: number
    height: number
    x?: number
    y?: number
  }
}

const defaults: AppPreferences = {
  theme: DEFAULT_THEME,
  locale: DEFAULT_LOCALE,
  lastDirectory: '',
  lastFilePath: '',
  previewVisible: true,
  previewFollow: true,
  typewriterMode: false,
  syntaxHighlighting: true,
  syntaxColorPreset: 'default',
  syntaxColorsCustom: { ...SYNTAX_PRESET_DEFAULT },
  editorFontSize: FONT_SIZE_DEFAULT,
  projectsBaseFolder: '',
  hasCompletedFirstRun: false,
  lastProjectPath: '',
  autosaveMinutes: 5,
  indexVisible: true,
  notesVisible: true,
  syntaxCoachCollapsed: false,
  rightPaneMode: 'preview',
  fountainHelpIndexCollapsed: false,
  spellcheckEnabled: true,
  spellcheckLanguages: [...DEFAULT_SPELLCHECK_LANGUAGES],
  spellcheckDictionaryUrl: '',
  windowBounds: {
    width: 1400,
    height: 900
  }
}

/**
 * Typed wrapper around electron-store.
 * Instantiated once in the main process.
 */
export const prefsStore = new Store<AppPreferences>({
  name: 'preferences',
  defaults
})

function clampFontSize(n: number): number {
  if (!Number.isFinite(n)) return FONT_SIZE_DEFAULT
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(n)))
}

export function getPreferences(): AppPreferences {
  return {
    theme: prefsStore.get('theme', defaults.theme),
    locale: prefsStore.get('locale', defaults.locale),
    lastDirectory: prefsStore.get('lastDirectory', defaults.lastDirectory),
    lastFilePath: prefsStore.get('lastFilePath', defaults.lastFilePath),
    previewVisible: prefsStore.get('previewVisible', defaults.previewVisible),
    previewFollow: prefsStore.get('previewFollow', defaults.previewFollow),
    typewriterMode: prefsStore.get('typewriterMode', defaults.typewriterMode),
    syntaxHighlighting: prefsStore.get(
      'syntaxHighlighting',
      defaults.syntaxHighlighting
    ),
    syntaxColorPreset: prefsStore.get(
      'syntaxColorPreset',
      defaults.syntaxColorPreset
    ),
    syntaxColorsCustom: {
      ...SYNTAX_PRESET_DEFAULT,
      ...prefsStore.get('syntaxColorsCustom', defaults.syntaxColorsCustom)
    },
    editorFontSize: clampFontSize(
      prefsStore.get('editorFontSize', defaults.editorFontSize)
    ),
    projectsBaseFolder: prefsStore.get(
      'projectsBaseFolder',
      defaults.projectsBaseFolder
    ),
    hasCompletedFirstRun: prefsStore.get(
      'hasCompletedFirstRun',
      defaults.hasCompletedFirstRun
    ),
    lastProjectPath: prefsStore.get('lastProjectPath', defaults.lastProjectPath),
    autosaveMinutes: clampAutosave(
      prefsStore.get('autosaveMinutes', defaults.autosaveMinutes)
    ),
    indexVisible: prefsStore.get('indexVisible', defaults.indexVisible),
    notesVisible: prefsStore.get('notesVisible', defaults.notesVisible),
    syntaxCoachCollapsed: prefsStore.get(
      'syntaxCoachCollapsed',
      defaults.syntaxCoachCollapsed
    ),
    rightPaneMode:
      prefsStore.get('rightPaneMode', defaults.rightPaneMode) === 'help'
        ? 'help'
        : 'preview',
    fountainHelpIndexCollapsed: prefsStore.get(
      'fountainHelpIndexCollapsed',
      defaults.fountainHelpIndexCollapsed
    ),
    spellcheckEnabled: Boolean(
      prefsStore.get('spellcheckEnabled', defaults.spellcheckEnabled)
    ),
    spellcheckLanguages: sanitizeSpellcheckLanguages(
      prefsStore.get('spellcheckLanguages', defaults.spellcheckLanguages)
    ),
    spellcheckDictionaryUrl: sanitizeDictionaryUrl(
      prefsStore.get('spellcheckDictionaryUrl', defaults.spellcheckDictionaryUrl)
    ),
    windowBounds: prefsStore.get('windowBounds', defaults.windowBounds)
  }
}

const AUTOSAVE_ALLOWED = new Set([0, 1, 2, 5, 10, 15, 30])

function clampAutosave(n: number): number {
  if (!Number.isFinite(n)) return 5
  const rounded = Math.round(n)
  return AUTOSAVE_ALLOWED.has(rounded) ? rounded : 5
}

export function setPreference<K extends keyof AppPreferences>(
  key: K,
  value: AppPreferences[K]
): AppPreferences {
  if (key === 'editorFontSize') {
    prefsStore.set(key, clampFontSize(value as number) as AppPreferences[K])
  } else if (key === 'autosaveMinutes') {
    prefsStore.set(key, clampAutosave(value as number) as AppPreferences[K])
  } else if (key === 'spellcheckLanguages') {
    prefsStore.set(
      key,
      sanitizeSpellcheckLanguages(value) as AppPreferences[K]
    )
  } else if (key === 'spellcheckDictionaryUrl') {
    prefsStore.set(
      key,
      sanitizeDictionaryUrl(value) as AppPreferences[K]
    )
  } else {
    prefsStore.set(key, value)
  }
  return getPreferences()
}

export function setPreferences(partial: Partial<AppPreferences>): AppPreferences {
  for (const [k, v] of Object.entries(partial)) {
    if (v === undefined) continue
    if (k === 'editorFontSize') {
      prefsStore.set('editorFontSize', clampFontSize(v as number))
    } else if (k === 'autosaveMinutes') {
      prefsStore.set('autosaveMinutes', clampAutosave(v as number))
    } else if (k === 'spellcheckLanguages') {
      prefsStore.set('spellcheckLanguages', sanitizeSpellcheckLanguages(v))
    } else if (k === 'spellcheckDictionaryUrl') {
      prefsStore.set('spellcheckDictionaryUrl', sanitizeDictionaryUrl(v))
    } else {
      prefsStore.set(k as keyof AppPreferences, v as never)
    }
  }
  return getPreferences()
}
