/**
 * Hollywood-format PDF export using PDFKit.
 *
 * Matches live preview: emphasis, dual dialogue columns, forced @ names.
 * Text is wrapped with the same character-width rules as the paginator
 * and drawn one visual line at a time so PDFKit cannot clip overflow.
 */

import PDFDocument from 'pdfkit'
import {
  ACTION_CHARS_PER_LINE,
  CHARACTER_LEFT_IN,
  DIALOGUE_LEFT_IN,
  DIALOGUE_RIGHT_IN,
  FONT_SIZE_PT,
  LINE_HEIGHT_PT,
  MARGIN_BOTTOM_IN,
  MARGIN_LEFT_IN,
  MARGIN_RIGHT_IN,
  MARGIN_TOP_IN,
  PAGE_HEIGHT_IN,
  PAGE_NUMBER_RIGHT_IN,
  PAGE_NUMBER_TOP_IN,
  PAGE_WIDTH_IN,
  PARENTHETICAL_LEFT_IN,
  PARENTHETICAL_RIGHT_IN,
  POINTS_PER_INCH,
  TRANSITION_RIGHT_IN,
  inchesToPoints
} from '../constants/screenplay'
import { emphasisToRuns, type EmphasisRun } from '../fountain/emphasis'
import { charsPerLineFor, paginateDocument, wrapTextLines } from '../fountain/page-counter'
import { parseFountain } from '../fountain/parser'
import type { LayoutLine, ScreenplayPage, TitlePage } from '../fountain/types'

export interface PdfExportOptions {
  title?: string
  author?: string
}

function geometryFor(
  type: LayoutLine['type'],
  dualColumn?: 'left' | 'right'
): { x: number; width: number; align: 'left' | 'right' | 'center' } {
  const pageW = inchesToPoints(PAGE_WIDTH_IN)
  const leftM = inchesToPoints(MARGIN_LEFT_IN)
  const rightM = inchesToPoints(MARGIN_RIGHT_IN)
  const bodyW = pageW - leftM - rightM

  if (dualColumn === 'left') {
    return { x: leftM, width: bodyW * 0.48, align: type === 'character' ? 'center' : 'left' }
  }
  if (dualColumn === 'right') {
    return {
      x: leftM + bodyW * 0.52,
      width: bodyW * 0.48,
      align: type === 'character' ? 'center' : 'left'
    }
  }

  switch (type) {
    case 'character':
      return {
        x: inchesToPoints(CHARACTER_LEFT_IN),
        width: pageW - inchesToPoints(CHARACTER_LEFT_IN) - rightM,
        align: 'left'
      }
    case 'parenthetical':
      return {
        x: inchesToPoints(PARENTHETICAL_LEFT_IN),
        width:
          pageW -
          inchesToPoints(PARENTHETICAL_LEFT_IN) -
          inchesToPoints(PARENTHETICAL_RIGHT_IN),
        align: 'left'
      }
    case 'dialogue':
    case 'lyrics':
      return {
        x: inchesToPoints(DIALOGUE_LEFT_IN),
        width: pageW - inchesToPoints(DIALOGUE_LEFT_IN) - inchesToPoints(DIALOGUE_RIGHT_IN),
        align: 'left'
      }
    case 'transition':
      return {
        x: leftM,
        width: pageW - leftM - inchesToPoints(TRANSITION_RIGHT_IN),
        align: 'right'
      }
    case 'centered':
      return { x: leftM, width: bodyW, align: 'center' }
    case 'scene_heading':
    case 'action':
    default:
      return { x: leftM, width: bodyW, align: 'left' }
  }
}

function fontForRun(run: EmphasisRun): string {
  const b = Boolean(run.style.bold)
  const i = Boolean(run.style.italic)
  if (b && i) return 'Courier-BoldOblique'
  if (b) return 'Courier-Bold'
  if (i) return 'Courier-Oblique'
  return 'Courier'
}

function bodyTop(): number {
  return inchesToPoints(MARGIN_TOP_IN)
}

function bodyBottom(): number {
  return inchesToPoints(PAGE_HEIGHT_IN) - inchesToPoints(MARGIN_BOTTOM_IN)
}

type PageSeq = { n: number }

function charsPerLineForWidth(widthPt: number): number {
  const bodyW =
    inchesToPoints(PAGE_WIDTH_IN) -
    inchesToPoints(MARGIN_LEFT_IN) -
    inchesToPoints(MARGIN_RIGHT_IN)
  return Math.max(1, Math.floor((widthPt / bodyW) * ACTION_CHARS_PER_LINE))
}

