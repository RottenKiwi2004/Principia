// Small numeric helpers shared by the widgets. Plain TypeScript: any file in the folder can import it.

/** Solves A x = b by Gaussian elimination with partial pivoting. Returns null when A is (numerically) singular. */
export function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  const scale = Math.max(1e-300, ...A.flat().map(Math.abs));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-13 * scale) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/** A seeded random number generator (mulberry32), so a figure looks the same on every load. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard normal sample from two uniforms (Box–Muller). */
export const gauss = (u: () => number) => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());

/** A number for a TeX readout: a few significant digits, no trailing zeros, powers of ten as 1.5\times10^{-8}. */
export function num(v: number, digits = 3) {
  if (Math.abs(v) >= 1e5 || (v !== 0 && Math.abs(v) < 1e-3)) {
    const [m, e] = v.toExponential(1).split('e');
    return `${Number(m)}\\times10^{${Number(e)}}`;
  }
  return String(Number(v.toFixed(digits)));
}
