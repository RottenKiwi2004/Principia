// npm test: notes format versions. Works on copies in the system temp folder; the repository is never written.
//  1. a format-1 course (tests/fixtures/format-1-course) loads as it is, in compatibility mode;
//  2. upgrading it writes format 2 with backups and a version file, and the result reads the same;
//  3. upgrading again does nothing; the sample is current; newer, invalid and stale version files are handled.
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { builtinModules } from '../lib/notebook/builtins';
import { comparePaths } from '../lib/notebook/indexer';
import { ModuleGraph } from '../lib/notebook/loader';
import { upgradeNotebook, versionStatus, VERSION_FILE, type VersionFile } from '../lib/notebook/migrate';
import { NodeSource } from '../lib/notebook/node-source';
import { scanNotebook } from '../lib/notebook/scan';
import { APP_VERSION, FORMAT_VERSION } from '../lib/version';

async function open(dir: string) {
  const source = new NodeSource(dir);
  const files = (await source.list()).map((f) => f.path).sort(comparePaths);
  const graph = new ModuleGraph(source, files, { builtins: builtinModules });
  const scan = await scanNotebook(graph, files);
  const status = await versionStatus(source, files, scan);
  const ctx = { files, read: (p: string) => source.readText(p), graph, scan };
  return { source, files, scan, status, ctx };
}

/** What a reader sees: the parts of the index and config that must survive an upgrade unchanged. */
const view = ({ scan }: Awaited<ReturnType<typeof open>>) => ({
  title: scan.config.title,
  decks: scan.config.decks,
  indexWhy: scan.config.indexWhy,
  folders: scan.config.folders,
  topics: scan.index.topics.map((t) => [t.path, t.topic.id, t.folders.join(' / ')]),
  identities: scan.index.identities.map((i) => i.id),
  uses: [...scan.index.uses].map(([id, u]) => [id, u.map((x) => `${x.path}#${x.sectionId}`)]),
});

const tests: [string, () => Promise<void>][] = [];
const test = (name: string, fn: () => Promise<void>) => tests.push([name, fn]);
let tmp = '';
const copy = async (from: string, name: string) => {
  const to = path.join(tmp, name);
  await cp(from, to, { recursive: true });
  return to;
};

test('a format-1 course opens in compatibility mode', async () => {
  const nb = await open(await copy('tests/fixtures/format-1-course', 'compat'));
  assert.equal(nb.scan.errors.size, 0, [...nb.scan.errors.values()].join('\n'));
  assert.equal(nb.status.format, 1);
  assert.equal(nb.status.action, 'upgrade');
  assert.equal(nb.scan.legacy.course?.path, 'course.ts');
  assert.deepEqual(view(nb), {
    title: 'Fixture Course',
    decks: [{ id: 'A', label: 'Week 1 · Deck A', pages: 20 }],
    indexWhy: String.raw`Rules such as $\nabla(\alpha f)=\alpha\nabla f$ are used in many steps.`,
    folders: { 'lecture-1': 'Lecture 1 · Basics', 'lecture-1/part-a': 'Part A', 'lecture-1/part-b': 'Part B' },
    topics: [
      ['lecture-1/part-a/01-basics.ts', 'basics', 'Lecture 1 · Basics / Part A'],
      ['lecture-1/part-b/02-more.ts', 'more', 'Lecture 1 · Basics / Part B'],
    ],
    identities: ['I1', 'I2', 'C1'],
    uses: [
      ['I1', ['lecture-1/part-a/01-basics.ts#norm']],
      ['I2', ['lecture-1/part-b/02-more.ts#grad']],
      ['C1', ['lecture-1/part-b/02-more.ts#grad']],
    ],
  });
});

