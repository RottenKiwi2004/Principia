import katex from 'katex';
import { KATEX_OPTIONS } from '@/lib/katex';

const OPTS = { ...KATEX_OPTIONS, output: 'htmlAndMathml' } as const;

export const renderTex = (src: string, displayMode = false) => katex.renderToString(src, { ...OPTS, displayMode });

/** Whole-string TeX. Display mode gives a block, inline mode a span. */
export function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html = renderTex(children, display);
  return display ? (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** Prose with math only inside $...$. Everything outside the dollars stays plain text. */
export function P({ children }: { children: string }) {
  const parts = children.split('$');
  return (
    <>
      {parts.map((seg, i) => (i % 2 ? <Tex key={i}>{seg}</Tex> : <span key={i}>{seg}</span>))}
    </>
  );
}
