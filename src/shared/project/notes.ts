/**
 * Project notes: one markdown file per screenplay title, plus [[tokens]]
 * in the Fountain editor that map to `# heading` sections.
 *
 * Example: project "MyScript" → `Notes-myscript.md`
 *          editor token `[[ Note 1]]` → heading `# note 1`
 */

export interface NoteSection {
  /** Normalised heading text (lowercase, collapsed whitespace). */
  heading: string
  /** Display heading (as written after `# `). */
  title: string
  body: string
}

const TOKEN_RE = /\[\[\s*([^\]]+?)\s*\]\]/g

export function notesFileName(projectTitle: string): string {
  const slug = projectTitle.trim().toLowerCase().replace(/\s+/g, ' ')
  return `Notes-${slug || 'untitled'}.md`
}

export function isNotesFileName(fileName: string, projectTitle?: string): boolean {
  const base = (fileName.split(/[/\\]/).pop() ?? fileName).toLowerCase()
  if (projectTitle) {
    return base === notesFileName(projectTitle).toLowerCase()
  }
  return /^notes[-_ ].+\.md$/i.test(base)
}

/** `[[ Note 1]]` → `note 1` */
export function tokenToHeading(token: string): string {
  return token.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function headingToTitle(heading: string): string {
  return heading.trim()
}

/**
 * Unique note tokens in source order (`[[ Note 1]]`, `[[beat]]`, …).
 */
export function extractNoteTokens(source: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  const re = new RegExp(TOKEN_RE.source, 'g')
  while ((m = re.exec(source)) !== null) {
    const heading = tokenToHeading(m[1])
    if (!heading || seen.has(heading)) continue
    seen.add(heading)
    out.push(heading)
  }
  return out
}

export function parseNoteSections(markdown: string): NoteSection[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const sections: NoteSection[] = []
  let current: NoteSection | null = null
  const body: string[] = []

  const flush = (): void => {
    if (!current) return
    current.body = trimSectionBody(body.join('\n'))
    sections.push(current)
    body.length = 0
  }

  for (const line of lines) {
    const heading = line.match(/^#\s+(.+?)\s*$/)
    if (heading) {
      flush()
      const title = heading[1].trim()
      current = {
        heading: tokenToHeading(title),
        title,
        body: ''
      }
      continue
    }
    if (current) body.push(line)
  }
  flush()
  return sections
}

function trimSectionBody(text: string): string {
  return text.replace(/^\n+/, '').replace(/\n+$/, '')
}

export function serializeNoteSections(sections: NoteSection[]): string {
  if (sections.length === 0) return ''
  return (
    sections
      .map((s) => {
        const title = s.title || s.heading
        const body = s.body.trim()
        return body ? `# ${title}\n\n${body}` : `# ${title}`
      })
      .join('\n\n') + '\n'
  )
}

export function upsertNoteSection(
  markdown: string,
  heading: string,
  body: string,
  title?: string
): string {
  const key = tokenToHeading(heading)
  const sections = parseNoteSections(markdown)
  const existing = sections.find((s) => s.heading === key)
  if (existing) {
    existing.body = body
    if (title) existing.title = title
  } else {
    sections.push({
      heading: key,
      title: title || headingToTitle(heading),
      body
    })
  }
  return serializeNoteSections(sections)
}

/**
 * Guarantee a `# heading` section exists for every editor token.
 * Existing bodies are preserved.
 */
export function ensureTokenSections(markdown: string, tokens: string[]): string {
  let next = markdown
  for (const token of tokens) {
    const heading = tokenToHeading(token)
    const sections = parseNoteSections(next)
    if (!sections.some((s) => s.heading === heading)) {
      next = upsertNoteSection(next, heading, '')
    }
  }
  return next
}

export function starterNotesMarkdown(projectTitle: string): string {
  return `# notes\n\nNotes for ${projectTitle.trim() || 'this screenplay'}.\n\nUse [[ Note 1]] in the script to pin a heading here.\n`
}
