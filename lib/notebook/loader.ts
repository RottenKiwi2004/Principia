// A small CommonJS-style module system for the files of one notebook folder.
//
// import(path) works in two phases. First it compiles the file and, recursively, everything it imports
// (asynchronous: files are read and npm packages fetched). Then it runs the compiled code with a synchronous
// require() that only hands out what the first phase prepared. Compiled code and module instances are cached
// until invalidate() is told that a file changed; then that file and every module that imports it, directly or
// not, are dropped and rebuilt on the next import. Cycles behave as in Node: the second module sees the first
// one's exports as they are at that moment.
import { compileModule, fileKind } from './compile';
import type { FileSource } from './source';

export type Resolved = { kind: 'builtin'; spec: string } | { kind: 'file'; path: string } | { kind: 'npm'; spec: string };

export type LoaderEnv = {
  /** Modules provided by the app (react, katex, principia...), already in interop shape. */
  builtins: () => Record<string, unknown>;
  /** Loads an npm package that is not a builtin. Without it, such imports fail. */
  importNpm?: (spec: string) => Promise<unknown>;
  /** A URL for a non-code file imported by a note (an image, say). Without it the path itself is used. */
  assetUrl?: (path: string, blob: Blob) => string;
  /** Adds (css) or removes (null) the stylesheet of an imported .css file. */
  injectCss?: (path: string, css: string | null) => void;
};

export type ImportOptions = {
  /** Return false to refuse an npm package (the import then fails without fetching anything). */
  allowNpm?: (spec: string) => boolean;
};

