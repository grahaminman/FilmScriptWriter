# Spell-check dictionaries

Chromium Hunspell dictionaries (`.bdic`) used by FilmScriptWriter on Windows
and Linux. macOS uses the system spell checker instead.

Shipped files:

- `en-GB.bdic` — British English (default)
- `en-US.bdic` — American English
- `es-ES.bdic` — Spanish (aliased to `es` / `es-419` for Latin America)

German (`de-DE`), French (`fr-FR`) and Italian (`it-IT`) are downloaded into
the per-user dictionaries folder from Settings when you choose those languages.

At first launch the app copies bundled files into that folder and creates
`es.bdic` / `es-419.bdic` aliases so Chromium can load Spanish.

Filenames must match the language tag plus `.bdic`. A valid file starts with
the four-byte magic `BDic`.
