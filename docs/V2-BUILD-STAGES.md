# FilmScriptWriter v2 — build stages

Do not create a second GitHub repository. Work stays on `grahaminman/FilmScriptWriter`.

## Stage 1 — Archive v1 and specify v2

**This run.** Freeze the Electron experiment, keep history, add branch `v2` and the product spec.

Status: **done** when this file is committed on `v2`.

Delivered:

- Annotated tag `legacy-v1.0.1` on the last full v1 experiment
- Branch `v2` from that freeze commit
- `BRANCHES.md`, `docs/V2-SPEC.md`, this file
- BETA.md / README notes pointing at the archive vs `v2`
- Brand assets copied to `docs/brand/` (FSW-LOGO.jpg, header-1.jpg) for Stage 2 — **not** wired into installers here
- v1 `src/` left in place as reference (not deleted, not rewritten)

## Stage 2 — Implement v2 from the spec

Implement the simpler Fountain writer described in [V2-SPEC.md](./V2-SPEC.md) **on branch `v2`**.

Replace or rebuild `src/` as needed. Do not port projects, notes, index cards, FDX, or the first-run wizard.

Status: **not started**.

## Stage 3+ — Iterate from actual use

After people write 2–5 page shorts daily, adjust from real friction. Not a second architecture rewrite unless the spec is wrong.

Status: **not started**.
