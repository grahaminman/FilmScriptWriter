# FilmScriptWriter v2 — product spec

Contract for **Stage 2**. Stage 1 (this file on branch `v2`) does **not** implement the app. Do not treat leftover v1 `src/` on this branch as the v2 product.

Same public repository: **grahaminman/FilmScriptWriter**. Do not create `filmscriptwriter` as a second repo.

## 1. Product identity

| Field | Value |
|-------|--------|
| Product name | FilmScriptWriter |
| Package name | `filmscriptwriter` |
| appId | `com.filmscriptwriter.app` |
| Licence | MIT (unchanged) |
| Tagline | UNLOCK YOUR STORY — Daily screenwriting practice. A complete short film, 2–5 pages a day. |
| Community | Free Skool group `filmscriptwriter-3192`. The app is free with or without membership. |
| Audience | Beginners and that community. Daily prompt → one complete short, **2–5 pages**. |

v2 is a **simpler Fountain writer for daily shorts**. It is not the v1 project/notes/index experiment.

## 2. Stack (do not substitute)

- Electron (current stable, matching v1 style)
- TypeScript
- CodeMirror 6
- electron-vite
- electron-builder
- Platforms: macOS x64, macOS arm64, Windows NSIS, Linux AppImage + `.deb`
- **No electron-updater.** Clean break from old installers and the old publish channel.

## 3. Branding

- Product name in chrome, About, and installers: **FilmScriptWriter**
- App icon: fountain-pen + film-strip mark
  - Source file in-repo: [`docs/brand/FSW-LOGO.jpg`](./brand/FSW-LOGO.jpg)
  - Stage 2 converts this to the electron-builder icon set (`build/icon.png` and platform icns/ico). Do not ship the community header as the window icon.
- Community header art: [`docs/brand/header-1.jpg`](./brand/header-1.jpg) — **About / splash only**, not the writing chrome (no banner over the editor).

## 4. Layout

Desktop-first window (same class as v1: ~1280×800, remember bounds).

```
+------------------------------------------------------------------+
|  toolbar (File/Edit/View/Settings actions as native menu + bar)  |
+--------+-----------------------------------+---------------------+
| files  |                                   | Preview  OR         |
| in the |     CodeMirror 6 (one editor)     | Fountain help       |
| Scripts|                                   | (one right pane)    |
| folder |                                   |                     |
+--------+-----------------------------------+---------------------+
| status: filename · pages · language · dirty                      |
+------------------------------------------------------------------+
```

- **Toolbar:** New from template, Open, Save, Save as, Preview/Help toggle, Settings.
- **Left:** collapsible list of files in **one** user-chosen Scripts folder. Click opens. No project tree, no index cards, no scene/character explorer.
- **Centre:** single CodeMirror editor. One file at a time. No tabs. No 3-pane document split.
- **Right:** toggles **Preview** *or* **Fountain help**. Not both at once. Not notes.
- **Status bar:** filename, Hollywood page count (same engine as preview/PDF), UI language, dirty state.

## 5. Keep (must ship in Stage 2)

- Fountain **1.1** editing (see [FOUNTAIN-FIDELITY.md](./FOUNTAIN-FIDELITY.md) as the behaviour target)
- Paginated preview: US Letter, Courier 12 pt, margins **left 1.5″ / right 1″ / top and bottom 1″**
- Fountain help in the right pane
- Settings
- Spell-check (offline Hunspell / Chromium, as v1)
- Optional syntax colours (user-chosen; preview stays black-on-white)
- Copy / cut / paste / undo / redo / select-all / find — mouse and keyboard, **OS-native shortcuts**
- Save / Save as / Open
- Export **Fountain** and **PDF only**
- Two templates (section 8)
- i18n for the **whole UI** (menus, dialogs, settings, status, errors)

## 6. Scripts folder (no wizard)

- Chosen in Settings, remembered in `electron-store`.
- Default suggestion: `Documents/FilmScriptWriter/scripts` (create if the user accepts the default).
- Left list shows `.fountain` and `.txt` in that folder (not recursive project packs).
- Autosave interval configurable (default every 5 minutes; can turn off). Save-on-close if dirty.
- On launch, restore the last file **if it still exists** in that folder (or last opened path). If not, empty editor or the short daily template — **no first-run wizard**.
- No “projects base folder”. No per-title directories. No dated `{Name}-draft-YYYY-MM-DD.fountain` scheme.

