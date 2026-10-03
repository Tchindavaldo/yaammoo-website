// Colonne centrale de l'ecran Analytics (vue par utilisateur) : tout tient dans
// la hauteur visible, sans defilement. Chaque carte est un resume ; « Tout
// voir » ouvre le detail dans le panneau lateral droit (AnalyticsPanel).
// Langage de BoutiqueCardsCol : carte blanche rayon 20, titre 14.5, pastille,
// chiffres 21 px, lignes separees, tags colores.
import { useState } from "react";
import { PERIODS, formatDuration, num, pct } from "./analyticsFormat.js";
import { funnelSteps, rateTone } from "./AnalyticsPanel.jsx";

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a919e" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Pastille de periode avec liste deroulante (modele menus-sort). */
export function PeriodPill({ period, onPeriod }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="menus-sort">
      <button type="button" className="an-pill-btn" onClick={() => setOpen((v) => !v)}>
        {PERIODS.find((p) => p.key === period)?.label}
        <Chevron />
      </button>
      {open && (
        <div className="menus-sort-pop">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={p.key === period ? "active" : ""}
              onClick={() => {
                onPeriod(p.key);
                setOpen(false);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ title, onMore, extra, className = "", children }) {
  return (
    <div className={`an-card an-fit ${className}`}>
      <div className="an-card-head">
        <div className="an-card-title">{title}</div>
        <div className="an-head-right">
          {extra}
          {onMore && (
            <button type="button" className="an-pill-btn" onClick={onMore}>
              Tout voir
            </button>
          )}
        </div>
      </div>
      <div className="an-fit-body">{children}</div>
    </div>
  );
}

/** Regroupe la serie quotidienne en 14 colonnes au plus. */
function bucketDays(daily) {
  const size = Math.max(1, Math.ceil(daily.length / 14));
  const out = [];
  for (let i = 0; i < daily.length; i += size) {
    const chunk = daily.slice(i, i + size);
    const d = new Date(`${chunk[0].day}T12:00:00`);
    out.push({
      label: daily.length <= 7 ? d.toLocaleDateString("fr-FR", { weekday: "narrow" }) : d.toLocaleDateString("fr-FR", { day: "2-digit" }),
      users: chunk.reduce((s, x) => s + Number(x.activeUsers || 0), 0),
      sessions: chunk.reduce((s, x) => s + Number(x.sessions || 0), 0),
    });
  }
  return out;
}

const Thumb = ({ photo }) => (photo ? <img className="an-thumb" src={photo} alt="" /> : <span className="an-thumb" />);

export default function AnalyticsCards({ data, online, shopOf, bannerOf, activeUsers, onOpen }) {
  if (!data) {
    return (
      <div className="an-center-grid">
        <div className="an-card an-card-skel an-span2" />
        {[0, 1, 2, 3].map((i) => (
          <div className="an-card an-card-skel" key={i} />
        ))}
      </div>
    );
  }

  const { daily, sessions, shopStats, funnel, searches, bannerStats } = data;
  const sum = (rows, k) => rows.reduce((s, r) => s + Number(r[k] || 0), 0);
  const totalSessions = sum(sessions, "sessions");
  const totalMs = sum(sessions, "totalMs");
  const bars = bucketDays(daily);
  const peak = Math.max(1, ...bars.map((b) => b.users + b.sessions));
  const steps = funnelSteps(funnel);
  const pick = (k) => steps.find((s) => s.key === k);

  const figures = [
    { label: "Utilisateurs actifs", value: num(activeUsers) },
    { label: "Sessions", value: num(totalSessions) },
    { label: "Duree moyenne", value: formatDuration(totalSessions ? totalMs / totalSessions : 0) },
    { label: "Pages du home", value: num(sum(daily, "homePages")) },
    { label: "Boutiques affichees", value: num(sum(daily, "impressions")) },
    { label: "En ligne", value: online ? num(online.count) : "…", accent: true },
  ];

  return (
    <div className="an-center-grid">
      {/* Audience : chiffres + barres empilees par jour */}
      <div className="an-card an-span2">
        <div className="an-card-head">
          <div className="an-card-title">Audience</div>
          <div className="an-head-right">
            <div className="an-legend">
              <span><i style={{ background: "#1b1f27" }} />Utilisateurs</span>
              <span><i style={{ background: "#fbdc7a" }} />Sessions</span>
            </div>
          </div>
        </div>
        <div className="an-audience">
          <div className="an-figures-grid">
            {figures.map((f) => (
              <div key={f.label}>
                <div className={f.accent ? "an-figure accent" : "an-figure"}>{f.value}</div>
                <div className="an-figure-label">{f.label}</div>
              </div>
            ))}
          </div>
          <div className="an-bars">
            {bars.map((b, i) => (
              <div className="an-bar-col" key={i} title={`${b.users} utilisateurs · ${b.sessions} sessions`}>
                <div className="an-bar-stack">
                  <div style={{ height: `${(100 * b.sessions) / peak}%`, background: "#fbdc7a", borderRadius: "5px 5px 0 0" }} />
                  <div style={{ height: `${(100 * b.users) / peak}%`, background: "#1b1f27", borderRadius: b.sessions ? "0 0 5px 5px" : 5 }} />
                </div>
                <div className="an-bar-label">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parcours : trois taux cles */}
      <Card title="Parcours de commande" onMore={() => onOpen("funnel")}>
        <div className="an-kpi3">
          {[
            ["Boutique → panier", pick("add_to_cart").users, pick("shop_open").users],
            ["Panier → paiement", pick("checkout_start").users, pick("add_to_cart").users],
            ["Paiement reussi", pick("payment_success").users, pick("checkout_start").users],
          ].map(([label, a, b]) => {
            const rate = b ? (100 * a) / b : null;
            return (
              <div key={label} className="an-kpi3-item">
                <div className="an-figure">{pct(a, b)}</div>
                <div className="an-figure-label">{label}</div>
                <div className="an-row-track an-mt9">
                  <span style={{ width: `${Math.min(100, rate || 0)}%`, background: rateTone(rate).color }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="an-muted-12 an-mt9">
          {num(pick("shop_open").users)} utilisateurs ont ouvert une boutique · {num(pick("payment_failed").users)} paiements echoues
        </div>
      </Card>

      {/* Boutiques : top 3 */}
      <Card title="Boutiques les plus vues" onMore={shopStats.length ? () => onOpen("shops") : null}>
        {shopStats.length === 0 && <div className="an-muted-12">Aucune boutique affichee.</div>}
        {shopStats.slice(0, 3).map((s) => {
          const shop = shopOf(s.fastfoodId);
          return (
            <div className="an-line" key={s.fastfoodId}>
              <Thumb photo={shop.photo} />
              <span className="an-min0 grow">
                <span className="an-line-main truncate an-block">{shop.name}</span>
                <span className="an-muted-12">{num(s.impressions)} affichages · {num(s.opens)} ouvertures</span>
              </span>
              <span className="an-tag" style={rateTone(s.impressions ? (100 * s.opens) / s.impressions : 0)}>
                {pct(Number(s.opens), Number(s.impressions))}
              </span>
            </div>
          );
        })}
      </Card>

      {/* Recherches : top 4 */}
      <Card title="Recherches" onMore={searches.length ? () => onOpen("searches") : null}>
        {searches.length === 0 && <div className="an-muted-12">Aucune recherche.</div>}
        {searches.slice(0, 4).map((q, i) => (
          <div className="an-line" key={q.query}>
            <span className={i === 0 ? "an-rank first" : "an-rank"}>{i + 1}</span>
            <span className="an-line-main grow truncate">{q.query}</span>
            {Number(q.zeroResults) > 0 && (
              <span className="an-tag" style={{ background: "#fdeceb", color: "#b3261e" }}>Sans resultat</span>
            )}
            <span className="an-line-val">{num(q.searches)}</span>
          </div>
        ))}
      </Card>

      {/* Bannieres : top 3 */}
      <Card title="Bannieres" onMore={bannerStats.length ? () => onOpen("banners") : null}>
        {bannerStats.length === 0 && <div className="an-muted-12">Aucune banniere vue.</div>}
        {bannerStats.slice(0, 3).map((b) => {
          const banner = bannerOf(b.bannerId);
          return (
            <div className="an-line" key={b.bannerId}>
              <Thumb photo={banner.photo} />
              <span className="an-min0 grow">
                <span className="an-line-main truncate an-block">{banner.name}</span>
                <span className="an-muted-12">{num(b.views)} vues · {num(b.clicks)} clics</span>
              </span>
              <span className="an-line-val">{pct(Number(b.clicks), Number(b.views))}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
