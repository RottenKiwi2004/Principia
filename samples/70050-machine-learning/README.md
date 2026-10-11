---
title: About this sample
---

# 70050 Machine Learning: sample notebook

The notes for week 1 of *70050 Machine Learning* (regression), written for Principia. Open this folder from the
app to read them; edit any file and save it to see the change in a moment.

## What is in here

| Path | Format | Shows |
|---|---|---|
| `principia.config.ts` | config | title, slide decks, shared identities, folder titles |
| `identities.ts` | TypeScript | identities shared by every topic, such as $\nabla_{\mathbf w}(\mathbf w^\top A\mathbf w)=(A+A^\top)\mathbf w$ |
| `lecture-1/…/*.ts` | structured topics | sections, derivation rows, identity tags, slide badges |
| `lecture-1/…/07-ridge.tsx` | topic + component | an interactive widget placed inside a section with `extra` |
| `playground.mdx` | MDX | prose, math, the topic components and a widget, mixed freely |
| `widgets/*.tsx` | React components | open one on its own, or import it from a topic or an MDX page |
| `widgets/widgets.css` | CSS | imported by the widgets; added to the page while they are loaded |

## Conventions

Every equation is TeX. In Markdown, inline math goes between single dollars, $X^\top X\mathbf w=X^\top\mathbf y$,
and display math between double dollars:

$$
\hat{\mathbf w}=(X^\top X+\lambda I)^{-1}X^\top\mathbf y
$$

> The pen colours of the topics (teal labels, green shapes, orange constants, pink concepts, red warnings) are the
> same everywhere, so a widget or an MDX page reads like the rest of the notes.