function drawPageNumber(doc: PDFKit.PDFDocument, pageNumber: number): void {
  const pageNumX =
    inchesToPoints(PAGE_WIDTH_IN) - inchesToPoints(PAGE_NUMBER_RIGHT_IN)
  const pageNumY = inchesToPoints(PAGE_NUMBER_TOP_IN)
  doc
    .font('Courier')
    .fontSize(FONT_SIZE_PT)
    .text(`${pageNumber}.`, pageNumX - 40, pageNumY, {
      width: 40,
      align: 'right',
      lineBreak: false
    })
}

function ensureLine(doc: PDFKit.PDFDocument, y: number, seq: PageSeq): number {
  const top = bodyTop()
  if (y + LINE_HEIGHT_PT > bodyBottom() && y > top) {
    doc.addPage()
    seq.n += 1
    drawPageNumber(doc, seq.n)
    return top
  }
  return y
}

/**
 * Draw one already-wrapped visual line. No PDFKit wrap/clip.
 */
function drawSingleLine(
  doc: PDFKit.PDFDocument,
  runs: EmphasisRun[],
  x: number,
  y: number,
  width: number,
  align: 'left' | 'right' | 'center'
): void {
  const plain = runs.map((r) => r.text).join('')
  if (!plain) return

  doc.font('Courier').fontSize(FONT_SIZE_PT)
  const plainWidth = doc.widthOfString(plain)
  let cursorX = x
  if (align === 'center') {
    cursorX = x + (width - plainWidth) / 2
  } else if (align === 'right') {
    cursorX = x + width - plainWidth
  }

  const styled = runs.some(
    (r) => r.style.bold || r.style.italic || r.style.underline
  )
  if (!styled) {
    doc.text(plain, cursorX, y, { lineBreak: false, continued: false })
    return
  }

  for (const run of runs) {
    if (!run.text) continue
    doc.font(fontForRun(run)).fontSize(FONT_SIZE_PT)
    const w = doc.widthOfString(run.text)
    doc.text(run.text, cursorX, y, { lineBreak: false, continued: false })
    if (run.style.underline) {
      doc
        .moveTo(cursorX, y + FONT_SIZE_PT + 1)
        .lineTo(cursorX + w, y + FONT_SIZE_PT + 1)
        .stroke()
    }
    cursorX += w
  }
}

type StyledChar = { ch: string; style: EmphasisRun['style'] }

function flattenRuns(runs: EmphasisRun[]): StyledChar[] {
  const out: StyledChar[] = []
  for (const run of runs) {
    for (const ch of run.text) {
      out.push({ ch, style: run.style })
    }
  }
  return out
}

function sameStyle(a: EmphasisRun['style'], b: EmphasisRun['style']): boolean {
  return (
    Boolean(a.bold) === Boolean(b.bold) &&
    Boolean(a.italic) === Boolean(b.italic) &&
    Boolean(a.underline) === Boolean(b.underline)
  )
}

function charsToRuns(chars: StyledChar[]): EmphasisRun[] {
  const runs: EmphasisRun[] = []
  for (const c of chars) {
    const last = runs[runs.length - 1]
    if (last && sameStyle(last.style, c.style)) last.text += c.ch
    else runs.push({ text: c.ch, style: { ...c.style } })
  }
  return runs
}

function collapseStyled(segment: StyledChar[]): StyledChar[] {
  const tmp: StyledChar[] = []
  for (const c of segment) {
    if (c.ch === ' ' || c.ch === '\t') {
      if (tmp.length && (tmp[tmp.length - 1].ch === ' ' || tmp[tmp.length - 1].ch === '\t')) {
        continue
      }
      tmp.push({ ch: ' ', style: c.style })
    } else {
      tmp.push(c)
    }
  }
  while (tmp.length && tmp[0].ch === ' ') tmp.shift()
  while (tmp.length && tmp[tmp.length - 1].ch === ' ') tmp.pop()
  return tmp
}

