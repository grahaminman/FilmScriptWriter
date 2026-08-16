/**
 * Project workspace: base folder, per-title folders, import, listing.
 */

import { BrowserWindow, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { app } from 'electron'
import {
  FOUNTAIN_EXTENSION,
  OPEN_FILTERS
} from '../shared/constants/screenplay'
import {
  formatDraftFileName,
  importAsCurrentDraftName,
  importAsNotesName,
  isFountainFile,
  parseDraftDate,
  pickCurrentDraft,
  sanitizeProjectName,
  todayIso
} from '../shared/project/draft-name'
import {
  notesFileName,
  starterNotesMarkdown
} from '../shared/project/notes'
import { getPreferences, setPreference, setPreferences } from './store'
import { pathExists } from './path-exists'
import { loadTemplateContent } from './template-service'

export type ProjectFileKind = 'fountain' | 'markdown' | 'pdf' | 'text' | 'other'

export interface ProjectFileInfo {
  path: string
  name: string
  kind: ProjectFileKind
  isCurrentDraft: boolean
  isNotes: boolean
  date: string | null
}

export interface ProjectSnapshot {
  projectPath: string
  projectName: string
  files: ProjectFileInfo[]
  currentDraftPath: string | null
  notesPath: string | null
}

export function defaultProjectsBaseFolder(): string {
  return path.join(app.getPath('documents'), 'FilmScriptWriter', 'Projects')
}

export function getProjectsBaseFolder(): string {
  const stored = getPreferences().projectsBaseFolder
  return stored && stored.length > 0 ? stored : defaultProjectsBaseFolder()
}

export async function ensureProjectsBaseFolder(folder?: string): Promise<string> {
  const dir = folder && folder.length > 0 ? folder : getProjectsBaseFolder()
  await fs.mkdir(dir, { recursive: true })
  setPreferences({
    projectsBaseFolder: dir,
    hasCompletedFirstRun: true
  })
  return dir
}

export async function chooseProjectsBaseFolder(
  win: BrowserWindow
): Promise<string | null> {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose projects folder',
    defaultPath: getProjectsBaseFolder(),
    properties: ['openDirectory', 'createDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return ensureProjectsBaseFolder(result.filePaths[0])
}

export function fileKind(fileName: string): ProjectFileKind {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.fountain') return 'fountain'
  if (ext === '.md' || ext === '.markdown') return 'markdown'
  if (ext === '.pdf') return 'pdf'
  if (ext === '.txt') return 'text'
  return 'other'
}

export async function listProject(projectPath: string): Promise<ProjectSnapshot> {
  const resolved = path.resolve(projectPath)
  const projectName = path.basename(resolved)
  const entries = await fs.readdir(resolved, { withFileTypes: true })
  const names = entries.filter((e) => e.isFile()).map((e) => e.name)
  const currentName = pickCurrentDraft(names)
  const notesName = notesFileName(projectName).toLowerCase()

  const files: ProjectFileInfo[] = names
    .filter((n) => !n.startsWith('.'))
    .map((name) => ({
      path: path.join(resolved, name),
      name,
      kind: fileKind(name),
      isCurrentDraft: currentName === name,
      isNotes: name.toLowerCase() === notesName,
      date: parseDraftDate(name)
    }))
    .sort((a, b) => {
      if (a.isCurrentDraft) return -1
      if (b.isCurrentDraft) return 1
      if (a.isNotes) return -1
      if (b.isNotes) return 1
      return a.name.localeCompare(b.name)
    })

  return {
    projectPath: resolved,
    projectName,
    files,
    currentDraftPath: currentName ? path.join(resolved, currentName) : null,
    notesPath:
      files.find((f) => f.isNotes)?.path ??
      path.join(resolved, notesFileName(projectName))
  }
}

export async function createProject(
  projectName: string,
  baseFolder?: string
): Promise<ProjectSnapshot> {
  const name = sanitizeProjectName(projectName)
  if (!name) {
    throw new Error('Project name is required')
  }
  const base = await ensureProjectsBaseFolder(baseFolder)
  const projectPath = path.join(base, name)
  if (await pathExists(projectPath)) {
    throw new Error(`A project named “${name}” already exists`)
  }
  await fs.mkdir(projectPath, { recursive: true })

  const draftName = formatDraftFileName(name, todayIso())
  const draftPath = path.join(projectPath, draftName)
  const notesPath = path.join(projectPath, notesFileName(name))
  const template = await loadTemplateContent()
  const stamped = stampTitle(template, name)
  await fs.writeFile(draftPath, stamped, 'utf8')
  await fs.writeFile(notesPath, starterNotesMarkdown(name), 'utf8')

  setPreference('lastProjectPath', projectPath)
  setPreference('lastDirectory', projectPath)
  setPreference('lastFilePath', draftPath)
  return listProject(projectPath)
}

function stampTitle(template: string, title: string): string {
  if (/^Title:\s*/im.test(template)) {
    return template.replace(/^Title:\s*.*$/im, `Title: ${title}`)
  }
  return `Title: ${title}\n\n${template}`
}

export async function openProjectDialog(
  win: BrowserWindow
): Promise<ProjectSnapshot | null> {
  const result = await dialog.showOpenDialog(win, {
    title: 'Open project folder',
    defaultPath: getProjectsBaseFolder(),
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const snap = await listProject(result.filePaths[0])
  setPreference('lastProjectPath', snap.projectPath)
  setPreference('lastDirectory', snap.projectPath)
  if (snap.currentDraftPath) setPreference('lastFilePath', snap.currentDraftPath)
  return snap
}

export async function listRecentProjects(): Promise<
  { name: string; path: string }[]
> {
  const base = getProjectsBaseFolder()
  if (!(await pathExists(base))) return []
  const entries = await fs.readdir(base, { withFileTypes: true })
  const out: { name: string; path: string }[] = []
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue
    out.push({ name: e.name, path: path.join(base, e.name) })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

export interface ImportResult {
  path: string
  snapshot: ProjectSnapshot
}

export async function importIntoProject(
  win: BrowserWindow,
  projectPath: string,
  mode: 'draft' | 'notes'
): Promise<ImportResult | null> {
  const result = await dialog.showOpenDialog(win, {
    title: mode === 'draft' ? 'Import as current draft' : 'Import as notes',
    defaultPath: getPreferences().lastDirectory || getProjectsBaseFolder(),
    filters:
      mode === 'draft'
        ? OPEN_FILTERS
        : [
            { name: 'Notes and files', extensions: ['md', 'fountain', 'txt', 'pdf'] },
            { name: 'All Files', extensions: ['*'] }
          ],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const source = result.filePaths[0]
  const snap0 = await listProject(projectPath)
  const destName =
    mode === 'draft'
      ? uniqueName(
          snap0.files.map((f) => f.name),
          importAsCurrentDraftName(snap0.projectName, todayIso())
        )
      : uniqueName(
          snap0.files.map((f) => f.name),
          importAsNotesName(path.basename(source))
        )
  const dest = path.join(projectPath, destName)

  if (mode === 'notes' && isFountainFile(source) && destName.endsWith('.md')) {
    const text = await fs.readFile(source, 'utf8')
    await fs.writeFile(dest, text, 'utf8')
  } else {
    await fs.copyFile(source, dest)
  }

  const snap = await listProject(projectPath)
  if (mode === 'draft') {
    setPreference('lastFilePath', dest)
  }
  return { path: dest, snapshot: snap }
}

function uniqueName(existing: string[], wanted: string): string {
  const lower = new Set(existing.map((n) => n.toLowerCase()))
  if (!lower.has(wanted.toLowerCase())) return wanted
  const ext = path.extname(wanted)
  const stem = wanted.slice(0, -ext.length || wanted.length)
  const stamp = new Date()
    .toISOString()
    .slice(11, 16)
    .replace(':', '')
  const alt = `${stem}-${stamp}${ext}`
  if (!lower.has(alt.toLowerCase())) return alt
  return `${stem}-${Date.now()}${ext}`
}

export async function readProjectFile(
  filePath: string
): Promise<{ path: string; content: string; binary?: Buffer; kind: ProjectFileKind }> {
  const kind = fileKind(filePath)
  if (kind === 'pdf') {
    const binary = await fs.readFile(filePath)
    return { path: filePath, content: '', binary, kind }
  }
  const content = await fs.readFile(filePath, 'utf8')
  return { path: filePath, content, kind }
}

export async function writeProjectFile(
  filePath: string,
  content: string
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
}

export async function tryRestoreLastProject(): Promise<ProjectSnapshot | null> {
  const last = getPreferences().lastProjectPath
  if (last && (await pathExists(last))) {
    try {
      return await listProject(last)
    } catch {
      return null
    }
  }
  return null
}

export { FOUNTAIN_EXTENSION }
