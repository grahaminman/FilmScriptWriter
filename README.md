# FilmScriptWriter

**v2 is the default branch.** It is a clean starting point for the simpler app.
The new editor is specified in [docs/V2-SPEC.md](./docs/V2-SPEC.md) and is **not built yet**.

Do **not** create a second GitHub repository. Keep `grahaminman/FilmScriptWriter`.

## What lives where

| Ref | What it is |
|-----|------------|
| **`v2`** (default) | Spec, brand, and empty workspace for the new build |
| `main` | Archived v1 experiment (projects, notes, index, FDX) |
| tag `legacy-v1.0.1` | Freeze of the last full v1 app |
| Releases `v1.0.1` / `v1.0.0.0` | Old beta installers — historical only |

Branch map: [BRANCHES.md](./BRANCHES.md) · Stages: [docs/V2-BUILD-STAGES.md](./docs/V2-BUILD-STAGES.md)

## Product (when Stage 2 is built)

**FilmScriptWriter** — UNLOCK YOUR STORY  
Daily screenwriting practice. A complete short film, 2–5 pages a day.

Free Fountain desktop editor for beginners and the Skool community `filmscriptwriter-3192`. Write on the left, paginated preview on the right, Fountain help when you need it. One scripts folder. No project wizard, notes sidebar, index cards, or FDX.

Brand assets for the next build:

- [docs/brand/FSW-LOGO.jpg](./docs/brand/FSW-LOGO.jpg) — app icon
- [docs/brand/header-1.jpg](./docs/brand/header-1.jpg) — About / splash only

## Run the old v1 beta (reference only)

```bash
git clone https://github.com/grahaminman/FilmScriptWriter.git
cd FilmScriptWriter
git checkout main   # or: git checkout legacy-v1.0.1
npm install
npm run dev
```

Installers: https://github.com/grahaminman/FilmScriptWriter/releases

## Next step

Implement [docs/V2-SPEC.md](./docs/V2-SPEC.md) on this branch. Do not port v1 projects, notes, index, FDX, or the auto-updater. Read v1 on `main` if you need behaviour for the parser, preview, or PDF.

## Licence

MIT — see [LICENSE](./LICENSE).
