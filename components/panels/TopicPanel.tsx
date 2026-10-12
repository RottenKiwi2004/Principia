'use client';

import { useSyncExternalStore } from 'react';
import type { StepMode, Topic } from '@/sdk/types';
import { filePanelId, sectionFocus } from '@/lib/workspace';
import { useFocusScroll } from '@/lib/useFocusScroll';
import { Callout, Circ, NoteLine, PanelContext, Row, SlideRefs, Why, stepAttr } from '../Notes';
import { P, Tex } from '../Tex';

const PENS = [
  ['teal', 'labels and comments'],
  ['green', 'shapes, step notes, Ex.'],
  ['orange', 'constants'],
  ['pink', 'named concepts'],
  ['red', 'warnings, the column of 1s'],
  ['purple', 'sub-headings'],
] as const;

export const sectionDomId = (panelId: string, sectionId: string) => `sec-${panelId}-${sectionId}`;

/**
 * A structured topic: sections with a "why", slide badges, derivation rows, extras and callouts. The header is
 * always shown; the sections carry step marks, so inside a StepScope they are revealed one step at a time.
 */
export function TopicView(p: { topic: Topic; nbId: string; path: string; notebookTitle: string; folders: string[]; defaultSteps?: StepMode }) {
  const { topic, nbId, path, notebookTitle, folders, defaultSteps } = p;
  const panelId = filePanelId(nbId, path);
  const focus = useSyncExternalStore(sectionFocus.subscribe, sectionFocus.get, sectionFocus.get);
  const prefix = `${panelId}::`;
  useFocusScroll(focus, (id) => (id.startsWith(prefix) ? sectionDomId(panelId, id.slice(prefix.length)) : null), 'start');

  return (
    <PanelContext.Provider value={{ nbId, panelId }}>
      <article className="sheet">
        <header>
          <p className="course">{notebookTitle}</p>
          {folders.length > 0 && <p className="crumbs">{folders.join('  /  ')}</p>}
          <h1>
            <P>{topic.title}</P>
            {topic.subtitle && (
              <span className="subt">
                {' '}
                – <P>{topic.subtitle}</P>
              </span>
            )}
          </h1>
          <p className="lede">
            <P>{topic.summary}</P>
          </p>
          <ul className="pens" aria-label="Pen colours">
            {PENS.map(([c, what]) => (
              <li key={c}>
                <i className={`dot bg-${c}`} />
                <span>
                  <b>{c}</b> {what}
                </span>
              </li>
            ))}
          </ul>
        </header>

        {topic.sections.map((s) => {
          // Step marks (see components/StepScope.tsx): a whole section, or its parts one by one.
          const mode = s.steps ?? topic.steps ?? defaultSteps ?? 'rows';
          const parts = mode === 'rows' || mode === 'lines';
          return (
            <section
              key={s.id}
              id={sectionDomId(panelId, s.id)}
              className={'sec' + (focus.id === prefix + s.id ? ' is-focus' : '')}
              {...stepAttr(mode === 'section')}
            >
              <div className="sec-head" {...stepAttr(parts)}>
                <h2>
                  {s.circ !== undefined && <Circ n={s.circ} />}
                  <span className="t">
                    <P>{s.title}</P>
                  </span>
                </h2>
                <Why>{s.why}</Why>
                <SlideRefs refs={s.slides} note={s.slideNote} nonExaminable={s.nonExaminable} />
              </div>
              {s.display && (
                <div className="scroll" {...stepAttr(parts)}>
                  <Tex display>{s.display}</Tex>
                </div>
              )}
              {s.pre && s.pre.length > 0 && (
                <div className="notes-inline" {...stepAttr(mode === 'rows')}>
                  {s.pre.map((n, i) => (
                    <NoteLine key={i} n={n} step={mode === 'lines'} />
                  ))}
                </div>
              )}
              {s.rows.length > 0 && (
                <div className="rows">
                  {s.rows.map((r, i) => (
                    <Row key={i} {...r} step={mode === 'rows' ? 'row' : mode === 'lines' ? 'lines' : undefined} />
                  ))}
                </div>
              )}
              {s.extra !== undefined && s.extra !== null && (
                <div className="extra" {...stepAttr(parts)}>
                  {s.extra}
                </div>
              )}
              {s.callouts?.map((c, i) => (
                <Callout key={i} {...c} step={parts} />
              ))}
            </section>
          );
        })}

        <p className="foot">Ask for the proof of any tag, for example “prove I5”, and I will add it under that tag.</p>
      </article>
    </PanelContext.Provider>
  );
}
