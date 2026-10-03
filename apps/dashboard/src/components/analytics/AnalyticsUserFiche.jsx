// Colonne droite de l'ecran Analytics : fiche de l'utilisateur selectionne,
// sur le modele de BoutiqueDetailCol (bandeau, titre 19, stats 23 px,
// sections separees, repartition a pastilles). GET /analytics/users/:userId.
import { useEffect, useState } from "react";
import { analyticsService } from "@yaammoo/shared";
import { avatarColor, formatAgo, formatDuration, initialsOf, num, userLabel } from "./analyticsFormat.js";

const EVENT_LABELS = {
  screen_view: "Ecran",
  home_page_loaded: "Page du home",
  shop_impression: "Boutique vue",
  shop_open: "Boutique ouverte",
  menu_open: "Menu ouvert",
  add_to_cart: "Ajout panier",
  checkout_start: "Paiement lance",
  payment_result: "Paiement",
  search: "Recherche",
  banner_view: "Banniere vue",
  banner_click: "Banniere cliquee",
};

// Familles d'evenements de la repartition (pastilles comme « Commandes »).
const FAMILIES = [
  { label: "Navigation", dot: "#2f6fd0", types: ["screen_view", "home_page_loaded", "shop_impression"] },
  { label: "Boutiques", dot: "#1b1f27", types: ["shop_open", "menu_open", "banner_click", "banner_view"] },
  { label: "Panier", dot: "#f5b301", types: ["add_to_cart", "checkout_start", "payment_result"] },
  { label: "Recherches", dot: "#ec4913", types: ["search"] },
];

function eventDetail(e, shopName) {
  const d = e.data || {};
  switch (e.type) {
    case "screen_view":
      return [d.screen, d.durationMs && formatDuration(d.durationMs)].filter(Boolean).join(" · ");
    case "home_page_loaded":
      return `page ${d.page}${d.msSincePrevious ? ` · apres ${formatDuration(d.msSincePrevious)}` : ""}`;
    case "shop_impression":
      return `${shopName(e.fastfoodId)} · ${formatDuration(d.visibleMs)}`;
    case "search":
      return `« ${d.query} » · ${d.resultsCount ?? "?"} resultat(s)`;
    case "payment_result":
      return d.status === "success" ? "reussi" : "echoue";
    default:
      return e.fastfoodId ? shopName(e.fastfoodId) : "";
  }
}

