# FilmScriptWriter branches and tags

Do **not** create a second GitHub repository. Names are case-insensitive: `grahaminman/filmscriptwriter` cannot exist beside `grahaminman/FilmScriptWriter`. Keep the public repo **FilmScriptWriter**.

| Ref | Role |
|-----|------|
| `main` | Archived v1 experiment. Do not add v2 features here. |
| `v1.0.1` | Historical v1 development line. |
| `legacy-v1.0.1` | Freeze tag for the last full v1 app. |
| `v2` | **Default branch.** Spec and brand for the simpler app. No v1 application source. |
| `next` | Optional sandbox; unused for v2. |
| `pages` | GitHub Pages site; unrelated to the v2 app. |

Existing tags `v1.0.0.0` and `v1.0.1` remain on GitHub Releases. Do not delete branches, tags, releases, or installers.

## Default branch

**`v2`** is the default so new work lands on the simpler product line.

## Where to read v1 source

```bash
git checkout main
# or
git checkout legacy-v1.0.1
```
