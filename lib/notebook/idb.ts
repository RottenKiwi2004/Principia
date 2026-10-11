// The open folders, remembered across reloads. Folder handles can only be stored in IndexedDB (not localStorage).

export type SavedRoot =
  | { id: string; kind: 'folder'; name: string; order: number; handle: FileSystemDirectoryHandle }
  | { id: string; kind: 'sample'; name: string; order: number; sample: string };

const DB = 'notes-workspace';
const STORE = 'roots';

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const d = await db();
  return new Promise<T>((resolve, reject) => {
    const req = fn(d.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  }).finally(() => d.close());
}

// Storage can be unavailable (private windows, blocked site data): the folders are then just not remembered.
export const loadRoots = () =>
  run<SavedRoot[]>('readonly', (s) => s.getAll())
    .then((r) => r.sort((a, b) => a.order - b.order))
    .catch(() => [] as SavedRoot[]);
export const saveRoot = (r: SavedRoot) => run('readwrite', (s) => s.put(r)).catch(() => undefined);
export const forgetRoot = (id: string) => run('readwrite', (s) => s.delete(id)).catch(() => undefined);
