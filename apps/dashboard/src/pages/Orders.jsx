// Gestion des commandes — portage web d'OrderManagePanel (app RN).
// Onglets de statut, filtre date + periodes, groupage par client/date/creneau,
// tri par rank, avancement de statut (unitaire ou sur tout le groupe).
import { useMemo, useState } from "react";
import {
  STATUS_TABS,
  STATUS_MAP,
  filterOrders,
  groupBySlot,
  availableDates,
  untreatedCounts,
  orderDateISO,
  orderPeriodKey,
  nextStatus,
  STATUS_LABELS,
  formatDayMonth,
  formatXAF,
  groupTotal,
  todayISO,
} from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Chip, Empty, Loading, StatusPill } from "../components/ui.jsx";
import OrderDetailModal from "../features/orders/OrderDetailModal.jsx";

const PERIOD_LABEL = (key) => {
  if (key === "surplace") return "Sur place";
  if (key === "express") return "Express";
  return key || "Creneau";
};

export default function Orders() {
  const { orders, loading, updateStatus, refresh } = useMerchant();
  const [statusKey, setStatusKey] = useState("pending");
  const [date, setDate] = useState(todayISO());
  const [periods, setPeriods] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const dates = useMemo(() => availableDates(orders), [orders]);

  // Periodes disponibles sur la date active (comme MerchantFilterSheet).
  const periodOptions = useMemo(() => {
    const onDate = orders.filter((o) => orderDateISO(o) === date);
    const keys = [...new Set(onDate.map(orderPeriodKey))].filter(Boolean);
    return keys.sort();
  }, [orders, date]);

  const filtered = useMemo(
    () => filterOrders(orders, { statusKey, date, periods }),
    [orders, statusKey, date, periods],
  );

  const rows = useMemo(() => groupBySlot(filtered), [filtered]);
  const counts = useMemo(() => untreatedCounts(orders, date), [orders, date]);

  const tabCount = (key) =>
    filterOrders(orders, { statusKey: key, date, periods }).length;

  const togglePeriod = (key) =>
    setPeriods((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );

  // Avance tout le groupe d'un coup (portage du bouton de la carte RN).
  const advanceGroup = async (group) => {
    const target = nextStatus(group[0].status);
    if (!target) return;
    setBusyId(group[0].id);
    await Promise.all(group.map((o) => updateStatus(o.id, target)));
    setBusyId(null);
  };

  return (
    <>
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="chip-row">
          {STATUS_TABS.map((t) => (
            <Chip
              key={t.key}
              active={statusKey === t.key}
              onClick={() => setStatusKey(t.key)}
              count={tabCount(t.key)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
        <div className="row">
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 165 }}
          />
          <button className="btn sm" onClick={() => refresh(true)} type="button">
            Actualiser
          </button>
        </div>
      </div>

      {periodOptions.length > 0 && (
        <div className="chip-row" style={{ marginBottom: 14 }}>
          <Chip active={periods.length === 0} onClick={() => setPeriods([])}>
            Toutes les periodes
          </Chip>
          {periodOptions.map((p) => (
            <Chip
              key={p}
              active={periods.includes(p)}
              onClick={() => togglePeriod(p)}
              count={
                orders.filter(
                  (o) =>
                    orderDateISO(o) === date &&
                    orderPeriodKey(o) === p &&
                    STATUS_MAP[statusKey].includes(o.status),
                ).length
              }
            >
              {PERIOD_LABEL(p)}
            </Chip>
          ))}
        </div>
      )}

      <div className="card">
        {loading && orders.length === 0 ? (
          <Loading label="Chargement des commandes..." />
        ) : rows.length === 0 ? (
          <Empty
            title={`Aucune commande ${STATUS_TABS.find((t) => t.key === statusKey)?.label.toLowerCase()}`}
            hint={`Pour le ${formatDayMonth(date)}`}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 52 }}>Rang</th>
                  <th>Client</th>
                  <th>Commande</th>
                  <th>Livraison</th>
                  <th className="right">Montant</th>
                  <th>Statut</th>
                  <th style={{ width: 150 }} className="no-print"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ head, group }) => {
                  const target = nextStatus(head.status);
                  const period = orderPeriodKey(head);
                  return (
                    <tr
                      key={head.id}
                      onClick={() => setOpenRow({ head, group })}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="mono dim">
                        {typeof head.rank === "number" ? head.rank : "—"}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }} className="truncate">
                          {head.userData?.infos?.nom ||
                            head.userData?.nom ||
                            head.userData?.email ||
                            "Client"}
                        </div>
                        <div className="small dim">
                          {head.delivery?.phone || head.userData?.infos?.numero || ""}
                        </div>
                      </td>
                      <td>
                        <div className="truncate" style={{ maxWidth: 230 }}>
                          {head.menu?.titre || head.menu?.name || "Menu"}
                          {head.quantity > 1 ? ` x${head.quantity}` : ""}
                        </div>
                        {group.length > 1 && (
                          <span className="pill">{group.length} commandes groupees</span>
                        )}
                      </td>
                      <td>
                        <span className="pill">{PERIOD_LABEL(period)}</span>
                        <div className="small dim truncate" style={{ maxWidth: 180 }}>
                          {head.delivery?.address || head.delivery?.zone || ""}
                        </div>
                      </td>
                      <td className="right mono" style={{ fontWeight: 650 }}>
                        {formatXAF(groupTotal(group))}
                      </td>
                      <td>
                        <StatusPill status={head.status} />
                      </td>
                      <td className="no-print">
                        {target && (
                          <button
                            className="btn primary sm"
                            disabled={busyId === head.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceGroup(group);
                            }}
                            type="button"
                          >
                            {busyId === head.id
                              ? "..."
                              : `Passer a ${STATUS_LABELS[target]}`}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(counts.past > 0 || counts.future > 0) && (
        <div className="notice-row">
          {counts.past > 0 && (
            <div className="notice past">
              <span className="notice-count mono">{counts.past}</span>
              Commandes passees non traitees
            </div>
          )}
          {counts.future > 0 && (
            <div className="notice future">
              <span className="notice-count mono">{counts.future}</span>
              Commandes a venir pas encore traitees
            </div>
          )}
        </div>
      )}

      {dates.length > 1 && (
        <>
          <h3 className="section-title">Autres dates</h3>
          <div className="chip-row">
            {dates.map((d) => (
              <Chip key={d} active={d === date} onClick={() => setDate(d)}>
                {formatDayMonth(d)}
              </Chip>
            ))}
          </div>
        </>
      )}

      {openRow && (
        <OrderDetailModal
          head={openRow.head}
          group={openRow.group}
          onClose={() => setOpenRow(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </>
  );
}