/** Same wrap as wrapTextLines, carrying emphasis onto each visual line. */
function wrapStyledParagraph(
  segment: StyledChar[],
  charsPerLine: number
): EmphasisRun[][] {
  const raw = collapseStyled(segment)
  if (raw.length === 0) return [[]]

  const words: StyledChar[][] = []
  let word: StyledChar[] = []
  for (const c of raw) {
    if (c.ch === ' ') {
      if (word.length) words.push(word)
      word = []
    } else {
      word.push(c)
    }
  }
  if (word.length) words.push(word)

  const lines: StyledChar[][] = []
  let current: StyledChar[] = []

  const startWord = (w: StyledChar[]): void => {
    if (w.length <= charsPerLine) {
      current = w.slice()
      return
    }
    let rest = w
    while (rest.length > charsPerLine) {
      lines.push(rest.slice(0, charsPerLine))
      rest = rest.slice(charsPerLine)
    }
    current = rest.slice()
  }

  for (const w of words) {
    if (current.length === 0) {
      startWord(w)
      continue
    }
    if (current.length + 1 + w.length <= charsPerLine) {
      current = [...current, { ch: ' ', style: {} }, ...w]
    } else {
      lines.push(current)
      startWord(w)
    }
  }
  if (current.length) lines.push(current)
  return (lines.length ? lines : [[]]).map(charsToRuns)
}

function visualRunLines(text: string, charsPerLine: number): EmphasisRun[][] {
  const runs = emphasisToRuns(text)
  if (charsPerLine <= 0) return [runs]
  const chars = flattenRuns(runs)
  const normalised: StyledChar[] = []
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (c.ch === '\r') {
      if (chars[i + 1]?.ch !== '\n') normalised.push({ ...c, ch: '\n' })
      continue
    }
    normalised.push(c)
  }
  if (normalised.length === 0) return [runs]

  const out: EmphasisRun[][] = []
  let segment: StyledChar[] = []
  for (const c of normalised) {
    if (c.ch === '\n') {
      out.push(...wrapStyledParagraph(segment, charsPerLine))
      segment = []
    } else {
      segment.push(c)
    }
  }
  out.push(...wrapStyledParagraph(segment, charsPerLine))
  return out.length ? out : [runs]
}

function drawWrappedBlock(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  align: 'left' | 'right' | 'center',
  charsPerLine: number,
  seq: PageSeq
): number {
  const lines = visualRunLines(text, charsPerLine)
  let cursor = y
  for (const runs of lines) {
    cursor = ensureLine(doc, cursor, seq)
    drawSingleLine(doc, runs, x, cursor, width, align)
    cursor += LINE_HEIGHT_PT
  }
  return cursor
}

type DualVisual = {
  runs: EmphasisRun[]
  x: number
  width: number
  align: 'left' | 'right' | 'center'
}

function layoutToDualVisual(
  lines: LayoutLine[],
  column: 'left' | 'right'
): DualVisual[] {
  const out: DualVisual[] = []
  for (const L of lines) {
    if (L.isSpacer || L.type === 'empty') continue
    const g = geometryFor(L.type, column)
    const vis = visualRunLines(L.text || ' ', charsPerLineForWidth(g.width))
    for (const runs of vis) {
      out.push({ runs, x: g.x, width: g.width, align: g.align })
    }
  }
  return out
}

function titlePageHasPrintable(tp: TitlePage): boolean {
  return Boolean(
    tp.title?.trim() ||
      tp.credit?.trim() ||
      tp.author?.trim() ||
      tp.draftDate?.trim() ||
      tp.contact?.trim()
  )
}

function drawTitlePage(doc: PDFKit.PDFDocument, tp: TitlePage): void {
  const leftM = inchesToPoints(MARGIN_LEFT_IN)
  const pageW = inchesToPoints(PAGE_WIDTH_IN)
  const rightM = inchesToPoints(MARGIN_RIGHT_IN)
  const bodyW = pageW - leftM - rightM
  const cpl = ACTION_CHARS_PER_LINE

  let y = inchesToPoints(3.5)

  const drawCentered = (text: string): void => {
    const vis = visualRunLines(text, cpl)
    for (const runs of vis) {
      drawSingleLine(doc, runs, leftM, y, bodyW, 'center')
      y += LINE_HEIGHT_PT
    }
  }

  if (tp.title?.trim()) {
    drawCentered(tp.title.trim())
    y += LINE_HEIGHT_PT * 2
  }

  const credit = tp.credit?.trim() || (tp.author?.trim() ? 'Written by' : '')
  if (credit) {
    drawCentered(credit)
    y += LINE_HEIGHT_PT
  }
  if (tp.author?.trim()) {
    drawCentered(tp.author.trim())
  }

  const dateLines = tp.draftDate?.trim()
    ? wrapTextLines(tp.draftDate.trim(), cpl)
    : []
  const contactLines = tp.contact?.trim()
    ? wrapTextLines(tp.contact.trim(), cpl)
    : []
  const bottomLines: string[] = [
    ...dateLines,
    ...(dateLines.length && contactLines.length ? [''] : []),
    ...contactLines
  ]
  if (bottomLines.length === 0) return

  let by =
    bodyBottom() - bottomLines.length * LINE_HEIGHT_PT
  if (by < y + LINE_HEIGHT_PT) by = y + LINE_HEIGHT_PT
  for (const line of bottomLines) {
    if (line) {
      drawSingleLine(
        doc,
        [{ text: line, style: {} }],
        leftM,
        by,
        bodyW,
        'left'
      )
    }
    by += LINE_HEIGHT_PT
  }
}

