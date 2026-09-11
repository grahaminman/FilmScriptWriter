import { app } from 'electron'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import {
  fillTemplatePlaceholders,
  getTemplateSource,
  type TemplateId
} from '../shared/templates/text'

export function bundledTemplatesDir(): string {
  const candidates = [
    path.join(app.getAppPath(), 'resources', 'templates'),
    path.join(process.cwd(), 'resources', 'templates')
  ]
  if (app.isPackaged) {
    candidates.unshift(path.join(process.resourcesPath, 'resources', 'templates'))
  }
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir
  }
  return candidates[0]
}

export function suggestedScriptsFolder(): string {
  return path.join(app.getPath('documents'), 'FilmScriptWriter', 'scripts')
}

export async function loadTemplate(id: TemplateId): Promise<string> {
  const file = id === 'feature' ? 'feature.fountain' : 'short-daily.fountain'
  const filePath = path.join(bundledTemplatesDir(), file)
  let raw: string
  try {
    raw = await fsp.readFile(filePath, 'utf8')
  } catch {
    raw = getTemplateSource(id)
  }
  let writer = ''
  try {
    writer = os.userInfo().username || ''
  } catch {
    writer = ''
  }
  return fillTemplatePlaceholders(raw, { writer })
}
