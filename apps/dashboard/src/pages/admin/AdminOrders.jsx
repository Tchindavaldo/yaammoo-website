// Admin — vue transverse de toutes les commandes de la plateforme.
// Le backend n'expose pas d'endpoint global : on agrege par boutique.
import { useEffect, useMemo, useState } from "react";
import {
  adminService,
  formatXAF,
  formatFullDate,
  orderDateISO,
  orderTotal,
  STATUS_TABS,
  STATUS_MAP,
  todayISO,
} from "@yaammoo/shared";
import { Stat, Empty, Loading, Chip, StatusPill } from "../../components/ui.jsx";

export default function AdminOrders() {
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusKey, setStatusKey] = useState("pending");
  const [shopId, setShopId] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminService.getFastFoods();
        if (cancelled) return;
        setShops(list);
        const all = await adminService.getAllOrders(list.map((s) => s.id));
        if (!cancelled) setOrders(all);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shopName = useMemo(() => {
    const map = new Map(shops.map((s) => [s.id, s.name || s.nom || s.id]));
    return (id) => map.get(id) || id;
  }, [shops]);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (!STATUS_MAP[statusKey].includes(o.status)) return false;
        if (shopId && o.fastFoodId !== shopId) return false;
        if (date && orderDateISO(o) !== date) return false;
        return true;
      }),
    [orders, statusKey, shopId, date],
  );

  const revenue = orders
    .filter((o) => ["completed", "finished", "delivered"].includes(o.status))
    .reduce((acc, o) => acc + orderTotal(o), 0);

  const todayCount = orders.filter((o) => orderDateISO(o) === todayISO()).length;

  if (loading) return <Loading label="Agregation des commandes..." />;
  if (error)
    return (
      <div className="card card-pad" style={{ color: "var(--danger)" }}>
        ❌ {error}
      </div>
    );

  return (
    <>
      <div className="stat-grid">
        <Stat label="Commandes totales" value={orders.length} />
        <Stat label="Aujourd'hui" value={todayCount} />
        <Stat label="Volume traite" value={formatXAF(revenue)} small />
        <Stat label="Boutiques actives" value={shops.length} />
      </div>

      <div className="row-between" style={{ marginBottom: 13 }}>
        <div className="chip-row">
          {STATUS_TABS.map((t) => (
            <Chip
              key={t.key}
              active={statusKey === t.key}
              onClick={() => setStatusKey(t.key)}
              count={orders.filter((o) => t.statuses.includes(o.status)).length}
            >
              {t.label}
            </Chip>
          ))}
        </div>
        <div className="row">
          <select
            className="input"
            style={{ width: 195 }}
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
          >
            <option value="">Toutes les boutiques</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.nom}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            style={{ width: 160 }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {date && (
            <button className="btn sm" onClick={() => setDate("")} type="button">
              Toutes dates
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <Empty title="Aucune commande pour ces filtres" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Boutique</th>
                  <th>Client</th>
                  <th>Commande</th>
                  <th className="right">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 300).map((o) => (
                  <tr key={o.id}>
                    <td className="small">{formatFullDate(orderDateISO(o))}</td>
                    <td className="truncate" style={{ maxWidth: 160 }}>
                      {shopName(o.fastFoodId)}
                    </td>
                    <td className="truncate" style={{ maxWidth: 150 }}>
                      {o.userData?.infos?.nom || o.userData?.email || "Client"}
                    </td>
                    <td className="truncate" style={{ maxWidth: 180 }}>
                      {o.menu?.titre || o.menu?.name || "Menu"}
                    </td>
                    <td className="right mono">{formatXAF(orderTotal(o))}</td>
                    <td>
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 300 && (
              <div className="small dim" style={{ padding: 12, textAlign: "center" }}>
                300 premieres lignes affichees sur {filtered.length}. Affinez les
                filtres.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