function drawPage(
  doc: PDFKit.PDFDocument,
  page: ScreenplayPage,
  isFirst: boolean,
  seq: PageSeq
): void {
  if (!isFirst) {
    doc.addPage()
  }
  seq.n += 1
  drawPageNumber(doc, seq.n)

  let y = bodyTop()
  const lines = page.lines
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.type === 'page_break') {
      i += 1
      continue
    }

    if (line.isSpacer || line.type === 'empty') {
      y += LINE_HEIGHT_PT * Math.max(1, line.lineCount)
      i += 1
      continue
    }

    if (line.dualGroup != null && line.dualColumn === 'left') {
      const group = line.dualGroup
      const left: LayoutLine[] = []
      const right: LayoutLine[] = []
      while (
        i < lines.length &&
        lines[i].dualGroup === group &&
        lines[i].dualColumn === 'left'
      ) {
        left.push(lines[i])
        i += 1
      }
      while (
        i < lines.length &&
        (lines[i].isSpacer || lines[i].type === 'empty')
      ) {
        i += 1
      }
      while (
        i < lines.length &&
        lines[i].dualGroup === group &&
        lines[i].dualColumn === 'right'
      ) {
        right.push(lines[i])
        i += 1
      }
      const leftVis = layoutToDualVisual(left, 'left')
      const rightVis = layoutToDualVisual(right, 'right')
      const n = Math.max(leftVis.length, rightVis.length)
      for (let k = 0; k < n; k++) {
        y = ensureLine(doc, y, seq)
        const L = leftVis[k]
        const R = rightVis[k]
        if (L) drawSingleLine(doc, L.runs, L.x, y, L.width, L.align)
        if (R) drawSingleLine(doc, R.runs, R.x, y, R.width, R.align)
        y += LINE_HEIGHT_PT
      }
      continue
    }

    if (line.dualGroup != null && line.dualColumn === 'right') {
      const group = line.dualGroup
      const right: LayoutLine[] = []
      while (
        i < lines.length &&
        lines[i].dualGroup === group &&
        lines[i].dualColumn === 'right'
      ) {
        right.push(lines[i])
        i += 1
      }
      const rightVis = layoutToDualVisual(right, 'right')
      for (const R of rightVis) {
        y = ensureLine(doc, y, seq)
        drawSingleLine(doc, R.runs, R.x, y, R.width, R.align)
        y += LINE_HEIGHT_PT
      }
      continue
    }

    const { x, width, align } = geometryFor(line.type, line.dualColumn)
    const text = line.text ?? ''
    y = drawWrappedBlock(
      doc,
      text,
      x,
      y,
      width,
      align,
      charsPerLineFor(line.type),
      seq
    )
    i += 1
  }
}

export function fountainToPdf(
  source: string,
  options: PdfExportOptions = {}
): Promise<Buffer> {
  const parsed = parseFountain(source)
  const pagination = paginateDocument(parsed)
  const printTitle = titlePageHasPrintable(parsed.titlePage)

  const title =
    options.title ||
    parsed.titlePage.title ||
    'Untitled Screenplay'
  const author = options.author || parsed.titlePage.author || ''

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [
          inchesToPoints(PAGE_WIDTH_IN),
          inchesToPoints(PAGE_HEIGHT_IN)
        ],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
          Title: title,
          Author: author,
          Creator: 'FilmScriptWriter',
          Producer: 'FilmScriptWriter'
        },
        autoFirstPage: true,
        bufferPages: true
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      if (printTitle) {
        drawTitlePage(doc, parsed.titlePage)
      }

      const pages = pagination.pages
      const seq: PageSeq = { n: 0 }
      if (pages.length === 0) {
        if (!printTitle) {
          doc.font('Courier').fontSize(FONT_SIZE_PT).text('')
        }
      } else {
        pages.forEach((page, idx) =>
          drawPage(doc, page, idx === 0 && !printTitle, seq)
        )
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

export { POINTS_PER_INCH }
