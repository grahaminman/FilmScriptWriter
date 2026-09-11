# FilmScriptWriter branches and tags

Do **not** create a second GitHub repository. Names are case-insensitive: `grahaminman/filmscriptwriter` cannot exist beside `grahaminman/FilmScriptWriter`. Keep the public repo **FilmScriptWriter**.

| Ref | Role |
|-----|------|
| `main` | Archived v1 experiment. Do not add v2 features here. |
| `v1.0.1` | Historical v1 development line. |
| `legacy-v1.0.1` | Freeze tag for the last full v1 app. |
| `v2` | Primary branch for the new simpler app. Empty of new application code until Stage 2. |
| `next` | Optional sandbox; unused for v2. |

Existing tags `v1.0.0.0` and `v1.0.1` remain on GitHub Releases (beta installers). Do not delete branches, tags, releases, or installers.

## Default branch

Preferred default is **`v2`** so new work lands on the simpler product line. `main` stays the v1 archive.

If the default branch was not changed by this Stage 1 run, set it in the GitHub UI:

1. Open https://github.com/grahaminman/FilmScriptWriter/settings
2. **General** → **Default branch**
3. Switch to `v2` → **Update**

## Freeze commit

Tag `legacy-v1.0.1` points at the tip of `main` after the v1.0.1 spellcheck merge (`63de020`). The `v1.0.1` **branch** is an ancestor of that merge; the existing **tag** `v1.0.1` is the older GitHub Release commit and was left in place.
