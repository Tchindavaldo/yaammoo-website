// Vue d'ensemble — stats du jour et commandes a traiter en priorite.
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  formatXAF,
  formatDayMonth,
  orderDateISO,
  filterOrders,
  groupBySlot,
  untreatedCounts,
  todayISO,
  orderTotal,
} from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Stat, Empty, Loading, StatusPill } from "../components/ui.jsx";

export default function Overview() {
  const { orders, menus, stats, loading } = useMerchant();
  const today = todayISO();

  const todayOrders = useMemo(
    () => orders.filter((o) => orderDateISO(o) === today),
    [orders, today],
  );

  const todayRevenue = todayOrders
    .filter((o) => ["completed", "finished", "delivered"].includes(o.status))
    .reduce((acc, o) => acc + orderTotal(o), 0);

  const pendingRows = useMemo(
    () =>
      groupBySlot(
        filterOrders(orders, { statusKey: "pending", date: today, periods: [] }),
      ).slice(0, 6),
    [orders, today],
  );

  const counts = untreatedCounts(orders, today);

  if (loading && orders.length === 0) return <Loading />;

  return (
    <>
      <div className="stat-grid">
        <Stat
          label="Commandes du jour"
          value={todayOrders.length}
          hint={formatDayMonth(today)}
        />
        <Stat label="En attente" value={stats.pendingOrders} hint="Tous jours confondus" />
        <Stat
          label="Recette du jour"
          value={formatXAF(todayRevenue)}
          small
          hint="Commandes terminees"
        />
        <Stat
          label="Recette totale"
          value={formatXAF(stats.totalRevenue)}
          small
          hint={`${stats.completedOrders} commandes`}
        />
        <Stat label="Menus actifs" value={menus.length} />
      </div>

      {(counts.past > 0 || counts.future > 0) && (
        <div className="notice-row" style={{ marginBottom: 18, marginTop: 0 }}>
          {counts.past > 0 && (
            <Link to="/commandes" className="notice past" style={{ textDecoration: "none" }}>
              <span className="notice-count mono">{counts.past}</span>
              Commandes passees non traitees
            </Link>
          )}
          {counts.future > 0 && (
            <Link to="/commandes" className="notice future" style={{ textDecoration: "none" }}>
              <span className="notice-count mono">{counts.future}</span>
              Commandes a venir pas encore traitees
            </Link>
          )}
        </div>
      )}

      <div className="row-between" style={{ marginBottom: 11 }}>
        <h2>A traiter aujourd'hui</h2>
        <Link to="/commandes" className="btn sm">
          Voir tout
        </Link>
      </div>

      <div className="card">
        {pendingRows.length === 0 ? (
          <Empty title="Aucune commande en attente" hint="Tout est a jour." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 52 }}>Rang</th>
                  <th>Client</th>
                  <th>Commande</th>
                  <th className="right">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {pendingRows.map(({ head, group }) => (
                  <tr key={head.id}>
                    <td className="mono dim">
                      {typeof head.rank === "number" ? head.rank : "—"}
                    </td>
                    <td className="truncate">
                      {head.userData?.infos?.nom ||
                        head.userData?.nom ||
                        head.userData?.email ||
                        "Client"}
                    </td>
                    <td className="truncate">
                      {head.menu?.titre || head.menu?.name || "Menu"}
                      {group.length > 1 && (
                        <span className="pill" style={{ marginLeft: 7 }}>
                          +{group.length - 1}
                        </span>
                      )}
                    </td>
                    <td className="right mono">
                      {formatXAF(group.reduce((a, o) => a + orderTotal(o), 0))}
                    </td>
                    <td>
                      <StatusPill status={head.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
