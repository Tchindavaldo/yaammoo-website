// Commandes — board de tickets par statut.
// Les trois colonnes montrent l'avancement d'un coup d'oeil : le marchand voit
// ce qui attend, ce qui est en cuisine et ce qui est pret sans changer d'onglet.
// La logique (filtres, groupage, rangs, statuts) est celle d'OrderManagePanel.
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
  todayISO,
} from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Chip, Empty, SkBoard, IconBtn } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import OrderTicket, { periodLabel } from "../features/orders/OrderTicket.jsx";
import OrderDetailModal from "../features/orders/OrderDetailModal.jsx";

const COLUMN_TITLE = {
  pending: "A traiter",
  proccess: "En preparation",
  finish: "Prete / livree",
};

export default function Orders() {
  const { orders, loading, updateStatus } = useMerchant();
  const toast = useToast();

  const [date, setDate] = useState(todayISO());
  const [periods, setPeriods] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const dates = useMemo(() => availableDates(orders), [orders]);

  // Periodes presentes sur la date affichee (comme MerchantFilterSheet).
  const periodOptions = useMemo(() => {
    const onDate = orders.filter((o) => orderDateISO(o) === date);
    return [...new Set(onDate.map(orderPeriodKey))].filter(Boolean).sort();
  }, [orders, date]);

  // Une colonne par statut : chacune est filtree puis groupee par creneau.
  const columns = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        key: tab.key,
        title: COLUMN_TITLE[tab.key] || tab.label,
        rows: groupBySlot(filterOrders(orders, { statusKey: tab.key, date, periods })),
      })),
    [orders, date, periods],
  );

  const counts = useMemo(() => untreatedCounts(orders, date), [orders, date]);
  const total = columns.reduce((acc, c) => acc + c.rows.length, 0);

  const togglePeriod = (key) =>
    setPeriods((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );

  // Avance tout le groupe d'un coup — un client servi, pas une ligne.
  const advanceGroup = async (group) => {
    const target = nextStatus(group[0].status);
    if (!target) return;
    setBusyId(group[0].id);
    const results = await Promise.all(group.map((o) => updateStatus(o.id, target)));
    setBusyId(null);
    if (results.every(Boolean)) {
      toast.ok(`Passee a ${STATUS_LABELS[target]}`, `${group.length} commande(s)`);
    } else {
      toast.err("Mise a jour partielle", "Certaines commandes n'ont pas change.");
    }
  };

  const shiftDate = (days) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().substring(0, 10));
  };

  return (
    <>
      <div className="toolbar">
        <div className="row" style={{ gap: 4 }}>
          <IconBtn icon="chevronLeft" label="Jour precedent" onClick={() => shiftDate(-1)} />
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 158 }}
          />
          <IconBtn icon="chevronRight" label="Jour suivant" onClick={() => shiftDate(1)} />
        </div>

        {date !== todayISO() && (
          <button type="button" className="btn btn-sm" onClick={() => setDate(todayISO())}>
            Aujourd'hui
          </button>
        )}

        {periodOptions.length > 0 && (
          <div className="chip-row">
            <Chip active={periods.length === 0} onClick={() => setPeriods([])}>
              Tout
            </Chip>
            {periodOptions.map((p) => (
              <Chip
                key={p}
                active={periods.includes(p)}
                onClick={() => togglePeriod(p)}
                count={
                  orders.filter(
                    (o) => orderDateISO(o) === date && orderPeriodKey(o) === p,
                  ).length
                }
              >
                {periodLabel(p)}
              </Chip>
            ))}
          </div>
        )}

        <div className="toolbar-end small dim">
          {total} ticket(s) le {formatDayMonth(date)}
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <SkBoard />
      ) : total === 0 ? (
        <div className="card">
          <Empty
            icon="inbox"
            title={`Aucune commande le ${formatDayMonth(date)}`}
            hint="Changez de date ou attendez les prochaines commandes — la vue se met a jour en direct."
          />
        </div>
      ) : (
        <div className="board">
          {columns.map((col) => (
            <section className={`column column-${col.key}`} key={col.key}>
              <div className="column-head">
                <span className="column-dot" />
                <span className="column-title">{col.title}</span>
                <span className="badge">{col.rows.length}</span>
              </div>
              <div className="column-body">
                {col.rows.length === 0 ? (
                  <p className="column-empty">Rien ici</p>
                ) : (
                  col.rows.map(({ head, group }) => (
                    <OrderTicket
                      key={head.id}
                      head={head}
                      group={group}
                      onOpen={setOpenRow}
                      onAdvance={advanceGroup}
                      busy={busyId === head.id}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {(counts.past > 0 || counts.future > 0) && (
        <div className="notice-row">
          {counts.past > 0 && (
            <button
              type="button"
              className="notice notice-past"
              onClick={() => setDate(lastBefore(dates, date) || date)}
            >
              <span className="notice-count">{counts.past}</span>
              <span className="stacked grow">
                <span className="strong">Commandes passees non traitees</span>
                <span className="small dim">Aller a la date concernee</span>
              </span>
              <Icon name="chevronRight" size={16} />
            </button>
          )}
          {counts.future > 0 && (
            <button
              type="button"
              className="notice notice-future"
              onClick={() => setDate(firstAfter(dates, date) || date)}
            >
              <span className="notice-count">{counts.future}</span>
              <span className="stacked grow">
                <span className="strong">Commandes a venir</span>
                <span className="small dim">Pas encore traitees</span>
              </span>
              <Icon name="chevronRight" size={16} />
            </button>
          )}
        </div>
      )}

      {dates.length > 1 && (
        <>
          <div className="section-head">
            <h3>Autres dates</h3>
          </div>
          <div className="chip-row">
            {dates.map((d) => (
              <Chip
                key={d}
                active={d === date}
                onClick={() => setDate(d)}
                count={
                  orders.filter(
                    (o) =>
                      orderDateISO(o) === d &&
                      STATUS_MAP.pending.includes(o.status),
                  ).length || undefined
                }
              >
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

/** Date non traitee la plus proche avant `date`. */
function lastBefore(dates, date) {
  return [...dates].filter((d) => d < date).sort().pop();
}

/** Date non traitee la plus proche apres `date`. */
function firstAfter(dates, date) {
  return [...dates].filter((d) => d > date).sort().shift();
}
