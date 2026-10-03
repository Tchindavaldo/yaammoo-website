// Analytics — statistiques d'usage de l'app mobile (admin).
//
// Barre de mode : « Par utilisateur » / « Vue globale », periode, actualiser.
//   Par utilisateur (organisation de Menus / Boutique) :
//     gauche = liste des utilisateurs, centre = cartes resumees de la
//     plateforme, droite = fiche de l'utilisateur selectionne.
//   Vue globale (langage de la Vue d'ensemble) :
//     heros + tuiles 4x2, puis parcours, boutiques, recherches.
// Rien ne defile au centre : le detail s'ouvre dans le panneau lateral droit.
// Le mode est dans l'URL (?vue=globale) pour survivre a un rechargement.
// Sources : routes /analytics/* du backend (voir architecture/analytics.md).
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminService, analyticsService } from "@yaammoo/shared";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Empty } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import AnalyticsUsersPane from "../components/analytics/AnalyticsUsersPane.jsx";
import AnalyticsCards, { PeriodPill } from "../components/analytics/AnalyticsCards.jsx";
import AnalyticsUserFiche from "../components/analytics/AnalyticsUserFiche.jsx";
import AnalyticsGlobal from "../components/analytics/AnalyticsGlobal.jsx";
import {
  BannersDetail,
  FunnelDetail,
  SearchesDetail,
  ShopsDetail,
  SidePanel,
  UserHistory,
} from "../components/analytics/AnalyticsPanel.jsx";
import { PERIODS, rangeOf } from "../components/analytics/analyticsFormat.js";

const ONLINE_REFRESH_MS = 30000;

const MODES = [
  { key: "users", label: "Par utilisateur" },
  { key: "globale", label: "Vue globale" },
];

/** Fusionne connexions, sessions, scroll du home et presence par utilisateur. */
function mergeUsers(data, online) {
  const byId = new Map();
  const put = (row) => byId.set(row.userId, { ...byId.get(row.userId), ...row });
  data.connections.forEach(put);
  data.sessions.forEach(put);
  data.scroll.forEach(put);
  for (const u of online?.users || []) put({ userId: u.userId, user: u.user, online: true, platform: u.platform, appVersion: u.appVersion });
  return [...byId.values()];
}

const idOf = (x) => x?.id || x?._id;