## 7. Languages

UI locale and spell-check language are **independent**.

| UI locale | Label |
|-----------|--------|
| `en_GB` | English (UK) — **default UI** |
| `en_US` | English (US) |
| `es_419` | Spanish (Latin America) |
| `de_DE` | German |
| `fr_FR` | French |
| `it_IT` | Italian |

Spell-check dictionaries (default **English UK**): `en-GB`, `en-US`, `es-419` (or the closest Hunspell pack documented in Settings), `de-DE`, `fr-FR`, `it-IT`. Download into a local folder; work offline after that.

British English in default UI copy (colour, organise, practise as a verb).

## 8. Templates (actual Fountain text)

Stage 2 ships these two files (names can be `short-daily.fountain` and `feature.fountain`). **File → New** offers both. The short daily template is the default for New.

### 8.1 Short daily template

```
Title: Untitled Short
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
```

### 8.2 Feature template

Title-page placeholders and a short three-act skeleton only. **No** 10-sequence teaching essay.

```
Title: {Title}
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
```

There is no Settings UI to replace the factory starter in v2. Users duplicate a file in the Scripts folder instead.

## 9. Remove / do not port from v1

- First-run wizard
- Projects base folder and per-title project directories
- Dated draft names
- Notes sidebar and `Notes-*.md`
- Index / index cards / scene-character explorer
- Multi-file tabs
- 3-pane document split
- In-app PDF tabs
- FDX export (`src/shared/export/fdx.ts` — do not port)
- Auto-updater
- Syntax-coach bar (not required)
- Editable factory-starter replacement UI

## 10. Reference code for Stage 2 (read later, do not port in Stage 1)

Use as a guide when rebuilding; copy behaviour, not the project model.

| Area | Path |
|------|------|
| Parser / pagination | `src/shared/fountain/*` |
| PDF | `src/shared/export/pdf.ts` (**not** `fdx.ts`) |
| Editor | `src/renderer/editor/*` |
| Preview | `src/renderer/preview/preview.ts` |
| Fountain help pane | `src/renderer/ui/fountain-help-pane.ts` |
| Files | `src/main/file-service.ts` |
| Prefs | `src/main/store.ts` |
| Spell-check | `src/main/spellcheck.ts` |
| Menus | `src/main/menu.ts` |
| Fountain matrix | `docs/FOUNTAIN-FIDELITY.md` |

## 11. Stage 2 build order (do not execute in Stage 1)

1. Scaffold electron-vite + TypeScript + electron-builder (same names/appId). No updater.
2. Native menus, Settings shell, i18n stub (en_GB first).
3. Single CodeMirror editor + OS edit commands.
4. Fountain parser + paginated preview (US Letter, Courier 12, specified margins).
5. Scripts folder + left file list + Open/Save/Save as + autosave + restore last file.
6. Two templates as in section 8.
7. PDF export (shared layout with preview). Fountain export is the file itself.
8. Fountain help right pane.
9. Spell-check + optional syntax colours.
10. Localise remaining locales.
11. Package: macOS x64 + arm64 DMG, Windows NSIS, Linux AppImage + deb. **No electron-updater.**

## 12. Stage 2 acceptance criteria (document only)

A developer can clone `v2`, `npm install && npm run dev`, and:

- Choose a Scripts folder in Settings (remembered).
- See files in the left list; open one in the single editor.
- Type Fountain; preview paginates to Hollywood rules; status bar page count matches.
- New from the short daily template, including the `[[ DAILY PROMPT ]]` block.
- Save / Save as / Open; autosave; last file restored if it still exists.
- Export PDF; no FDX in menus.
- Toggle right pane Preview / Fountain help.
- Spell-check default en-GB; UI default en_GB; change them independently.
- Copy/cut/paste/undo/redo/select-all/find work with mouse and OS shortcuts.
- No first-run wizard, no project folders, no notes sidebar, no tabs, no updater.
- `npm test` covers parser, page count, and export of a short Fountain fixture.
- Installers build for the host OS via `npm run dist` / CI tags.

## 13. Non-goals for v2.0

Voice, collaboration, cloud sync, Skool SSO, AI co-writer (that is the separate FilmScriptWriter AI product), FDX, Final Draft round-trip, mobile.
