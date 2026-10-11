'use client';

import { useEffect, useState } from 'react';
import { pickFolder, pickSample } from '@/lib/notebook/actions';
import { useNotebooks } from '@/lib/notebook/hooks';
import { listSamples } from '@/lib/notebook/store';

/** Shown in the dock when no tab is open. */
export function Welcome() {
  const open = useNotebooks();
  const [samples, setSamples] = useState<string[]>([]);
  useEffect(() => {
    void listSamples().then(setSamples);
  }, []);

  return (
    <div className="welcome">
      <div className="welcome-card">
        <h1>Principia</h1>
        <p className="lede">
          {open.length
            ? 'Pick a file in the explorer, or open another folder.'
            : 'Open a folder of notes. Structured topics, Markdown, MDX and React components (.tsx) are rendered; anything else is shown as it is.'}
        </p>
        <div className="welcome-actions">
          <button type="button" className="btn btn-primary" onClick={() => void pickFolder()}>
            Open folder…
          </button>
          {samples.map((s) => (
            <button key={s} type="button" className="btn" onClick={() => void pickSample(s)}>
              Open sample: {s}
            </button>
          ))}
        </div>
        <ul className="welcome-list">
          <li>
            <b>.ts / .tsx</b> exporting a topic: sections, derivation rows, identity tags, slide badges.
          </li>
          <li>
            <b>.tsx / .jsx</b> with a default-exported component: any interactive page. Imports <code>react</code>,{' '}
            <code>katex</code>, <code>principia</code>, files in the folder, and npm packages (from esm.sh).
          </li>
          <li>
            <b>.md / .mdx</b>: Markdown with <code>$math$</code>; MDX can place components anywhere in the text.
          </li>
          <li>
            <b>Anything else</b>: images, PDFs, video and audio are shown; HTML runs in a sandbox; other files show their text.
          </li>
        </ul>
        <p className="welcome-note">Saved edits appear in a moment. Folders stay open across reloads (Chrome and Edge).</p>
      </div>
    </div>
  );
}
