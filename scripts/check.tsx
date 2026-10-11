// Offline check of a notes folder, with the same compiler and loader as the app.
//   npm run check                                   the bundled sample
//   npm run check -- path/to/folder                 any folder
//   npm run check -- path/to/folder --topic ridge   only some topics (comma-separated ids; folder-wide checks still run)
// It loads every file, renders every topic, Markdown/MDX page and component, parses every equation with KaTeX, and
// checks tags, slide references, "why" blocks and prose (math only inside $...$) in the structured topics.
import { createElement, type ComponentType } from 'react';
import katex from 'katex';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopicView } from '../components/panels/TopicPanel';
import { IdentityView } from '../components/panels/IdentityPanel';
import { mdxComponents } from '../components/panels/FilePanel';
import { builtinModules } from '../lib/notebook/builtins';
import { fileKind } from '../lib/notebook/compile';
import { comparePaths, sectionTags } from '../lib/notebook/indexer';
import { ModuleGraph } from '../lib/notebook/loader';
import { NodeSource } from '../lib/notebook/node-source';
import { scanNotebook } from '../lib/notebook/scan';
import type { Note } from '../sdk/types';

const failures: string[] = [];
const warnings: string[] = [];
const args = process.argv.slice(2);
const only = (() => {
  const i = args.indexOf('--topic');
  return i >= 0 ? new Set(args[i + 1].split(',')) : null;
})();
const folder = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--topic') ?? 'samples/70050-machine-learning';

// ---- helpers ------------------------------------------------------------------------------
const texOk = (src: string, where: string, displayMode = false) => {
  try {
    katex.renderToString(src, { displayMode, throwOnError: true, trust: true, strict: 'ignore' });
  } catch (e) {
    failures.push(`${where}: KaTeX error: ${(e as Error).message.split('\n')[0]}`);
  }
};
// Prose: math only inside $...$. Characters that look like math outside the dollars are an error.
const BAD = /[ᵀ₀₁₂ᵢⱼ⁻¹²ŵŷεσμλθφΦΣ≥≤×−∇‖∈→⇒⊤=^\\∑∫]/;
const proseOk = (text: string, where: string) => {
  const parts = text.split('$');
  if (parts.length % 2 === 0) return failures.push(`${where}: unbalanced $ in "${text}"`);
  parts.forEach((seg, i) => {
    if (i % 2) texOk(seg, where);
    else if (BAD.test(seg)) failures.push(`${where}: plain-text math outside $...$ in "${seg.trim()}"`);
  });
};
const noteOk = (n: Note, where: string) => (n.k === 'shape' ? texOk(n.tex, `${where} shape`) : proseOk(n.t, where));
const words = (s: string) => s.trim().split(/\s+/).length;
const katexErrors = (html: string) => (html.match(/katex-error/g) ?? []).length;

