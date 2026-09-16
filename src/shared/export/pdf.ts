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

/** Start a new PDF page when the next visual line would leave the bottom margin. */
function ensureLine(doc: PDFKit.PDFDocument, y: number): number {
  const top = bodyTop()
  if (y + LINE_HEIGHT_PT > bodyBottom() && y > top) {
    doc.addPage()
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

/**
 * Map Fountain text onto paginator visual lines, keeping emphasis when
 * the block fits on one line.
 */
function visualRunLines(text: string, charsPerLine: number): EmphasisRun[][] {
  const runs = emphasisToRuns(text)
  const plain = runs.map((r) => r.text).join('')
  const wrapped = wrapTextLines(plain, charsPerLine)
  if (wrapped.length <= 1) return [runs]
  return wrapped.map((line) => [{ text: line, style: {} }])
}

function drawWrappedBlock(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  align: 'left' | 'right' | 'center',
  charsPerLine: number
): number {
  const lines = visualRunLines(text, charsPerLine)
  let cursor = y
  for (const runs of lines) {
    cursor = ensureLine(doc, cursor)
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
    const vis = visualRunLines(L.text || ' ', charsPerLineFor(L.type))
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

function drawPage(
  doc: PDFKit.PDFDocument,
  page: ScreenplayPage,
  isFirst: boolean
): void {
  if (!isFirst) {
    doc.addPage()
  }

  drawPageNumber(doc, page.pageNumber)

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
        y = ensureLine(doc, y)
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
        y = ensureLine(doc, y)
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
      charsPerLineFor(line.type)
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
      if (pages.length === 0) {
        if (!printTitle) {
          doc.font('Courier').fontSize(FONT_SIZE_PT).text('')
        }
      } else {
        pages.forEach((page, idx) =>
          drawPage(doc, page, idx === 0 && !printTitle)
        )
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

export { POINTS_PER_INCH }
