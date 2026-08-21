// Coque du dashboard : sidebar de navigation + topbar contextuelle.
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { STATUS_MAP } from "@yaammoo/shared";

const TITLES = {
  "/": ["Vue d'ensemble", "Activite de la boutique"],
  "/commandes": ["Commandes", "Gestion des commandes recues"],
  "/caisse": ["Caisse", "Creer une commande et editer la facture"],
  "/menus": ["Menus", "Catalogue de la boutique"],
  "/portefeuille": ["Portefeuille", "Gains, retraits et transactions"],
  "/admin/boutiques": ["Boutiques", "Toutes les boutiques de la plateforme"],
  "/admin/commandes": ["Toutes les commandes", "Vue transverse plateforme"],
  "/admin/utilisateurs": ["Utilisateurs", "Comptes clients, marchands, livreurs"],
};

export default function DashboardLayout() {
  const { userData, logout, isAdmin } = useAuth();
  const { orders, boutique, loading } = useMerchant();
  const location = useLocation();

  const pendingCount = orders.filter((o) =>
    STATUS_MAP.pending.includes(o.status),
  ).length;

  const titleEntry = TITLES[location.pathname];
  const [title, subtitle] = Array.isArray(titleEntry)
    ? titleEntry
    : ["Dashboard", ""];

  const shopName = boutique?.name || boutique?.nom || "Ma boutique";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">Y</span>
          <span>Yaammoo</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Boutique</div>
          <NavLink to="/" end className="nav-item">
            Vue d'ensemble
          </NavLink>
          <NavLink to="/commandes" className="nav-item">
            Commandes
            {pendingCount > 0 && <span className="badge brand">{pendingCount}</span>}
          </NavLink>
          <NavLink to="/caisse" className="nav-item">
            Caisse
          </NavLink>
          <NavLink to="/menus" className="nav-item">
            Menus
          </NavLink>
          <NavLink to="/portefeuille" className="nav-item">
            Portefeuille
          </NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-section">Administration</div>
              <NavLink to="/admin/boutiques" className="nav-item">
                Boutiques
              </NavLink>
              <NavLink to="/admin/commandes" className="nav-item">
                Toutes les commandes
              </NavLink>
              <NavLink to="/admin/utilisateurs" className="nav-item">
                Utilisateurs
              </NavLink>
            </>
          )}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <div className="small truncate" style={{ padding: "0 11px 8px" }}>
            <div style={{ fontWeight: 650 }} className="truncate">
              {userData?.infos?.nom || userData?.infos?.email || "Compte"}
            </div>
            <div className="dim truncate">{isAdmin ? "Admin plateforme" : shopName}</div>
          </div>
          <button className="nav-item" onClick={logout} type="button">
            Se deconnecter
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            {subtitle ? <span className="topbar-sub">{subtitle}</span> : null}
          </div>
          <div className="topbar-right">
            {loading && <div className="spinner" />}
            <span className="pill">{shopName}</span>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
