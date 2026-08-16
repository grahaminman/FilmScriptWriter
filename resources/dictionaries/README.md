# Spell-check dictionaries

Chromium Hunspell dictionaries (`.bdic`) used by FilmScriptWriter on Windows
and Linux. macOS uses the system spell checker instead.

Shipped files:

- `en-GB.bdic` — British English (default)
- `en-US.bdic` — American English
- `es-ES.bdic` — Spanish (used for Latin American / Paraguay via `es` / `es-419` aliases)

At first launch the app copies these into the per-user dictionaries folder
(next to the preferences store) and creates `es.bdic` / `es-419.bdic` aliases
so Chromium can load Spanish under any of those language codes.

## Offline / self-hosted copies

If the Google CDN is unavailable:

1. Drop replacement `.bdic` files into this folder (packaged with the app) **or**
   into the user dictionaries folder shown in Settings.
2. Or set **Dictionary download URL** in Settings to a folder you host, so
   Chromium can fetch `{url}en-GB.bdic`, `{url}en-US.bdic`, `{url}es-419.bdic`.

Filenames must match the language tag plus `.bdic`. A valid file starts with
the four-byte magic `BDic`.
