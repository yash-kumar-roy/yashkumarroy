import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// --- Binormal ROC model: TPR = Φ(a + Φ⁻¹(FPR)), with AUC = Φ(a / √2) -------------------------
function erf(x) {
  const sign = Math.sign(x);
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}
const phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));

// Acklam's inverse normal CDF approximation
function phiInv(p) {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const lo = 0.02425;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) return -phiInv(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

const W = 360;
const H = 330;
const PAD = { l: 46, r: 14, t: 14, b: 44 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;
const sx = (fpr) => PAD.l + fpr * PW;
const sy = (tpr) => PAD.t + (1 - tpr) * PH;

export default function RocCurve({ auc = 0.89, label, projectSlug }) {
  const safeAuc = Math.min(0.995, Math.max(0.5, Number(auc) || 0.5));
  const a = Math.SQRT2 * phiInv(safeAuc);
  const tprAt = (fpr) => (fpr <= 0 ? 0 : fpr >= 1 ? 1 : phi(a + phiInv(fpr)));

  const { linePath, areaPath } = useMemo(() => {
    const pts = [[0, 0]];
    for (let i = 1; i < 120; i += 1) {
      const f = (i / 120) ** 2; // denser sampling near the origin where the curve bends
      pts.push([f, tprAt(f)]);
    }
    pts.push([1, 1]);
    const line = pts.map(([f, t], i) => `${i ? 'L' : 'M'}${sx(f).toFixed(2)},${sy(t).toFixed(2)}`).join(' ');
    return { linePath: line, areaPath: `${line} L${sx(1)},${sy(0)} L${sx(0)},${sy(0)} Z` };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeAuc]);

  // Count-up for the AUC readout, synced with the line drawing in CSS.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(safeAuc);
      return undefined;
    }
    let raf;
    const start = performance.now() + 350;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / 1400));
      setShown(safeAuc * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safeAuc]);

  // Interactive probe: hover/drag across the plot to read the trade-off at any threshold.
  const svgRef = useRef(null);
  const [probe, setProbe] = useState(0.2);
  const [active, setActive] = useState(false);
  function move(clientX) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    setProbe(Math.min(0.98, Math.max(0.02, (x - PAD.l) / PW)));
    setActive(true);
  }
  function onKey(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setProbe((p) => Math.min(0.98, p + 0.02));
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setProbe((p) => Math.max(0.02, p - 0.02));
    setActive(true);
  }
  const tpr = tprAt(probe);
  const pct = (v) => `${Math.round(v * 100)}%`;

  return (
    <figure className="roc">
      <div className="roc-head">
        <p className="roc-score">
          <span className="roc-score-value">{shown.toFixed(2)}</span>
          <span className="roc-score-label">ROC-AUC</span>
        </p>
        <p className="roc-readout" aria-live="polite">
          {active ? (
            <>
              With <strong>{pct(probe)}</strong> false alarms, it catches <strong>{pct(tpr)}</strong> of customers who leave.
            </>
          ) : (
            'Hover over the chart to explore it.'
          )}
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="roc-svg"
        role="slider"
        tabIndex={0}
        aria-label="ROC curve. Use arrow keys to move along the curve."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(probe * 100)}
        aria-valuetext={`${pct(probe)} false positives, ${pct(tpr)} true positives`}
        onPointerMove={(e) => move(e.clientX)}
        onPointerDown={(e) => move(e.clientX)}
        onPointerLeave={() => setActive(false)}
        onKeyDown={onKey}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      >
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v} className="roc-grid">
            <line x1={sx(v)} x2={sx(v)} y1={sy(0)} y2={sy(1)} />
            <line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} />
            <text x={sx(v)} y={sy(0) + 16} textAnchor="middle">{v}</text>
            <text x={sx(0) - 8} y={sy(v) + 4} textAnchor="end">{v}</text>
          </g>
        ))}
        <text className="roc-axis" x={sx(0.5)} y={H - 6} textAnchor="middle">False positive rate</text>
        <text className="roc-axis" transform={`translate(12 ${sy(0.5)}) rotate(-90)`} textAnchor="middle">True positive rate</text>

        {/* chance line */}
        <line className="roc-chance" x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} />

        <path className="roc-area" d={areaPath} />
        <path className="roc-line" d={linePath} pathLength="1" />

        <g className={`roc-probe ${active ? 'is-active' : ''}`}>
          <line x1={sx(probe)} x2={sx(probe)} y1={sy(0)} y2={sy(tpr)} />
          <line x1={sx(0)} x2={sx(probe)} y1={sy(tpr)} y2={sy(tpr)} />
          <circle cx={sx(probe)} cy={sy(tpr)} r="6" />
        </g>
      </svg>

      <figcaption>
        {projectSlug ? <Link to={`/projects/${projectSlug}`}>{label}</Link> : label}
      </figcaption>
    </figure>
  );
}
