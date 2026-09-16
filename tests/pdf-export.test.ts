import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { inflateRawSync, inflateSync } from 'node:zlib'
import { fountainToPdf } from '../src/shared/export/pdf'
import {
  ACTION_CHARS_PER_LINE,
  MARGIN_LEFT_IN,
  MARGIN_RIGHT_IN,
  PAGE_WIDTH_IN,
  POINTS_PER_INCH
} from '../src/shared/constants/screenplay'
import { SHORT_DAILY_TEMPLATE } from '../src/shared/templates/text'

function tryPdftotext(buffer: Buffer): string | null {
  const r = spawnSync('pdftotext', ['-layout', '-', '-'], {
    input: buffer,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  })
  if (r.status === 0 && typeof r.stdout === 'string' && r.stdout.length > 0) {
    return r.stdout
  }
  return null
}

function unescapePdfLiteral(raw: string): string {
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] !== '\\') {
      out += raw[i]
      continue
    }
    const n = raw[i + 1]
    if (n === undefined) break
    if (n === 'n') {
      out += '\n'
      i += 1
      continue
    }
    if (n === 'r') {
      out += '\r'
      i += 1
      continue
    }
    if (n === 't') {
      out += '\t'
      i += 1
      continue
    }
    if (n === 'b' || n === 'f' || n === '(' || n === ')' || n === '\\') {
      out += n === 'b' ? '\b' : n === 'f' ? '\f' : n
      i += 1
      continue
    }
    if (n >= '0' && n <= '7') {
      let oct = n
      let j = i + 2
      while (oct.length < 3 && j < raw.length && raw[j] >= '0' && raw[j] <= '7') {
        oct += raw[j]
        j += 1
      }
      out += String.fromCharCode(parseInt(oct, 8))
      i = j - 1
      continue
    }
    out += n
    i += 1
  }
  return out
}

function hexToString(hex: string): string {
  const h = hex.replace(/\s/g, '')
  if (h.length < 2) return ''
  const bytes: number[] = []
  const padded = h.length % 2 === 1 ? `0${h}` : h
  for (let i = 0; i < padded.length; i += 2) {
    bytes.push(parseInt(padded.slice(i, i + 2), 16))
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let s = ''
    for (let i = 2; i + 1 < bytes.length; i += 2) {
      s += String.fromCharCode((bytes[i] << 8) | bytes[i + 1])
    }
    return s
  }
  return Buffer.from(bytes).toString('latin1')
}

function extractStringsFromContent(content: string): string[] {
  const parts: string[] = []
  const tj = /\((?:\\.|[^\\)])*\)\s*Tj/g
  let m: RegExpExecArray | null
  while ((m = tj.exec(content))) {
    const inner = m[0].slice(1, m[0].lastIndexOf(')'))
    parts.push(unescapePdfLiteral(inner))
  }
  const hexTj = /<([0-9A-Fa-f\s]+)>\s*Tj/g
  while ((m = hexTj.exec(content))) {
    parts.push(hexToString(m[1]))
  }
  const TJ = /\[([\s\S]*?)\]\s*TJ/g
  while ((m = TJ.exec(content))) {
    const arr = m[1]
    const innerLit = /\((?:\\.|[^\\)])*\)/g
    let s: RegExpExecArray | null
    while ((s = innerLit.exec(arr))) {
      parts.push(unescapePdfLiteral(s[0].slice(1, -1)))
    }
    const hex = /<([0-9A-Fa-f\s]+)>/g
    while ((s = hex.exec(arr))) {
      parts.push(hexToString(s[1]))
    }
  }
  return parts
}

function inflateMaybe(data: Buffer): Buffer {
  const attempts: Buffer[] = [data]
  if (data.length && (data[data.length - 1] === 0x0a || data[data.length - 1] === 0x0d)) {
    const cut = data[data.length - 1] === 0x0a && data.length > 1 && data[data.length - 2] === 0x0d ? 2 : 1
    attempts.push(data.subarray(0, data.length - cut))
  }
  for (const buf of attempts) {
    try {
      return inflateSync(buf)
    } catch {
      /* try raw */
    }
    try {
      return inflateRawSync(buf)
    } catch {
      /* next */
    }
  }
  return data
}

