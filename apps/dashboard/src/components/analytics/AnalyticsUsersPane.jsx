// Colonne gauche de l'ecran Analytics : liste maitre des utilisateurs, sur le
// modele de la liste de Menus / AdminShopRail (chips, compteur + tri, lignes
// `menu-row`). Clic sur une ligne = fiche a droite.
import { useState } from "react";
import { avatarColor, formatAgo, formatDuration, initialsOf, num, userLabel } from "./analyticsFormat.js";

const CHIPS = [
  { key: "all", label: "Actifs" },
  { key: "online", label: "En ligne" },
];

export const USER_SORTS = [
  { key: "lastConnectedAt", label: "Plus recents" },
  { key: "connectionCount", label: "Connexions" },
  { key: "totalMs", label: "Temps passe" },
  { key: "shopsSeen", label: "Boutiques vues" },
];

const Chevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function AnalyticsUsersPane({ users, filter, onFilter, sort, onSort, selectedId, onSelect, loading }) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel = USER_SORTS.find((s) => s.key === sort)?.label;

  return (
    <section className="menus-list-pane">
      <div className="menus-chips">
        <div className="menus-chips-group">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              type="button"
              className={filter === c.key ? "menu-chip active" : "menu-chip"}
              onClick={() => onFilter(c.key)}
            >
              <span>{c.label}</span>
              <Chevron />
            </button>
          ))}
        </div>
      </div>

      <div className="menus-count">
        <div className="menus-count-label">
          <span className="menus-count-num">{num(users.length)}</span>{" "}
          {filter === "online" ? "en ligne" : "utilisateurs actifs"}
        </div>
        <div className="menus-sort">
          <button type="button" onClick={() => setSortOpen((v) => !v)}>
            <span>{sortLabel}</span>
            <Chevron />
          </button>
          {sortOpen && (
            <div className="menus-sort-pop">
              {USER_SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={s.key === sort ? "active" : ""}
                  onClick={() => {
                    onSort(s.key);
                    setSortOpen(false);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="menus-list">
        {loading && users.length === 0 && <div className="an-pane-note">Chargement…</div>}
        {!loading && users.length === 0 && (
          <div className="an-pane-note">
            {filter === "online" ? "Personne en ligne" : "Aucune activite sur la periode"}
          </div>
        )}
        {users.map((u) => {
          const name = userLabel(u);
          const device = [u.platform, u.appVersion && `v${u.appVersion}`].filter(Boolean).join(" · ");
          return (
            <button
              type="button"
              key={u.userId}
              className={u.userId === selectedId ? "menu-row active" : "menu-row"}
              onClick={() => onSelect(u.userId)}
            >
              <span className="menu-row-thumb an-user-thumb" style={{ background: avatarColor(u.userId) }}>
                {initialsOf(name)}
              </span>
              <span className="menu-row-body">
                <span className="menu-row-top">
                  <span className="menu-row-ident">
                    <span className="menu-row-rating">
                      <span className="menu-row-rating-count">
                        {device || u.user?.phone || u.user?.email || "App mobile"}
                      </span>
                    </span>
                    <span className="menu-row-name truncate">{name}</span>
                    <span className="menu-row-meta truncate">
                      {num(u.connectionCount)} connexion{Number(u.connectionCount) > 1 ? "s" : ""}
                      {" · "}
                      {num(u.sessions)} session{Number(u.sessions) > 1 ? "s" : ""}
                      {" · "}
                      {num(u.shopsSeen)} boutique{Number(u.shopsSeen) > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span
                    className={u.online ? "menu-row-dot on" : "menu-row-dot an-dot-off"}
                    title={u.online ? "En ligne" : "Hors ligne"}
                  />
                </span>
                <span className="menu-row-foot">
                  <span className="menu-row-stock">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    <span>{u.online ? "En ligne" : formatAgo(u.lastConnectedAt || u.lastSessionAt)}</span>
                  </span>
                  <span className="menu-row-price">{formatDuration(u.totalMs)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
