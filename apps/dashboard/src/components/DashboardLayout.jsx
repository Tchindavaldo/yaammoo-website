// Coque du dashboard : rail lateral et barre haute repris a l'identique du
// design de reference « Dashboard Menu md screen v3 ».
//
// La machine d'etat de la navigation est celle du design, reprise telle
// quelle (voir navGroupsData() dans le fichier .dc.html) :
//   page : item actif — tout item clique le devient, avec ou sans enfants
//   open : item dont le sous-menu est deplie — un seul a la fois
//   sub  : sous-entree active, remise a null des qu'on clique un parent
// Un item sans enfants laisse `open` inchange : ouvrir un sous-menu puis
// cliquer ailleurs ne le referme pas, exactement comme le design.
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Icon } from "./icons.jsx";
import { Avatar, IconBtn } from "./ui.jsx";

// Items repris un pour un du design, dans le meme ordre.
// `count` nomme un compteur calcule au rendu ; `to` la route quand l'ecran
// existe — les autres items restent cliquables dans le rail.
const NAV_GROUPS = [
  {
    label: "PILOTAGE",
    items: [
      { id: "overview", icon: "overview", label: "Vue d'ensemble", to: "/overview" },
      {
        id: "orders",
        icon: "orders",
        label: "Commandes",
        count: "orders",
      },
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      {
        id: "shops",
        icon: "shops",
        label: "Boutiques",
        to: "/boutique",
      },
      {
        id: "menus",
        icon: "menus",
        label: "Menus",
        to: "/",
        count: "menus",
      },
      { id: "products", icon: "grid", label: "Produits" },
      { id: "delivery", icon: "bike", label: "Livraisons" },
    ],
  },
  {
    label: "FINANCES",
    items: [
      { id: "payments", icon: "wallet", label: "Paiements & wallet" },
      { id: "fees", icon: "percent", label: "Frais & commissions" },
    ],
  },
];

const FOOT_LINKS = [
  { icon: "support", label: "Support" },
  { icon: "settings", label: "Parametres" },
  { icon: "team", label: "Equipe" },
];

export default function DashboardLayout() {
  const { userData, logout, isAdmin } = useAuth();
  const { orders, menus, boutique, loading, overrideFastFoodId, setOverrideFastFoodId } =
    useMerchant();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawer, setDrawer] = useState(false);
  // Item actif du rail.
  const [page, setPage] = useState("menus");

  // La navigation ferme le tiroir mobile.
  useEffect(() => setDrawer(false), [location.pathname, location.search]);

  // La Vue d'ensemble reproduit le <main> du design : elle porte son propre
  // header et son propre defilement, donc la barre haute partagee s'efface.
  const isOverview = location.pathname === "/overview";
  const isBoutique = location.pathname === "/boutique";
  const isBare = isOverview || isBoutique;

  // L'item actif suit l'URL pour survivre a un rechargement.
  useEffect(() => {
    if (location.pathname === "/overview") setPage("overview");
    else if (location.pathname === "/boutique") setPage("shops");
    else setPage("menus");
  }, [location.pathname]);

  const counts = { orders: orders.length, menus: menus?.length || 0 };

  const shopName = boutique?.name || boutique?.nom || "Ma boutique";
  const accountName = userData?.infos?.nom || userData?.infos?.email || "Compte";
  const shortName = accountName.split(" ").slice(0, 2).join(" ");

  // Date du jour en toutes lettres, comme le sous-titre du design.
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  // `shell-fixed` garde la coque du design (hauteur fixe, aucun defilement de
  // page) a toutes les tailles d'ecran sur la Vue d'ensemble et Boutique.
  const shellClass = ["shell", drawer ? "drawer-open" : "", isBare ? "shell-fixed" : ""]
    .filter(Boolean)
    .join(" ");

  // onClick du design : page <- id, sub <- null, et open ne bascule que si
  // l'item a des enfants.
  const selectItem = (item) => {
    setPage(item.id);
    if (item.to) navigate(item.to);
  };

  const renderItem = (item) => {
    const { id, icon, label, count } = item;
    const active = page === id;
    const value = count ? counts[count] : 0;

    return (
      <div key={id}>
        <button
          type="button"
          className={active ? "nav-item active" : "nav-item"}
          onClick={() => selectItem(item)}
        >
          <span className="nav-icon">
            <Icon name={icon} size={17} />
          </span>
          <span className="nav-label">{label}</span>
          {value > 0 && <span className="nav-count">{value}</span>}
        </button>
      </div>
    );
  };

  return (
    <div className={shellClass}>
      <div className="scrim" onClick={() => setDrawer(false)} />

      <aside className="sidebar no-print">
        <div className="brand">
          <span className="brand-mark">Y</span>
          <span className="brand-text">
            <span className="brand-name">Yaammoo</span>
            <span className="brand-sub">CONSOLE ADMIN</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((g) => (
            <div className="nav-group" key={g.label}>
              <div className="nav-section">{g.label}</div>
              {g.items.map(renderItem)}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-foot">
          {FOOT_LINKS.map((f) => (
            <button type="button" key={f.label} className="nav-foot">
              <Icon name={f.icon} size={17} />
              <span>{f.label}</span>
            </button>
          ))}

          <div className="account">
            <Avatar name={accountName} />
            <span className="stacked grow account-meta">
              <span className="account-name truncate">{accountName}</span>
              <span className="account-role truncate">
                {overrideFastFoodId ? "Pilotage admin" : isAdmin ? "Admin" : shopName}
              </span>
            </span>
            <IconBtn icon="exit" label="Se deconnecter" size="sm" onClick={logout} />
          </div>
        </div>
      </aside>

      <div className="main">
        {!isOverview && (
        <header className="topbar no-print">
          <IconBtn
            icon="hamburger"
            label="Ouvrir le menu"
            className="menu-btn"
            onClick={() => setDrawer(true)}
          />

          <div className="topbar-title">
            <h1 className="truncate">
              {isBoutique ? "Boutique" : "Gestion des menus"}
            </h1>
            <span className="topbar-sub truncate">
              {isBoutique
                ? `${today} \u00a0\u00b7\u00a0 Fiche et gestion de votre etablissement`
                : `${today} \u00a0\u00b7\u00a0 Catalogue des plats`}
            </span>
          </div>

          <div className="topbar-actions">
            <span className={loading ? "live" : "live on"}>
              <span className="live-dot" />
              {loading ? "Sync..." : "En direct"}
            </span>
            <div className="topbar-account" title={accountName}>
              <Avatar name={accountName} className="topbar-avatar" />
              <span className="truncate">{shortName}</span>
              <Icon name="chevronDown" size={13} />
            </div>
          </div>
        </header>
        )}

        {overrideFastFoodId && !isOverview && (
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

        <div className={isBare ? "content content-bare" : "content"}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
