'use client';

import { useSyncExternalStore } from 'react';
import type { Identity } from '@/sdk/types';
import type { NotebookIndex } from '@/lib/notebook/indexer';
import { useNotebook } from '@/lib/notebook/hooks';
import { identityFocus, indexPanelId, openSection } from '@/lib/workspace';
import { useFocusScroll } from '@/lib/useFocusScroll';
import { useScrollMemory } from '@/lib/useScrollMemory';
import { PanelContext, Why } from '../Notes';
import { P, Tex } from '../Tex';

export const identityDomId = (nbId: string, id: string) => `idx-${nbId}-${id}`;

export function IdentityPanel({ nbId }: { nbId: string }) {
  const nb = useNotebook(nbId);
  const scroll = useScrollMemory(indexPanelId(nbId), nb?.status === 'ready');
  return (
    <div className="panel" {...scroll}>
      {nb?.status === 'ready' ? (
        <IdentityView nbId={nbId} title={nb.title} indexWhy={nb.config.indexWhy} index={nb.index} />
      ) : (
        <article className="sheet">
          <p className="lede">{nb ? 'Loading the folder…' : 'This folder is closed. Close the tab, or open the folder again from the explorer.'}</p>
        </article>
      )}
    </div>
  );
}

/** Every identity of a notebook, grouped by area, with "used in" chips that open the topic at that step. */
export function IdentityView({ nbId, title, indexWhy, index }: { nbId: string; title: string; indexWhy?: string; index: NotebookIndex }) {
  const focus = useSyncExternalStore(identityFocus.subscribe, identityFocus.get, identityFocus.get);
  const prefix = `${nbId}::`;
  useFocusScroll(focus, (id) => (id.startsWith(prefix) ? identityDomId(nbId, id.slice(prefix.length)) : null), 'center');

  const all = index.identities;
  const areas = [...new Set(all.map((i) => i.area))];

  return (
    <PanelContext.Provider value={{ nbId, panelId: indexPanelId(nbId) }}>
      <article className="sheet">
        <header>
          <p className="course">{title}</p>
          <h1>Identity index</h1>
          {indexWhy && <Why>{indexWhy}</Why>}
          <p className="lede">
            Every identity, rule and convention the notes use, with its shapes. The chips under each one show where it is
            used: click one to open that topic at that step.
          </p>
        </header>

        {all.length === 0 && <p className="lede">No identities yet. Add them to a topic's `identities` or to the folder's config.</p>}

        {areas.map((area) => (
          <div key={area} className="idx-area">
            <p className="idx-area-h">{area}</p>
            <div className="rows">
              {all
                .filter((i) => i.area === area)
                .map((it) => (
                  <IdentityRow key={it.id} it={it} nbId={nbId} index={index} focused={focus.id === prefix + it.id} />
                ))}
            </div>
          </div>
        ))}

        <p className="foot">Ask for the proof of any tag, for example “prove I5”, and I will add it under that tag.</p>
      </article>
    </PanelContext.Provider>
  );
}

function IdentityRow({ it, nbId, index, focused }: { it: Identity; nbId: string; index: NotebookIndex; focused: boolean }) {
  const uses = index.uses.get(it.id) ?? [];
  return (
    <div id={identityDomId(nbId, it.id)} className={'idx' + (focused ? ' is-focus' : '')}>
      <div className="tag">{it.id}</div>
      <div className="stmt">
        <Tex>{it.tex}</Tex>
      </div>
      <div className="why">
        <p>
          <P>{it.note}</P>
        </p>
        <p className="used">
          {uses.length === 0 ? (
            'not used in a step yet'
          ) : (
            <>
              used in{' '}
              {uses.map((u) => (
                <button
                  key={`${u.path}-${u.sectionId}`}
                  type="button"
                  className="use-chip"
                  onClick={() => openSection(nbId, u.path, u.sectionId)}
                  title={`${u.topicTitle}: ${u.sectionTitle.replace(/\$/g, '')}`}
                >
                  {u.topicShort}
                  {u.circ !== undefined ? <span className="circ">{u.circ}</span> : <span className="sec-no">§{u.secNo}</span>}
                </button>
              ))}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
