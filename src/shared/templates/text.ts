export type TemplateId = 'short-daily' | 'feature'

export const SHORT_DAILY_TEMPLATE = `Title: Untitled Short
Credit: Written by
Author: {Writer}
Draft date: {Date}
Contact:
  {Email}

[[ DAILY PROMPT
Community: filmscriptwriter-3192
Write one complete short film today. Aim for 2–5 pages.

Person:
Place:
Prop:
Optional dialogue:

When you are done, FADE OUT. This note does not print. ]]

FADE IN:

INT. 


FADE OUT.

>THE END<
`

export const FEATURE_TEMPLATE = `Title: {Title}
Credit: Written by
Author: {Writer}
Draft date: {Date}
Contact:
  {Email}

[[ Replace {Title}, {Writer}, {Date}, {Email}. Section headings (#) do not print. ]]

FADE IN:

# ACT ONE

= Ordinary world. Something they cannot ignore. Locked in.

INT. 


# ACT TWO

= Trouble grows. Midpoint turn. The old way stops working.

INT. 


# ACT THREE

= They face it. Cost. New normal.

INT. 


FADE OUT.

>THE END<
`

export const TEMPLATE_FILES: Record<TemplateId, { filename: string; content: string }> = {
  'short-daily': {
    filename: 'short-daily.fountain',
    content: SHORT_DAILY_TEMPLATE
  },
  feature: {
    filename: 'feature.fountain',
    content: FEATURE_TEMPLATE
  }
}

export function formatTemplateDate(date: Date = new Date()): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function fillTemplatePlaceholders(
  source: string,
  vars: { writer?: string; date?: string; email?: string; title?: string } = {}
): string {
  const date = vars.date ?? formatTemplateDate()
  let out = source.replace(/^Draft date: \{Date\}$/m, `Draft date: ${date}`)
  const writer = vars.writer?.trim()
  if (writer) out = out.replace(/^Author: \{Writer\}$/m, `Author: ${writer}`)
  const email = vars.email?.trim()
  if (email) {
    out = out.replace(/^ {2}\{Email\}$/m, `  ${email}`)
  }
  const title = vars.title?.trim()
  if (title) out = out.replace(/^Title: \{Title\}$/m, `Title: ${title}`)
  return out
}

export function getTemplateSource(
  id: TemplateId,
  vars?: { writer?: string; date?: string; email?: string; title?: string }
): string {
  return fillTemplatePlaceholders(TEMPLATE_FILES[id].content, vars)
}
