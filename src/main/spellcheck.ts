/**
 * Chromium Hunspell spellchecker: local dictionaries, language prefs,
 * context-menu suggestions. Windows/Linux use .bdic files; macOS uses
 * the system checker (language is chosen by macOS).
 */

import {
  app,
  BrowserWindow,
  Menu,
  net,
  session,
  shell,
  type MenuItemConstructorOptions,
  type Session
} from 'electron'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import * as path from 'path'
import { pathToFileURL } from 'url'
import { t } from '../shared/i18n/locales'
import {
  DEFAULT_DICTIONARY_MIRRORS,
  DEFAULT_SPELLCHECK_LANGUAGES,
  DICTIONARY_VERSION_SUFFIXES,
  dictionaryBasenamesFor,
  hunspellCodesFor,
  resolveSpellcheckLanguages,
  SPELLCHECK_LANG_ES
} from '../shared/constants/spellcheck'
import { getPreferences } from './store'

const BDIC_MAGIC = Buffer.from('BDic')
const MIN_BDIC_BYTES = 10_000

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

let lastDownloadError = ''

export function getUserDictionaryDir(): string {
  return path.join(app.getPath('userData'), 'dictionaries')
}

export function getBundledDictionaryDir(): string {
  const candidates = [
    path.join(app.getAppPath(), 'resources', 'dictionaries'),
    path.join(process.cwd(), 'resources', 'dictionaries')
  ]
  if (app.isPackaged) {
    candidates.unshift(
      path.join(process.resourcesPath, 'resources', 'dictionaries')
    )
  }
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir
  }
  return candidates[0]
}

function usesHunspell(): boolean {
  return process.platform !== 'darwin'
}

/**
 * Point Chromium at the local Hunspell folder. Must run before app.ready.
 */
export function registerHunspellPath(): void {
  const dir = getUserDictionaryDir()
  fs.mkdirSync(dir, { recursive: true })
  seedBundledDictionariesSync(dir)
  app.commandLine.appendSwitch('hunspell-dictionaries-path', dir)
}

function seedBundledDictionariesSync(dir: string): void {
  const bundled = getBundledDictionaryDir()
  if (!fs.existsSync(bundled)) return
  let names: string[] = []
  try {
    names = fs.readdirSync(bundled)
  } catch {
    return
  }
  for (const name of names) {
    if (!name.endsWith('.bdic')) continue
    const dest = path.join(dir, name)
    if (!fs.existsSync(dest)) {
      try {
        fs.copyFileSync(path.join(bundled, name), dest)
      } catch (err) {
        console.warn('[spellcheck] copy bundled', name, err)
      }
    }
  }
  aliasSpanishDictionariesSync(dir)
}

function aliasSpanishDictionariesSync(dir: string): void {
  const source =
    firstExistingSync(dir, ['es-419.bdic', 'es.bdic', 'es-ES.bdic']) ??
    firstExistingSync(getBundledDictionaryDir(), [
      'es-419.bdic',
      'es.bdic',
      'es-ES.bdic'
    ])
  if (!source) return
  for (const alias of ['es-419.bdic', 'es.bdic', 'es-ES.bdic']) {
    const dest = path.join(dir, alias)
    if (fs.existsSync(dest)) continue
    try {
      fs.copyFileSync(source, dest)
    } catch (err) {
      console.warn('[spellcheck] alias', alias, err)
    }
  }
}

function firstExistingSync(dir: string, names: string[]): string | null {
  for (const name of names) {
    const full = path.join(dir, name)
    if (fs.existsSync(full)) return full
  }
  return null
}

export async function ensureDictionaryDir(): Promise<string> {
  const dir = getUserDictionaryDir()
  await fsp.mkdir(dir, { recursive: true })
  seedBundledDictionariesSync(dir)
  return dir
}

function isValidBdic(buf: Buffer): boolean {
  return buf.length >= MIN_BDIC_BYTES && buf.subarray(0, 4).equals(BDIC_MAGIC)
}

