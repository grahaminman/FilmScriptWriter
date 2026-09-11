import Store from 'electron-store'
import {
  AUTOSAVE_MINUTES_DEFAULT,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  DEFAULT_WINDOW_BOUNDS,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  type LocaleCode,
  type ThemeMode
} from '../shared/constants/screenplay'
import { isLocaleCode } from '../shared/i18n/locales'
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

const defaults: AppPreferences = {
  theme: DEFAULT_THEME,
  locale: DEFAULT_LOCALE,
  lastDirectory: '',
  lastFilePath: '',
  scriptsFolder: '',
  filesSidebarVisible: true,
  previewFollow: true,
  syntaxHighlighting: true,
  syntaxColorPreset: 'default',
  syntaxColorsCustom: { ...SYNTAX_PRESET_DEFAULT },
  editorFontSize: FONT_SIZE_DEFAULT,
  autosaveMinutes: AUTOSAVE_MINUTES_DEFAULT,
  rightPaneMode: 'preview',
  fountainHelpIndexCollapsed: false,
  spellcheckEnabled: true,
  spellcheckLanguages: [...DEFAULT_SPELLCHECK_LANGUAGES],
  spellcheckDictionaryUrl: '',
  windowBounds: {
    width: DEFAULT_WINDOW_BOUNDS.width,
    height: DEFAULT_WINDOW_BOUNDS.height
  }
}

export const prefsStore = new Store<AppPreferences>({
  name: 'preferences',
  defaults
})

function clampFontSize(n: number): number {
  if (!Number.isFinite(n)) return FONT_SIZE_DEFAULT
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(n)))
}

const AUTOSAVE_ALLOWED = new Set([0, 1, 2, 5, 10, 15, 30])

function clampAutosave(n: number): number {
  if (!Number.isFinite(n)) return AUTOSAVE_MINUTES_DEFAULT
  const rounded = Math.round(n)
  return AUTOSAVE_ALLOWED.has(rounded) ? rounded : AUTOSAVE_MINUTES_DEFAULT
}

function sanitizeLocale(raw: unknown): LocaleCode {
  if (typeof raw === 'string' && isLocaleCode(raw)) return raw
  return DEFAULT_LOCALE
}

function sanitizeTheme(raw: unknown): ThemeMode {
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return DEFAULT_THEME
}

export function getPreferences(): AppPreferences {
  return {
    theme: sanitizeTheme(prefsStore.get('theme', defaults.theme)),
    locale: sanitizeLocale(prefsStore.get('locale', defaults.locale)),
    lastDirectory: prefsStore.get('lastDirectory', defaults.lastDirectory),
    lastFilePath: prefsStore.get('lastFilePath', defaults.lastFilePath),
    scriptsFolder: prefsStore.get('scriptsFolder', defaults.scriptsFolder),
    filesSidebarVisible: Boolean(
      prefsStore.get('filesSidebarVisible', defaults.filesSidebarVisible)
    ),
    previewFollow: Boolean(prefsStore.get('previewFollow', defaults.previewFollow)),
    syntaxHighlighting: Boolean(
      prefsStore.get('syntaxHighlighting', defaults.syntaxHighlighting)
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
    autosaveMinutes: clampAutosave(
      prefsStore.get('autosaveMinutes', defaults.autosaveMinutes)
    ),
    rightPaneMode:
      prefsStore.get('rightPaneMode', defaults.rightPaneMode) === 'help'
        ? 'help'
        : 'preview',
    fountainHelpIndexCollapsed: Boolean(
      prefsStore.get(
        'fountainHelpIndexCollapsed',
        defaults.fountainHelpIndexCollapsed
      )
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

export function setPreference<K extends keyof AppPreferences>(
  key: K,
  value: AppPreferences[K]
): AppPreferences {
  if (key === 'editorFontSize') {
    prefsStore.set(key, clampFontSize(value as number) as AppPreferences[K])
  } else if (key === 'autosaveMinutes') {
    prefsStore.set(key, clampAutosave(value as number) as AppPreferences[K])
  } else if (key === 'spellcheckLanguages') {
    prefsStore.set(key, sanitizeSpellcheckLanguages(value) as AppPreferences[K])
  } else if (key === 'spellcheckDictionaryUrl') {
    prefsStore.set(key, sanitizeDictionaryUrl(value) as AppPreferences[K])
  } else if (key === 'locale') {
    prefsStore.set(key, sanitizeLocale(value) as AppPreferences[K])
  } else if (key === 'theme') {
    prefsStore.set(key, sanitizeTheme(value) as AppPreferences[K])
  } else {
    prefsStore.set(key, value)
  }
  return getPreferences()
}

export function setPreferences(partial: Partial<AppPreferences>): AppPreferences {
  for (const [k, v] of Object.entries(partial)) {
    if (v === undefined) continue
    setPreference(k as keyof AppPreferences, v as never)
  }
  return getPreferences()
}
