// Ecran « Vue d'ensemble » — portage fidele de
// « Dashboard Admin md screen.dc.html » (section sc-if isOverview).
// Les styles inline du design sont repris tels quels : chaque valeur
// (taille, couleur, rayon, gap) vient du fichier de reference.
import { useState } from "react";

/* ---------------------------------------------------------------- donnees */

// overviewKpis du design (script data-dc-script).
const KPI_DEFS = [
  {
    label: "Commandes",
    value: "2 148",
    unit: "",
    delta: "4.3%",
    up: true,
    kind: "line",
    series: [4, 6, 5, 7, 6, 8, 7, 9, 6, 10, 9, 11],
    subLabel: "Obj. mensuel",
    subVal: "2 500 cmd (86%)",
  },
  {
    label: "Chiffre d’affaires",
    value: "18,4",
    unit: "M FCFA",
    delta: "2.1%",
    up: true,
    kind: "progress",
    series: [64],
    subLabel: "Objectif",
    subVal: "25 M FCFA",
  },
  {
    label: "Panier moyen",
    value: "8 560",
    unit: "FCFA",
    delta: "1.2%",
    up: false,
    kind: "bars",
    series: [3, 5, 4, 9, 10, 7, 4, 3],
    subLabel: "Médiane",
    subVal: "7 800 FCFA",
  },
  {
    label: "En livraison",
    value: "96",
    unit: "",
    delta: "3.4%",
    up: true,
    kind: "dense",
    series: [3, 5, 4, 7, 9, 8, 6, 7, 9, 10, 8, 9, 6, 8, 10, 7, 9, 6, 8, 10],
    subLabel: "En cours",
    subVal: "82 standard · 14 exp.",
  },
  {
    label: "Annulées",
    value: "37",
    unit: "",
    delta: "1.9%",
    up: false,
    kind: "area",
    series: [8, 7, 9, 6, 7, 5, 6, 4, 5, 4, 3, 4],
    subLabel: "Taux perte",
    subVal: "1,7% du total",
  },
  {
    label: "Nouveaux clients",
    value: "412",
    unit: "",
    delta: "6.1%",
    up: true,
    kind: "line",
    series: [3, 4, 4, 6, 5, 7, 8, 7, 9, 8, 10, 11],
    subLabel: "Acquisition",
    subVal: "68% via mobile",
  },
  {
    label: "Boutiques actives",
    value: "68",
    unit: "",
    delta: "2.8%",
    up: true,
    kind: "bars",
    series: [4, 6, 5, 7, 6, 8, 9, 7],
    subLabel: "Sur catalogue",
    subVal: "84 répertoriées",
  },
  {
    label: "Délai moyen",
    value: "34",
    unit: "min",
    delta: "0.8%",
    up: false,
    kind: "area",
    series: [7, 8, 7, 6, 7, 6, 5, 6, 5, 4, 5, 4],
    subLabel: "Engagement",
    subVal: "< 45 min garanti",
  },
];

// orderMonths : oData / omax du design.
const ORDER_DATA = [3200, 5400, 2600, 4800, 4100, 5200];
const ORDER_MAX = 6000;
const ORDER_LABELS = ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"];

const DOWS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
// counts du calendarData() du design.
const DAY_COUNTS = { 2: 3, 3: 1, 6: 2, 8: 4, 11: 2, 14: 1, 15: 6, 17: 2, 22: 3, 25: 2, 28: 1 };
const TODAY = 15;
const STATE_COLORS = {
  "Terminé": ["#e7f7ee", "#16a34a"],
  "En cours": ["#e8f0fe", "#2f6fd0"],
  "À venir": ["#fdeee6", "#ec4913"],
};

// topUsers du design : barres violettes, coordonnees reprises telles quelles.
const TOP_USERS = [
  {
    count: "12 commandes",
    sub: "Ce trimestre",
    attended: "26 livraisons",
    bars: [
      [2, 30, 30, "#ddd6fe"],
      [15, 8, 52, "#7c3aed"],
      [28, 22, 38, "#ddd6fe"],
      [41, 14, 46, "#7c3aed"],
      [54, 25, 35, "#ddd6fe"],
      [67, 5, 55, "#7c3aed"],
      [80, 34, 26, "#ddd6fe"],
    ],
  },
  {
    count: "9 commandes",
    sub: "Ce trimestre",
    attended: "18 livraisons",
    bars: [
      [2, 35, 25, "#ddd6fe"],
      [15, 20, 40, "#ddd6fe"],
      [28, 10, 50, "#7c3aed"],
      [41, 28, 32, "#ddd6fe"],
      [54, 7, 53, "#7c3aed"],
      [67, 22, 38, "#ddd6fe"],
      [80, 32, 28, "#ddd6fe"],
    ],
  },
  {
    count: "7 commandes",
    sub: "Ce trimestre",
    attended: "14 livraisons",
    bars: [
      [2, 28, 32, "#ddd6fe"],
      [15, 34, 26, "#ddd6fe"],
      [28, 16, 44, "#7c3aed"],
      [41, 8, 52, "#7c3aed"],
      [54, 30, 30, "#ddd6fe"],
      [67, 20, 40, "#ddd6fe"],
      [80, 26, 34, "#ddd6fe"],
    ],
  },
];

