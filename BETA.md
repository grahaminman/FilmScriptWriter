# FilmScriptWriter — Beta notice

**This software is a beta / early preview.**

It is shared so testers can try Fountain editing, export, and packaging. It is **not** a finished product.

## What “beta” means here

- Features may change or break between builds
- Bugs are expected; please report them with steps to reproduce
- Installers may be **unsigned** (Windows SmartScreen / macOS Gatekeeper may warn)
- Do not rely on it for critical production deadlines without your own backups

## Releases

Older tags stay on the Releases page if a newer build misbehaves.

| Tag | Status |
|-----|--------|
| **`v1.0.1`** | Current **beta** GitHub Release (Linux / macOS / Windows) — projects, tabs, notes, Fountain help, editable starter template |
| **`v1.0.0.0`** | Previous beta — kept available |

Latest: https://github.com/grahaminman/FilmScriptWriter/releases/tag/v1.0.1  
Previous: https://github.com/grahaminman/FilmScriptWriter/releases/tag/v1.0.0.0  
All: https://github.com/grahaminman/FilmScriptWriter/releases

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Default branch (v1.0.1 line) |
| **`v1.0.1`** | Active development (package version `1.0.1`) |
| `next` | Optional sandbox for larger experiments |

## Reporting issues

Open a GitHub Issue on this repository with:

1. OS and app version (`Help → About`)
2. What you did
3. What you expected
4. What happened instead

## Building installers (CI)

GitHub Actions workflow: `.github/workflows/build.yml`

- **Tests** run on every pull request to `main`
- **Installers** (Linux / Windows / macOS) build on tag `v*` or **Actions → Build installers (beta) → Run workflow**

Download artifacts from the completed workflow run.
