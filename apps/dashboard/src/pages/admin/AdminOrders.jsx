// Admin — vue transverse de toutes les commandes de la plateforme.
// Le backend n'expose pas d'endpoint global : on agrege boutique par boutique.
// Ici le tableau est la bonne forme — c'est un journal, pas un plan de travail.
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
import {
  Alert,
  Avatar,
  Btn,
  Empty,
  Kpi,
  KpiBand,
  Segmented,
  SkTable,
  StatusPill,
} from "../../components/ui.jsx";

const DONE = ["completed", "finished", "delivered"];
const LIMIT = 300;

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
    .filter((o) => DONE.includes(o.status))
    .reduce((acc, o) => acc + orderTotal(o), 0);

  const todayCount = orders.filter((o) => orderDateISO(o) === todayISO()).length;

  const tabs = STATUS_TABS.map((t) => ({
    key: t.key,
    label: t.label,
    count: orders.filter((o) => t.statuses.includes(o.status)).length,
  }));

  if (loading) return <SkTable rows={8} cols={6} />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <KpiBand>
        <Kpi
          lead
          icon="chart"
          label="Volume traite"
          value={formatXAF(revenue)}
          foot={`${orders.length} commande(s) sur ${shops.length} boutique(s)`}
        />
        <Kpi icon="orders" label="Commandes totales" value={orders.length} />
        <Kpi icon="clock" label="Aujourd'hui" value={todayCount} />
        <Kpi icon="shops" label="Boutiques actives" value={shops.length} />
      </KpiBand>

      <div className="toolbar">
        <Segmented options={tabs} value={statusKey} onChange={setStatusKey} />
        <div className="toolbar-end">
          <select
            className="input"
            style={{ width: 200 }}
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
            style={{ width: 158 }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {(date || shopId) && (
            <Btn
              size="sm"
              icon="close"
              onClick={() => {
                setDate("");
                setShopId("");
              }}
            >
              Reinitialiser
            </Btn>
          )}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <Empty
            icon="inbox"
            title="Aucune commande pour ces filtres"
            hint="Elargissez la periode ou changez de boutique."
          />
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
                {filtered.slice(0, LIMIT).map((o) => (
                  <tr key={o.id}>
                    <td className="small nowrap">{formatFullDate(orderDateISO(o))}</td>
                    <td className="truncate" style={{ maxWidth: 170 }}>
                      {shopName(o.fastFoodId)}
                    </td>
                    <td>
                      <span className="client-cell">
                        <Avatar
                          name={o.userData?.infos?.nom || o.userData?.email || "Client"}
                        />
                        <span className="truncate" style={{ maxWidth: 130 }}>
                          {o.userData?.infos?.nom || o.userData?.email || "Client"}
                        </span>
                      </span>
                    </td>
                    <td className="truncate" style={{ maxWidth: 190 }}>
                      {o.menu?.titre || o.menu?.name || "Menu"}
                    </td>
                    <td className="right num strong">{formatXAF(orderTotal(o))}</td>
                    <td>
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > LIMIT && (
              <div className="card-foot small dim" style={{ textAlign: "center" }}>
                {LIMIT} premieres lignes sur {filtered.length}. Affinez les filtres.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
