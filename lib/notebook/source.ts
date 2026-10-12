// Where a notebook's files come from. Every path is relative to the folder's root and uses '/' separators.

export type FileEntry = { path: string; size: number; mtime: number };

export interface FileSource {
  readonly name: string;
  /** True when list() sees edits made after opening, so polling it picks up changes. */
  readonly live: boolean;
  /** Every file under the root, recursively, skipping dot-folders and node_modules. */
  list(): Promise<FileEntry[]>;
  readText(path: string): Promise<string>;
  readBlob(path: string): Promise<Blob>;
  /** Writing is optional: only sources that can write have these, and canWrite() says if they may right now. */
  canWrite?(): Promise<boolean>;
  writeText?(path: string, text: string): Promise<void>;
  remove?(path: string): Promise<void>;
}

export type WritableSource = FileSource & Required<Pick<FileSource, 'canWrite' | 'writeText' | 'remove'>>;

/** True when `s` can write now (for a picked folder: the user granted edit permission). */
export async function writable(s: FileSource | null): Promise<boolean> {
  return !!s?.writeText && !!s.remove && !!s.canWrite && (await s.canWrite().catch(() => false));
}

export const skipDir = (name: string) => name.startsWith('.') || name === 'node_modules';
const MAX_FILES = 5000;

// The File System Access API is not in TypeScript's DOM types yet.
declare global {
  interface FileSystemHandle {
    queryPermission?(o?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission?(o?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  }
  interface Window {
    showDirectoryPicker?(o?: { id?: string; mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}

/** A folder picked with window.showDirectoryPicker (Chrome, Edge). Reads always see the current files on disk. */
export class DirectorySource implements FileSource {
  readonly live = true;
  constructor(readonly handle: FileSystemDirectoryHandle) {}
  get name() {
    return this.handle.name;
  }

  async list() {
    const out: FileEntry[] = [];
    const walk = async (dir: FileSystemDirectoryHandle, prefix: string): Promise<void> => {
      const jobs: Promise<void>[] = [];
      for await (const h of dir.values()) {
        if (out.length + jobs.length > MAX_FILES) break;
        if (h.kind === 'directory') {
          if (!skipDir(h.name)) jobs.push(walk(h as FileSystemDirectoryHandle, `${prefix}${h.name}/`));
        } else {
          jobs.push(
            (h as FileSystemFileHandle).getFile().then((f) => {
              out.push({ path: prefix + h.name, size: f.size, mtime: f.lastModified });
            }),
          );
        }
      }
      await Promise.all(jobs);
    };
    await walk(this.handle, '');
    return out;
  }

  private async dir(parts: string[], create = false) {
    let dir = this.handle;
    for (const p of parts) dir = await dir.getDirectoryHandle(p, { create });
    return dir;
  }
  private async file(path: string) {
    const parts = path.split('/');
    return (await (await this.dir(parts.slice(0, -1))).getFileHandle(parts[parts.length - 1])).getFile();
  }
  readText(path: string) {
    return this.file(path).then((f) => f.text());
  }
  readBlob(path: string): Promise<Blob> {
    return this.file(path);
  }

  async canWrite() {
    return (await this.handle.queryPermission?.({ mode: 'readwrite' })) === 'granted';
  }
  async writeText(path: string, text: string) {
    const parts = path.split('/');
    const dir = await this.dir(parts.slice(0, -1), true);
    const out = await (await dir.getFileHandle(parts[parts.length - 1], { create: true })).createWritable();
    await out.write(text);
    await out.close();
  }
  async remove(path: string) {
    const parts = path.split('/');
    await (await this.dir(parts.slice(0, -1))).removeEntry(parts[parts.length - 1]);
  }
}

/** Files from <input type="file" webkitdirectory>, for browsers without showDirectoryPicker. A snapshot: it does not see later edits. */
export class FileListSource implements FileSource {
  readonly live = false;
  readonly name: string;
  private files = new Map<string, File>();

  constructor(list: Iterable<File>) {
    let name = 'Folder';
    for (const f of list) {
      const parts = (f.webkitRelativePath || f.name).split('/');
      if (parts.length > 1) name = parts[0];
      const rel = parts.length > 1 ? parts.slice(1) : parts;
      if (rel.slice(0, -1).some(skipDir)) continue;
      this.files.set(rel.join('/'), f);
    }
    this.name = name;
  }

  async list() {
    return [...this.files].slice(0, MAX_FILES).map(([path, f]) => ({ path, size: f.size, mtime: f.lastModified }));
  }
  private file(path: string) {
    const f = this.files.get(path);
    if (!f) throw new Error(`${path} is not in the folder`);
    return f;
  }
  async readText(path: string) {
    return this.file(path).text();
  }
  async readBlob(path: string) {
    return this.file(path);
  }
}

/** A folder under samples/ in this repository, served by app/api/samples. */
export class SampleSource implements FileSource {
  readonly live = true;
  constructor(readonly sample: string) {}
  get name() {
    return this.sample;
  }

  private url(path = '') {
    const rest = path ? '/' + path.split('/').map(encodeURIComponent).join('/') : '';
    return `/api/samples/${encodeURIComponent(this.sample)}${rest}`;
  }
  private async get(path?: string) {
    const r = await fetch(this.url(path), { cache: 'no-store' });
    if (!r.ok) throw new Error(`${path ?? this.sample}: ${r.status} ${r.statusText}`);
    return r;
  }
  async list() {
    return (await (await this.get()).json()) as FileEntry[];
  }
  async readText(path: string) {
    return (await this.get(path)).text();
  }
  async readBlob(path: string) {
    return (await this.get(path)).blob();
  }
}
