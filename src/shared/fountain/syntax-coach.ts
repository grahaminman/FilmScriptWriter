/**
 * Live Fountain syntax coach — maps the line under the caret (and the
 * word being typed) to a beginner-friendly explanation.
 */

/** Mirrors the editor line classifier without importing renderer code. */
export type CoachLineKind =
  | 'scene'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'lyrics'
  | 'centered'
  | 'section'
  | 'note'
  | 'boneyard'
  | 'meta'
  | 'pagebreak'
  | 'empty'
  | 'unknown'

export type CoachId =
  | 'ready'
  | 'title'
  | 'scene'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'dual'
  | 'transition'
  | 'centered'
  | 'lyrics'
  | 'note'
  | 'boneyard'
  | 'section'
  | 'synopsis'
  | 'pagebreak'
  | 'emphasis'
  | 'not-fountain'

export interface SyntaxCoachTip {
  id: string
  title: string
  syntax: string
  explanation: string
  next?: string
}

export interface SyntaxCoachInput {
  lineText: string
  lineKind: CoachLineKind
  previousKind?: CoachLineKind
  prevBlank: boolean
  /** 0-based column of the caret on the line. */
  cursorCol: number
  isFountain: boolean
}

const TIPS: Record<string, SyntaxCoachTip> = {
  ready: {
    id: 'ready',
    title: 'Ready to write',
    syntax: 'INT. KITCHEN - DAY\n\nA kettle WHISTLES.\n\nMAYA',
    explanation:
      'A screenplay is what we see and hear. After a blank line you can start a new scene, describe the action, or type a character’s name in CAPITALS so they can speak.',
    next: 'Try a scene heading: INT. (inside) or EXT. (outside), then the place and time.'
  },
  title: {
    id: 'title',
    title: 'Title page',
    syntax: 'Title: MyScript\nCredit: written by\nAuthor: Your Name\nDraft date: 16 August 2026',
    explanation:
      'The first lines of a Fountain file can be a title page: a Key, a colon, then the value. A blank line ends the title page and the script itself begins. This is the cover of your screenplay, not the story.',
    next: 'Common keys: Title, Author, Credit, Source, Draft date, Contact. Press Enter twice when you are ready to write the first scene.'
  },
  scene: {
    id: 'scene',
    title: 'Scene heading (slugline)',
    syntax: 'INT. KITCHEN - DAY',
    explanation:
      'Every new location gets a scene heading so the reader (and later the crew) knows where we are. INT. means inside, EXT. means outside. Then the place, a dash, and the time of day. Fountain prints this line in CAPITALS.',
    next: 'Also valid: EXT. STREET - NIGHT · EST. CITY SKYLINE - DUSK · I/E. CAR - DAY. Force any line to be a heading by starting it with a single period: .THE VOID'
  },
  action: {
    id: 'action',
    title: 'Action / description',
    syntax: 'Rain hammers the windscreen. MAYA grips the wheel.',
    explanation:
      'Action is what the camera sees, written in present tense. Keep it visual and brief — if we cannot film it, it does not belong here. Character names in action are often capitalised the first time we meet them.',
    next: 'A blank line, then a name in ALL CAPS, starts dialogue. Start a line with ! to force action if Fountain would otherwise treat it as something else.'
  },
  character: {
    id: 'character',
    title: 'Character cue',
    syntax: 'MAYA\n(whispering)\nWe have to go.',
    explanation:
      'When someone is about to speak, type their name alone on a line in CAPITALS. The next line is what they say. Extensions in brackets tell us how we hear them: (V.O.) voice-over, (O.S.) off-screen, (CONT’D) they are still talking.',
    next: 'Add ^ at the end of the second name for dual dialogue (two people speaking at once). Force mixed-case names with @, e.g. @McKenzie.'
  },
  parenthetical: {
    id: 'parenthetical',
    title: 'Parenthetical (wryly)',
    syntax: 'MAYA\n(under her breath)\nNot now.',
    explanation:
      'A short note in (brackets) under the character name, before the spoken line. Use it sparingly for how the line is said or a tiny bit of business. If it is a whole action, write an action line instead.',
    next: 'Keep it to a few words. It must sit between the name and the dialogue.'
  },
  dialogue: {
    id: 'dialogue',
    title: 'Dialogue',
    syntax: 'MAYA\nIf we miss this train, we miss everything.',
    explanation:
      'This is the spoken line. Write it the way the character would actually say it. It sits under their name (and any parenthetical). A blank line ends the speech so you can go back to action or another character.',
    next: 'Do not type quotation marks. Emphasis: *italics*, **bold**, _underline_.'
  },
  dual: {
    id: 'dual',
    title: 'Dual dialogue',
    syntax: 'MAYA\nI said no.\n\nJON ^\nYou never listen.',
    explanation:
      'Two characters speaking over each other. Type the first speech as normal. For the second character, put a caret ^ after their name. Preview and PDF print the two speeches side by side.',
    next: 'The ^ goes on the second character cue, not on the spoken words.'
  },
  transition: {
    id: 'transition',
    title: 'Transition',
    syntax: 'CUT TO:\n\nFADE OUT.',
    explanation:
      'A direction for how we leave one scene and enter the next. Classic ones end in TO: and print on the right of the page. New writers often skip these — CUT TO is assumed between scenes — but they are useful for a fade or a smash cut.',
    next: 'Force any right-aligned transition by starting the line with >:  >SMASH CUT'
  },
  centered: {
    id: 'centered',
    title: 'Centered text',
    syntax: '> THE END <',
    explanation:
      'Wrap a line in greater-than and less-than to centre it on the page. Used for THE END, intertitles, or a title card in the body of the script.',
    next: 'Both > and < are required. A lone > is treated as a transition instead.'
  },
  lyrics: {
    id: 'lyrics',
    title: 'Lyrics',
    syntax: '~When you walk through a storm',
    explanation:
      'A line that starts with ~ is a lyric (someone singing). It prints in italics. Use it for songs, not for ordinary speech.',
    next: 'One ~ per line. Continue the song on the following lines, each with ~.'
  },
  note: {
    id: 'note',
    title: 'Note [[ ]]',
    syntax: '[[ Check this against the outline. ]]',
    explanation:
      'Double square brackets are a writer’s note. They are for you (and this app’s notes sidebar). They do not print in the PDF and they are not dialogue. Use them for reminders, questions, or research you do not want on the page.',
    next: 'Close with ]]. A note on its own line is hidden from the printed script. In this app, [[ Note 1]] also becomes an editable heading in the Notes sidebar.'
  },
  boneyard: {
    id: 'boneyard',
    title: 'Boneyard /* */',
    syntax: '/*\nINT. OLD OPENING - DAY\nThis scene is cut for now.\n*/',
    explanation:
      'A boneyard is a comment block — text you want to keep in the file but take out of the movie. Everything between /* and */ is ignored when the script is printed. Think of it as a drawer for leftover scenes, not as a note to an actor.',
    next: 'Start with /* and finish with */. A one-line boneyard is /* like this */. It will not appear in preview or PDF.'
  },
  section: {
    id: 'section',
    title: 'Section heading',
    syntax: '# Act One\n## The robbery',
    explanation:
      'Hash marks organise a long script the way headings organise a document. They are for you while you write (acts, sequences, index). They are not printed as scene headings.',
    next: '# top level, ## nested, and so on. Use the Index sidebar to jump between them.'
  },
  synopsis: {
    id: 'synopsis',
    title: 'Synopsis line',
    syntax: '= Maya decides to run.',
    explanation:
      'A line that starts with = is a one-line outline note under a section or scene. It is a planning tool, not action the camera sees, and it is left out of the printed pages.',
    next: 'Do not confuse = with ===, which is a page break.'
  },
  pagebreak: {
    id: 'pagebreak',
    title: 'Forced page break',
    syntax: '===',
    explanation:
      'Three or more equals signs force a new page in preview and PDF, the way a screenwriter sometimes starts a new page before a big reveal.',
    next: 'Use rarely. Normal page breaks are calculated for you.'
  },
  emphasis: {
    id: 'emphasis',
    title: 'Emphasis',
    syntax: '*italics*   **bold**   _underline_   ***bold italics***',
    explanation:
      'Fountain uses Markdown-style markers inside action and dialogue. They print as italics, bold, or underline. Do not use them for whole paragraphs — a little emphasis goes a long way on a screenplay page.',
    next: 'Close the same marker you opened. Avoid shouting in ALL CAPS for emphasis; that is for character names and scene headings.'
  },
  'not-fountain': {
    id: 'not-fountain',
    title: 'Fountain help',
    syntax: '',
    explanation:
      'This bar follows Fountain screenplay syntax. Open a .fountain draft to see live help as you type.',
    next: 'The current draft of a project is the dated .fountain file.'
  }
}