export default function AnalyticsUserFiche({ userId, row, range, shopName, onHistory }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    setData(null);
    setError(null);
    analyticsService
      .getUser(userId, range)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.response?.data?.error || e.message));
    return () => {
      alive = false;
    };
  }, [userId, range]);

  if (!userId) {
    return (
      <div className="an-fiche">
        <div className="an-card-empty an-fiche-empty">Selectionnez un utilisateur pour voir sa fiche.</div>
      </div>
    );
  }

  const name = userLabel(data || row);
  const contact = [data?.user?.phone || row?.user?.phone, data?.user?.email || row?.user?.email].filter(Boolean);
  const sessions = data?.sessions || [];
  const events = data?.events || [];
  const scroll = data?.homeScroll;
  const totalMs = sessions.reduce((s, x) => s + Number(x.durationMs || 0), 0);
  const online = data ? data.online : row?.online;
  const device = sessions[0] || row || {};
  const pageGoal = Math.max(scroll?.maxPage || 0, 1);
  const families = FAMILIES.map((f) => ({ ...f, value: events.filter((e) => f.types.includes(e.type)).length }));
  const openHistory = () =>
    onHistory({
      name,
      sessions,
      events,
      eventLabel: (t) => EVENT_LABELS[t] || t,
      eventDetail: (e) => eventDetail(e, shopName),
    });

  return (
    <div className="an-fiche">
      {/* Bandeau */}
      <div className="an-fiche-banner" style={{ background: avatarColor(userId) }}>
        <span className="an-fiche-initials">{initialsOf(name)}</span>
        <span className="an-fiche-badge">
          <i style={{ background: online ? "#2dd36f" : "#a2aab6" }} />
          {online ? "En ligne" : `Vu ${formatAgo(data?.lastConnectedAt || row?.lastConnectedAt)}`}
        </span>
      </div>

      {/* Titre */}
      <div className="an-fiche-section an-fiche-title-row">
        <div className="an-min0">
          <div className="an-fiche-name truncate">{name}</div>
          <div className="an-muted-12 truncate">{contact.join(" · ") || userId}</div>
        </div>
      </div>

      {error && <div className="an-fiche-section an-error">{error}</div>}

      {/* Stats */}
      <div className="an-fiche-section">
        <div className="an-fiche-stats">
          {[
            { value: num(data?.connectionCount ?? row?.connectionCount), label: "Connexions" },
            { value: num(sessions.length || row?.sessions), label: "Sessions" },
            { value: formatDuration(totalMs || row?.totalMs), label: "Temps passe" },
            { value: num(scroll?.shopsSeen ?? row?.shopsSeen), label: "Boutiques vues" },
          ].map((s) => (
            <div key={s.label}>
              <div className="an-fiche-stat">{s.value}</div>
              <div className="an-figure-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="an-fiche-progress">
          <div style={{ width: `${Math.min(100, (100 * (scroll?.pagesLoaded || 0)) / Math.max(pageGoal, scroll?.pagesLoaded || 1))}%` }} />
        </div>
        <div className="an-muted-12 an-mt9">
          {scroll
            ? `${num(scroll.pagesLoaded)} pages du home · jusqu'a la page ${scroll.maxPage} · ${formatDuration(scroll.avgMsBeforeNextPage)} avant la suivante`
            : "Aucun scroll du home sur la periode"}
        </div>
      </div>

      {/* Activite */}
      <div className="an-fiche-section">
        <div className="an-card-head">
          <div className="an-card-title">Activite</div>
          <span className="an-muted-12">{num(events.length)} evenements</span>
        </div>
        <div className="an-fiche-families">
          {families.map((f) => (
            <div key={f.label} className="an-min0">
              <div className="an-family-top">
                <span className="an-family-dot" style={{ background: f.dot }} />
                <span className="an-family-value">{f.value}</span>
              </div>
              <div className="an-figure-label">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div className="an-fiche-section">
        <div className="an-card-head">
          <div className="an-card-title">Sessions recentes</div>
          <span className="an-muted-12 truncate">
            {[device.platform, device.deviceModel, device.appVersion && `v${device.appVersion}`].filter(Boolean).join(" · ")}
          </span>
        </div>
        {!data && !error && <div className="an-muted-12">Chargement…</div>}
        {data && sessions.length === 0 && <div className="an-muted-12">Aucune session sur la periode.</div>}
        {sessions.slice(0, 2).map((s) => (
          <div className="an-line" key={s.id}>
            <span className="an-line-main">{formatAgo(s.startedAt)}</span>
            <span className="an-muted-12 grow truncate">{s.osVersion || s.platform || ""}</span>
            <span className="an-line-val">{formatDuration(s.durationMs)}</span>
          </div>
        ))}
      </div>

      {/* Derniers evenements */}
      <div className="an-fiche-section an-fiche-last">
        <div className="an-card-head">
          <div className="an-card-title">Derniers evenements</div>
          {data && (sessions.length > 2 || events.length > 3) && (
            <button type="button" className="an-pill-btn" onClick={openHistory}>
              Tout voir
            </button>
          )}
        </div>
        {data && events.length === 0 && <div className="an-muted-12">Aucun evenement sur la periode.</div>}
        {events.slice(0, 3).map((e) => (
          <div className="an-line" key={e.id}>
            <span className="an-line-main">{EVENT_LABELS[e.type] || e.type}</span>
            <span className="an-muted-12 grow truncate">{eventDetail(e, shopName)}</span>
            <span className="an-muted-12">{formatAgo(e.occurredAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
