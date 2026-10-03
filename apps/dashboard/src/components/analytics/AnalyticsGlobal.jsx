// Vue globale de l'ecran Analytics, dans le langage de la Vue d'ensemble :
// rangee 1 = heros « Utilisateurs actifs » (courbe) + grille de tuiles 4x2 ;
// rangee 2 = parcours de commande, boutiques, recherches. Tout tient dans la
// hauteur visible ; « Tout voir » ouvre le detail dans le panneau droit.
import { formatDuration, num, pct } from "./analyticsFormat.js";
import { HeroChart, KpiTile, deltaOf } from "./AnalyticsCharts.jsx";
import { funnelSteps, rateTone } from "./AnalyticsPanel.jsx";

const dayLabel = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
const comma = (v) => v.toFixed(1).replace(".", ",");

function Card({ title, sub, onMore, children }) {
  return (
    <div className="an-ov-card">
      <div className="an-ov-card-head">
        <div className="an-min0">
          <div className="an-ov-card-title">{title}</div>
          {sub && <div className="an-ov-card-sub">{sub}</div>}
        </div>
        {onMore && (
          <button type="button" className="an-pill-btn" onClick={onMore}>
            Tout voir
          </button>
        )}
      </div>
      <div className="an-fit-body">{children}</div>
    </div>
  );
}

