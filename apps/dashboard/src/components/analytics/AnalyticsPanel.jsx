// Panneau lateral droit de l'ecran Analytics (memes classes que le panneau
// « Nouveau menu » : .mpanel / .mpanel-scrim). Il porte le detail complet des
// cartes resumees : parcours, boutiques, recherches, bannieres, evenements.
import { useEffect } from "react";
import { Icon } from "../icons.jsx";
import { formatAgo, formatDuration, num, pct } from "./analyticsFormat.js";

export function SidePanel({ title, subtitle, onClose, children }) {
  // Echap ferme le panneau, comme sur Menus.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="mpanel-scrim" onClick={onClose} />
      <aside className="mpanel an-panel" role="dialog" aria-label={title}>
        <div className="mpanel-head">
          <span className="an-min0">
            <span className="mpanel-title">{title}</span>
            {subtitle && <span className="an-muted-12 an-block">{subtitle}</span>}
          </span>
          <button type="button" className="mpanel-close" onClick={onClose} aria-label="Fermer">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="an-panel-body">{children}</div>
      </aside>
    </>
  );
}

export const FUNNEL_STEPS = [
  ["shop_open", "Boutique ouverte"],
  ["menu_open", "Menu consulte"],
  ["add_to_cart", "Ajout au panier"],
  ["checkout_start", "Paiement lance"],
  ["payment_success", "Paiement reussi"],
  ["payment_failed", "Paiement echoue"],
];

/** Etapes de l'entonnoir avec taux depuis l'etape precedente. */
export function funnelSteps(funnel) {
  const steps = FUNNEL_STEPS.map(([key, label]) => {
    const row = funnel.find((f) => f.step === key);
    return { key, label, users: Number(row?.users || 0), events: Number(row?.events || 0) };
  });
  return steps.map((s, i) => {
    const failed = s.key === "payment_failed";
    const prev = failed ? steps[3].users : i === 0 ? null : steps[i - 1].users;
    return { ...s, failed, prev, rate: prev === null ? null : prev ? (100 * s.users) / prev : 0 };
  });
}

/** Teinte des tags de taux (memes tags que « Commandes en retard »). */
export const rateTone = (rate, failed) => {
  if (failed) return { background: "#fdeceb", color: "#b3261e" };
  if (rate === null || rate >= 50) return { background: "#e8f5ec", color: "#15803d" };
  if (rate >= 20) return { background: "#fdf1e3", color: "#8a4b00" };
  return { background: "#fdeceb", color: "#b3261e" };
};

function Thumb({ photo }) {
  return photo ? <img className="an-thumb" src={photo} alt="" /> : <span className="an-thumb" />;
}

export function FunnelDetail({ funnel }) {
  const steps = funnelSteps(funnel);
  const top = steps[0].users;
  return (
    <div className="an-panel-list">
      {steps.map((s) => (
        <div className="an-panel-item" key={s.key}>
          <div className="an-card-head">
            <span className="an-line-main">{s.label}</span>
            <span className="an-tag" style={rateTone(s.rate, s.failed)}>
              {s.rate === null ? "Depart" : pct(s.users, s.prev)}
            </span>
          </div>
          <div className="an-row-track an-mt9">
            <span style={{ width: `${top ? Math.max(2, (100 * s.users) / top) : 0}%`, background: s.failed ? "#f6d1c2" : "#1b1f27" }} />
          </div>
          <div className="an-muted-12 an-mt9">
            {num(s.users)} utilisateurs · {num(s.events)} evenements · {pct(s.users, top)} du depart
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShopsDetail({ shopStats, shopOf }) {
  return (
    <div className="an-panel-list">
      {shopStats.map((s, i) => {
        const shop = shopOf(s.fastfoodId);
        return (
          <div className="an-panel-item" key={s.fastfoodId}>
            <div className="an-user">
              <span className={i === 0 ? "an-rank first" : "an-rank"}>{i + 1}</span>
              <Thumb photo={shop.photo} />
              <span className="an-line-main truncate">{shop.name}</span>
            </div>
            <div className="an-panel-figs">
              {[
                [num(s.impressions), "Affichages"],
                [num(s.viewers), "Personnes"],
                [formatDuration(s.avgVisibleMs), "Temps visible"],
                [num(s.opens), "Ouvertures"],
                [pct(Number(s.opens), Number(s.impressions)), "Taux"],
                [num(s.menuOpens), "Menus"],
                [num(s.addToCart), "Paniers"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="an-panel-fig">{v}</div>
                  <div className="an-figure-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SearchesDetail({ searches }) {
  return (
    <div className="an-panel-list">
      {searches.map((q, i) => (
        <div className="an-line" key={q.query}>
          <span className={i === 0 ? "an-rank first" : "an-rank"}>{i + 1}</span>
          <span className="an-line-main grow truncate">{q.query}</span>
          <span className="an-muted-12">{num(q.users)} pers.</span>
          <span className="an-line-val">{num(q.searches)}</span>
          {Number(q.zeroResults) > 0 && (
            <span className="an-tag" style={{ background: "#fdeceb", color: "#b3261e" }}>
              {num(q.zeroResults)} sans resultat
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function BannersDetail({ bannerStats, bannerOf }) {
  return (
    <div className="an-tiles-grid">
      {bannerStats.map((b) => {
        const banner = bannerOf(b.bannerId);
        return (
          <div className="an-tile-card" key={b.bannerId}>
            {banner.photo ? <img src={banner.photo} alt="" className="an-tile-img" /> : <div className="an-tile-img an-tile-img-empty" />}
            <div className="an-min0">
              <div className="an-tile-name truncate">{banner.name}</div>
              <div className="an-tile-line">{num(b.views)} vues · {num(b.clicks)} clics</div>
              <div className="an-tile-line small">
                {num(b.viewers)} personnes · taux de clic {pct(Number(b.clicks), Number(b.views))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Historique complet d'un utilisateur : sessions puis evenements. */
export function UserHistory({ sessions, events, eventLabel, eventDetail }) {
  return (
    <>
      <div className="an-card-title">Sessions</div>
      <div className="an-panel-list an-mb16">
        {sessions.length === 0 && <div className="an-muted-12">Aucune session.</div>}
        {sessions.map((s) => (
          <div className="an-line" key={s.id}>
            <span className="an-line-main">{formatAgo(s.startedAt)}</span>
            <span className="an-muted-12 grow truncate">
              {[s.platform, s.deviceModel, s.osVersion, s.appVersion && `v${s.appVersion}`].filter(Boolean).join(" · ")}
            </span>
            <span className="an-line-val">{formatDuration(s.durationMs)}</span>
          </div>
        ))}
      </div>
      <div className="an-card-title">Evenements</div>
      <div className="an-panel-list">
        {events.length === 0 && <div className="an-muted-12">Aucun evenement.</div>}
        {events.map((e) => (
          <div className="an-line" key={e.id}>
            <span className="an-line-main">{eventLabel(e.type)}</span>
            <span className="an-muted-12 grow truncate">{eventDetail(e)}</span>
            <span className="an-muted-12">{formatAgo(e.occurredAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
