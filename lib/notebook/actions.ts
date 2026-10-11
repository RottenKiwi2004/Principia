// What the "Open folder" and "Open sample" buttons do: open the notebook, then show its first page.
import { getApi, openDefault } from '@/lib/workspace';
import { openFiles, openFolder, openSample } from './store';

function show(id: string | null) {
  if (!id) return;
  const api = getApi();
  const shown = api?.panels.some((p) => (p.params as { nbId?: string } | undefined)?.nbId === id);
  if (!shown) openDefault(id);
}

/** The browser's folder picker; where there is none (Firefox, Safari), a folder upload dialog instead. */
export async function pickFolder() {
  const r = await openFolder();
  if (r !== 'unsupported') return show(r);
  const input = document.createElement('input');
  input.type = 'file';
  input.webkitdirectory = true;
  input.multiple = true;
  input.onchange = () => {
    if (input.files) void openFiles(input.files).then(show);
  };
  input.click();
}

export async function pickSample(name: string) {
  show(await openSample(name));
}