async function main() {
  const source = new NodeSource(folder);
  const files = (await source.list()).map((f) => f.path).sort(comparePaths);
  const graph = new ModuleGraph(source, files, { builtins: builtinModules });
  const { config, index, errors } = await scanNotebook(graph, files);
  const title = config.title || source.name;
  for (const [path, e] of errors) failures.push(`${path}: does not load: ${e}`);

  // ---- pages: Markdown, MDX and components render without errors -----------------------------
  let pages = 0;
  for (const path of files) {
    const kind = fileKind(path);
    if (kind !== 'md' && kind !== 'mdx' && kind !== 'script') continue;
    if (kind === 'script' && (errors.has(path) || index.byPath.has(path))) continue;
    let exp: Record<string, unknown>;
    try {
      exp = await graph.import(path);
    } catch (e) {
      if (!errors.has(path)) failures.push(`${path}: does not load: ${(e as Error).message}`);
      continue;
    }
    if (typeof exp.default !== 'function') continue;
    try {
      const html = renderToStaticMarkup(createElement(exp.default as ComponentType<{ components: unknown }>, { components: mdxComponents }));
      if (katexErrors(html)) failures.push(`${path}: ${katexErrors(html)} KaTeX render errors`);
      pages++;
    } catch (e) {
      failures.push(`${path}: render error: ${(e as Error).message}`);
    }
  }

  // ---- identities -----------------------------------------------------------------------------
  const known = new Set<string>();
  for (const it of index.identities) {
    if (known.has(it.id)) failures.push(`identity id ${it.id} is defined twice`);
    known.add(it.id);
    if (!/^[IC]\d+$/.test(it.id)) failures.push(`identity id "${it.id}" must look like I12 or C3`);
    texOk(it.tex, `identity ${it.id}`);
    proseOk(it.note, `identity ${it.id} note`);
    if (!index.uses.has(it.id)) warnings.push(`identity ${it.id}: not tagged in any step`);
  }
  if (config.indexWhy) proseOk(config.indexWhy, 'config indexWhy');
  const deckPages = new Map((config.decks ?? []).map((d) => [d.id, d.pages]));

  // ---- structured topics ----------------------------------------------------------------------
  const topicIds = new Set<string>();
  let checkedTopics = 0;
  for (const { path, topic: t, folders } of index.topics) {
    if (topicIds.has(t.id)) failures.push(`topic id ${t.id} is used twice`);
    topicIds.add(t.id);
    if (only && !only.has(t.id)) continue;
    checkedTopics++;
    const at = (s: string) => `${path} › ${s}`;

    if (t.summary === 'Not written yet.') warnings.push(`${path}: still a stub`);
    if (t.short.length > 12) warnings.push(at(`short "${t.short}" is over 12 characters`));
    if (/\$/.test(t.title)) warnings.push(at('keep the topic title plain text (it is also the tab title)'));
    proseOk(t.title, at('title'));
    if (t.subtitle) proseOk(t.subtitle, at('subtitle'));
    proseOk(t.summary, at('summary'));

    const secIds = new Set<string>();
    let lastCirc = 0;
    for (const s of t.sections) {
      const w = (x: string) => at(`${s.id} ${x}`);
      if (secIds.has(s.id)) failures.push(at(`section id ${s.id} is used twice`));
      secIds.add(s.id);
      if (s.circ !== undefined) {
        if (s.circ !== lastCirc + 1) warnings.push(w(`circ ${s.circ} does not follow ${lastCirc}`));
        lastCirc = s.circ;
      }
      proseOk(s.title, w('title'));
      if (!s.why.trim()) failures.push(w('"why" is empty'));
      else if (words(s.why) > 60) warnings.push(w(`"why" is ${words(s.why)} words, keep it under 60`));
      proseOk(s.why, w('why'));
      if (s.slideNote) proseOk(s.slideNote, w('slideNote'));
      for (const r of s.slides) {
        const pages = deckPages.get(r.deck);
        if (pages === undefined) failures.push(w(`slide deck "${r.deck}" is not in the config's decks`));
        else if (r.n < 1 || r.n > pages) failures.push(w(`slide ${r.deck} · ${r.n} is outside 1–${pages}`));
        if (!r.name.trim()) failures.push(w(`slide ${r.deck} · ${r.n} has no name`));
      }
      if (s.display) texOk(s.display, w('display'), true);
      s.pre?.forEach((n, i) => noteOk(n, w(`pre ${i + 1}`)));
      s.rows.forEach((r, i) => {
        texOk(r.eq, w(`row ${i + 1} eq`));
        r.notes.forEach((n) => noteOk(n, w(`row ${i + 1}`)));
      });
      for (const c of s.callouts ?? []) {
        proseOk(c.heading, w('callout heading'));
        proseOk(c.text, w('callout text'));
        if (c.eq) texOk(c.eq, w('callout eq'));
      }
      for (const id of sectionTags(s)) if (!known.has(id)) failures.push(w(`tag ${id} is not in the identity index`));
    }

    try {
      const html = renderToStaticMarkup(<TopicView topic={t} nbId="check" path={path} notebookTitle={title} folders={folders} />);
      if (katexErrors(html)) failures.push(at(`${katexErrors(html)} KaTeX render errors`));
    } catch (e) {
      failures.push(at(`render error: ${(e as Error).message}`));
    }
  }

  const idx = renderToStaticMarkup(<IdentityView nbId="check" title={title} indexWhy={config.indexWhy} index={index} />);
  if (idx.includes('katex-error')) failures.push('identity index has KaTeX errors');

  // ---- report ---------------------------------------------------------------------------------
  console.log(`${title} (${folder}): ${files.length} files, ${index.topics.length} topics, ${pages} pages, ${index.identities.length} identities`);
  warnings.forEach((w) => console.warn('warning:', w));
  if (failures.length) {
    failures.forEach((f) => console.error('FAIL:', f));
    console.error(`${failures.length} failures`);
    process.exit(1);
  }
  console.log(`ok: ${checkedTopics} topics checked`);
}

void main();
