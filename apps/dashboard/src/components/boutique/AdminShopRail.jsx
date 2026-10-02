import { useEffect, useMemo, useState } from "react";
import { adminService } from "@yaammoo/shared";

/* ── Rail admin : liste de toutes les boutiques ─────────────────────── */
// Design identique a la colonne gauche de Menus (menus-list-pane + menu-row).
export default function AdminShopRail({ activeFastFoodId, onSelect, onRestored }) {
  // Onglet courant : boutiques actives | boutiques supprimees (restaurables).
  const [tab, setTab] = useState("actives"); // "actives" | "supprimees"
  const [shops, setShops] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [restoringId, setRestoringId] = useState(null);

  // Rechargement a chaque changement d'onglet : les deux listes viennent
  // d'endpoints differents (/fastfood/all et /fastfood/admin/deleted).
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const fetcher =
      tab === "actives"
        ? adminService.getFastFoods()
        : adminService.getDeletedFastFoods();
    fetcher
      .then((data) => {
        if (!alive) return;
        if (tab === "actives") setShops(data);
        else setDeleted(data);
      })
      .catch((err) => console.error("AdminShopRail fetch error:", err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tab]);

  async function handleRestore(id) {
    setRestoringId(id);
    try {
      await adminService.restoreFastFood(id);
      setDeleted((prev) => prev.filter((s) => (s._id || s.id) !== id));
      onRestored?.();
    } catch (err) {
      console.error("Echec restauration boutique:", err);
    } finally {
      setRestoringId(null);
    }
  }

  const filtered = useMemo(() => {
    const list = tab === "actives" ? shops : deleted;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const name = (s.name || s.nom || "").toLowerCase();
      const cat = (s.category || s.type || "").toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [tab, shops, deleted, query]);

  const Chevron = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <section className="menus-list-pane" style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* En-tete : bascule Boutiques actives / supprimees */}
      <div className="menus-chips">
        <div className="menus-chips-group" style={{ display: "flex", gap: 6 }}>
          {[
            { id: "actives", label: "Boutiques actives" },
            { id: "supprimees", label: "Boutiques supprimées" },
          ].map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setQuery("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 15px",
                  border: "1px solid " + (on ? "#1b1f27" : "#e6e9ee"),
                  borderRadius: 999,
                  background: on ? "#1b1f27" : "#fff",
                  fontSize: 13,
                  fontWeight: on ? 600 : 400,
                  color: on ? "#fff" : "#4c5361",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compteur + barre de recherche */}
      <div className="menus-count">
        <div className="menus-count-label">
          <span className="menus-count-num">{filtered.length}</span> boutique
          {filtered.length > 1 ? "s" : ""}
          {/* Sortie du pilotage admin : reste accessible hors des onglets. */}
          {activeFastFoodId && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              style={{
                marginLeft: 8,
                padding: "3px 10px",
                border: "1px solid #ec4913",
                borderRadius: 999,
                background: "#fff",
                fontSize: 11.5,
                fontWeight: 500,
                color: "#ec4913",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              Quitter
            </button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            color: "#4c5361",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13.5,
              color: "#4c5361",
              background: "transparent",
              width: 90,
            }}
          />
        </div>
      </div>

      {/* Liste scrollable */}
      <div className="menus-list">
        {loading && (
          <div style={{ fontSize: 12, color: "#8a919e", textAlign: "center", padding: "20px 0" }}>
            Chargement…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ fontSize: 12, color: "#8a919e", textAlign: "center", padding: "20px 0" }}>
            {tab === "actives" ? "Aucune boutique" : "Aucune boutique supprimée"}
          </div>
        )}
        {filtered.map((shop) => {
          const id = shop._id || shop.id;
          const name = shop.name || shop.nom || "Boutique";
          const cat = shop.category || shop.type || "";
          const photo = shop.image || shop.photo || shop.logo || null;
          const open = shop.isOpen !== false && shop.status !== "closed";
          const active = id === activeFastFoodId;

          // Onglet « supprimées » : la ligne ne se selectionne pas, elle porte
          // un unique bouton Restaurer (ni Modifier, ni Supprimer).
          if (tab === "supprimees") {
            const busy = restoringId === id;
            return (
              <div
                key={id}
                className="menu-row"
                style={{ cursor: "default", opacity: busy ? 0.6 : 1 }}
              >
                <span
                  className="menu-row-thumb"
                  style={
                    photo
                      ? { background: `url(${photo}) center/cover no-repeat` }
                      : undefined
                  }
                >
                  {!photo && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c6cbd3" strokeWidth="1.6">
                      <path d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <path d="M9 22V12h6v10" />
                    </svg>
                  )}
                </span>
                <span className="menu-row-body">
                  <span className="menu-row-top">
                    <span className="menu-row-ident">
                      {cat && (
                        <span className="menu-row-rating">
                          <span className="menu-row-rating-count">{cat}</span>
                        </span>
                      )}
                      <span className="menu-row-name truncate">{name}</span>
                      <span className="menu-row-meta truncate">
                        {shop.deletedAt
                          ? `Supprimée le ${new Date(shop.deletedAt).toLocaleDateString("fr-FR")}`
                          : "Supprimée"}
                      </span>
                    </span>
                  </span>
                  <span className="menu-row-foot">
                    <button
                      type="button"
                      onClick={() => handleRestore(id)}
                      disabled={busy}
                      style={{
                        padding: "5px 12px",
                        border: "1px solid #1b1f27",
                        borderRadius: 999,
                        background: "#1b1f27",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#fff",
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy ? "Restauration…" : "Restaurer"}
                    </button>
                  </span>
                </span>
              </div>
            );
          }

          return (
            <button
              key={id}
              type="button"
              className={active ? "menu-row active" : "menu-row"}
              onClick={() => onSelect(id)}
            >
              <span
                className="menu-row-thumb"
                style={
                  photo
                    ? { backgroundImage: `url(${photo})`, background: `url(${photo}) center/cover no-repeat` }
                    : undefined
                }
              >
                {!photo && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c6cbd3" strokeWidth="1.6">
                    <path d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                )}
              </span>

              <span className="menu-row-body">
                <span className="menu-row-top">
                  <span className="menu-row-ident">
                    {cat && (
                      <span className="menu-row-rating">
                        <span className="menu-row-rating-count">{cat}</span>
                      </span>
                    )}
                    <span className="menu-row-name truncate">{name}</span>
                    <span className="menu-row-meta truncate">
                      {shop.address || shop.adresse || "Adresse non renseignée"}
                    </span>
                  </span>
                  <span
                    className={open ? "menu-row-dot on" : "menu-row-dot off"}
                    title={open ? "Ouverte" : "Fermée"}
                  />
                </span>
                <span className="menu-row-foot">
                  <span className="menu-row-stock">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    <span>{open ? "Ouverte" : "Fermée"}</span>
                  </span>
                  <span className="menu-row-price">{shop.orders || "—"}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