const KEYWORD_RULES: { test: RegExp; id: string }[] = [
  { test: /\/\*|\*\//, id: 'boneyard' },
  { test: /\bboneyard\b/i, id: 'boneyard' },
  { test: /\[\[|\]\]/, id: 'note' },
  { test: /\bnotes?\b/i, id: 'note' },
  { test: /===+/, id: 'pagebreak' },
  { test: /\bpage\s*break\b/i, id: 'pagebreak' },
  { test: /\b(cut to|fade (in|out)|dissolve to|smash cut)\b:?/i, id: 'transition' },
  { test: /\btransition\b/i, id: 'transition' },
  { test: /\b(int|ext|est|i\/e|int\/ext)\.?\b/i, id: 'scene' },
  { test: /\b(slugline|scene heading|slug line)\b/i, id: 'scene' },
  { test: /\b(interior|exterior)\b/i, id: 'scene' },
  { test: /\b(v\.?o\.?|o\.?s\.?|cont['’]?d|parenthetical|wryly)\b/i, id: 'parenthetical' },
  { test: /\bdual\b|\^/, id: 'dual' },
  { test: /\blyrics?\b/i, id: 'lyrics' },
  { test: /\bcentered\b|\bcentre[d]?\b/i, id: 'centered' },
  { test: /\bsynopsis\b/i, id: 'synopsis' },
  { test: /\b(title page|draft date)\b/i, id: 'title' },
  { test: /\b(character cue|character name)\b/i, id: 'character' },
  { test: /\bdialogue\b/i, id: 'dialogue' },
  { test: /\baction\b/i, id: 'action' },
  { test: /(\*\*|__|\*[^*]+\*|_[^_]+_)/, id: 'emphasis' }
]

const KIND_TO_ID: Record<string, string> = {
  scene: 'scene',
  action: 'action',
  character: 'character',
  parenthetical: 'parenthetical',
  dialogue: 'dialogue',
  transition: 'transition',
  lyrics: 'lyrics',
  centered: 'centered',
  section: 'section',
  note: 'note',
  boneyard: 'boneyard',
  meta: 'title',
  pagebreak: 'pagebreak',
  empty: 'ready'
}

/**
 * Word (or Fountain token) immediately left of the caret.
 */
export function wordAtCursor(lineText: string, cursorCol: number): string {
  const col = Math.max(0, Math.min(cursorCol, lineText.length))
  const left = lineText.slice(0, col)
  const m = left.match(
    /(\[\[[A-Za-z0-9 ]*|\]\]|\/\*|\*\/|\^[ \t]*|={1,}|#{1,6}|~+|!+|@+|[A-Za-z0-9/.']+)$/
  )
  return m ? m[1] : ''
}

function tipById(id: string): SyntaxCoachTip {
  return TIPS[id] ?? TIPS.ready
}

/**
 * Choose the most specific coaching tip for the caret position.
 */
export function resolveSyntaxCoach(input: SyntaxCoachInput): SyntaxCoachTip {
  if (!input.isFountain) return tipById('not-fountain')

  const line = input.lineText
  const trimmed = line.trim()
  const word = wordAtCursor(line, input.cursorCol)
  const hay = `${trimmed} ${word}`

  // Incomplete / mid-token prefixes win — this is the “as you type” coach.
  if (/^\/\*/.test(trimmed) || word === '/*' || word === '*/') return tipById('boneyard')
  if (/^\[\[/.test(trimmed) || word === '[[' || word === ']]' || /\[\[/.test(line)) {
    return tipById('note')
  }
  if (/^#{1,6}(\s|$)/.test(trimmed) || /^#+$/.test(word)) return tipById('section')
  if (/^={3,}/.test(trimmed)) return tipById('pagebreak')
  if (/^=(?!=)/.test(trimmed) || word === '=') return tipById('synopsis')
  if (/^>\s*.+\s*<\s*$/.test(trimmed)) return tipById('centered')
  if (trimmed.startsWith('>') || word === '>') return tipById('transition')
  if (trimmed.startsWith('~') || word.startsWith('~')) return tipById('lyrics')
  if (trimmed.startsWith('@') || word.startsWith('@')) return tipById('character')
  if (/^\.(?!\.)/.test(trimmed)) return tipById('scene')
  if (/\^\s*$/.test(trimmed)) return tipById('dual')
  if (
    input.prevBlank &&
    /^(INT|EXT|EST|I\/E|INT\/EXT|INT\.\/EXT)/i.test(trimmed)
  ) {
    return tipById('scene')
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(hay) || rule.test.test(word)) return tipById(rule.id)
  }

  if (!trimmed) {
    if (input.previousKind === 'character' || input.previousKind === 'parenthetical') {
      return tipById('dialogue')
    }
    if (input.previousKind === 'dialogue') return tipById('action')
    return tipById('ready')
  }

  const fromKind = KIND_TO_ID[input.lineKind] ?? 'action'
  return tipById(fromKind)
}

export function listCoachTips(): SyntaxCoachTip[] {
  return Object.values(TIPS)
}