export default function AnalyticsGlobal({ data, online, activeUsers, periodLabel, shopOf, onOpen }) {
  if (!data) {
    return (
      <div className="an-global">
        <div className="an-ov-row1">
          <div className="an-ov-card an-card-skel" />
          <div className="an-ov-card an-card-skel" />
        </div>
        <div className="an-ov-row2">
          {[0, 1, 2].map((i) => (
            <div className="an-ov-card an-card-skel" key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { daily, sessions, shopStats, funnel, searches } = data;
  const sum = (rows, k) => rows.reduce((s, r) => s + Number(r[k] || 0), 0);
  const col = (k) => daily.map((d) => Number(d[k] || 0));
  const totalSessions = sum(sessions, "sessions");
  const totalMs = sum(sessions, "totalMs");
  const t = {
    connections: sum(daily, "connections"),
    pages: sum(daily, "homePages"),
    impressions: sum(daily, "impressions"),
    opens: sum(daily, "shopOpens"),
    carts: sum(daily, "addToCart"),
    checkouts: sum(daily, "checkouts"),
    paid: sum(daily, "paymentsSuccess"),
    searches: sum(daily, "searches"),
  };
  const avgSession = col("sessions").map((n, i) => (n ? col("totalMs")[i] / n : 0));
  const activeDelta = deltaOf(col("activeUsers"));

  const tiles = [
    { label: "Sessions", value: num(totalSessions), kind: "line", series: col("sessions"), subLabel: "Par utilisateur", subVal: activeUsers ? comma(totalSessions / activeUsers) : "—" },
    { label: "Duree moyenne", value: formatDuration(totalSessions ? totalMs / totalSessions : 0), kind: "area", series: avgSession, subLabel: "Cumul", subVal: formatDuration(totalMs) },
    { label: "Connexions", value: num(t.connections), kind: "bars", series: col("connections"), subLabel: "En ligne", subVal: online ? `${num(online.count)} maintenant` : "—" },
    { label: "Pages du home", value: num(t.pages), kind: "dense", series: col("homePages"), subLabel: "Par session", subVal: totalSessions ? comma(t.pages / totalSessions) : "—" },
    { label: "Boutiques affichees", value: num(t.impressions), kind: "bars", series: col("impressions"), subLabel: "Distinctes", subVal: `${num(shopStats.length)} boutiques` },
    { label: "Boutiques ouvertes", value: num(t.opens), kind: "line", series: col("shopOpens"), subLabel: "Taux d'ouverture", subVal: pct(t.opens, t.impressions) },
    { label: "Ajouts panier", value: num(t.carts), kind: "area", series: col("addToCart"), subLabel: "Paiements lances", subVal: num(t.checkouts) },
    { label: "Paiements reussis", value: num(t.paid), kind: "bars", series: col("paymentsSuccess"), subLabel: "Conversion", subVal: pct(t.paid, t.checkouts) },
  ];

  const steps = funnelSteps(funnel).filter((s) => !s.failed);
  const topSteps = Math.max(1, steps[0].users);
  const topShops = shopStats.slice(0, 4);
  const maxImp = Math.max(1, ...topShops.map((s) => Number(s.impressions)));

  return (
    <div className="an-global">
      <div className="an-ov-row1">
        {/* Heros */}
        <div className="an-ov-card">
          <div className="an-ov-card-head">
            <div className="an-min0">
              <div className="an-ov-hero-title">Utilisateurs actifs</div>
              <div className="an-ov-card-sub">Ouverture de l'app ou connexion, par jour</div>
            </div>
            <span className="an-live">
              <i className="an-dot-inline" />
              {online ? num(online.count) : "…"} en ligne
            </span>
          </div>
          <div className="an-hero-value-row">
            <span className="an-hero-value">{num(activeUsers)}</span>
            {activeDelta !== null && (
              <span className="an-hero-pill">
                {activeDelta >= 0 ? "↑" : "↓"} {comma(Math.abs(activeDelta))}%
              </span>
            )}
          </div>
          <div className="an-ov-card-sub">
            {num(t.searches)} recherches · {num(t.pages)} pages du home · {periodLabel}
          </div>
          <HeroChart series={col("activeUsers")} labels={daily.map((d) => dayLabel(d.day))} />
        </div>

        {/* Tuiles 4x2 */}
        <div className="an-tiles">
          {tiles.map((k) => (
            <KpiTile key={k.label} {...k} delta={deltaOf(k.series)} caption={periodLabel} />
          ))}
        </div>
      </div>

      <div className="an-ov-row2">
        {/* Parcours : colonnes verticales */}
        <Card title="Parcours de commande" sub="Utilisateurs distincts par etape" onMore={() => onOpen("funnel")}>
          <div className="an-ov-columns">
            {steps.map((s) => (
              <div className="an-ov-column" key={s.key}>
                <div className="an-ov-column-val">{num(s.users)}</div>
                <div className="an-ov-column-track">
                  <div style={{ height: `${Math.max(3, (100 * s.users) / topSteps)}%` }} />
                </div>
                <div className="an-ov-column-label">{s.label}</div>
                <span className="an-tag" style={rateTone(s.rate)}>
                  {s.rate === null ? "Depart" : pct(s.users, s.prev)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Boutiques : barres horizontales */}
        <Card title="Boutiques les plus vues" sub="Affichages dans le home" onMore={shopStats.length ? () => onOpen("shops") : null}>
          {topShops.length === 0 && <div className="an-muted-12">Aucune boutique affichee.</div>}
          {topShops.map((s) => {
            const shop = shopOf(s.fastfoodId);
            return (
              <div className="an-ov-hbar" key={s.fastfoodId}>
                <div className="an-card-head">
                  <span className="an-line-main truncate">{shop.name}</span>
                  <span className="an-muted-12">
                    {num(s.impressions)} · {pct(Number(s.opens), Number(s.impressions))} ouv.
                  </span>
                </div>
                <div className="an-row-track">
                  <span style={{ width: `${(100 * Number(s.impressions)) / maxImp}%`, background: "#ec4913" }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Recherches */}
        <Card title="Recherches" sub={`${num(t.searches)} sur la periode`} onMore={searches.length ? () => onOpen("searches") : null}>
          {searches.length === 0 && <div className="an-muted-12">Aucune recherche.</div>}
          {searches.slice(0, 5).map((q, i) => (
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
      </div>
    </div>
  );
}
