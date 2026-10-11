// npm packages that are not builtins are loaded as ES modules from esm.sh (this needs a network connection).
// They are fetched with `?external=react,react-dom`, so they import React by its bare name; an import map points
// those names at small modules that re-export the app's own React. One React instance means hooks and context
// work across the app, the notes and the packages.
import { builtinModules, interop } from './builtins';

const SHARED = ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client'];
let mapped = false;

function installImportMap() {
  if (mapped) return;
  mapped = true;
  const mods = builtinModules();
  (globalThis as Record<string, unknown>).__notesShared = Object.fromEntries(SHARED.map((s) => [s, mods[s]]));
  const imports: Record<string, string> = {};
  for (const s of SHARED) {
    const names = Object.keys(mods[s] as object).filter((k) => k !== 'default' && k !== '__esModule' && /^[A-Za-z_$][\w$]*$/.test(k));
    const code = `const m = globalThis.__notesShared[${JSON.stringify(s)}];\nexport default m.default;\nexport const { ${names.join(', ')} } = m;\n`;
    imports[s] = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  }
  const el = document.createElement('script');
  el.type = 'importmap';
  el.textContent = JSON.stringify({ imports });
  document.head.append(el);
}

// A real dynamic import of a URL, hidden from the bundler (which would try to resolve it at build time).
const dynamicImport = new Function('url', 'return import(url)') as (url: string) => Promise<object>;

/** The esm.sh URL for an import such as 'd3', 'd3@7', '@observablehq/plot' or 'lodash-es/debounce'. */
export function npmUrl(spec: string, versions: Record<string, string> = {}) {
  const m = /^(@[^/]+\/[^/@]+|[^/@]+)(@[^/]+)?(\/.*)?$/.exec(spec);
  if (!m) throw new Error(`'${spec}' is not an npm package name`);
  const [, name, at, sub = ''] = m;
  const version = at ? at.slice(1) : versions[name];
  return `https://esm.sh/${name}${version ? `@${version}` : ''}${sub}?external=react,react-dom`;
}

export async function importNpm(spec: string, versions?: Record<string, string>) {
  installImportMap();
  return interop(await dynamicImport(npmUrl(spec, versions)));
}
