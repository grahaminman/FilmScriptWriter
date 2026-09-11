# FilmScriptWriter v2 — build stages

Do not create a second GitHub repository. Work stays on `grahaminman/FilmScriptWriter`.

## Stage 1 — Archive v1 and specify v2

Freeze the Electron experiment, keep history, add branch `v2` and the product spec.

Status: **done**.

- Annotated tag `legacy-v1.0.1` on the last full v1 experiment (`63de020` on `main`)
- Branch `v2` is the GitHub default branch
- `BRANCHES.md`, `docs/V2-SPEC.md`, this file
- Brand assets in `docs/brand/` (not wired into installers yet)

## Stage 1b — Clean v2 working tree

Remove v1 application code from `v2` so Stage 2 starts from spec + brand only.
v1 source remains on `main` and tag `legacy-v1.0.1`.

Status: **done**.

## Stage 2 — Implement v2 from the spec

Implement the simpler Fountain writer in [V2-SPEC.md](./V2-SPEC.md) **on branch `v2`**.

Scaffold a new Electron + TypeScript + CodeMirror 6 app. Do not copy projects, notes, index cards, FDX, or the first-run wizard. Use `main` only as a behaviour reference for Fountain parse / preview / PDF.

Status: **done** (`2.0.0-beta.1`). The app runs with `npm install && npm run dev`.

## Stage 3+ — Iterate from actual use

After people write 2–5 page shorts daily, adjust from real friction.

Status: **not started**.