/* ----------------------------------------------------------- mini charts */

// miniChart() du design : line / area / progress / bars / dense.
function MiniChart({ kind, series }) {
  const mx = Math.max(...series);
  const h = 32;
  const w = 70;
  const pts = series.map((v, i) => [
    (i / (series.length - 1)) * w,
    h - 3 - (v / mx) * (h - 8),
  ]);
  const path = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");

  if (kind === "line")
    return (
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <path d={path} fill="none" stroke="#ec4913" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );

  if (kind === "area")
    return (
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <path d={`${path} L${w} ${h} L0 ${h} Z`} fill="#fbe3d9" stroke="none" />
        <path d={path} fill="none" stroke="#ec4913" strokeWidth="1.8" />
      </svg>
    );

  if (kind === "progress")
    return (
      <div
        style={{
          width: "100%",
          height: 22,
          borderRadius: 999,
          background: "#fbe3d9",
          overflow: "hidden",
          alignSelf: "center",
        }}
      >
        <div
          style={{
            width: `${series[0]}%`,
            height: "100%",
            borderRadius: 999,
            background: "#ec4913",
          }}
        />
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        height: h,
        display: "flex",
        alignItems: "flex-end",
        gap: kind === "dense" ? 1.5 : 2.5,
      }}
    >
      {series.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.round((v / mx) * 100)}%`,
            borderRadius: 2,
            background:
              kind === "dense"
                ? i % 2
                  ? "#f6d1c2"
                  : "#ec4913"
                : v / mx > 0.6
                  ? "#ec4913"
                  : "#f6d1c2",
          }}
        />
      ))}
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

/* ------------------------------------------------------------ calendrier */

// calendarData() du design : 35 cellules, decalage d = i - 1, mois de 30 jours.
function buildCalendar(sel) {
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const d = i - 1;
    const out = d < 1 || d > 30;
    const day = out ? (d < 1 ? 30 + d + 1 : d - 30) : d;
    const active = !out && d === sel;
    cells.push({ d, day, out, active, hasDot: !out && Boolean(DAY_COUNTS[d]) });
  }

  const recaps = Object.keys(DAY_COUNTS)
    .map(Number)
    .sort((a, b) => a - b)
    .map((d) => {
      const n = DAY_COUNTS[d];
      const label = d < TODAY ? "Terminé" : d === TODAY ? "En cours" : "À venir";
      return {
        d,
        count: n,
        stateLabel: label,
        colors: STATE_COLORS[label],
        amount: `${(n * 8600).toLocaleString("fr-FR")} F`,
      };
    });

  const selDow = DOWS[(sel + 1) % 7];
  return {
    cells,
    recaps,
    selDow,
    selDateLabel: `${selDow} ${sel < 10 ? "0" + sel : sel}`,
  };
}

/* ------------------------------------------------------------------ page */

export default function Overview() {
  const [day, setDay] = useState(15);
  const { cells, recaps, selDow, selDateLabel } = buildCalendar(day);

  return (
    <div
      style={{
        padding: "0 0 20px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        flex: 1,
        minHeight: 0,
        height: "100%",
        paddingBottom: 10,
      }}
    >
      {/* Header principal Vue d'ensemble */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "22px 26px 12px",
          background: "#ffffff",
          borderBottom: "1px solid #eceef2",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.4px",
              color: "#14161a",
            }}
          >
            Vue d'ensemble
          </div>
          <div style={{ marginTop: 3, fontSize: 13, color: "#8a919e" }}>
            Lundi 8 septembre 2026 &nbsp;·&nbsp; Données en temps réel
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "1px solid #e6e9ee",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 13.5,
              color: "#8a919e",
              minWidth: 210,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <span>Rechercher…</span>
          </div>
          <div
            style={{
              position: "relative",
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #e6e9ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flex: "0 0 38px",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4c5361" strokeWidth="1.7">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#ec4913",
                border: "2px solid #f8fafc",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "#fff",
              border: "1px solid #e6e9ee",
              borderRadius: 12,
              padding: "6px 12px 6px 6px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "#2f6fd0",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                overflow: "hidden",
                flex: "0 0 28px",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "999px 999px 0 0",
                  background: "#1b2431",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: "#1b1f27",
                whiteSpace: "nowrap",
              }}
            >
              Doval T.
            </span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Corps scrollable */}
      <div
        style={{
          padding: "0 26px 4px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {/* Rangee 1 : ventes + grille KPI 4x2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,2.9fr)",
            gap: 14,
            alignItems: "stretch",
            flex: "0 0 45%",
            minHeight: "min-content",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eceef2",
              borderRadius: 20,
              padding: "16px 16px 12px",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 600, color: "#14161a" }}>Ventes ce mois</div>
                <div style={{ marginTop: 5, fontSize: 13.5, color: "#6b7280" }}>
                  Tous les canaux confondus
                </div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: "1px solid #eceef2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  fontSize: 15,
                  lineHeight: 1,
                }}
              >
                ···
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
                <span style={{ fontSize: 13, color: "#6b7280", marginTop: 5 }}>FCFA</span>
                <span
                  style={{
                    fontSize: 27,
                    fontWeight: 600,
                    letterSpacing: "-1px",
                    color: "#14161a",
                  }}
                >
                  14 094 000
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fdece6",
                  color: "#ec4913",
                  borderRadius: 999,
                  padding: "5px 10px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ↑ 4,6%
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: "#6b7280" }}>
              Encore 48 346 000 FCFA avant l’objectif
            </div>
            <div
              style={{
                marginTop: 12,
                flex: "1 1 auto",
                minHeight: 120,
                display: "flex",
                gap: 10,
              }}
            >
              <div
                style={{
                  flex: "0 0 42px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#6b7280",
                  textAlign: "right",
                  paddingBottom: 20,
                }}
              >
                <div>24 M</div>
                <div>20,5 M</div>
                <div>17 M</div>
                <div>13,5 M</div>
                <div>10 M</div>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ height: 1, borderTop: "1px dotted #eceef2" }} />
                    ))}
                  </div>
                  <svg
                    viewBox="0 0 300 150"
                    preserveAspectRatio="none"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  >
                    <defs>
                      <linearGradient id="ymSalesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4913" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#ec4913" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,72 H40 V52 H80 V72 H120 V32 H160 V72 H200 V88 H240 V72 H270 V60 H300 L300,150 L0,150 Z"
                      fill="url(#ymSalesFill)"
                    />
                    <path
                      d="M0,72 H40 V52 H80 V72 H120 V32 H160 V72 H200 V88 H240 V72 H270 V60 H300"
                      fill="none"
                      stroke="#ec4913"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11.5,
                    color: "#6b7280",
                  }}
                >
                  <span>04</span>
                  <span>07</span>
                  <span>10</span>
                  <span>13</span>
                  <span>16</span>
                </div>
              </div>
            </div>
          </div>

          {/* NE PAS MODIFIER : grille KPI figee a 4 colonnes x 2 lignes. */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0,1fr))",
              gridTemplateRows: "repeat(2, minmax(0,1fr))",
              gap: 12,
              minHeight: 0,
              flex: "1 1 0",
            }}
          >
            {KPI_DEFS.map((k) => {
              const deltaColor = k.up ? "#16a34a" : "#ec4913";
              return (
                <div
                  key={k.label}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #eceef2",
                    borderRadius: 16,
                    padding: "12px 14px 11px",
                    minWidth: 0,
                    minHeight: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    gap: 4,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 12.5, color: "#6b7280", fontWeight: 500 }}>
                        {k.label}
                      </div>
                      <span style={{ display: "flex", color: "#8a919e" }}>
                        <TrendIcon up={k.up} />
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 4,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 21,
                              fontWeight: 600,
                              letterSpacing: "-0.6px",
                              lineHeight: 1.1,
                            }}
                          >
                            {k.value}
                          </span>
                          <span style={{ fontSize: 11, color: "#8a919e", marginTop: 3 }}>
                            {k.unit}
                          </span>
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 500,
                            color: deltaColor,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ display: "flex" }}>
                            <DeltaIcon up={k.up} color={deltaColor} />
                          </span>
                          {k.delta}
                        </div>
                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 11.5,
                            color: "#9aa3b0",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Ce mois
                        </div>
                      </div>
                      <div
                        style={{
                          flex: "0 1 60px",
                          minWidth: 0,
                          maxWidth: 60,
                          height: 36,
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                        }}
                      >
                        <MiniChart kind={k.kind} series={k.series} />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      flex: "0 0 auto",
                      paddingTop: 8,
                      borderTop: "1px solid #f1f3f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      fontSize: 11.5,
                    }}
                  >
                    <span style={{ color: "#8a919e", whiteSpace: "nowrap", flex: "0 0 auto" }}>
                      {k.subLabel}
                    </span>
                    <span
                      style={{
                        fontWeight: 500,
                        color: "#374151",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {k.subVal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rangee 2 : calendrier, utilisateurs actifs, volume de commandes */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "stretch",
            flex: "1 1 0",
            minHeight: 0,
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              flex: "0 1 auto",
              minWidth: 0,
              background: "#fff",
              border: "1px solid #e2e6ec",
              borderRadius: 18,
              padding: 14,
              display: "grid",
              gridTemplateColumns: "minmax(0,max-content) max-content",
              gap: 12,
              alignItems: "stretch",
              minHeight: 0,
              overflow: "hidden",
              paddingRight: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 19, fontWeight: 600 }}>
                  Septembre <span style={{ color: "#9aa3b0" }}>2026</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    border: "1px solid #e6e9ee",
                    borderRadius: 999,
                    padding: "7px 14px",
                    fontSize: 13,
                  }}
                >
                  Mois
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              <div
                style={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(7,44px)",
                  gridTemplateRows: "24px",
                  gridAutoRows: "minmax(36px,1fr)",
                  gap: 7,
                  justifyContent: "start",
                  alignContent: "stretch",
                }}
              >
                {DOWS.map((l, i) => {
                  const on = DOWS.indexOf(selDow) === i;
                  return (
                    <div
                      key={l}
                      style={{
                        textAlign: "center",
                        padding: "8px 0",
                        fontSize: 11.5,
                        letterSpacing: ".5px",
                        borderRadius: 9,
                        background: on ? "#f1f3f6" : undefined,
                        color: on ? "#1b1f27" : "#a2aab6",
                        fontWeight: on ? 500 : undefined,
                      }}
                    >
                      {l}
                    </div>
                  );
                })}
                {cells.map((c, i) => (
                  <div
                    key={i}
                    onClick={c.out ? undefined : () => setDay(c.d)}
                    style={{
                      position: "relative",
                      height: "100%",
                      minHeight: 34,
                      borderRadius: 11,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      border: "1px solid transparent",
                      cursor: "pointer",
                      background: c.active ? "#1b1f27" : c.out ? "transparent" : "#f7f8fa",
                      color: c.active ? "#fff" : c.out ? "#c6cbd3" : "#3d4451",
                      fontWeight: c.active ? 500 : undefined,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        background: c.hasDot
                          ? c.active
                            ? "#fff"
                            : "#ec4913"
                          : "transparent",
                      }}
                    />
                    <span style={{ fontSize: 13.5 }}>{c.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  paddingRight: 10,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, minWidth: 0 }}>Activité du jour</div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#8a919e",
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selDateLabel}
                </div>
              </div>

              <div style={{ flex: "1 1 0", minHeight: 0, display: "flex" }}>
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    overflowY: "auto",
                    padding: "0 4px 2px 0",
                    WebkitMaskImage:
                      "linear-gradient(#000 calc(100% - 28px), transparent 100%)",
                    maskImage: "linear-gradient(#000 calc(100% - 28px), transparent 100%)",
                  }}
                >
                  {recaps.map((o) => (
                    <div
                      key={o.d}
                      style={{
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                        border: `1px solid ${o.d === day ? "#1b1f27" : "#eceef2"}`,
                        borderRadius: 14,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ flex: "0 0 30px", textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.1 }}>
                          {o.count}
                        </div>
                        <div style={{ fontSize: 11, color: "#9aa3b0", letterSpacing: ".4px" }}>
                          CMD
                        </div>
                      </div>
                      <div style={{ width: 1, alignSelf: "stretch", background: "#f1f3f6" }} />
                      <div
                        style={{
                          flex: "0 0 auto",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            flex: "0 0 auto",
                            fontSize: 11.5,
                            fontWeight: 500,
                            borderRadius: 7,
                            padding: "3px 9px",
                            whiteSpace: "nowrap",
                            background: o.colors[0],
                            color: o.colors[1],
                          }}
                        >
                          {o.stateLabel}
                        </span>
                      </div>
                      <div
                        style={{
                          flex: "0 0 auto",
                          marginLeft: 8,
                          textAlign: "right",
                          fontSize: 12.5,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              boxSizing: "border-box",
              flex: "1 1 220px",
              minWidth: 220,
              background: "#ffffff",
              border: "1px solid #e2e6ec",
              borderRadius: 18,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600 }}>Utilisateurs les plus actifs</div>
              <div style={{ fontSize: 12.5, color: "#8a919e" }}>Ce trimestre</div>
            </div>

            <div
              style={{
                marginTop: 4,
                flex: "1 1 auto",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                overflow: "auto",
              }}
            >
              {TOP_USERS.map((u) => (
                <div
                  key={u.count}
                  style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #f1f3f6",
                    padding: "16px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    minHeight: 0,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 700,
                        color: "#14161a",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {u.count}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: "#8a919e" }}>{u.sub}</div>
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {[
                          ["AK", "#fce7f3", "#db2777", 3, -6],
                          ["BM", "#fef3c7", "#d97706", 2, -6],
                          ["CF", "#eff6ff", "#2563eb", 1, 0],
                        ].map(([txt, bg, color, z, mr]) => (
                          <div
                            key={txt}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 999,
                              background: bg,
                              border: "2px solid #fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9.5,
                              fontWeight: 600,
                              color,
                              marginRight: mr,
                              zIndex: z,
                            }}
                          >
                            {txt}
                          </div>
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.attended}
                      </span>
                    </div>
                  </div>

                  {/* Mini histogramme a barres violettes */}
                  <div
                    style={{
                      flex: "0 0 96px",
                      width: 96,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      overflow: "hidden",
                    }}
                  >
                    <svg width="96" height="56" viewBox="0 0 96 60" style={{ display: "block" }}>
                      {u.bars.map(([x, y, h, fill]) => (
                        <rect key={x} x={x} y={y} width="8" height={h} rx="3" fill={fill} />
                      ))}
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              boxSizing: "border-box",
              flex: "2 1 300px",
              minWidth: 300,
              minHeight: 0,
              background: "#ffffff",
              border: "1px solid #e2e6ec",
              borderRadius: 18,
              padding: "22px 22px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              overflow: "hidden",
            }}
          >
            <div>
              <div style={{ fontSize: 19, fontWeight: 600 }}>Volume de commandes</div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  color: "#6b7280",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ec4913" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                Le panier moyen est stable depuis 6 mois.
              </div>
            </div>
            <div
              style={{
                marginTop: 6,
                flex: "1 1 auto",
                minHeight: 0,
                display: "grid",
                gridTemplateColumns: "minmax(140px,160px) minmax(0,1fr)",
                gap: 14,
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minWidth: 0,
                  justifyContent: "space-between",
                }}
              >
                {[
                  ["30 derniers jours", "18,4 M", "FCFA", "5.2%", "#16a34a"],
                  ["6 derniers mois", "92,7 M", "FCFA", "1.2%", "#ec4913"],
                  ["Depuis le lancement", "341 M", "FCFA", "6.8%", "#ec4913"],
                ].map(([title, val, unit, pct, color]) => (
                  <div
                    key={title}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      background: "#ffffff",
                      borderRadius: 12,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#8a919e", whiteSpace: "nowrap" }}>
                      {title}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontSize: 20, fontWeight: 600 }}>{val}</span>
                      <span style={{ fontSize: 12, color: "#8a919e" }}>{unit}</span>
                      <span style={{ fontSize: 13, color, fontWeight: 500 }}>{pct}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  alignSelf: "stretch",
                  minHeight: 230,
                  display: "flex",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    alignSelf: "stretch",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#9aa3b0",
                    textAlign: "right",
                  }}
                >
                  <div>6k</div>
                  <div>4k</div>
                  <div>2k</div>
                  <div>0</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      flex: "1 1 auto",
                      minHeight: 0,
                      display: "grid",
                      gridTemplateColumns: "repeat(6, minmax(0,1fr))",
                    }}
                  >
                    {ORDER_DATA.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: "100%",
                            borderRadius: 999,
                            background: "#f1f3f6",
                            display: "flex",
                            alignItems: "flex-end",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              borderRadius: 999,
                              background: "#ec4913",
                              height: `${((v / ORDER_MAX) * 100).toFixed(1)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns: "repeat(6, minmax(0,1fr))",
                      textAlign: "center",
                      fontSize: 12.5,
                      color: "#6b7280",
                    }}
                  >
                    {ORDER_LABELS.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