/** An error in one file, with that file's path. `cause` is the original error. */
export class ModuleError extends Error {
  constructor(
    readonly path: string,
    readonly cause: unknown,
  ) {
    super(`${path}: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'ModuleError';
  }
}

/** The cause of a ModuleError when ImportOptions.allowNpm refused a package: the file is fine, just not loaded yet. */
export class DeferredImport extends Error {}

type Compiled = { code?: string; value?: unknown; css?: string; deps: Map<string, Resolved> };
type Mod = { exports: unknown };

const EXTS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.mdx', '.md', '.json'];

export const dirname = (path: string) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '');

/** Joins and normalises a relative path. Throws if it climbs out of the root. */
export function joinPath(dir: string, rel: string) {
  const out: string[] = [];
  for (const seg of `${dir}/${rel}`.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (!out.length) throw new Error(`'${rel}' points outside the folder`);
      out.pop();
    } else out.push(seg);
  }
  return out.join('/');
}

export class ModuleGraph {
  private compiling = new Map<string, Promise<Compiled>>();
  private compiled = new Map<string, Compiled>();
  private modules = new Map<string, Mod>();
  private npmLoading = new Map<string, Promise<unknown>>();
  private npm = new Map<string, unknown>();
  private files: Set<string>;

  constructor(
    private source: FileSource,
    files: Iterable<string>,
    private env: LoaderEnv,
  ) {
    this.files = new Set(files);
  }

  /** The folder's file list changed (files added or removed): resolution may differ, so everything is rebuilt. */
  setFiles(files: Iterable<string>) {
    this.files = new Set(files);
    this.invalidate([...this.compiling.keys()]);
  }

  /** The exports of a file, compiling and running it and its imports first if needed. */
  async import(path: string, o: ImportOptions = {}): Promise<Record<string, unknown>> {
    await this.prepare(path, o);
    return this.execute(path) as Record<string, unknown>;
  }

  /** The exports of a file that has already run, or undefined. Never compiles or runs anything. */
  loaded(path: string) {
    return this.modules.get(path)?.exports as Record<string, unknown> | undefined;
  }

  /** The files, among those compiled so far, that import `spec` (a builtin or npm name, or a resolved file path). */
  importersOf(spec: string) {
    const out: string[] = [];
    for (const [p, c] of this.compiled)
      for (const [s, r] of c.deps)
        if (s === spec || (r.kind === 'file' && r.path === spec)) {
          out.push(p);
          break;
        }
    return out;
  }

  /** Drops the given files and everything that imports them. Returns every dropped path. */
  invalidate(paths: Iterable<string>): Set<string> {
    const dirty = new Set(paths);
    for (let grew = true; grew; ) {
      grew = false;
      for (const [p, c] of this.compiled) {
        if (dirty.has(p)) continue;
        for (const r of c.deps.values())
          if (r.kind === 'file' && dirty.has(r.path)) {
            dirty.add(p);
            grew = true;
            break;
          }
      }
    }
    for (const p of dirty) {
      if (this.compiled.get(p)?.css !== undefined) this.env.injectCss?.(p, null);
      this.compiling.delete(p);
      this.compiled.delete(p);
      this.modules.delete(p);
    }
    return dirty;
  }

  /** Where `spec`, imported by `from`, points. Throws for a relative import of a file that does not exist. */
  resolve(spec: string, from: string): Resolved {
    if (spec in this.env.builtins()) return { kind: 'builtin', spec };
    const rel = spec.startsWith('./') || spec.startsWith('../');
    if (rel || spec.startsWith('/') || spec.startsWith('~/')) {
      const base = rel ? joinPath(dirname(from), spec) : joinPath('', spec.replace(/^~?\//, ''));
      const hit = this.findFile(base);
      if (!hit) throw new Error(`cannot find '${spec}'`);
      return { kind: 'file', path: hit };
    }
    return { kind: 'npm', spec };
  }

  private findFile(p: string) {
    const tries = [p, ...EXTS.map((e) => p + e), ...EXTS.map((e) => `${p}/index${e}`)];
    // TypeScript's ESM style: import './x.js' for the file x.ts
    if (/\.(m?js|jsx)$/.test(p)) tries.push(p.replace(/\.(m?js|jsx)$/, '.ts'), p.replace(/\.(m?js|jsx)$/, '.tsx'));
    return tries.find((t) => this.files.has(t));
  }

  private async prepare(root: string, o: ImportOptions) {
    const seen = new Set<string>();
    const visit = async (p: string): Promise<void> => {
      if (seen.has(p)) return;
      seen.add(p);
      const c = await this.compile(p);
      await Promise.all(
        [...c.deps.values()].map((r) => {
          if (r.kind === 'file') return visit(r.path);
          if (r.kind === 'npm') return this.loadNpm(r.spec, p, o);
        }),
      );
    };
    await visit(root);
  }

  private compile(path: string) {
    let job = this.compiling.get(path);
    if (!job) {
      job = this.doCompile(path).then(
        (c) => {
          if (this.compiling.get(path) === job) this.compiled.set(path, c);
          return c;
        },
        (e) => {
          throw e instanceof ModuleError ? e : new ModuleError(path, e);
        },
      );
      this.compiling.set(path, job);
    }
    return job;
  }

  private async doCompile(path: string): Promise<Compiled> {
    if (!this.files.has(path)) throw new Error('file not found');
    const kind = fileKind(path);
    if (kind === 'script' || kind === 'mdx' || kind === 'md') {
      const code = await compileModule(path, await this.source.readText(path), kind);
      const deps = new Map<string, Resolved>();
      for (const m of code.matchAll(/\brequire\(\s*(['"])([^'"\n]+)\1\s*\)/g))
        if (!deps.has(m[2])) deps.set(m[2], this.resolve(m[2], path));
      return { code, deps };
    }
    const none = new Map<string, Resolved>();
    if (kind === 'json') return { value: JSON.parse(await this.source.readText(path)), deps: none };
    if (kind === 'css') {
      const css = await this.source.readText(path);
      return { value: { __esModule: true, default: css }, css, deps: none };
    }
    if (kind === 'text' || kind === 'html') return { value: { __esModule: true, default: await this.source.readText(path) }, deps: none };
    const blob = await this.source.readBlob(path);
    return { value: { __esModule: true, default: this.env.assetUrl ? this.env.assetUrl(path, blob) : path }, deps: none };
  }

  private loadNpm(spec: string, from: string, o: ImportOptions) {
    if (this.npm.has(spec)) return;
    if (o.allowNpm && !o.allowNpm(spec)) throw new ModuleError(from, new DeferredImport(`npm package '${spec}' is not loaded here`));
    if (!this.env.importNpm) throw new ModuleError(from, new Error(`cannot import '${spec}': npm packages are only available in the app`));
    let job = this.npmLoading.get(spec);
    if (!job) {
      job = this.env.importNpm(spec).then(
        (m) => {
          this.npm.set(spec, m);
          return m;
        },
        (e) => {
          this.npmLoading.delete(spec); // let a later import retry, e.g. once the network is back
          throw new ModuleError(from, new Error(`could not load npm package '${spec}': ${e instanceof Error ? e.message : e}`));
        },
      );
      this.npmLoading.set(spec, job);
    }
    return job;
  }

  private execute(path: string): unknown {
    const done = this.modules.get(path);
    if (done) return done.exports;
    const c = this.compiled.get(path);
    if (!c) throw new ModuleError(path, new Error('not compiled'));

    const mod: Mod = { exports: {} };
    this.modules.set(path, mod);
    try {
      if (c.code === undefined) {
        mod.exports = c.value;
        if (c.css !== undefined) this.env.injectCss?.(path, c.css);
      } else {
        const require = (spec: string) => {
          const r = c.deps.get(spec);
          if (!r) throw new Error(`cannot require '${spec}': only imports with a fixed string are supported`);
          if (r.kind === 'builtin') return this.env.builtins()[r.spec];
          if (r.kind === 'file') return this.execute(r.path);
          return this.npm.get(r.spec);
        };
        const run = new Function('require', 'module', 'exports', '__filename', '__dirname', `${c.code}\n//# sourceURL=notes:///${encodeURI(this.source.name)}/${encodeURI(path)}`);
        run(require, mod, mod.exports, path, dirname(path));
      }
    } catch (e) {
      this.modules.delete(path);
      throw e instanceof ModuleError ? e : new ModuleError(path, e);
    }
    return mod.exports;
  }
}
