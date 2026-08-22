// Portefeuille — solde, activite par jour, journal des transactions.
// Le graphe donne la forme de la periode, le tableau reste la vue exhaustive.
import { useEffect, useState } from "react";
import {
  merchantService,
  formatXAF,
  formatFullDate,
  formatDayMonth,
} from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Alert, Empty, Kpi, KpiBand, Segmented, SkTable } from "../components/ui.jsx";
import { BarChart } from "../components/Chart.jsx";

const PERIODS = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
];

export default function Wallet() {
  const { transactions } = useMerchant();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    merchantService
      .getWalletStats(period)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Stats indisponibles.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const series = stats?.series || [];
  const maxNet = Math.max(1, ...series.map((s) => Math.abs(s.net)));

  return (
    <>
      <div className="toolbar">
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <SkTable rows={5} cols={4} />
      ) : (
        !error && (
          <>
            <KpiBand>
              <Kpi
                lead
                icon="wallet"
                label="Solde actuel"
                value={formatXAF(stats?.balance)}
                foot={period === "week" ? "Sur la semaine" : "Sur le mois"}
              />
              <Kpi icon="trend" label="Gains" value={formatXAF(stats?.totals?.payin)} />
              <Kpi icon="swap" label="Retraits" value={formatXAF(stats?.totals?.payout)} />
              <Kpi icon="chart" label="Net" value={formatXAF(stats?.totals?.net)} />
            </KpiBand>

            {series.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-head">
                  <div className="stacked">
                    <h2>Gains encaisses</h2>
                    <span className="tiny dim">Par jour sur la periode</span>
                  </div>
                </div>
                <div className="card-pad">
                  <BarChart
                    data={series.map((d) => ({
                      label: formatDayMonth(d.period).split(" ")[0],
                      title: formatDayMonth(d.period),
                      value: d.payin,
                    }))}
                    format={formatXAF}
                    height={150}
                  />
                </div>
              </div>
            )}

            <div className="section-head">
              <h2>Activite par jour</h2>
            </div>
            <div className="card">
              {series.length === 0 ? (
                <Empty icon="inbox" title="Aucun mouvement sur la periode" />
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Jour</th>
                        <th className="right">Gains</th>
                        <th className="right">Retraits</th>
                        <th className="right">Net</th>
                        <th style={{ width: 150 }}>Repartition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.map((d) => (
                        <tr key={d.period}>
                          <td className="nowrap">{formatDayMonth(d.period)}</td>
                          <td className="right num">{formatXAF(d.payin)}</td>
                          <td className="right num">{formatXAF(d.payout)}</td>
                          <td className="right num strong">
                            <span className={d.net >= 0 ? "pill pill-done" : "pill pill-danger"}>
                              {formatXAF(d.net)}
                            </span>
                          </td>
                          <td>
                            <div className="meter">
                              <span
                                style={{
                                  width: `${(Math.abs(d.net) / maxNet) * 100}%`,
                                  background:
                                    d.net >= 0
                                      ? "var(--done-mark)"
                                      : "var(--danger-mark)",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}

      <div className="section-head">
        <h2>Transactions</h2>
        <span className="small dim">{transactions.length} mouvement(s)</span>
      </div>
      <div className="card">
        {transactions.length === 0 ? (
          <Empty icon="wallet" title="Aucune transaction" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Libelle</th>
                  <th>Moyen</th>
                  <th className="right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="nowrap small">{formatFullDate(t.createdAt)}</td>
                    <td className="strong">{t.name}</td>
                    <td className="dim">{t.payBy || "—"}</td>
                    <td className="right num strong">
                      <span className={t.type === "debit" ? "pill pill-danger" : "pill pill-done"}>
                        {t.type === "debit" ? "−" : "+"}
                        {formatXAF(t.amount)}
                      </span>
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
