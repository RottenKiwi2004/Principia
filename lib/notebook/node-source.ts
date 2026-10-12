// A notebook folder on disk, read and written with Node's fs. For scripts (npm run check, npm run upgrade),
// never for the browser.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { skipDir, type FileEntry, type WritableSource } from './source';

export class NodeSource implements WritableSource {
  readonly live = true;
  readonly name: string;
  constructor(readonly root: string) {
    this.name = path.basename(path.resolve(root));
  }

  async list() {
    const out: FileEntry[] = [];
    const walk = async (dir: string, prefix: string) => {
      for (const e of await readdir(dir, { withFileTypes: true })) {
        if (e.isDirectory()) {
          if (!skipDir(e.name)) await walk(path.join(dir, e.name), `${prefix}${e.name}/`);
        } else if (e.isFile()) {
          const s = await stat(path.join(dir, e.name));
          out.push({ path: prefix + e.name, size: s.size, mtime: s.mtimeMs });
        }
      }
    };
    await walk(this.root, '');
    return out;
  }
  readText(p: string) {
    return readFile(path.join(this.root, p), 'utf8');
  }
  async readBlob(p: string) {
    return new Blob([new Uint8Array(await readFile(path.join(this.root, p)))]);
  }

  async canWrite() {
    return true;
  }
  async writeText(p: string, text: string) {
    const full = path.join(this.root, p);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, text, 'utf8');
  }
  async remove(p: string) {
    await rm(path.join(this.root, p));
  }
}