export default function Analytics() {
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const mode = params.get("vue") === "globale" ? "globale" : "users";
  const setMode = (key) => {
    const next = new URLSearchParams(params);
    if (key === "users") next.delete("vue");
    else next.set("vue", key);
    setParams(next, { replace: true });
  };

  const [period, setPeriod] = useState("7");
  const [tick, setTick] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(null);
  const [shops, setShops] = useState([]);
  const [banners, setBanners] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("lastConnectedAt");
  const [selId, setSelId] = useState(null);
  // Panneau droit : { kind: funnel | shops | searches | banners | history, payload? }
  const [panel, setPanel] = useState(null);
  const closePanel = useCallback(() => setPanel(null), []);

  const range = useMemo(() => rangeOf(period), [period, tick]);
  const periodLabel = PERIODS.find((p) => p.key === period)?.label;

  // Noms et photos des boutiques et bannieres (les stats ne portent que les ids).
  useEffect(() => {
    adminService.getFastFoods().then(setShops).catch(() => {});
    adminService.getBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    Promise.all([
      analyticsService.getDaily(range),
      analyticsService.getConnectionStats(range),
      analyticsService.getSessionStats(range),
      analyticsService.getHomeScroll(range),
      analyticsService.getShops(range),
      analyticsService.getFunnel(range),
      analyticsService.getSearches(range),
      analyticsService.getBanners(range),
    ])
      .then(([daily, connections, sessions, scroll, shopStats, funnel, searches, bannerStats]) => {
        if (alive) setData({ daily, connections, sessions, scroll, shopStats, funnel, searches, bannerStats });
      })
      .catch((e) => alive && setError(e?.response?.data?.error || e.message));
    return () => {
      alive = false;
    };
  }, [range]);

  const loadOnline = useCallback(() => {
    analyticsService.getOnline().then(setOnline).catch(() => {});
  }, []);
  useEffect(() => {
    loadOnline();
    const id = setInterval(loadOnline, ONLINE_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadOnline]);

  const shopOf = useCallback(
    (id) => {
      const s = shops.find((x) => idOf(x) === id);
      return {
        name: s?.name || s?.nom || `Boutique #${String(id || "").slice(0, 6)}`,
        photo: s?.image || s?.photo || s?.logo || null,
      };
    },
    [shops],
  );
  const shopName = useCallback((id) => shopOf(id).name, [shopOf]);
  const bannerOf = useCallback(
    (id) => {
      const b = banners.find((x) => idOf(x) === id);
      return {
        name: b?.title || b?.titre || b?.name || `Banniere #${String(id || "").slice(0, 6)}`,
        photo: b?.image || b?.imageUrl || b?.url || null,
      };
    },
    [banners],
  );

  const allUsers = useMemo(() => (data ? mergeUsers(data, online) : []), [data, online]);
  const users = useMemo(() => {
    const base = filter === "online" ? allUsers.filter((u) => u.online) : allUsers;
    const val = (r) =>
      sort === "lastConnectedAt"
        ? r.online ? Infinity : new Date(r.lastConnectedAt || r.lastSessionAt || 0).getTime()
        : Number(r[sort] || 0);
    return [...base].sort((a, b) => val(b) - val(a));
  }, [allUsers, filter, sort]);

  // Selection : celle de l'utilisateur, sinon le premier de la liste.
  useEffect(() => {
    if (!users.length) return;
    if (!users.some((u) => u.userId === selId)) setSelId(users[0].userId);
  }, [users, selId]);

  if (!isAdmin) {
    return (
      <div className="card">
        <Empty icon="alert" title="Acces reserve" hint="Les statistiques sont reservees aux administrateurs." />
      </div>
    );
  }

  const openPanel = (kind) => setPanel({ kind });

  const panelView = panel && data && {
    funnel: { title: "Parcours de commande", sub: periodLabel, body: <FunnelDetail funnel={data.funnel} /> },
    shops: { title: "Boutiques vues", sub: `${data.shopStats.length} boutiques · ${periodLabel}`, body: <ShopsDetail shopStats={data.shopStats} shopOf={shopOf} /> },
    searches: { title: "Recherches", sub: periodLabel, body: <SearchesDetail searches={data.searches} /> },
    banners: { title: "Bannieres du carrousel", sub: periodLabel, body: <BannersDetail bannerStats={data.bannerStats} bannerOf={bannerOf} /> },
    history: panel.payload && {
      title: panel.payload.name,
      sub: `Historique · ${periodLabel}`,
      body: <UserHistory {...panel.payload} />,
    },
  }[panel.kind];

  return (
    <div className="an-page">
      <div className="an-modebar">
        <div className="menus-chips-group">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={mode === m.key ? "menu-chip active" : "menu-chip"}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="an-head-right">
          <PeriodPill period={period} onPeriod={setPeriod} />
          <button
            type="button"
            className="menu-new"
            onClick={() => {
              setTick((x) => x + 1);
              loadOnline();
            }}
          >
            <Icon name="refresh" size={14} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {error && <div className="an-error">{error}</div>}

      {mode === "globale" ? (
        <AnalyticsGlobal
          data={data}
          online={online}
          activeUsers={allUsers.length}
          periodLabel={periodLabel}
          shopOf={shopOf}
          onOpen={openPanel}
        />
      ) : (
        <div className="an-screen">
          <AnalyticsUsersPane
            users={users}
            filter={filter}
            onFilter={setFilter}
            sort={sort}
            onSort={setSort}
            selectedId={selId}
            onSelect={setSelId}
            loading={!data && !error}
          />

          <div className="menus-rule" />

          <AnalyticsCards
            data={data}
            online={online}
            shopOf={shopOf}
            bannerOf={bannerOf}
            activeUsers={allUsers.length}
            onOpen={openPanel}
          />

          <AnalyticsUserFiche
            userId={selId}
            row={users.find((u) => u.userId === selId)}
            range={range}
            shopName={shopName}
            onHistory={(payload) => setPanel({ kind: "history", payload })}
          />
        </div>
      )}

      {panelView && (
        <SidePanel title={panelView.title} subtitle={panelView.sub} onClose={closePanel}>
          {panelView.body}
        </SidePanel>
      )}
    </div>
  );
}
