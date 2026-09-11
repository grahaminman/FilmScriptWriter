/** US Letter width in inches. */
export const PAGE_WIDTH_IN = 8.5

/** US Letter height in inches. */
export const PAGE_HEIGHT_IN = 11

/** Points per inch (PostScript / PDF coordinate system). */
export const POINTS_PER_INCH = 72

/** Screenplay body font size in points. Always Courier 12. */
export const FONT_SIZE_PT = 12

/**
 * Line height in points for single-spaced Courier 12.
 * Classic screenplay format uses ~12 pt leading (1 line = 1/6 inch).
 */
export const LINE_HEIGHT_PT = 12

/** Left margin (scene headings, action, transitions start here). */
export const MARGIN_LEFT_IN = 1.5

/** Right margin. */
export const MARGIN_RIGHT_IN = 1.0

/** Top margin (page number sits just above body start). */
export const MARGIN_TOP_IN = 1.0

/** Bottom margin. */
export const MARGIN_BOTTOM_IN = 1.0

export const CHARACTER_LEFT_IN = 3.7
export const PARENTHETICAL_LEFT_IN = 3.1
export const DIALOGUE_LEFT_IN = 2.5
export const DIALOGUE_RIGHT_IN = 1.5
export const PARENTHETICAL_RIGHT_IN = 2.0
export const TRANSITION_RIGHT_IN = 1.0

export const ACTION_CHARS_PER_LINE = 60
export const DIALOGUE_CHARS_PER_LINE = 35
export const PARENTHETICAL_CHARS_PER_LINE = 25
export const CHARACTER_CHARS_PER_LINE = 30

/**
 * Usable body lines per page after top/bottom margins and page-number row.
 * (11" - 1" top - 1" bottom) / (12pt/72) = 54 lines; reserve 1 for page #.
 */
export const LINES_PER_PAGE = 54

export const PAGE_NUMBER_TOP_IN = 0.5
export const PAGE_NUMBER_RIGHT_IN = 1.0

export function inchesToPoints(inches: number): number {
  return inches * POINTS_PER_INCH
}

export function pointsToInches(points: number): number {
  return points / POINTS_PER_INCH
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type LocaleCode = 'en_GB' | 'en_US' | 'es_419' | 'de_DE' | 'fr_FR' | 'it_IT'

export const SUPPORTED_LOCALES: readonly LocaleCode[] = [
  'en_GB',
  'en_US',
  'es_419',
  'de_DE',
  'fr_FR',
  'it_IT'
] as const

export const DEFAULT_LOCALE: LocaleCode = 'en_GB'
export const DEFAULT_THEME: ThemeMode = 'light'

export const FONT_SIZE_MIN = 11
export const FONT_SIZE_MAX = 28
export const FONT_SIZE_DEFAULT = 14
export const FONT_SIZE_STEP = 1

export const FOUNTAIN_EXTENSION = '.fountain'
export const TXT_EXTENSION = '.txt'
export const PDF_EXTENSION = '.pdf'

export const OPEN_FILTERS = [
  {
    name: 'Screenplay',
    extensions: ['fountain', 'txt']
  },
  {
    name: 'All Files',
    extensions: ['*']
  }
]

export const AUTOSAVE_MINUTES_OPTIONS = [0, 1, 2, 5, 10, 15, 30] as const
export const AUTOSAVE_MINUTES_DEFAULT = 5

export const SAVE_FOUNTAIN_FILTERS = [
  {
    name: 'Fountain',
    extensions: ['fountain']
  },
  {
    name: 'Plain Text',
    extensions: ['txt']
  }
]

export const SAVE_PDF_FILTERS = [
  {
    name: 'PDF',
    extensions: ['pdf']
  }
]

export const DEFAULT_WINDOW_BOUNDS = {
  width: 1280,
  height: 800
} as const

export const MIN_WINDOW_WIDTH = 1024
export const MIN_WINDOW_HEIGHT = 700

export const SCRIPTS_FOLDER_NAME = 'FilmScriptWriter/scripts'

export const IPC = {
  FILE_NEW: 'file:new',
  FILE_OPEN: 'file:open',
  FILE_OPEN_PATH: 'file:open-path',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_EXPORT_FOUNTAIN: 'file:export-fountain',
  FILE_EXPORT_PDF: 'file:export-pdf',
  FILE_GET_STATE: 'file:get-state',
  FILE_SET_DIRTY: 'file:set-dirty',
  FILE_GET_STARTUP: 'file:get-startup',
  FILE_GET_TEMPLATE: 'file:get-template',
  FILE_LIST_SCRIPTS: 'file:list-scripts',
  FILE_SCRIPTS_CHANGED: 'file:scripts-changed',

  DIALOG_CONFIRM_DISCARD: 'dialog:confirm-discard',
  DIALOG_SHOW_ERROR: 'dialog:show-error',

  PREFS_GET: 'prefs:get',
  PREFS_SET: 'prefs:set',
  PREFS_CHANGED: 'prefs:changed',

  MENU_ACTION: 'menu:action',

  APP_GET_VERSION: 'app:get-version',
  APP_GET_DEFAULT_SCRIPTS: 'app:get-default-scripts',
  APP_QUIT: 'app:quit',
  APP_ABORT_QUIT: 'app:abort-quit',

  SCRIPTS_CHOOSE_FOLDER: 'scripts:choose-folder',
  SCRIPTS_USE_DEFAULT: 'scripts:use-default',

  SPELLCHECK_STATUS: 'spellcheck:status',
  SPELLCHECK_DOWNLOAD: 'spellcheck:download',
  SPELLCHECK_OPEN_FOLDER: 'spellcheck:open-folder'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
