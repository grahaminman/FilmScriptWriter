/**
 * Starter template management.
 *
 * Bundled original  → resources/templates/ (read-only)
 * Factory copy      → Documents/.../FilmScriptWriter-Starter.factory.fountain
 *                     kept so Settings can revert
 * User template     → Documents/.../FilmScriptWriter-Starter.fountain
 *                     edited in Settings; used for every new project
 *
 * New projects always load the user template. File → Save will not write
 * to the bundled or factory files.
 */

import { BrowserWindow, app, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { pathExists } from './path-exists'
import { FOUNTAIN_EXTENSION, OPEN_FILTERS } from '../shared/constants/screenplay'

/** Canonical template file name (must match files under resources/templates). */
export const STARTER_TEMPLATE_NAME = 'FilmScriptWriter-Starter.fountain'
export const FACTORY_TEMPLATE_NAME = 'FilmScriptWriter-Starter.factory.fountain'

export interface TemplateInfo {
  userPath: string
  factoryPath: string
  bundledPath: string
  content: string
  factoryAvailable: boolean
}

/**
 * Resolve the bundled template path (dev vs packaged).
 */
export function getBundledTemplatePath(): string {
  // Packaged: extraResources copies `resources/` → process.resourcesPath/resources
  // Dev: project root resources/templates
  if (app.isPackaged) {
    return path.join(
      process.resourcesPath,
      'resources',
      'templates',
      STARTER_TEMPLATE_NAME
    )
  }
  // electron-vite / project root
  return path.join(
    app.getAppPath(),
    'resources',
    'templates',
    STARTER_TEMPLATE_NAME
  )
}

/**
 * User-visible templates directory (Documents/FilmScriptWriter/templates).
 */
export function getUserTemplatesDir(): string {
  return path.join(app.getPath('documents'), 'FilmScriptWriter', 'templates')
}

/**
 * Full path to the user-facing starter template copy.
 */
export function getUserTemplatePath(): string {
  return path.join(getUserTemplatesDir(), STARTER_TEMPLATE_NAME)
}

/** Untouched revert copy of the factory starter. */
export function getFactoryTemplatePath(): string {
  return path.join(getUserTemplatesDir(), FACTORY_TEMPLATE_NAME)
}

/**
 * True if `filePath` is the bundled or user starter template (must not be overwritten).
 */
export function isProtectedTemplatePath(filePath: string | null | undefined): boolean {
  if (!filePath) return false
  const resolved = path.resolve(filePath)
  const candidates = [
    getBundledTemplatePath(),
    getFactoryTemplatePath(),
    getUserTemplatePath()
  ].map((p) => {
    try {
      return path.resolve(p)
    } catch {
      return p
    }
  })
  return candidates.some((c) => c === resolved)
}

/**
 * Ensure the user templates folder exists and contains a copy of the starter.
 * Existing user copy is left untouched so personal edits (if any) are preserved.
 * Missing file is re-created from the bundled original.
 */
export async function ensureUserTemplateAvailable(): Promise<string> {
  const dir = getUserTemplatesDir()
  await fs.mkdir(dir, { recursive: true })

  const factory = getFactoryTemplatePath()
  if (!(await pathExists(factory))) {
    await writeFromBundledOrFallback(factory)
  }

  const dest = getUserTemplatePath()
  if (!(await pathExists(dest))) {
    if (await pathExists(factory)) {
      await fs.copyFile(factory, dest)
    } else {
      await writeFromBundledOrFallback(dest)
    }
  }
  return dest
}

async function writeFromBundledOrFallback(dest: string): Promise<void> {
  const src = getBundledTemplatePath()
  try {
    await fs.copyFile(src, dest)
  } catch (err) {
    console.warn('[template] could not copy bundled template:', err)
    await fs.writeFile(dest, FALLBACK_TEMPLATE, 'utf8')
  }
}

/**
 * Read the template used for new projects. User file wins so Settings edits apply.
 */
export async function loadTemplateContent(): Promise<string> {
  await ensureUserTemplateAvailable()
  const candidates = [getUserTemplatePath(), getFactoryTemplatePath(), getBundledTemplatePath()]
  for (const p of candidates) {
    try {
      const text = await fs.readFile(p, 'utf8')
      if (text.trim().length > 0) return text
    } catch {
      /* try next */
    }
  }
  return FALLBACK_TEMPLATE
}

export async function getTemplateInfo(): Promise<TemplateInfo> {
  await ensureUserTemplateAvailable()
  const content = await loadTemplateContent()
  return {
    userPath: getUserTemplatePath(),
    factoryPath: getFactoryTemplatePath(),
    bundledPath: getBundledTemplatePath(),
    content,
    factoryAvailable: await pathExists(getFactoryTemplatePath())
  }
}

export async function saveUserTemplate(content: string): Promise<TemplateInfo> {
  await ensureUserTemplateAvailable()
  await fs.writeFile(getUserTemplatePath(), content, 'utf8')
  return getTemplateInfo()
}

export async function revertUserTemplate(): Promise<TemplateInfo> {
  await ensureUserTemplateAvailable()
  const factory = getFactoryTemplatePath()
  if (await pathExists(factory)) {
    await fs.copyFile(factory, getUserTemplatePath())
  } else {
    await writeFromBundledOrFallback(getUserTemplatePath())
  }
  return getTemplateInfo()
}

export async function chooseAndInstallUserTemplate(
  win: BrowserWindow
): Promise<TemplateInfo | null> {
  await ensureUserTemplateAvailable()
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose a Fountain file to use as the new-project template',
    defaultPath: getUserTemplatesDir(),
    filters: OPEN_FILTERS,
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const source = result.filePaths[0]
  const text = await fs.readFile(source, 'utf8')
  await fs.writeFile(getUserTemplatePath(), text, 'utf8')
  return getTemplateInfo()
}

export { FOUNTAIN_EXTENSION }

/**
 * Minimal inline fallback if all filesystem copies are missing.
 */
const FALLBACK_TEMPLATE = `Title: FilmScriptWriter Starter Template
Author: Your Name
Draft date: 2026-01-01

# Getting started

= This is a starter template. Use Save As to keep the original.

INT. ROOM - DAY

Action describes what we see.

WRITER
Dialogue goes here.

FADE OUT.
`
