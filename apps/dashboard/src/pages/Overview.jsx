// Vue d'ensemble — ce qu'il faut savoir en entrant : combien on a fait
// aujourd'hui, ce qui attend d'etre servi, et la tendance de la semaine.
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  formatXAF,
  formatDayMonth,
  orderDateISO,
  filterOrders,
  groupBySlot,
  untreatedCounts,
  todayISO,
  orderTotal,
  nextStatus,
} from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Btn, Empty, Kpi, KpiBand, SkBoard } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import { BarChart } from "../components/Chart.jsx";
import OrderTicket from "../features/orders/OrderTicket.jsx";

const DONE = ["completed", "finished", "delivered"];

export default function Overview() {
  const { orders, menus, stats, loading, updateStatus } = useMerchant();
  const navigate = useNavigate();
  const today = todayISO();

  const todayOrders = useMemo(
    () => orders.filter((o) => orderDateISO(o) === today),
    [orders, today],
  );

  const todayRevenue = todayOrders
    .filter((o) => DONE.includes(o.status))
    .reduce((acc, o) => acc + orderTotal(o), 0);

  // File d'attente : les prochains clients a servir, dans l'ordre de rang.
  const queue = useMemo(
    () =>
      groupBySlot(
        filterOrders(orders, { statusKey: "pending", date: today, periods: [] }),
      ).slice(0, 6),
    [orders, today],
  );

  // Recette encaissee sur les 7 derniers jours.
  const week = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(`${today}T12:00:00`);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().substring(0, 10);
      days.push({
        label: formatDayMonth(iso).split(" ")[0],
        title: formatDayMonth(iso),
        value: orders
          .filter((o) => orderDateISO(o) === iso && DONE.includes(o.status))
          .reduce((acc, o) => acc + orderTotal(o), 0),
      });
    }
    return days;
  }, [orders, today]);

  const counts = untreatedCounts(orders, today);

  if (loading && orders.length === 0) return <SkBoard columns={2} cards={2} />;

  return (
    <>
      <KpiBand>
        <Kpi
          lead
          icon="wallet"
          label="Recette du jour"
          value={formatXAF(todayRevenue)}
          foot={`${todayOrders.filter((o) => DONE.includes(o.status)).length} commande(s) encaissee(s) · ${formatDayMonth(today)}`}
        />
        <Kpi icon="orders" label="Commandes du jour" value={todayOrders.length} />
        <Kpi icon="clock" label="En attente" value={stats.pendingOrders} />
        <Kpi icon="menus" label="Menus actifs" value={menus.length} />
      </KpiBand>

      {(counts.past > 0 || counts.future > 0) && (
        <div className="notice-row notice-row-top">
          {counts.past > 0 && (
            <Link to="/commandes" className="notice notice-past">
              <span className="notice-count">{counts.past}</span>
              <span className="stacked grow">
                <span className="strong">Commandes passees non traitees</span>
                <span className="small dim">A rattraper</span>
              </span>
              <Icon name="chevronRight" size={16} />
            </Link>
          )}
          {counts.future > 0 && (
            <Link to="/commandes" className="notice notice-future">
              <span className="notice-count">{counts.future}</span>
              <span className="stacked grow">
                <span className="strong">Commandes a venir</span>
                <span className="small dim">Deja enregistrees</span>
              </span>
              <Icon name="chevronRight" size={16} />
            </Link>
          )}
        </div>
      )}

      <div className="board board-split">
        <section className="column column-pending">
          <div className="column-head">
            <span className="column-dot" />
            <span className="column-title">File d'attente</span>
            <span className="badge">{queue.length}</span>
            <Link to="/commandes" className="btn btn-ghost btn-sm push">
              Tout voir
              <Icon name="arrowRight" size={13} />
            </Link>
          </div>
          <div className="column-body">
            {queue.length === 0 ? (
              <Empty
                icon="checkCircle"
                title="Rien en attente"
                hint="Toutes les commandes du jour sont traitees."
                action={
                  <Btn size="sm" icon="pos" onClick={() => navigate("/caisse")}>
                    Ouvrir la caisse
                  </Btn>
                }
              />
            ) : (
              queue.map(({ head, group }) => (
                <OrderTicket
                  key={head.id}
                  head={head}
                  group={group}
                  onOpen={() => navigate("/commandes")}
                  onAdvance={(g) => {
                    const target = nextStatus(g[0].status);
                    return target
                      ? Promise.all(g.map((o) => updateStatus(o.id, target)))
                      : undefined;
                  }}
                />
              ))
            )}
          </div>
        </section>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <div className="stacked">
                <h2>Recette encaissee</h2>
                <span className="tiny dim">7 derniers jours</span>
              </div>
              <span className="pill pill-plain">
                {formatXAF(week.reduce((a, d) => a + d.value, 0))}
              </span>
            </div>
            <div className="card-pad">
              <BarChart data={week} format={formatXAF} height={148} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Total boutique</h2>
            </div>
            <table className="table">
              <tbody>
                <tr>
                  <td className="dim">Commandes servies</td>
                  <td className="right num strong">{stats.completedOrders}</td>
                </tr>
                <tr>
                  <td className="dim">Commandes totales</td>
                  <td className="right num strong">{stats.totalOrders}</td>
                </tr>
                <tr>
                  <td className="dim">Recette cumulee</td>
                  <td className="right num strong">{formatXAF(stats.totalRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