/** Visible PDF text via pdftotext, or by inflating content streams. */
export function extractPdfText(buffer: Buffer): string {
  const fromTool = tryPdftotext(buffer)
  if (fromTool != null) return fromTool

  const latin = buffer.toString('latin1')
  const parts: string[] = []
  const re = /stream\r?\n([\s\S]*?)endstream/g
  let m: RegExpExecArray | null
  while ((m = re.exec(latin))) {
    const decoded = inflateMaybe(Buffer.from(m[1], 'latin1'))
    const content = decoded.toString('latin1')
    if (!/TJ\b|Tj\b/.test(content)) continue
    parts.push(...extractStringsFromContent(content))
  }
  if (parts.length === 0) {
    parts.push(...extractStringsFromContent(latin))
  }
  return parts.join('')
}

function extractPdfBBoxWords(
  buffer: Buffer
): Array<{ text: string; xMin: number; xMax: number }> {
  const r = spawnSync('pdftotext', ['-bbox', '-', '-'], {
    input: buffer,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  })
  if (r.status !== 0 || typeof r.stdout !== 'string') return []
  const words: Array<{ text: string; xMin: number; xMax: number }> = []
  const re =
    /<word xMin="([^"]+)" yMin="[^"]+" xMax="([^"]+)" yMax="[^"]+">([^<]*)<\/word>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(r.stdout))) {
    words.push({ xMin: Number(m[1]), xMax: Number(m[2]), text: m[3] })
  }
  return words
}

function pdfContainsFont(buffer: Buffer, name: string): boolean {
  if (buffer.toString('latin1').includes(name)) return true
  const latin = buffer.toString('latin1')
  const re = /stream\r?\n([\s\S]*?)endstream/g
  let m: RegExpExecArray | null
  while ((m = re.exec(latin))) {
    const decoded = inflateMaybe(Buffer.from(m[1], 'latin1'))
    if (decoded.toString('latin1').includes(name)) return true
  }
  return false
}

