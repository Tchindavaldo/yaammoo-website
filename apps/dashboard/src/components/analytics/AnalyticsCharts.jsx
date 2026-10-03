// Graphes de la vue globale, repris du langage de la Vue d'ensemble :
// mini-graphes des tuiles (line / area / bars / dense), courbe du heros,
// tuile KPI avec evolution.

/** Mini-graphe d'une tuile — meme rendu que miniChart() de la Vue d'ensemble. */
export function MiniChart({ kind, series }) {
  const values = series.length > 1 ? series : [0, ...series, 0];
  const mx = Math.max(1, ...values);
  const h = 32;
  const w = 70;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - (v / mx) * (h - 8)]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");

  if (kind === "line" || kind === "area") {
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="an-mini-svg">
        {kind === "area" && <path d={`${path} L${w} ${h} L0 ${h} Z`} fill="#fbe3d9" stroke="none" />}
        <path d={path} fill="none" stroke="#ec4913" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  const bars = values.slice(-20);
  return (
    <div className={kind === "dense" ? "an-mini-bars is-dense" : "an-mini-bars"}>
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            height: `${Math.max(4, Math.round((v / mx) * 100))}%`,
            background: kind === "dense" ? (i % 2 ? "#f6d1c2" : "#ec4913") : v / mx > 0.6 ? "#ec4913" : "#f6d1c2",
          }}
        />
      ))}
    </div>
  );
}

/** Graduations lisibles de l'axe vertical : 0 .. max arrondi. */
function ticksOf(max) {
  const top = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  return [4, 3, 2, 1, 0].map((i) => Math.round((top * i) / 4));
}

/** Courbe en escalier avec axes — comme « Ventes ce mois ». */
export function HeroChart({ series, labels }) {
  const values = series.length ? series : [0];
  const ticks = ticksOf(Math.max(...values));
  const top = ticks[0] || 1;
  const step = 300 / values.length;
  let d = "";
  values.forEach((v, i) => {
    const y = 150 - (v / top) * 140;
    d += i === 0 ? `M0,${y.toFixed(1)}` : ` V${y.toFixed(1)}`;
    d += ` H${((i + 1) * step).toFixed(1)}`;
  });
  const n = values.length;
  const marks = n <= 5 ? labels : [0, 1, 2, 3, 4].map((k) => labels[Math.round((k * (n - 1)) / 4)]);

  return (
    <div className="an-hero-chart">
      <div className="an-hero-axis">
        {ticks.map((t, i) => (
          <div key={i}>{t.toLocaleString("fr-FR")}</div>
        ))}
      </div>
      <div className="an-hero-plot">
        <div className="an-hero-area">
          <div className="an-hero-grid">
            {ticks.map((_, i) => (
              <div key={i} />
            ))}
          </div>
          <svg viewBox="0 0 300 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="anHeroFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4913" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#ec4913" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={`${d} L300,150 L0,150 Z`} fill="url(#anHeroFill)" />
            <path d={d} fill="none" stroke="#ec4913" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="an-hero-x">
          {marks.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeltaIcon({ up, color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d={up ? "M5 17L12 10l3 3 5-6" : "M5 7l7 7 3-3 5 6"} />
      <path d={up ? "M15 7h5v5" : "M15 17h5v-5"} />
    </svg>
  );
}

function TrendIcon({ up }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a919e" strokeWidth="1.7">
      <path d={up ? "M4 16l5-6 4 3 7-8" : "M4 8l5 6 4-3 7 8"} />
      <path d={up ? "M15 5h5v5" : "M15 19h5v-5"} />
    </svg>
  );
}

/** Evolution en % de la 2e moitie de la serie par rapport a la 1re. */
export function deltaOf(series) {
  if (series.length < 2) return null;
  const mid = Math.floor(series.length / 2);
  const a = series.slice(0, mid).reduce((s, v) => s + v, 0);
  const b = series.slice(series.length - mid).reduce((s, v) => s + v, 0);
  if (!a) return b ? 100 : null;
  return (100 * (b - a)) / a;
}

/** Tuile KPI de la Vue d'ensemble (fond #f8fafc, rayon 16, pied libelle/valeur). */
export function KpiTile({ label, value, delta, kind, series, subLabel, subVal, caption }) {
  const known = delta !== null && delta !== undefined;
  const up = !known || delta >= 0;
  const color = up ? "#16a34a" : "#ec4913";
  return (
    <div className="an-tile">
      <div>
        <div className="an-tile-top">
          <div className="an-tile-label">{label}</div>
          <span className="an-flex">
            <TrendIcon up={up} />
          </span>
        </div>
        <div className="an-tile-mid">
          <div className="an-min0">
            <div className="an-tile-value">{value}</div>
            <div className="an-tile-delta" style={{ color: known ? color : "#9aa3b0" }}>
              {known && (
                <span className="an-flex">
                  <DeltaIcon up={up} color={color} />
                </span>
              )}
              {known ? `${Math.abs(delta).toFixed(1).replace(".", ",")}%` : "—"}
            </div>
            <div className="an-tile-caption">{caption}</div>
          </div>
          {series && (
            <div className="an-tile-chart">
              <MiniChart kind={kind} series={series} />
            </div>
          )}
        </div>
      </div>
      <div className="an-tile-foot">
        <span className="an-tile-foot-label">{subLabel}</span>
        <span className="an-tile-foot-val">{subVal}</span>
      </div>
    </div>
  );
}
