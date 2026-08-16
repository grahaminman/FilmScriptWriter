/**
 * In-app searchable help. Articles are English (UI chrome is translated).
 */

export interface HelpArticle {
  id: string
  title: string
  tags: string[]
  body: string
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'start',
    title: 'Getting started',
    tags: ['first run', 'welcome', 'new project', 'folder'],
    body: `The first time FilmScriptWriter runs it asks where all your projects should live. This is the base folder. You can change it later in Settings.

A project is one screenplay and its supporting files, kept in a folder named after the project.

To start writing:
1. Choose the base folder (or accept Documents/FilmScriptWriter/Projects).
2. Enter a project name, for example MyScript.
3. FilmScriptWriter creates the folder and the first draft file.`
  },
  {
    id: 'files',
    title: 'Project folders and file names',
    tags: ['folder', 'fountain', 'markdown', 'notes', 'draft'],
    body: `Each project lives under your base folder:

  Base folder / MyScript /
    MyScript-draft-2026-08-16.fountain   ← current draft
    Notes-myscript.md                    ← notes for this title
    outline.md, research.md, reference.pdf    ← anything else you add

The primary screenplay is always a .fountain file. Supporting files are Markdown (.md) unless they are PDFs or older drafts.

The current draft is the .fountain file whose name contains the newest date. A file with no date is never current if a dated draft exists.`
  },
  {
    id: 'drafts',
    title: 'Current draft vs older drafts',
    tags: ['draft', 'date', 'preview', 'import'],
    body: `The current draft is the project file — the one you are working on.

Rules:
• Newest date in the filename wins (YYYY-MM-DD or YYYYMMDD).
• If one file has a date and another does not, the dated file is current.
• Only the current draft shows the paginated preview on the right.
• Opening an older .fountain draft does not open a preview.

Start a new draft by importing a file as the current draft, or by saving a new dated copy. Imported current drafts always receive today’s date in the filename.`
  },
  {
    id: 'import',
    title: 'Importing drafts and notes',
    tags: ['import', 'date', 'notes', 'pdf'],
    body: `File → Import… copies a file into the open project.

Import as current draft
  The file is saved as {Project}-draft-YYYY-MM-DD.fountain (date added).
  It becomes the previewed project file.

Import as notes
  Any date in the filename is stripped. Fountain/text is stored as Markdown
  so it will not be treated as a draft. PDFs keep the .pdf extension.

You can also open any file already in the project folder as a tab.`
  },
  {
    id: 'tabs',
    title: 'Tabs',
    tags: ['tabs', 'open', 'pdf', 'draft'],
    body: `When more than one file is open, a tab bar appears. Tabs can be:

• The current draft
• Earlier drafts in the same folder
• Notes or other Markdown
• PDFs in the project folder

Click a tab to show it in the focused pane. Close a tab with the × or middle-click. Unsaved tabs prompt before closing.`
  },
  {
    id: 'split',
    title: 'Split view (up to three files)',
    tags: ['split', 'preview', 'side by side', 'dual'],
    body: `View → Split lets you see 1, 2 or 3 files side by side.

Typical dual-screen layout:
  [ notes or older draft ]  [ current draft ]  [ preview ]

The paginated preview is only for the current draft and always sits on the far right. Older .fountain files never show a preview.

Assign a file to a pane by focusing the pane, then clicking a tab.`
  },
  {
    id: 'notes',
    title: 'Notes sidebar and [[tokens]]',
    tags: ['notes', 'sidebar', 'token', 'preview'],
    body: `Each project has a notes file named after the title:
  MyScript → Notes-myscript.md

The notes sidebar sits to the left of the editor and can be shown or hidden.

In the screenplay, write [[ Note 1]] (spaces inside the brackets are fine).
That token appears in the notes sidebar as a heading:

  # note 1

Edit the heading’s body in the sidebar — you do not have to type the note into the script. Add further notes from the sidebar; they are saved to the notes file.

Tokens stay compact in the editor so the page is not filled with research.`
  },
  {
    id: 'index',
    title: 'Index sidebar',
    tags: ['index', 'scenes', 'characters', 'search', 'filter'],
    body: `The leftmost sidebar is an expandable index of the current draft.

Filter by Scenes, Characters or Notes, and type to search.
Click a scene or character to jump to that line.
Project files are listed at the top — click one to open it as a tab.`
  },
  {
    id: 'autosave',
    title: 'Autosave',
    tags: ['autosave', 'save', 'settings'],
    body: `Autosave is on by default every 5 minutes.

Change the interval in Settings (off, 1, 2, 5, 10, 15 or 30 minutes).
Only files that already have a path are autosaved. Untitled buffers still need Save As.

The status bar shows “Autosaved” after a successful pass. You can still save at any time with Ctrl/Cmd+S.`
  },
  {
    id: 'settings',
    title: 'Settings',
    tags: ['settings', 'base folder', 'autosave', 'theme'],
    body: `Settings (and first-run) control:

• Projects base folder — where every new project is created
• Autosave interval
• Theme, language, font size, syntax colours, preview follow, typewriter mode

Changing the base folder does not move existing projects. Open them with File → Open Project… or move the folders yourself.`
  },
  {
    id: 'syntax-help',
    title: 'Fountain syntax help',
    tags: ['fountain', 'syntax', 'help', 'preview', 'index'],
    body: `The right-hand pane can show either the paginated preview or a full Fountain syntax reference.

Toolbar: Preview  ·  Fountain Syntax Help
Menu: View → Fountain Syntax Help (Ctrl/Cmd+Shift+P)

The reference is written for people new to screenwriting. A retractable index on the right lists every option with its syntax. Click an item to jump. Collapse the list with › if you want more room for the article.

The thin coach bar under the toolbar still follows what you type. When the full help is open it highlights the matching topic.`
  },
  {
    id: 'preview',
    title: 'Preview and export',
    tags: ['preview', 'pdf', 'fdx', 'export'],
    body: `Preview uses Hollywood pagination (US Letter, Courier 12) and matches PDF export.

Preview is shown only for the current project .fountain file, on the right.
Toggle it with View → Toggle Preview (Ctrl/Cmd+P).

Export the focused fountain document as Fountain, Final Draft (.fdx) or PDF from the Export menu.`
  },
  {
    id: 'shortcuts',
    title: 'Keyboard shortcuts',
    tags: ['keyboard', 'shortcuts', 'keys'],
    body: `Ctrl/Cmd+N     New project
Ctrl/Cmd+O     Open file
Ctrl/Cmd+Shift+O  Open project folder
Ctrl/Cmd+S     Save
Ctrl/Cmd+Shift+S  Save As
Ctrl/Cmd+P     Toggle preview
Ctrl/Cmd+F     Find
Ctrl/Cmd+H     Find and replace
Ctrl/Cmd+T     Typewriter mode
Ctrl/Cmd+1/2/3 Split 1 / 2 / 3 panes
Ctrl/Cmd+/     Searchable help
Ctrl/Cmd+= / − Font size
Ctrl/Cmd+0     Reset font size`
  }
]

export function searchHelp(query: string): HelpArticle[] {
  const q = query.trim().toLowerCase()
  if (!q) return HELP_ARTICLES
  const words = q.split(/\s+/).filter(Boolean)
  return HELP_ARTICLES.filter((article) => {
    const hay = `${article.title} ${article.tags.join(' ')} ${article.body}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}
