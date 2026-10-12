'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Callout as CalloutData, Note, RowData, SlideRef } from '@/sdk/types';
import { openIdentity } from '@/lib/workspace';
import { P, Tex } from './Tex';

/** Which notebook and dock panel a note is rendered in, so a tag opens the right index beside the right panel. */
export const PanelContext = createContext<{ nbId: string; panelId?: string }>({ nbId: '' });

/** An identity tag. Clicking it opens the identity index to the side and highlights that row. */
export function Flag({ id }: { id: string }) {
  const { nbId, panelId } = useContext(PanelContext);
  return (
    <button
      type="button"
      className="flag"
      onClick={() => openIdentity(nbId, id, panelId)}
      title={`Open ${id} in the identity index`}
    >
      {id}
    </button>
  );
}

/** A circled step number. With onClick it is a button that jumps to that step. */
export function Circ({ n, onClick, title }: { n: number; onClick?: () => void; title?: string }) {
  return onClick ? (
    <button type="button" className="circ circ-btn" onClick={onClick} title={title ?? `Show step ${n}`}>
      {n}
    </button>
  ) : (
    <span className="circ">{n}</span>
  );
}

/**
 * Where an element appears when the note is stepped through (see components/StepScope.tsx):
 * true = at the next step, 'with' = together with the previous step, a number = at that step.
 */
export type StepMark = boolean | 'with' | number;

/** The data-step attribute for a mark: spread it on the element that should appear at that step. */
export const stepAttr = (m?: StepMark) =>
  m === undefined || m === false ? {} : { 'data-step': m === true ? '' : m === 'with' ? '=' : String(m) };

/**
 * Content that appears at its own step when the note is stepped through.
 *   <Step>…</Step>              at the next step
 *   <Step withPrevious>…</Step> together with the previous step
 *   <Step at={3}>…</Step>       at step 3
 *   <Step as="span">…</Step>    inline, inside a paragraph
 */
export function Step({ children, at, withPrevious, as: Tag = 'div', className }: { children?: ReactNode; at?: number; withPrevious?: boolean; as?: 'div' | 'span' | 'section' | 'li'; className?: string }) {
  return (
    <Tag className={className} {...stepAttr(at ?? (withPrevious ? 'with' : true))}>
      {children}
    </Tag>
  );
}

export function NoteLine({ n, step }: { n: Note; step?: StepMark }) {
  const mark = stepAttr(step);
  switch (n.k) {
    case 'shape':
      return (
        <p className="shape" {...mark}>
          <Tex>{n.tex}</Tex>
        </p>
      );
    case 'tag':
      return (
        <p {...mark}>
          {n.ids.map((id) => (
            <Flag key={id} id={id} />
          ))}
          <span className="lab">
            <P>{n.t}</P>
          </span>
        </p>
      );
    case 'ex':
      return (
        <p className="note-ex" {...mark}>
          <span className="ex-tag">Ex.</span> <P>{n.t}</P>
        </p>
      );
    case 'text':
      return (
        <p className="note-text" {...mark}>
          <P>{n.t}</P>
        </p>
      );
    default:
      return (
        <p {...mark}>
          <span className={n.k}>
            <P>{n.t}</P>
          </span>
        </p>
      );
  }
}

/** A derivation row. `step`: the row appears at a step ('row'), or its equation first and then each note ('lines'). */
export function Row({ eq, notes, step }: RowData & { step?: 'row' | 'lines' }) {
  return (
    <div className="row" {...stepAttr(!!step)}>
      <div className="eq">
        <Tex>{eq}</Tex>
      </div>
      <div className="note">
        {notes.map((n, i) => (
          <NoteLine key={i} n={n} step={step === 'lines'} />
        ))}
      </div>
    </div>
  );
}

export function SlideRefs({ refs, note, nonExaminable }: { refs: SlideRef[]; note?: string; nonExaminable?: boolean }) {
  return (
    <div className="slideref">
      {refs.map((r) => (
        <span className="sref" key={`${r.deck}-${r.n}`}>
          <b>
            {r.deck} · {r.n}
          </b>
          <em>{r.name}</em>
        </span>
      ))}
      {nonExaminable && <span className="nonexam">Non-examinable</span>}
      {note && (
        <p className="slidenote">
          <P>{note}</P>
        </p>
      )}
    </div>
  );
}

/** "Why are we doing this?": the motivation for a topic, placed directly under its purple heading. */
export function Why({ children }: { children: string }) {
  return (
    <div className="why-block">
      <p className="why-q">Why are we doing this?</p>
      <p className="why-a">
        <P>{children}</P>
      </p>
    </div>
  );
}

export function Callout({ heading, flag, text, eq, step }: CalloutData & { step?: StepMark }) {
  return (
    <div className="callout" {...stepAttr(step)}>
      <p className="callout-h">{heading}</p>
      <p>
        {flag && <Flag id={flag} />} <P>{text}</P> {eq && <Tex>{eq}</Tex>}
      </p>
    </div>
  );
}
