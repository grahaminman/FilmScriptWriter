/**
 * Full Fountain syntax reference for the in-app help pane.
 * Written for people new to screenwriting.
 */

export interface FountainSyntaxTopic {
  id: string
  title: string
  /** One-line syntax shown in the retractable index. */
  syntax: string
  group: 'start' | 'page' | 'speech' | 'markup' | 'planning'
  body: string
}

export const FOUNTAIN_SYNTAX_TOPICS: FountainSyntaxTopic[] = [
  {
    id: 'what',
    title: 'What is Fountain?',
    syntax: 'plain text .fountain',
    group: 'start',
    body: `Fountain is a way to write a screenplay in an ordinary text file. You type simple marks; the app turns them into a Hollywood-formatted page (Courier, the usual margins, character names in the middle).

You do not draw boxes or click “Character”. You type, and the shape of the line tells Fountain what it is.

A .fountain file is just text. You can open it in any editor. FilmScriptWriter adds a live page preview, notes, and this reference.`
  },
  {
    id: 'page',
    title: 'How a screenplay page works',
    syntax: 'US Letter · Courier 12',
    group: 'start',
    body: `A professional screenplay looks like a play for the camera:

• Scene headings tell us where we are.
• Action describes what we see, in present tense.
• A name in CAPITALS means someone is about to speak.
• Dialogue is the spoken line — no quotation marks.
• Transitions (CUT TO:) are optional; a new scene heading is usually enough.

If you cannot film it or hear it, it probably does not belong on the page. Thoughts, camera essays, and “we feel that…” are for notes, not action.`
  },
  {
    id: 'blank',
    title: 'Blank lines',
    syntax: '(empty line between elements)',
    group: 'start',
    body: `Fountain uses a blank line as punctuation between elements.

• After a scene heading, a blank line, then action.
• After action, a blank line, then a CHARACTER name to start speech.
• After dialogue, a blank line ends that speech.

If two things stick together that should be separate, press Enter twice.`
  },
  {
    id: 'title',
    title: 'Title page',
    syntax: 'Title: My Script',
    group: 'start',
    body: `The very first lines of the file can be a title page — the cover, not the story.

Title: MyScript
Credit: written by
Author: Your Name
Source: a true story
Draft date: 16 August 2026
Contact: you@email.com

Each line is Key: value. A blank line ends the title page. Then the screenplay begins.

Common keys: Title, Credit, Author, Source, Draft date, Contact, Copyright.`
  },
  {
    id: 'scene',
    title: 'Scene heading (slugline)',
    syntax: 'INT. KITCHEN - DAY',
    group: 'page',
    body: `Every new place gets a scene heading so the reader knows where we are.

INT. KITCHEN - DAY
EXT. HIGH STREET - NIGHT
EST. CITY SKYLINE - DUSK
I/E. CAR - MOVING - DAY

INT. = inside. EXT. = outside. EST. = establishing (a wide view). I/E. or INT./EXT. = both (a car, a doorway).

Then the LOCATION, a dash, and the TIME (DAY, NIGHT, DAWN, CONTINUOUS…).

Fountain prints this line in CAPITALS. Start a new heading whenever the location or time changes.`
  },
  {
    id: 'forced-scene',
    title: 'Forced scene heading',
    syntax: '.THE VOID',
    group: 'page',
    body: `If a heading does not start with INT. or EXT., put a period at the start of the line:

.LATER
.THE DREAM

The period is not printed. Use this for montages, “TEN YEARS LATER”, or unusual sluglines.`
  },
  {
    id: 'action',
    title: 'Action / description',
    syntax: 'Rain hits the glass.',
    group: 'page',
    body: `Action is what the camera sees, written in present tense.

Rain hits the glass. MAYA does not look up.

Keep it visual and short. Name a character in CAPITALS the first time we meet them.

Do not write camera directions unless you are also directing and it really matters. Do not write what people think — write what they do.`
  },
  {
    id: 'forced-action',
    title: 'Forced action',
    syntax: '!This stays action.',
    group: 'page',
    body: `A line that starts with ! is always action, even if it looks like a name or a heading.

!MAKE IT STOP

The ! is not printed. Use it when Fountain would otherwise treat the line as a character cue.`
  },
  {
    id: 'character',
    title: 'Character cue',
    syntax: 'MAYA',
    group: 'speech',
    body: `When someone is about to speak, type their name alone on a line in CAPITALS, after a blank line.

MAYA
We have to go.

The next line is the spoken words. The name prints in the centre of the page.

Same spelling every time — the Index sidebar collects these names.`
  },
  {
    id: 'forced-character',
    title: 'Forced character',
    syntax: '@McKenzie',
    group: 'speech',
    body: `If a name is not all-caps (McKenzie, iPhone VOICE), start the line with @:

@McKenzie
Don't.

The @ is not printed. The name still acts as a character cue.`
  },
  {
    id: 'extensions',
    title: 'Character extensions',
    syntax: 'MAYA (V.O.)',
    group: 'speech',
    body: `Brackets after the name tell us how we hear them:

MAYA (V.O.)     voice-over — we hear her, we may not see her speaking
MAYA (O.S.)     off-screen — she is in the scene but not in shot
MAYA (CONT'D)   she is still talking after action interrupted her
MAYA (INTO PHONE)
MAYA (PRELAP)   we hear the next scene's line over this picture

Write them in the character line, not in the dialogue.`
  },
  {
    id: 'parenthetical',
    title: 'Parenthetical',
    syntax: '(under her breath)',
    group: 'speech',
    body: `A short note in (brackets) under the name, before the spoken line.

MAYA
(under her breath)
Not now.

Use it for how the line is said, or a tiny bit of business. If it is a whole action, write an action line instead. One short phrase is enough.`
  },
  {
    id: 'dialogue',
    title: 'Dialogue',
    syntax: 'We have to go.',
    group: 'speech',
    body: `Dialogue is the spoken line. It sits under the character name (and any parenthetical).

MAYA
If we miss this train, we miss everything.

No quotation marks. A blank line ends the speech.

Write the way the person talks. If they would not say it, cut it.`
  },
  {
    id: 'dual',
    title: 'Dual dialogue',
    syntax: 'JON ^',
    group: 'speech',
    body: `Two people speaking at the same time. Write the first speech as normal. On the second name, put a caret ^ at the end:

MAYA
I said no.

JON ^
You never listen.

Preview and PDF print the two speeches side by side. The ^ goes on the second character cue, not on the words.`
  },
  {
    id: 'transition',
    title: 'Transition',
    syntax: 'CUT TO:',
    group: 'page',
    body: `A transition tells us how we leave one scene. It prints on the right.

CUT TO:
FADE OUT.
DISSOLVE TO:
SMASH CUT TO:

New writers often skip CUT TO: — a new scene heading already means we cut. Use a transition when the *way* you leave matters (a fade, a smash).`
  },
  {
    id: 'forced-transition',
    title: 'Forced transition',
    syntax: '>SMASH CUT',
    group: 'page',
    body: `Start the line with > (and do not close it with <) to force a right-aligned transition:

>BACK TO THE KITCHEN

A line wrapped in both > and < is centered text instead. See Centered.`
  },
  {
    id: 'centered',
    title: 'Centered text',
    syntax: '> THE END <',
    group: 'page',
    body: `Wrap a line in greater-than and less-than to centre it:

> THE END <
> SUPER: Three years later <

Used for THE END, title cards, and intertitles. Both > and < are required.`
  },
  {
    id: 'lyrics',
    title: 'Lyrics',
    syntax: '~When you walk…',
    group: 'speech',
    body: `A line that starts with ~ is a lyric (someone singing). It prints in italics.

~When you walk through a storm
~Hold your head up high

One ~ per line. Use it for songs, not ordinary speech.`
  },
  {
    id: 'note',
    title: 'Notes [[ ]]',
    syntax: '[[ your reminder ]]',
    group: 'markup',
    body: `Double square brackets are a writer’s note. They do not print. They are not dialogue.

[[ Check this against the outline. ]]

Use them for reminders, questions, and research.

In FilmScriptWriter, [[ Note 1]] also becomes an editable heading in the Notes sidebar so you can keep long notes off the script page.

Close every note with ]].`
  },
  {
    id: 'boneyard',
    title: 'Boneyard /* */',
    syntax: '/* cut scene */',
    group: 'markup',
    body: `A boneyard is a comment block — text you keep in the file but take out of the movie.

/*
INT. OLD OPENING - DAY
This scene is cut for now.
*/

Everything between /* and */ is ignored in preview and PDF. A one-line boneyard is /* like this */.

This is a drawer for leftover scenes, not a note to an actor. For a short reminder, use [[ notes ]] instead.`
  },
  {
    id: 'section',
    title: 'Section headings',
    syntax: '# Act One',
    group: 'planning',
    body: `Hash marks organise a long script the way headings organise a document.

# Act One
## The robbery
### Getaway

They are for you while you write. They are not printed as scene headings. The left Index sidebar can jump to them.

# is the top level, ## is nested, and so on.`
  },
  {
    id: 'synopsis',
    title: 'Synopsis line',
    syntax: '= Maya decides to run.',
    group: 'planning',
    body: `A line that starts with a single = is a one-line outline note.

= Maya decides to run.

It sits under a section or scene as a planning tool. It is not action the camera sees and it is left out of the printed pages.

Do not confuse = with === (a forced page break).`
  },
  {
    id: 'pagebreak',
    title: 'Forced page break',
    syntax: '===',
    group: 'planning',
    body: `Three or more equals signs force a new page in preview and PDF:

===

Use it rarely — for example before a title card or a big reveal. Ordinary page breaks are calculated for you.`
  },
  {
    id: 'emphasis',
    title: 'Emphasis',
    syntax: '*italic* **bold** _underline_',
    group: 'markup',
    body: `Inside action and dialogue you can mark stress:

*italics*
**bold**
_underline_
***bold italics***

A little goes a long way. Do not shout in ALL CAPS for emphasis — that is for names and scene headings.

Close the same mark you opened.`
  },
  {
    id: 'scene-numbers',
    title: 'Scene numbers',
    syntax: 'INT. ROOM - DAY #1#',
    group: 'planning',
    body: `You can pin a scene number on a heading with hashes:

INT. KITCHEN - DAY #12#
INT. KITCHEN - DAY #12# #12A#

Production drafts use these. Early drafts usually leave them off; add them when the script is locked for shooting.`
  },
  {
    id: 'cheatsheet',
    title: 'Quick cheatsheet',
    syntax: 'INT.  NAME  [[ ]]  /* */',
    group: 'start',
    body: `INT. PLACE - DAY          scene (inside)
EXT. PLACE - NIGHT        scene (outside)
.FORCED HEADING           unusual slugline
Action in present tense.  what we see
CHARACTER                 they are about to speak
@MixedCase                forced character name
(V.O.) (O.S.) (CONT'D)    how we hear them
(wryly)                   parenthetical
spoken line               dialogue — no quotes
NAME ^                    dual dialogue (second speaker)
CUT TO:                   transition
>SMASH CUT                forced transition
> THE END <               centered
~lyric line               singing
[[ note ]]                hidden writer's note
/* boneyard */            omitted from print
# Act One                 outline section
= one-line synopsis       outline, not action
===                       force a new page
*italic* **bold** _u_     emphasis`
  }
]

export const SYNTAX_GROUPS: { id: FountainSyntaxTopic['group']; label: string }[] =
  [
    { id: 'start', label: 'Start here' },
    { id: 'page', label: 'On the page' },
    { id: 'speech', label: 'Speech' },
    { id: 'markup', label: 'Notes & marks' },
    { id: 'planning', label: 'Planning' }
  ]

export function topicById(id: string): FountainSyntaxTopic | undefined {
  return FOUNTAIN_SYNTAX_TOPICS.find((t) => t.id === id)
}

/** Map live-coach tip ids onto reference topics. */
export const COACH_TO_TOPIC: Record<string, string> = {
  ready: 'what',
  title: 'title',
  scene: 'scene',
  action: 'action',
  character: 'character',
  parenthetical: 'parenthetical',
  dialogue: 'dialogue',
  dual: 'dual',
  transition: 'transition',
  centered: 'centered',
  lyrics: 'lyrics',
  note: 'note',
  boneyard: 'boneyard',
  section: 'section',
  synopsis: 'synopsis',
  pagebreak: 'pagebreak',
  emphasis: 'emphasis'
}
