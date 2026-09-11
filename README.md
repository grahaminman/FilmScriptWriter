# FilmScriptWriter

**v2 is the app.** A simpler Fountain writer for daily 2–5 page shorts.

Do **not** create a second GitHub repository. Keep `grahaminman/FilmScriptWriter`.

**FilmScriptWriter** — UNLOCK YOUR STORY  
Daily screenwriting practice. A complete short film, 2–5 pages a day.

Free desktop editor for beginners and the Skool community `filmscriptwriter-3192`. One Scripts folder, one editor, paginated preview or Fountain help. No project wizard, notes sidebar, index cards, or FDX.

Spec: [docs/V2-SPEC.md](./docs/V2-SPEC.md) · Stages: [docs/V2-BUILD-STAGES.md](./docs/V2-BUILD-STAGES.md) · Branches: [BRANCHES.md](./BRANCHES.md)

## Run v2

```bash
git clone https://github.com/grahaminman/FilmScriptWriter.git
cd FilmScriptWriter
git checkout v2
npm install
npm run dev
```

## Scripts

| Command | What it does |
|---------|----------------|
| `npm install` | Install dependencies |
| `npm run dev` | Launch the Electron app in development |
| `npm test` | Parser, pagination, PDF, and template tests |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Compile main / preload / renderer |
| `npm run dist` | Build installers for the host OS |
| `npm run dist:linux` | Linux AppImage + `.deb` |
| `npm run dist:win` | Windows NSIS |
| `npm run dist:mac` | macOS x64 + arm64 DMG |

Version: **2.0.0-beta.1**. There is no auto-updater.

## v1 testers

The archived v1 experiment (projects, notes, index, FDX) lives on **`main`** and freeze tag **`legacy-v1.0.1`**. Historical installers stay on [GitHub Releases](https://github.com/grahaminman/FilmScriptWriter/releases).

```bash
git checkout main   # or: git checkout legacy-v1.0.1
npm install
npm run dev
```

## Licence

MIT — see [LICENSE](./LICENSE).
