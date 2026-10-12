# Changelog

Principia has two version numbers.

- **App version** (`package.json`, shown at the bottom of the Explorer): semver. While it is 0.x, a minor
  version (0.3 → 0.4) adds features and a patch version fixes bugs.
- **Notes format** (`FORMAT_VERSION` in `lib/version.ts`): a whole number, raised only when notes written for the
  old format need changes. Each raise comes with a migration in `lib/notebook/migrate.ts`, and the app keeps
  reading every older format.

Every notebook records its format in `principia.version.json`. On open:

| The notebook's format is | The app |
|---|---|
| older | shows it in compatibility mode, then upgrades the files if it may write to the folder (backups in `.principia/backup/<time>/`) |
| the same, version file missing or written by an older app | writes or updates `principia.version.json` |
| the same, written by this app | does nothing |
| the same, written by a newer app | does nothing, and says the notes may use features this app lacks |
| newer | shows it as well as it can, with a warning, and never writes to it |

`npm run upgrade -- <folder>` does the same from the command line (add `--dry-run` to see the changes first).

## Notes formats

| Format | App versions | Layout |
|---|---|---|
| 1 | 0.1 | One course folder: `course.ts` exports a `Course` whose `tree` lists every topic, in folders with display titles. Topics import `@/content/helpers` and `@/content/types`. |
| 2 | 0.2 – | Any folder: the file tree is the tree. Optional `principia.config.ts` (title, decks, identities, folder titles…). Notes import `principia`. Markdown, MDX and components. `principia.version.json` from 0.3. |

Upgrade 1 → 2: the imports become `principia`; `course.ts` becomes `principia.config.ts` (its folder titles go
to `folders`, keyed by directory) and is removed unless another file imports it. Topics are then listed in file
order, not the order of the old `tree`.

## 0.5.0 – 2026-10-12

- Previous and next note: two buttons at the end of the bottom bar, and `Ctrl+←` / `Ctrl+→` (`⌘` on a Mac).
  The notes of a folder are its structured topics and Markdown/MDX pages, in explorer order; helper modules,
  widgets and config files are skipped. The next note takes the current tab's place, like following a link (a
  note already open in another tab is brought forward instead); each note keeps its own stage and scroll.
- The bottom bar shows for every note, with the step buttons only when the note has steps.
- The bar acts on the active note. When the identity index is active, it acts on the note showing beside it.

## 0.4.1 – 2026-10-12

- Stepping forward follows the end of the note: when the last shown part is in view, the panel scrolls down by
  exactly the height the step added, so a note read at the bottom stays at the bottom. A part taller than the
  panel is shown from its top. When the reader has scrolled away from the end, stepping leaves the scroll alone.
- Quick runs of steps (a held key) build on where the running scroll will end, so they do not fall behind.

## 0.4.0 – 2026-10-11

- Step-by-step reveal: a lecture note opens showing its header, and each step adds the next part.
  - Topics step automatically: `steps: 'section' | 'rows' | 'lines' | 'none'` in the config, a topic or a section
    (default `'rows'`: heading, display, notes, each row, extra, each callout).
  - MDX and components: `<Step>` (or any element with `data-step`), or `export const steps = 'blocks'` for every
    top-level block.
  - Step controls over the bottom middle of the dock: to the start, back, stage / total, forward, to the end.
    `←` and `→` step, `Shift+←` and `Shift+→` jump. The stage is remembered per tab.
  - A link into a hidden part of a note (an identity's "used in" chip) reveals up to it.
- A folder last written by a newer app version (same notes format) is now flagged: it may use newer features.
- Notes format unchanged (2): the new fields are optional, so older notes need no upgrade.

## 0.3.0 – 2026-10-11

- Version numbering: the app version and the notes format version, shown in the Explorer and on the start page.
- `principia.version.json` in every notebook: format, the app version that last wrote it, and upgrade history.
- Automatic upgrades on open, with backups; an "Upgrade" button where the browser first needs edit permission.
- Backward compatibility: format-1 course folders open as they are (`@/content/*` imports, `course.ts` as the
  config, the deprecated `folder`, `file` and `Course` exports of `principia`).
- The folder picker asks for edit access, so that upgrades can be written.
- `npm run upgrade`, and `npm test` (upgrade tests on a format-1 fixture, in `tests/fixtures/`).
- `npm run check` reports the notes format and warns when a folder needs upgrading.

## 0.2.0 – 2026-10-11

- Open any folder (several at once); remembered across reloads; edits on disk reload live.
- Notes in any format: structured topics, Markdown, MDX, React components (`.tsx`) compiled in the browser;
  images, PDFs, media, sandboxed HTML; other files as text. npm packages from esm.sh.
- `extra` in topic sections, for interactive components.
- The 70050 notes moved to `samples/70050-machine-learning` (notes format 2).

## 0.1.0

- The 70050 Machine Learning notes as a VS Code-style workspace (notes format 1).
