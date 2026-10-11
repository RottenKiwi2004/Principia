// Ridge regression on a degree-9 polynomial, with a dial for lambda. Follows the topic: inputs and targets are
// centred, the intercept is unpenalised, and (X^T X + lambda I) w = X^T y is solved rather than inverted.
import { useMemo, useState } from 'react';
import { P, R, Tex } from 'principia';
import { gauss, num, rng, solve } from './linalg';
import './widgets.css';

const DEG = 9;
const N = 12;
const SIGMA = 0.25;
const truth = (x: number) => Math.sin(Math.PI * x);
const features = (x: number) => Array.from({ length: DEG }, (_, j) => x ** (j + 1));

function sample(seed: number) {
  const u = rng(seed);
  return Array.from({ length: N }, (_, i) => {
    const x = -1 + (2 * (i + 0.5)) / N + (u() - 0.5) * 0.08;
    return { x, y: truth(x) + SIGMA * gauss(u) };
  });
}

export function ridgeFit(pts: { x: number; y: number }[], lambda: number) {
  const X = pts.map((p) => features(p.x));
  const xbar = Array.from({ length: DEG }, (_, j) => X.reduce((s, r) => s + r[j], 0) / X.length);
  const ybar = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const Xc = X.map((r) => r.map((v, j) => v - xbar[j]));
  const yc = pts.map((p) => p.y - ybar);
  const A = xbar.map((_, j) => xbar.map((_, k) => Xc.reduce((s, r) => s + r[j] * r[k], 0) + (j === k ? lambda : 0)));
  const b = xbar.map((_, j) => Xc.reduce((s, r, i) => s + r[j] * yc[i], 0));
  const w = solve(A, b) ?? new Array<number>(DEG).fill(0);
  const w0 = ybar - w.reduce((s, wj, j) => s + wj * xbar[j], 0);
  const predict = (x: number) => w0 + features(x).reduce((s, f, j) => s + w[j] * f, 0);
  const rss = pts.reduce((s, p) => s + (p.y - predict(p.x)) ** 2, 0);
  return { w, w0, predict, rss, norm: Math.hypot(...w) };
}

// fit plot
const FW = 360;
const FH = 240;
const fx = (x: number) => 20 + ((x + 1.05) / 2.1) * (FW - 30);
const fy = (y: number) => FH / 2 - (y / 2.2) * (FH / 2 - 12);
const curve = (f: (x: number) => number) =>
  Array.from({ length: 161 }, (_, i) => -1.05 + (2.1 * i) / 160)
    .map((x, i) => `${i ? 'L' : 'M'}${fx(x).toFixed(1)},${fy(Math.max(-3, Math.min(3, f(x)))).toFixed(1)}`)
    .join('');

// coefficient plot: bar height is sign(w) * log10(1 + |w|), so huge and small coefficients both show
const CW = 240;
const CH = 240;
const SPAN = 4;
const cy = (v: number) => CH / 2 - (Math.max(-SPAN, Math.min(SPAN, v)) / SPAN) * (CH / 2 - 14);
const slog = (w: number) => Math.sign(w) * Math.log10(1 + Math.abs(w));

export default function RidgeShrinkage() {
  const [logLambda, setLogLambda] = useState(-3);
  const [seed, setSeed] = useState(7);
  const pts = useMemo(() => sample(seed), [seed]);
  const lambda = 10 ** logLambda;
  const fit = ridgeFit(pts, lambda);

  const hint =
    logLambda < -5
      ? 'Almost no penalty: the curve chases the noise and the coefficients are huge.'
      : logLambda > 0.5
        ? R`A strong penalty: every coefficient shrinks towards 0 and the fit flattens towards the mean $\bar y$.`
        : R`In between: a smooth curve close to the true function, with moderate coefficients.`;

  return (
    <div className="w-box">
      <p className="w-title">Turn the ridge dial</p>
      <div className="w-grid">
        <svg className="w-plot" viewBox={`0 0 ${FW} ${FH}`} role="img" aria-label="Data, true function and ridge fit">
          <line className="axis" x1={fx(-1.05)} y1={fy(0)} x2={fx(1.05)} y2={fy(0)} />
          <path d={curve(truth)} fill="none" stroke="var(--green)" strokeWidth={1.5} strokeDasharray="5 4" />
          <path d={curve(fit.predict)} fill="none" stroke="var(--teal)" strokeWidth={2.5} />
          {pts.map((p, i) => (
            <circle key={i} cx={fx(p.x)} cy={fy(p.y)} r={4.5} fill="var(--red)" />
          ))}
        </svg>
        <svg className="w-plot" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label="Fitted coefficients">
          <line className="axis" x1={10} y1={cy(0)} x2={CW - 6} y2={cy(0)} />
          {fit.w.map((wj, j) => {
            const x = 14 + j * ((CW - 24) / DEG);
            const top = Math.min(cy(0), cy(slog(wj)));
            return (
              <g key={j}>
                <rect x={x} y={top} width={(CW - 24) / DEG - 6} height={Math.abs(cy(slog(wj)) - cy(0))} fill="var(--purple)" />
                <text className="tick" x={x + ((CW - 24) / DEG - 6) / 2} y={CH - 2} textAnchor="middle">
                  {j + 1}
                </text>
              </g>
            );
          })}
          <text className="tick" x={10} y={12}>
            sign·log10(1+|w_j|)
          </text>
        </svg>
      </div>

      <div className="w-row">
        <label>
          <Tex>{R`\log_{10}\lambda`}</Tex>{' '}
          <input type="range" min={-8} max={2} step={0.1} value={logLambda} onChange={(e) => setLogLambda(Number(e.target.value))} />
        </label>
        <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
          New noise
        </button>
      </div>
      <div className="w-readout">
        <Tex display>{R`\lambda=${num(lambda)},\qquad \lVert\hat{\mathbf w}\rVert_2=${num(fit.norm)},\qquad \text{RSS}=${num(fit.rss)}`}</Tex>
      </div>
      <p className="w-hint">
        <P>{hint}</P>
      </p>
    </div>
  );
}
