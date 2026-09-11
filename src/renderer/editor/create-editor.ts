import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  placeholder,
  type ViewUpdate
} from '@codemirror/view'
import { EditorState, Compartment, type Extension } from '@codemirror/state'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import {
  searchKeymap,
  openSearchPanel,
  highlightSelectionMatches
} from '@codemirror/search'
import { fountain } from './fountain-language'
import { fountainLineHighlighter } from './fountain-line-highlighter'
import { smartSearch } from './smart-search'
import { t } from '../../shared/i18n/locales'
import {
  FONT_SIZE_DEFAULT,
  type LocaleCode
} from '../../shared/constants/screenplay'

export interface EditorHandle {
  view: EditorView
  getValue: () => string
  setValue: (text: string) => void
  focus: () => void
  setTheme: (dark: boolean) => void
  setLocale: (locale: LocaleCode) => void
  setFontSize: (px: number) => void
  setSyntaxHighlighting: (enabled: boolean) => void
  openFind: () => void
  openFindReplace: () => void
  getCursorLine: () => number
  onCursorLineChange: (cb: (line: number) => void) => () => void
  setSpellcheck: (enabled: boolean, languages: string[]) => void
  destroy: () => void
}

export interface CreateEditorOptions {
  parent: HTMLElement
  initialDoc?: string
  dark?: boolean
  locale?: LocaleCode
  fontSize?: number
  syntaxHighlighting?: boolean
  onChange?: (text: string) => void
  onDirty?: (dirty: boolean) => void
  onCursorLine?: (line: number) => void
  spellcheckEnabled?: boolean
  spellcheckLanguages?: string[]
}

export function createEditor(options: CreateEditorOptions): EditorHandle {
  const placeholderComp = new Compartment()
  const fontComp = new Compartment()
  const highlightComp = new Compartment()
  const spellcheckComp = new Compartment()

  let locale: LocaleCode = options.locale ?? 'en_GB'
  let dark = options.dark ?? false
  let syntaxOn = options.syntaxHighlighting !== false

  const cursorListeners = new Set<(line: number) => void>()

  const notifyChange = (text: string): void => {
    options.onChange?.(text)
    options.onDirty?.(true)
  }

  const state = EditorState.create({
    doc: options.initialDoc ?? '',
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      fountain(),
      smartSearch(),
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        indentWithTab
      ]),
      EditorView.lineWrapping,
      fontComp.of(fontSizeTheme(options.fontSize ?? FONT_SIZE_DEFAULT)),
      highlightComp.of(syntaxOn ? fountainLineHighlighter() : []),
      spellcheckComp.of(
        spellcheckAttributes(
          options.spellcheckEnabled !== false,
          options.spellcheckLanguages ?? ['en-GB']
        )
      ),
      placeholderComp.of(placeholder(t(locale, 'editor.placeholder'))),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          notifyChange(update.state.doc.toString())
        }
        if (update.selectionSet || update.docChanged) {
          const line = update.state.doc.lineAt(update.state.selection.main.head)
            .number
          options.onCursorLine?.(line)
          for (const cb of cursorListeners) cb(line)
        }
      }),
      baseEditorChrome()
    ]
  })

  const view = new EditorView({
    state,
    parent: options.parent
  })

  options.parent.dataset.editorTheme = dark ? 'dark' : 'light'

  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue: (text: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text }
      })
    },
    focus: () => view.focus(),
    setTheme: (isDark: boolean) => {
      dark = isDark
      options.parent.dataset.editorTheme = isDark ? 'dark' : 'light'
    },
    setLocale: (next: LocaleCode) => {
      locale = next
      view.dispatch({
        effects: placeholderComp.reconfigure(
          placeholder(t(locale, 'editor.placeholder'))
        )
      })
    },
    setFontSize: (px: number) => {
      view.dispatch({
        effects: fontComp.reconfigure(fontSizeTheme(px))
      })
    },
    setSyntaxHighlighting: (enabled: boolean) => {
      syntaxOn = enabled
      view.dispatch({
        effects: highlightComp.reconfigure(enabled ? fountainLineHighlighter() : [])
      })
    },
    openFind: () => {
      openSearchPanel(view)
    },
    openFindReplace: () => {
      openSearchPanel(view)
    },
    getCursorLine: () => {
      return view.state.doc.lineAt(view.state.selection.main.head).number
    },
    onCursorLineChange: (cb) => {
      cursorListeners.add(cb)
      return () => {
        cursorListeners.delete(cb)
      }
    },
    setSpellcheck: (enabled, languages) => {
      view.dispatch({
        effects: spellcheckComp.reconfigure(spellcheckAttributes(enabled, languages))
      })
    },
    destroy: () => view.destroy()
  }
}

function spellcheckAttributes(enabled: boolean, languages: string[]): Extension {
  const lang = (languages[0] ?? 'en-GB').replace('_', '-')
  return EditorView.contentAttributes.of({
    spellcheck: enabled ? 'true' : 'false',
    lang
  })
}

function fontSizeTheme(px: number): Extension {
  return EditorView.theme({
    '&': { fontSize: `${px}px` },
    '.cm-scroller': { fontSize: `${px}px`, lineHeight: '1.45' },
    '.cm-content': { fontSize: `${px}px` }
  })
}

function baseEditorChrome(): Extension {
  return EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': {
      fontFamily:
        '"Courier New", Courier, "Nimbus Mono L", "Liberation Mono", monospace',
      lineHeight: '1.45',
      overflow: 'auto'
    },
    '.cm-content': {
      padding: '16px 8px 48px 8px',
      caretColor: 'var(--cm-caret)',
      color: 'var(--text)'
    },
    '.cm-gutters': {
      backgroundColor: 'var(--cm-gutter-bg)',
      color: 'var(--cm-gutter-fg)',
      border: 'none',
      borderRight: '1px solid var(--line)'
    },
    '.cm-activeLine': { backgroundColor: 'var(--cm-active-line)' },
    '.cm-activeLineGutter': { backgroundColor: 'var(--cm-active-line)' },
    '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--cm-caret)' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'var(--cm-selection) !important'
    },
    '.cm-panel.cm-search': {
      backgroundColor: 'var(--panel)',
      color: 'var(--ink)',
      borderBottom: '1px solid var(--line)',
      padding: '6px 8px',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px'
    },
    '.cm-panel.cm-search input, .cm-panel.cm-search button, .cm-panel.cm-search label':
      {
        color: 'var(--ink)',
        fontSize: '13px'
      },
    '.cm-panel.cm-search input': {
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: '4px',
      padding: '3px 6px'
    },
    '.cm-panel.cm-search button': {
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: '4px',
      padding: '3px 8px',
      cursor: 'pointer'
    },
    '.cm-searchMatch': { backgroundColor: 'rgba(58, 124, 165, 0.28)' },
    '.cm-searchMatch-selected': { backgroundColor: 'rgba(58, 124, 165, 0.5)' }
  })
}