async function isValidBdicFile(filePath: string): Promise<boolean> {
  try {
    const fh = await fsp.open(filePath, 'r')
    try {
      const { size } = await fh.stat()
      if (size < MIN_BDIC_BYTES) return false
      const buf = Buffer.alloc(4)
      await fh.read(buf, 0, 4, 0)
      return buf.equals(BDIC_MAGIC)
    } finally {
      await fh.close()
    }
  } catch {
    return false
  }
}

function downloadBases(customUrl: string): string[] {
  const bases: string[] = []
  if (customUrl) bases.push(customUrl)
  for (const mirror of DEFAULT_DICTIONARY_MIRRORS) {
    if (!bases.includes(mirror)) bases.push(mirror)
  }
  return bases
}

function candidateUrls(base: string, lang: string): string[] {
  const urls: string[] = []
  for (const suffix of DICTIONARY_VERSION_SUFFIXES) {
    urls.push(`${base}${lang}${suffix}.bdic`)
  }
  return urls
}

async function fetchBdic(url: string): Promise<Buffer | null> {
  try {
    const res = await net.fetch(url, { bypassCustomProtocolHandlers: true })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return isValidBdic(buf) ? buf : null
  } catch {
    return null
  }
}

async function downloadOneDictionary(lang: string, destDir: string): Promise<boolean> {
  const dest = path.join(destDir, `${lang}.bdic`)
  if (await isValidBdicFile(dest)) return true

  const prefs = getPreferences()
  for (const base of downloadBases(prefs.spellcheckDictionaryUrl)) {
    for (const url of candidateUrls(base, lang)) {
      const buf = await fetchBdic(url)
      if (!buf) continue
      const tmp = `${dest}.tmp`
      await fsp.writeFile(tmp, buf)
      await fsp.rename(tmp, dest)
      return true
    }
  }
  return false
}

export async function downloadSpellcheckDictionaries(
  languages?: string[]
): Promise<SpellcheckStatus> {
  lastDownloadError = ''
  const dir = await ensureDictionaryDir()
  const ids = languages?.length
    ? languages
    : getPreferences().spellcheckLanguages
  const names = dictionaryBasenamesFor(ids)
  const missing: string[] = []
  for (const name of names) {
    const ok = await downloadOneDictionary(name, dir)
    if (!ok) missing.push(name)
  }
  aliasSpanishDictionariesSync(dir)
  if (missing.length > 0) {
    const stillMissing = []
    for (const name of missing) {
      if (!(await isValidBdicFile(path.join(dir, `${name}.bdic`)))) {
        stillMissing.push(name)
      }
    }
    if (stillMissing.length > 0) {
      lastDownloadError = `Missing: ${stillMissing.join(', ')}`
    }
  }
  applySpellcheckToAllSessions()
  return getSpellcheckStatus()
}

export async function openDictionaryFolder(): Promise<void> {
  const dir = await ensureDictionaryDir()
  const err = await shell.openPath(dir)
  if (err) console.warn('[spellcheck] open folder', err)
}

function activeSession(): Session {
  const win = BrowserWindow.getAllWindows()[0]
  return win && !win.isDestroyed()
    ? win.webContents.session
    : session.defaultSession
}

export function applySpellcheckToSession(ses: Session): void {
  const prefs = getPreferences()
  if (typeof ses.setSpellCheckerEnabled === 'function') {
    ses.setSpellCheckerEnabled(prefs.spellcheckEnabled)
  }
  const url =
    prefs.spellcheckDictionaryUrl || DEFAULT_DICTIONARY_MIRRORS[0]
  try {
    ses.setSpellCheckerDictionaryDownloadURL(url)
  } catch (err) {
    console.warn('[spellcheck] download URL', err)
  }
  if (!prefs.spellcheckEnabled) return
  const available = ses.availableSpellCheckerLanguages ?? []
  const resolved = resolveSpellcheckLanguages(prefs.spellcheckLanguages, available)
  try {
    ses.setSpellCheckerLanguages(resolved)
  } catch (err) {
    console.warn('[spellcheck] set languages', resolved, err)
    for (const code of hunspellCodesFor(prefs.spellcheckLanguages)) {
      try {
        ses.setSpellCheckerLanguages([code])
        break
      } catch {
        /* try next Hunspell tag */
      }
    }
  }
}

