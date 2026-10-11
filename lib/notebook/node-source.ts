// A notebook folder on disk, read with Node's fs. For scripts (npm run check), never for the browser.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { skipDir, type FileEntry, type FileSource } from './source';

export class NodeSource implements FileSource {
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
}
