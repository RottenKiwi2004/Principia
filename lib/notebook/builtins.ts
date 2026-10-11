// The modules every note can import without installing anything. They are the app's own instances, so a
// component in a note shares React (hooks, context) with the app.
import * as React from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import * as JsxDevRuntime from 'react/jsx-dev-runtime';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as katex from 'katex';
import * as sdk from '@/sdk';

/** An ES module namespace in the shape sucrase's import helpers expect: named exports plus `default`. */
export const interop = (ns: object): Record<string, unknown> => {
  const m = ns as Record<string, unknown>;
  return { ...m, default: 'default' in m ? m.default : m, __esModule: true };
};

let cache: Record<string, unknown> | null = null;

/** Built lazily: `principia` imports components that import this file, so it cannot be read at load time. */
export function builtinModules() {
  return (cache ??= {
    react: interop(React),
    'react/jsx-runtime': interop(JsxRuntime),
    'react/jsx-dev-runtime': interop(JsxDevRuntime),
    'react-dom': interop(ReactDOM),
    'react-dom/client': interop(ReactDOMClient),
    katex: interop(katex),
    principia: interop(sdk),
  });
}
