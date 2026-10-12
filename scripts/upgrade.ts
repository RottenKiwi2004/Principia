// Upgrades a notes folder to the current notes format, as the app does when it opens a folder it can write.
//   npm run upgrade -- path/to/folder              upgrade (or just write principia.version.json)
//   npm run upgrade -- path/to/folder --dry-run    only say what would change
import { builtinModules } from '../lib/notebook/builtins';
import { comparePaths } from '../lib/notebook/indexer';
import { ModuleGraph } from '../lib/notebook/loader';
import { upgradeNotebook, versionStatus, VERSION_FILE } from '../lib/notebook/migrate';
import { NodeSource } from '../lib/notebook/node-source';
import { scanNotebook } from '../lib/notebook/scan';
import { APP_VERSION, FORMAT_VERSION } from '../lib/version';

async function main() {
  const args = process.argv.slice(2);
  const folder = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  if (!folder) {
    console.error('usage: npm run upgrade -- <folder> [--dry-run]');
    process.exit(2);
  }

  const source = new NodeSource(folder);
  const files = (await source.list()).map((f) => f.path).sort(comparePaths);
  const graph = new ModuleGraph(source, files, { builtins: builtinModules });
  const scan = await scanNotebook(graph, files);
  const status = await versionStatus(source, files, scan);

  console.log(
    `${folder}: notes format ${status.format}${status.guessed ? ' (no version file, worked out from the files)' : `, last written by Principia ${status.file?.app}`}.`,
  );
  console.log(`This is Principia ${APP_VERSION}, notes format ${FORMAT_VERSION}.`);

  switch (status.action) {
    case 'none':
      return console.log('Up to date: nothing to do.');
    case 'newer':
      return console.log('The notes are newer than this app: nothing is changed. Update Principia to read them fully.');
    case 'invalid':
    case 'misplaced':
      console.error(status.problem);
      process.exit(1);
  }

  const r = await upgradeNotebook(source, { files, read: (p) => source.readText(p), graph, scan }, status, { dryRun });
  for (const s of r.plan.steps) console.log(`step: ${s}`);
  const existing = new Set(files);
  for (const c of r.plan.changes) console.log(`  ${c.text === null ? 'remove' : existing.has(c.path) ? 'change' : 'add   '}  ${c.path}`);
  console.log(`  ${existing.has(VERSION_FILE) ? 'change' : 'add   '}  ${VERSION_FILE}`);
  if (dryRun) return console.log('Dry run: nothing was written.');
  if ('backup' in r && r.backup) console.log(`The old versions of changed files are in ${r.backup}/.`);
  console.log(`Done: notes format ${FORMAT_VERSION}.`);
}

void main();