test('upgrading format 1 writes format 2, keeps a backup, and reads the same', async () => {
  const dir = await copy('tests/fixtures/format-1-course', 'upgrade');
  const before = await open(dir);
  const r = await upgradeNotebook(before.source, before.ctx, before.status);
  assert.deepEqual(r.plan.changes.map((c) => [c.path, c.text === null ? 'remove' : 'write']).sort(), [
    ['course.ts', 'remove'],
    ['identities.ts', 'write'],
    ['lecture-1/part-a/01-basics.ts', 'write'],
    ['lecture-1/part-b/02-more.ts', 'write'],
    ['principia.config.ts', 'write'],
  ]);

  const after = await open(dir);
  assert.equal(after.scan.errors.size, 0, [...after.scan.errors.values()].join('\n'));
  assert.deepEqual(view(after), view(before));
  assert.deepEqual(after.scan.legacy, { course: undefined, nestedCourse: undefined, aliased: [] });
  assert.equal(after.scan.configPath, 'principia.config.ts');
  assert.equal(after.status.action, 'none');
  assert.ok(!after.files.includes('course.ts'));

  const config = await readFile(path.join(dir, 'principia.config.ts'), 'utf8');
  assert.match(config, /import \{ identities \} from '\.\/identities';/);
  assert.match(config, /indexWhy: R`/);

  const version = JSON.parse(await readFile(path.join(dir, VERSION_FILE), 'utf8')) as VersionFile;
  assert.equal(version.format, FORMAT_VERSION);
  assert.equal(version.app, APP_VERSION);
  assert.equal(version.history?.length, 1);
  assert.deepEqual([version.history![0].from, version.history![0].to], [1, 2]);
  const backup = version.history![0].backup!;
  assert.ok('backup' in r && r.backup === backup && backup.startsWith('.principia/backup/'));
  const original = await readFile(path.join('tests/fixtures/format-1-course', 'course.ts'), 'utf8');
  assert.equal(await readFile(path.join(dir, backup, 'course.ts'), 'utf8'), original);
  assert.match(await readFile(path.join(dir, backup, 'identities.ts'), 'utf8'), /@\/content\/types/);
});

test('the bundled sample is current', async () => {
  const nb = await open('samples/70050-machine-learning');
  assert.equal(nb.status.format, FORMAT_VERSION);
  assert.equal(nb.status.action, 'none', 'samples/70050-machine-learning/principia.version.json is behind: update its "app"');
  assert.equal(nb.scan.legacy.aliased.length, 0);
});

test('a current folder without a version file only gets one', async () => {
  const dir = await copy('samples/70050-machine-learning', 'stamp');
  await rm(path.join(dir, VERSION_FILE), { force: true });
  const nb = await open(dir);
  assert.equal(nb.status.action, 'stamp');
  const r = await upgradeNotebook(nb.source, nb.ctx, nb.status);
  assert.equal(r.plan.changes.length, 0);
  assert.equal('backup' in r ? r.backup : undefined, undefined);
  assert.equal((await open(dir)).status.action, 'none');
});

test('version files from other app versions', async () => {
  const dir = await copy('samples/70050-machine-learning', 'versions');
  const status = async (v: unknown) => {
    await writeFile(path.join(dir, VERSION_FILE), typeof v === 'string' ? v : JSON.stringify(v));
    return (await open(dir)).status.action;
  };
  assert.equal(await status({ format: FORMAT_VERSION, app: '0.0.1' }), 'stamp'); //  an older app wrote it
  assert.equal(await status({ format: FORMAT_VERSION, app: '99.0.0' }), 'none'); // a newer app, same format
  assert.equal((await open(dir)).status.newerApp, true); //                        … which is reported
  assert.equal(await status({ format: FORMAT_VERSION + 1, app: '99.0.0' }), 'newer');
  assert.equal(await status('{ not json'), 'invalid');
  assert.equal(await status({ format: 'two', app: '1' }), 'invalid');
});

test('an old app folder is not upgraded in place', async () => {
  const dir = path.join(tmp, 'app-folder');
  await cp('tests/fixtures/format-1-course', path.join(dir, 'content/courses/fixture'), { recursive: true });
  const nb = await open(dir);
  assert.equal(nb.status.action, 'misplaced');
});

async function main() {
  tmp = await mkdtemp(path.join(tmpdir(), 'principia-test-'));
  let failed = 0;
  try {
    for (const [name, fn] of tests) {
      try {
        await fn();
        console.log(`ok    ${name}`);
      } catch (e) {
        failed++;
        console.error(`FAIL  ${name}\n${e instanceof Error ? e.message : e}\n`);
      }
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
  console.log(failed ? `${failed} of ${tests.length} failed` : `all ${tests.length} passed`);
  process.exit(failed ? 1 : 0);
}

void main();
