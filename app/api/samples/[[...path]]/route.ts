// Serves the example notebooks in samples/ to the app (read-only).
//   GET /api/samples                 → ["70050-machine-learning", ...]
//   GET /api/samples/<name>          → every file of that sample: [{ path, size, mtime }]
//   GET /api/samples/<name>/<path>   → one file
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const ROOT = path.join(process.cwd(), 'samples');
const skip = (name: string) => name.startsWith('.') || name === 'node_modules';

const TYPES: Record<string, string> = {
  '.md': 'text/markdown', '.mdx': 'text/markdown', '.json': 'application/json', '.html': 'text/html', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
};

async function list(dir: string, prefix = ''): Promise<{ path: string; size: number; mtime: number }[]> {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (skip(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await list(full, `${prefix}${e.name}/`)));
    else if (e.isFile()) {
      const s = await stat(full);
      out.push({ path: prefix + e.name, size: s.size, mtime: s.mtimeMs });
    }
  }
  return out;
}

const json = (body: unknown) => Response.json(body, { headers: { 'cache-control': 'no-store' } });

export async function GET(_req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const parts = (await ctx.params).path ?? [];
  if (parts.some((p) => !p || p === '.' || p === '..' || /[\\/:]/.test(p) || skip(p))) return new Response('Bad path', { status: 400 });

  try {
    if (parts.length === 0) {
      const dirs = (await readdir(ROOT, { withFileTypes: true })).filter((e) => e.isDirectory() && !skip(e.name));
      return json(dirs.map((e) => e.name));
    }
    const sample = path.join(ROOT, parts[0]);
    if (parts.length === 1) return json(await list(sample));

    const file = path.join(sample, ...parts.slice(1));
    if (!file.startsWith(sample + path.sep) || !(await stat(file)).isFile()) return new Response('Not found', { status: 404 });
    const type = TYPES[path.extname(file).toLowerCase()] ?? 'text/plain; charset=utf-8';
    return new Response(new Uint8Array(await readFile(file)), { headers: { 'content-type': type, 'cache-control': 'no-store' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
