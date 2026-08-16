/**
 * Draft filename conventions for FilmScriptWriter projects.
 *
 * Current draft screenplay:  {Project Name}-draft-YYYY-MM-DD.fountain
 * Older drafts keep their dated names. A file with no date yields to any
 * dated sibling — the newest ISO (or compact YYYYMMDD) date wins.
 */

export const FOUNTAIN_EXT = '.fountain'
export const MARKDOWN_EXT = '.md'

/** Capture a calendar date from a draft-style filename. */
const DRAFT_ISO_RE = /(?:^|[_\-\s.])draft[-_\s.]?(\d{4}-\d{2}-\d{2})(?:[_\-\s.]|$)/i
const ANY_ISO_RE = /(\d{4}-\d{2}-\d{2})/
const DRAFT_COMPACT_RE = /(?:^|[_\-\s.])draft[-_\s.]?(\d{8})(?:[_\-\s.]|$)/i

export interface DraftInfo {
  fileName: string
  date: string | null
  /** Milliseconds since epoch for the parsed date, or 0 when undated. */
  dateMs: number
}

export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  )
}

function compactToIso(compact: string): string | null {
  if (!/^\d{8}$/.test(compact)) return null
  const iso = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`
  return isIsoDate(iso) ? iso : null
}

/**
 * Parse a calendar date out of a screenplay filename.
 * Prefers `…-draft-YYYY-MM-DD…`, then any ISO date, then compact YYYYMMDD.
 */
export function parseDraftDate(fileName: string): string | null {
  const base = fileName.split(/[/\\]/).pop() ?? fileName
  const draftIso = base.match(DRAFT_ISO_RE)
  if (draftIso && isIsoDate(draftIso[1])) return draftIso[1]
  const anyIso = base.match(ANY_ISO_RE)
  if (anyIso && isIsoDate(anyIso[1])) return anyIso[1]
  const compact = base.match(DRAFT_COMPACT_RE)
  if (compact) return compactToIso(compact[1])
  return null
}

export function inspectDraft(fileName: string): DraftInfo {
  const date = parseDraftDate(fileName)
  return {
    fileName,
    date,
    dateMs: date ? Date.parse(`${date}T00:00:00Z`) : 0
  }
}

/** `{Project Name}-draft-YYYY-MM-DD.fountain` */
export function formatDraftFileName(
  projectName: string,
  date: string = todayIso()
): string {
  const name = sanitizeProjectName(projectName)
  const iso = isIsoDate(date) ? date : todayIso()
  return `${name}-draft-${iso}${FOUNTAIN_EXT}`
}

export function sanitizeProjectName(name: string): string {
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
}

/**
 * Remove a recognised draft date (and a neighbouring `-draft-` token)
 * from a filename stem, keeping the extension unless asked otherwise.
 */
export function stripDraftDate(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? fileName
  const extMatch = base.match(/(\.[A-Za-z0-9]+)$/)
  const ext = extMatch ? extMatch[1] : ''
  let stem = ext ? base.slice(0, -ext.length) : base
  stem = stem.replace(/[-_\s.]draft[-_\s.]?\d{4}-\d{2}-\d{2}/gi, '')
  stem = stem.replace(/[-_\s.]draft[-_\s.]?\d{8}/gi, '')
  stem = stem.replace(/\d{4}-\d{2}-\d{2}/g, '')
  stem = stem.replace(/[-_\s.]{2,}/g, '-').replace(/^[-_\s.]+|[-_\s.]+$/g, '')
  return (stem || 'notes') + ext
}

export function isFountainFile(fileName: string): boolean {
  return /\.(fountain|txt)$/i.test(fileName)
}

/**
 * Choose the current draft among fountain filenames.
 *
 * - Any dated file beats every undated file.
 * - Among dated files the newest calendar date wins.
 * - Equal dates: later name in the input list wins (stable, caller can
 *   sort by mtime first if desired).
 * - All undated: returns null so the caller can fall back to mtime.
 */
export function pickCurrentDraft(fileNames: string[]): string | null {
  const fountain = fileNames.filter(isFountainFile)
  if (fountain.length === 0) return null

  const dated = fountain.map(inspectDraft).filter((d) => d.date)
  if (dated.length === 0) return null

  let best = dated[0]
  for (const item of dated.slice(1)) {
    if (item.dateMs >= best.dateMs) best = item
  }
  return best.fileName
}

/** True when `fileName` is the current draft of `all`. */
export function isCurrentDraft(fileName: string, all: string[]): boolean {
  const current = pickCurrentDraft(all)
  if (!current) return false
  const a = fileName.split(/[/\\]/).pop()
  const b = current.split(/[/\\]/).pop()
  return Boolean(a && b && a === b)
}

/**
 * Destination name when importing a screenplay as the new current draft.
 * Always dated so it becomes current.
 */
export function importAsCurrentDraftName(
  projectName: string,
  date: string = todayIso()
): string {
  return formatDraftFileName(projectName, date)
}

/**
 * Destination stem when importing a file as notes (not a draft).
 * Dates are stripped; extension becomes `.md` unless the source is a PDF.
 */
export function importAsNotesName(originalFileName: string): string {
  const stripped = stripDraftDate(originalFileName)
  const base = stripped.split(/[/\\]/).pop() ?? stripped
  if (/\.pdf$/i.test(base)) return base
  const stem = base.replace(/\.[A-Za-z0-9]+$/, '')
  return `${stem || 'notes'}${MARKDOWN_EXT}`
}
