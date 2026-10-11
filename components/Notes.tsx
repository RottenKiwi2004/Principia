'use client';

import { createContext, useContext } from 'react';
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

export function NoteLine({ n }: { n: Note }) {
  switch (n.k) {
    case 'shape':
      return (
        <p className="shape">
          <Tex>{n.tex}</Tex>
        </p>
      );
    case 'tag':
      return (
        <p>
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
        <p className="note-ex">
          <span className="ex-tag">Ex.</span> <P>{n.t}</P>
        </p>
      );
    case 'text':
      return (
        <p className="note-text">
          <P>{n.t}</P>
        </p>
      );
    default:
      return (
        <p>
          <span className={n.k}>
            <P>{n.t}</P>
          </span>
        </p>
      );
  }
}

export function Row({ eq, notes }: RowData) {
  return (
    <div className="row">
      <div className="eq">
        <Tex>{eq}</Tex>
      </div>
      <div className="note">
        {notes.map((n, i) => (
          <NoteLine key={i} n={n} />
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

export function Callout({ heading, flag, text, eq }: CalloutData) {
  return (
    <div className="callout">
      <p className="callout-h">{heading}</p>
      <p>
        {flag && <Flag id={flag} />} <P>{text}</P> {eq && <Tex>{eq}</Tex>}
      </p>
    </div>
  );
}
