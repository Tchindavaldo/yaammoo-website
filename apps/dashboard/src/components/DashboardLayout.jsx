// Coque du dashboard : barre laterale repliable, barre haute contextuelle,
// bandeau de pilotage quand un admin travaille sur une autre boutique.
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { STATUS_MAP } from "@yaammoo/shared";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Icon } from "./icons.jsx";
import { Avatar, IconBtn } from "./ui.jsx";

const PAGES = {
  "/": ["Vue d'ensemble", "Activite de la boutique aujourd'hui"],
  "/commandes": ["Commandes", "Suivi et avancement des tickets"],
  "/caisse": ["Caisse", "Encaisser au comptoir et editer la facture"],
  "/menus": ["Menus", "Catalogue de la boutique"],
  "/portefeuille": ["Portefeuille", "Gains, retraits et transactions"],
  "/admin/boutiques": ["Boutiques", "Toutes les boutiques de la plateforme"],
  "/admin/commandes": ["Commandes plateforme", "Vue transverse toutes boutiques"],
  "/admin/utilisateurs": ["Utilisateurs", "Comptes marchands et clients"],
};

const NAV = [
  { to: "/", icon: "overview", label: "Vue d'ensemble", end: true },
  { to: "/commandes", icon: "orders", label: "Commandes", badge: "pending" },
  { to: "/caisse", icon: "pos", label: "Caisse" },
  { to: "/menus", icon: "menus", label: "Menus" },
  { to: "/portefeuille", icon: "wallet", label: "Portefeuille" },
];

const ADMIN_NAV = [
  { to: "/admin/boutiques", icon: "shops", label: "Boutiques" },
  { to: "/admin/commandes", icon: "chart", label: "Commandes plateforme" },
  { to: "/admin/utilisateurs", icon: "users", label: "Utilisateurs" },
];

export default function DashboardLayout() {
  const { userData, logout, isAdmin } = useAuth();
  const { orders, boutique, loading, overrideFastFoodId, setOverrideFastFoodId, refresh } =
    useMerchant();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("yam.sidebar") === "collapsed",
  );
  const [drawer, setDrawer] = useState(false);

  // La navigation ferme le tiroir mobile.
  useEffect(() => setDrawer(false), [location.pathname]);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem("yam.sidebar", c ? "expanded" : "collapsed");
      return !c;
    });
  };

  const pendingCount = orders.filter((o) =>
    STATUS_MAP.pending.includes(o.status),
  ).length;

  const [title, subtitle] = PAGES[location.pathname] || ["Dashboard", ""];
  const shopName = boutique?.name || boutique?.nom || "Ma boutique";
  const accountName =
    userData?.infos?.nom || userData?.infos?.email || "Compte";

  const shellClass = [
    "shell",
    collapsed ? "collapsed" : "",
    drawer ? "drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const navLink = ({ to, icon, label, end, badge }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
    >
      <Icon name={icon} size={17} />
      <span className="nav-label">{label}</span>
      {badge === "pending" && pendingCount > 0 && (
        <span className="badge badge-accent">{pendingCount}</span>
      )}
    </NavLink>
  );

  return (
    <div className={shellClass}>
      <div className="scrim" onClick={() => setDrawer(false)} />

      <aside className="sidebar no-print">
        <div className="brand">
          <span className="brand-mark">Y</span>
          <span className="brand-text">
            <span className="brand-name">Yaammoo</span>
            <span className="brand-sub">Console marchand</span>
          </span>
        </div>

        <button
          type="button"
          className="shop-switch"
          onClick={() => setOverrideFastFoodId(null)}
          disabled={!overrideFastFoodId}
          title={shopName}
        >
          <Avatar name={shopName} className="shop-avatar" />
          <span className="shop-meta">
            <span className="shop-name truncate">{shopName}</span>
            <span className="shop-role">
              {overrideFastFoodId ? "Pilotage admin" : isAdmin ? "Admin" : "Marchand"}
            </span>
          </span>
        </button>

        <nav className="sidebar-nav">
          <div className="nav-section">Boutique</div>
          {NAV.map(navLink)}
          {isAdmin && (
            <>
              <div className="nav-section">Plateforme</div>
              {ADMIN_NAV.map(navLink)}
            </>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="account">
            <Avatar name={accountName} />
            <span className="stacked grow account-meta">
              <span className="small strong truncate">{accountName}</span>
              <span className="tiny dim truncate">
                {isAdmin ? "Admin plateforme" : shopName}
              </span>
            </span>
          </div>
          <button type="button" className="nav-item" onClick={logout}>
            <Icon name="logout" size={17} />
            <span className="nav-label">Se deconnecter</span>
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar no-print">
          <IconBtn
            icon="hamburger"
            label="Ouvrir le menu"
            className="menu-btn"
            onClick={() => setDrawer(true)}
          />
          <IconBtn
            icon="panel"
            label={collapsed ? "Deplier le menu" : "Replier le menu"}
            className="collapse-btn"
            onClick={toggleCollapse}
          />

          <div className="topbar-title">
            <h1 className="truncate">{title}</h1>
            {subtitle && <span className="topbar-sub truncate">{subtitle}</span>}
          </div>

          <div className="topbar-actions">
            <span className={loading ? "live" : "live on"}>
              <span className="live-dot" />
              {loading ? "Sync..." : "En direct"}
            </span>
            <span className="topbar-sep" />
            <IconBtn
              icon="refresh"
              label="Actualiser"
              onClick={() => refresh(true)}
            />
          </div>
        </header>

        {overrideFastFoodId && (
          <div className="pilot-bar no-print">
            <Icon name="alert" size={15} />
            Vous pilotez <strong>{shopName}</strong> en tant qu'administrateur.
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setOverrideFastFoodId(null)}
            >
              Revenir a ma boutique
            </button>
          </div>
        )}

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
