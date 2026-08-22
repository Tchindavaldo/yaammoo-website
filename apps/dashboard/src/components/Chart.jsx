// Graphes du dashboard — SVG pur, une seule serie, un seul axe.
// Pas de legende : le titre nomme la serie. Le survol est la couche de lecture
// fine ; le tableau qui accompagne le graphe reste la vue exhaustive.
import { useState } from "react";

const PAD = { top: 10, right: 4, bottom: 20, left: 4 };

/**
 * Histogramme a serie unique.
 * @param data  [{ label, value, title? }]
 * @param format  formateur de valeur pour l'infobulle
 * @param height  hauteur de la zone tracee
 */
export function BarChart({ data, format = (v) => v, height = 132, maxTicks = 7 }) {
  const [hover, setHover] = useState(null);

  if (!data || data.length === 0) return null;

  const w = 100; // repere en pourcentage, le SVG s'etire au conteneur
  const plotH = height - PAD.top - PAD.bottom;
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const slot = (w - PAD.left - PAD.right) / data.length;
  // 2px de respiration entre deux barres : les fills ne se touchent jamais.
  const barW = Math.max(slot * 0.42, slot - 2.4);
  const step = Math.max(1, Math.ceil(data.length / maxTicks));

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Histogramme"
        onMouseLeave={() => setHover(null)}
      >
        <g className="chart-grid">
          {[0, 0.5, 1].map((t) => (
            <line
              key={t}
              x1={PAD.left}
              x2={w - PAD.right}
              y1={PAD.top + plotH * t}
              y2={PAD.top + plotH * t}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {data.map((d, i) => {
          const h = (Math.abs(d.value) / max) * plotH;
          const x = PAD.left + slot * i + (slot - barW) / 2;
          return (
            <g key={i}>
              <rect
                className={`chart-bar${hover !== null && hover !== i ? " dim" : ""}`}
                x={x}
                y={PAD.top + plotH - h}
                width={barW}
                height={Math.max(h, 1)}
                rx={Math.min(barW / 2, 1.6)}
              />
              {/* Cible de survol plus large que la barre. */}
              <rect
                x={PAD.left + slot * i}
                y={0}
                width={slot}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            </g>
          );
        })}

        {data.map((d, i) =>
          i % step === 0 ? (
            <text
              key={`t${i}`}
              className="chart-axis"
              x={PAD.left + slot * i + slot / 2}
              y={height - 6}
              textAnchor="middle"
              style={{ fontSize: 9 }}
            >
              {d.label}
            </text>
          ) : null,
        )}
      </svg>

      {hover !== null && (
        <div
          className="chart-tip"
          style={{
            left: `${((PAD.left + slot * hover + slot / 2) / w) * 100}%`,
            top: 0,
          }}
        >
          <div className="chart-tip-label">{data[hover].title || data[hover].label}</div>
          <div className="chart-tip-value">{format(data[hover].value)}</div>
        </div>
      )}
    </div>
  );
}

