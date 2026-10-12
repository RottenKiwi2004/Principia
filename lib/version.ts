// Two version numbers, see CHANGELOG.md:
// - APP_VERSION is the app's own semver, from package.json.
// - FORMAT_VERSION is the version of the notes format: what a notebook's files must look like. It goes up only
//   when notes written for the old format need changes to read well in the new one, and every step has a
//   migration in lib/notebook/migrate.ts. Older formats keep loading through compatibility shims.
import pkg from '../package.json';

export const APP_VERSION: string = pkg.version;
export const FORMAT_VERSION = 2;

/** Compares two semver strings, ignoring pre-release tags: -1, 0 or 1. Missing parts count as 0. */
export function compareVersions(a: string, b: string) {
  const pa = a.split(/[.+-]/).slice(0, 3).map((n) => Number(n) || 0);
  const pb = b.split(/[.+-]/).slice(0, 3).map((n) => Number(n) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) < (pb[i] ?? 0) ? -1 : 1;
  return 0;
}