export function applySpellcheckToAllSessions(): void {
  const seen = new Set<Session>()
  const apply = (ses: Session): void => {
    if (seen.has(ses)) return
    seen.add(ses)
    applySpellcheckToSession(ses)
  }
  apply(session.defaultSession)
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) apply(win.webContents.session)
  }
}

export function getSpellcheckStatus(): SpellcheckStatus {
  const prefs = getPreferences()
  const dir = getUserDictionaryDir()
  const ses = activeSession()
  const available = ses.availableSpellCheckerLanguages ?? []
  const applied = (() => {
    try {
      return resolveSpellcheckLanguages(prefs.spellcheckLanguages, available)
    } catch {
      return [...DEFAULT_SPELLCHECK_LANGUAGES]
    }
  })()
  const names = new Set([
    ...dictionaryBasenamesFor(prefs.spellcheckLanguages),
    ...hunspellCodesFor(prefs.spellcheckLanguages)
  ])
  if (prefs.spellcheckLanguages.includes(SPELLCHECK_LANG_ES)) {
    names.add('es-419')
    names.add('es')
    names.add('es-ES')
  }
  const files: SpellcheckFileStatus[] = [...names].sort().map((language) => {
    const filePath = path.join(dir, `${language}.bdic`)
    let present = false
    try {
      present = fs.existsSync(filePath) && fs.statSync(filePath).size >= MIN_BDIC_BYTES
    } catch {
      present = false
    }
    return { language, present, path: filePath }
  })
  return {
    enabled: prefs.spellcheckEnabled,
    languages: [...prefs.spellcheckLanguages],
    appliedLanguages: applied,
    availableLanguages: available,
    dictionaryDir: dir,
    dictionaryUrl: prefs.spellcheckDictionaryUrl,
    usesHunspell: usesHunspell(),
    files,
    lastError: lastDownloadError
  }
}

export function installSpellcheckContextMenu(win: BrowserWindow): void {
  win.webContents.on('context-menu', (_event, params) => {
    const locale = getPreferences().locale
    const template: MenuItemConstructorOptions[] = []

    if (params.misspelledWord) {
      for (const suggestion of params.dictionarySuggestions) {
        template.push({
          label: suggestion,
          click: () => win.webContents.replaceMisspelling(suggestion)
        })
      }
      if (params.dictionarySuggestions.length > 0) {
        template.push({ type: 'separator' })
      }
      template.push({
        label: t(locale, 'menu.edit.addToDictionary'),
        click: () => {
          win.webContents.session.addWordToSpellCheckerDictionary(
            params.misspelledWord
          )
        }
      })
      template.push({ type: 'separator' })
    }

    const flags = params.editFlags
    template.push(
      {
        role: 'cut',
        label: t(locale, 'menu.edit.cut'),
        enabled: flags.canCut
      },
      {
        role: 'copy',
        label: t(locale, 'menu.edit.copy'),
        enabled: flags.canCopy
      },
      {
        role: 'paste',
        label: t(locale, 'menu.edit.paste'),
        enabled: flags.canPaste
      },
      {
        role: 'selectAll',
        label: t(locale, 'menu.edit.selectAll'),
        enabled: flags.canSelectAll
      }
    )

    Menu.buildFromTemplate(template).popup({ window: win })
  })
}

/** Local file URLs — used only for diagnostics / copying into userData. */
export function dictionaryFileUrl(filePath: string): string {
  return pathToFileURL(filePath).href
}

export async function initSpellcheck(): Promise<void> {
  await ensureDictionaryDir()
  applySpellcheckToAllSessions()
  // Refresh languages after Chromium notices newly seeded files.
  setTimeout(() => applySpellcheckToAllSessions(), 750)
}