describe('PDF export', () => {
  it('generates a non-empty PDF buffer for a short script', async () => {
    const source = `
Title: PDF Test
Author: Tester

INT. ROOM - DAY

Action line here.

ALICE
Hello there, friend.

CUT TO:

EXT. PARK - NIGHT

The end.
`
    const buffer = await fountainToPdf(source, {
      title: 'PDF Test',
      author: 'Tester'
    })
    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(buffer.length).toBeGreaterThan(100)
    expect(buffer.subarray(0, 4).toString('utf8')).toBe('%PDF')
  })

  it('generates a PDF for an empty document', async () => {
    const buffer = await fountainToPdf('')
    expect(buffer.subarray(0, 4).toString('utf8')).toBe('%PDF')
    expect(buffer.length).toBeGreaterThan(50)
  })

  it('handles a longer multi-page script', async () => {
    const parts: string[] = ['Title: Long\n\n']
    for (let i = 0; i < 40; i++) {
      parts.push(`INT. SET ${i} - DAY\n\n`)
      parts.push(`Action paragraph ${i}. `.repeat(10) + '\n\n')
      parts.push(`HERO\nLine ${i}.\n\n`)
    }
    const buffer = await fountainToPdf(parts.join(''))
    expect(buffer.subarray(0, 4).toString('utf8')).toBe('%PDF')
    expect(buffer.length).toBeGreaterThan(1000)
  }, 15_000)

  it('prints title-page fields and body element types; omits notes', async () => {
    const longAction = `${'The rain keeps falling on the empty street while neon signs flicker above the diner. '.repeat(4)}WRAPTAILOMEGA99`
    expect(longAction.length).toBeGreaterThan(ACTION_CHARS_PER_LINE)

    const source = `Title: UNIQUETITLEPAGE
Credit: Written by
Author: UNIQUEAUTHORNAME
Draft date: UNIQUEDRAFTDATE
Contact: UNIQUECONTACTLINE

[[ UNIQUENOTEHIDDEN ]]

INT. UNIQUESCENEHEADING - DAY

UNIQUEACTIONSENTENCE

${longAction}

UNIQUECHARACTER
UNIQUEDIALOGUELINE

CUT TO:

FADE OUT.

>UNIQUETHEEND<
`
    const buffer = await fountainToPdf(source)
    const text = extractPdfText(buffer)

    expect(text).toContain('UNIQUETITLEPAGE')
    expect(text).toContain('Written by')
    expect(text).toContain('UNIQUEAUTHORNAME')
    expect(text).toContain('UNIQUEDRAFTDATE')
    expect(text).toContain('UNIQUECONTACTLINE')
    expect(text).toContain('UNIQUESCENEHEADING')
    expect(text).toContain('UNIQUEACTIONSENTENCE')
    expect(text).toContain('WRAPTAILOMEGA99')
    expect(text).toContain('UNIQUECHARACTER')
    expect(text).toContain('UNIQUEDIALOGUELINE')
    expect(text).toContain('CUT TO')
    expect(text).toContain('FADE OUT')
    expect(text).toContain('UNIQUETHEEND')
    expect(text).not.toContain('UNIQUENOTEHIDDEN')
  }, 15_000)

  it('does not drop later body lines across page boundaries', async () => {
    const parts: string[] = ['Title: Overflow\n\n']
    for (let i = 0; i < 80; i++) {
      parts.push(`LineMarker${i}zz\n\n`)
    }
    const buffer = await fountainToPdf(parts.join(''))
    const text = extractPdfText(buffer)
    for (let i = 0; i < 80; i++) {
      expect(text, `missing LineMarker${i}zz`).toContain(`LineMarker${i}zz`)
    }
  }, 15_000)

  it('prints both dual-dialogue columns', async () => {
    const source = `
INT. ROOM - DAY

ALICE
ALPHALEFTDUAL

BOB ^
BETARIGHTDUAL
`
    const buffer = await fountainToPdf(source)
    const text = extractPdfText(buffer)
    expect(text).toContain('ALPHALEFTDUAL')
    expect(text).toContain('BETARIGHTDUAL')
    expect(text).toContain('ALICE')
    expect(text).toContain('BOB')
  })

  it('wraps long dual dialogue to column width without overlapping', async () => {
    const left = `LeftDualStart ${'Lwrapxx '.repeat(18)}LeftDualEnd`
    const right = `RightDualStart ${'Rwrapyy '.repeat(18)}RightDualEnd`
    const source = `
INT. ROOM - DAY

ALICE
${left}

BOB ^
${right}
`
    const buffer = await fountainToPdf(source)
    const text = extractPdfText(buffer)
    expect(text).toContain('LeftDualStart')
    expect(text).toContain('LeftDualEnd')
    expect(text).toContain('RightDualStart')
    expect(text).toContain('RightDualEnd')

    const bodyW = (PAGE_WIDTH_IN - MARGIN_LEFT_IN - MARGIN_RIGHT_IN) * POINTS_PER_INCH
    const leftM = MARGIN_LEFT_IN * POINTS_PER_INCH
    const leftEdge = leftM + bodyW * 0.48
    const rightEdge = leftM + bodyW * 0.52
    const words = extractPdfBBoxWords(buffer)
    expect(words.length).toBeGreaterThan(0)
    const leftWords = words.filter(
      (w) => w.text === 'Lwrapxx' || w.text.startsWith('LeftDual')
    )
    const rightWords = words.filter(
      (w) => w.text === 'Rwrapyy' || w.text.startsWith('RightDual')
    )
    expect(leftWords.length).toBeGreaterThan(0)
    expect(rightWords.length).toBeGreaterThan(0)
    for (const w of leftWords) {
      expect(w.xMax, w.text).toBeLessThanOrEqual(leftEdge + 1)
    }
    for (const w of rightWords) {
      expect(w.xMin, w.text).toBeGreaterThanOrEqual(rightEdge - 1)
    }
  }, 15_000)

  it('numbers PDF pages created when a block overflows the paginator page', async () => {
    const source = Array.from({ length: 2000 }, (_, i) => `pgw${i}`).join(' ')
    const buffer = await fountainToPdf(source)
    const text = extractPdfText(buffer)
    expect(text).toContain('pgw0')
    expect(text).toContain('pgw1999')
    expect(text).toMatch(/\b1\./)
    expect(text).toMatch(/\b2\./)
  }, 15_000)

  it('keeps emphasis on wrapped PDF lines', async () => {
    const inner = Array.from({ length: 50 }, (_, i) => `italword${i}`).join(' ')
    const source = `INT. ROOM - DAY\n\n*${inner} ItalTail*\n`
    const buffer = await fountainToPdf(source)
    const text = extractPdfText(buffer)
    expect(text).toContain('italword0')
    expect(text).toContain('ItalTail')
    expect(pdfContainsFont(buffer, 'Courier-Oblique')).toBe(true)
  }, 15_000)

  it('omits daily-prompt notes from the PDF', async () => {
    const buffer = await fountainToPdf(SHORT_DAILY_TEMPLATE)
    const text = extractPdfText(buffer)
    expect(text).not.toContain('DAILY PROMPT')
    expect(text).not.toContain('filmscriptwriter-3192')
    expect(text).toContain('FADE IN')
    expect(text).toContain('FADE OUT')
    expect(text).toContain('THE END')
  })
})
