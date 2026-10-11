// Turns a note file into CommonJS code the module graph can run.
// TypeScript and JSX go through sucrase (no type checking, just stripping); Markdown and MDX go through
// @mdx-js/mdx with math ($...$, $$...$$ via KaTeX), GitHub tables and front matter. Both run in the browser
// and in Node, so `npm run check` uses the same pipeline as the app.
import { transform, type Transform } from 'sucrase';
import { KATEX_OPTIONS } from '@/lib/katex';

export type FileKind = 'script' | 'mdx' | 'md' | 'json' | 'css' | 'html' | 'image' | 'pdf' | 'video' | 'audio' | 'text';

const KINDS: Record<string, FileKind> = {
  ts: 'script', tsx: 'script', mts: 'script', cts: 'script', js: 'script', jsx: 'script', mjs: 'script', cjs: 'script',
  mdx: 'mdx', md: 'md', markdown: 'md',
  json: 'json', css: 'css', html: 'html', htm: 'html', pdf: 'pdf',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', avif: 'image', svg: 'image', ico: 'image', bmp: 'image',
  mp4: 'video', webm: 'video', mov: 'video', mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio', flac: 'audio',
};

export const extOf = (path: string) => {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
};

/** What a file is, from its extension. Anything unknown is treated as text (the viewer checks for binary content). */
export function fileKind(path: string): FileKind {
  if (path.endsWith('.d.ts')) return 'text';
  return KINDS[extOf(path)] ?? 'text';
}

function scriptTransforms(path: string): Transform[] {
  const ext = extOf(path);
  if (ext === 'ts' || ext === 'mts' || ext === 'cts') return ['typescript', 'imports'];
  if (ext === 'tsx') return ['typescript', 'jsx', 'imports'];
  return ['jsx', 'imports'];
}

/** CommonJS code for a script, MDX or Markdown file. Throws with a line number on a syntax error. */
export async function compileModule(path: string, source: string, kind: 'script' | 'mdx' | 'md'): Promise<string> {
  if (kind === 'script') {
    try {
      return transform(source, {
        transforms: scriptTransforms(path),
        jsxRuntime: 'automatic',
        production: true,
        disableESTransforms: true,
        filePath: path,
      }).code;
    } catch (e) {
      // "Error transforming x.tsx: Unexpected token (2:20)" → "Unexpected token (2:20)"; the caller adds the path.
      if (e instanceof Error) e.message = e.message.replace(/^Error transforming [^:]*: /, '');
      throw e;
    }
  }

  // Loaded on first use: the Markdown toolchain is large and many folders never need it.
  const [{ compile }, { default: remarkMath }, { default: remarkGfm }, { default: remarkFrontmatter }, { default: rehypeKatex }] =
    await Promise.all([
      import('@mdx-js/mdx'),
      import('remark-math'),
      import('remark-gfm'),
      import('remark-frontmatter'),
      import('rehype-katex'),
    ]);
  const file = await compile(
    { value: source, path },
    {
      format: kind,
      outputFormat: 'program',
      jsxImportSource: 'react',
      development: false,
      remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath],
      rehypePlugins: [[rehypeKatex, KATEX_OPTIONS]],
    },
  );
  return transform(String(file), { transforms: ['imports'], disableESTransforms: true, filePath: path }).code;
}
