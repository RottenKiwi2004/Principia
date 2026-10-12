# Principia

A dark, VS Code-style workspace for folders of notes. Open any folder: structured topics (derivation rows,
identity tags, slide badges), Markdown and MDX with KaTeX math, and React components (`.tsx`) are rendered live;
images, PDFs, video and audio are shown; HTML runs in a sandbox; everything else shows its text. Save a file in any
editor and the open tabs update in a moment.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start`.

| Script | Does |
|---|---|
| `npm run check` | loads and renders every file of `samples/70050-machine-learning` and checks the topics (KaTeX, tags, slides, "why" blocks, plain-text math in prose) |
| `npm run check -- <folder>` | the same for any folder; add `--topic ridge,lasso` to check only some topics |
| `npm run upgrade -- <folder>` | brings a folder to the current notes format (`--dry-run` to only list the changes) |
| `npm test` | upgrade and compatibility tests (on copies in the temp folder) |
| `npm run typecheck` | TypeScript over the app and the sample |

## Versions

The app version is in `package.json`; the notes format version is in `lib/version.ts`. Both are shown at the
bottom of the Explorer. Each notebook has a `principia.version.json` with the format it is written in. A
notebook in an older format is still shown, in compatibility mode, and is upgraded on open when the app may write
to it, with backups in `.principia/backup/`. See **`CHANGELOG.md`** for the rules and the history of formats.

## Using the workspace

| Action | How |
|---|---|
| Open a folder | The folder button at the top of the Explorer, or "Open folder…" on the start page. Several folders can be open at once. |
| Try the sample | "Open sample: 70050-machine-learning" (the folder `samples/70050-machine-learning`). |
| Open a file | Click it in the Explorer. It becomes a tab in the active group. The split icon opens it to the side. |
| Identity index | Click any tag (`I5`, `C1`, …) to open it to the right with that row highlighted. Its chips jump to where an identity is used. |
| Step through a note | Lecture topics open showing their header; the bar at the bottom middle steps them part by part: to the start, back, stage / total, forward, to the end. Keys: `←` `→`, and `Shift+←` `Shift+→` to jump. While the end of the note is in view, each step scrolls by the height it adds, so you never scroll by hand. The stage is remembered per tab. |
| Previous / next note | The two buttons at the end of the bar, or `Ctrl+←` `Ctrl+→` (`⌘` on a Mac). The next note (topic or Markdown/MDX page, in explorer order) takes the current tab's place. |
| Split or merge | Drag a tab to an edge to split, or onto another tab strip to merge. |
| Reload or close a folder | The buttons on the folder's row (on hover). |
| Hide the Explorer | `Ctrl+B` or `Cmd+B`. |
| Reset the layout | "Reset layout" at the bottom of the Explorer. |

Open folders are remembered in IndexedDB; tabs, splits, collapsed folders and step stages in `localStorage`
(`notes-layout-v3`, `notes-explorer-collapsed-v2`, `notes-steps-v1`).

### Browsers

The folder picker is the File System Access API (Chrome and Edge). It asks for edit access, which upgrades need;
the app writes nothing else. After a reload the browser asks for permission again: click the folder's
"reconnect" row once. Other browsers get a folder upload dialog instead; such a folder is
a snapshot that does not see later edits and is not remembered after a reload.

### Trust

Notes are code: a `.tsx`, `.ts` or `.mdx` file runs in the app's page with the app's permissions. Open only folders
you trust, as you would only run code you trust.

## Writing notes

Read **`docs/CONTENT_GUIDE.md`**: the file formats, the `principia` module, the config file, and the structured
topic format with its colour convention. The sample folder uses every format.

## How it works

```
app/                       layout, page, api/samples (serves samples/ read-only)
components/                Workspace, Dock (dockview), Explorer, Welcome, Notes (rows, tags, slide refs, why, Step), Tex,
                           StepScope (step-by-step reveal), StepControls (the step bar and keys)
components/panels/         FilePanel (chooses a view per file), TopicPanel (TopicView), IdentityPanel
sdk/                       the `principia` module that notes import: types, helpers, components
lib/notebook/              source (folder handle, upload, sample), compile (sucrase, MDX), loader (module graph),
                           builtins, npm (esm.sh + import map), indexer, scan, store (open folders, polling),
                           migrate (versions, upgrades), legacy (reading notes format 1)
lib/version.ts             app version and notes format version
lib/steps.ts               the stage of every steppable panel, and which one the step bar drives
lib/workspace.ts           open / split / focus logic
scripts/                   check.tsx, upgrade.ts, test-upgrade.ts
samples/                   example notebooks
tests/fixtures/            a notebook in notes format 1, for npm test
```

Files are compiled in the browser when they are opened: TypeScript and JSX with sucrase (types are stripped,
not checked), Markdown and MDX with `@mdx-js/mdx` plus remark-math, rehype-katex, GFM tables and front matter.
A small CommonJS-style module graph runs the result and caches it; when a file changes, it and everything that
imports it are rebuilt. `react`, `react-dom`, `katex` and `principia` are the app's own instances; other npm
packages come from esm.sh, with an import map so they share the app's React.

Stack: Next.js (App Router), React, KaTeX, Dockview, sucrase, MDX.
