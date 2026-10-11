// Least squares in 1D, live: drag the points, click to add one, double-click one to remove it.
// The readout is the 2-by-2 system of "Linear regression and least squares", step 5, with today's numbers.
import { useRef, useState, type PointerEvent } from 'react';
import { Flag, P, R, Tex } from 'principia';
import { num, solve } from './linalg';
import './widgets.css';

type Pt = { x: number; y: number };

const W = 560;
const H = 320;
const PAD = 30;
const sx = (x: number) => PAD + (x / 10) * (W - 2 * PAD);
const sy = (y: number) => H - PAD - (y / 10) * (H - 2 * PAD);
const clamp = (v: number) => Math.min(10, Math.max(0, v));

const START: Pt[] = [
  { x: 1, y: 2.2 },
  { x: 2.5, y: 2.6 },
  { x: 4, y: 4.6 },
  { x: 5.5, y: 4.4 },
  { x: 7, y: 6.9 },
  { x: 8.8, y: 7.1 },
];

export function fitLine(pts: Pt[]) {
  const N = pts.length;
  const Sx = pts.reduce((s, p) => s + p.x, 0);
  const Sxx = pts.reduce((s, p) => s + p.x * p.x, 0);
  const Sy = pts.reduce((s, p) => s + p.y, 0);
  const Sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
  const w = N >= 2 ? solve([[N, Sx], [Sx, Sxx]], [Sy, Sxy]) : null;
  const rss = w ? pts.reduce((s, p) => s + (p.y - w[0] - w[1] * p.x) ** 2, 0) : NaN;
  return { N, Sx, Sxx, Sy, Sxy, w, rss };
}

export default function LineFit() {
  const [pts, setPts] = useState<Pt[]>(START);
  const drag = useRef<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const f = fitLine(pts);

  const toData = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const vy = ((e.clientY - r.top) / r.height) * H;
    return { x: clamp(((vx - PAD) / (W - 2 * PAD)) * 10), y: clamp(((H - PAD - vy) / (H - 2 * PAD)) * 10) };
  };
  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    svg.current!.setPointerCapture(e.pointerId);
    const hit = (e.target as Element).getAttribute('data-i');
    if (hit !== null) drag.current = Number(hit);
    else {
      drag.current = pts.length;
      setPts([...pts, toData(e)]);
    }
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const i = drag.current;
    if (i === null) return;
    const p = toData(e);
    setPts((old) => old.map((q, k) => (k === i ? p : q)));
  };
  const remove = (i: number) => setPts((old) => old.filter((_, k) => k !== i));

  const [w0, w1] = f.w ?? [0, 0];
  const system = R`\begin{bmatrix}${f.N} & ${num(f.Sx, 2)}\\ ${num(f.Sx, 2)} & ${num(f.Sxx, 2)}\end{bmatrix}\begin{bmatrix}w_0\\ w_1\end{bmatrix}=\begin{bmatrix}${num(f.Sy, 2)}\\ ${num(f.Sxy, 2)}\end{bmatrix}`;

  return (
    <div className="w-box">
      <p className="w-title">Fit a line by least squares</p>
      <svg
        ref={svg}
        className="w-plot"
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        role="img"
        aria-label="Scatter plot with the least-squares line"
      >
        <line className="axis" x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} />
        <line className="axis" x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} />
        {[0, 5, 10].map((t) => (
          <text key={t} className="tick" x={sx(t)} y={H - PAD + 16} textAnchor="middle">
            {t}
          </text>
        ))}
        {f.w && (
          <>
            {pts.map((p, i) => (
              <line key={i} x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(w0 + w1 * p.x)} stroke="var(--green)" strokeWidth={2} />
            ))}
            <line x1={sx(0)} y1={sy(w0)} x2={sx(10)} y2={sy(w0 + 10 * w1)} stroke="var(--teal)" strokeWidth={2.5} />
          </>
        )}
        {pts.map((p, i) => (
          <circle
            key={i}
            data-i={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={7}
            fill="var(--red)"
            stroke="var(--ground)"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onDoubleClick={() => remove(i)}
          />
        ))}
      </svg>

      <div className="w-readout">
        {f.w ? (
          <>
            <Tex display>{system}</Tex>
            <Tex display>{R`\hat w_0=${num(w0)},\quad \hat w_1=${num(w1)},\qquad L(\hat{\mathbf w})=\sum_i\epsilon_i^2=${num(f.rss)}`}</Tex>
          </>
        ) : (
          <p className="w-hint w-warn">
            <Flag id="I6" /> <P>{R`No unique line: with fewer than two distinct $x$ values the $2\times2$ matrix is singular.`}</P>
          </p>
        )}
      </div>
      <p className="w-hint">The green segments are the residuals; the teal line makes the sum of their squares as small as it can be.</p>
    </div>
  );
}
