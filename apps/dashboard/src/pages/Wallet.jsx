// Portefeuille — solde, gains/retraits par jour, transactions.
// Portage de PorteFeuillePanel + walletStatsService (app RN).
import { useEffect, useState } from "react";
import {
  merchantService,
  formatXAF,
  formatFullDate,
  formatDayMonth,
} from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Stat, Empty, Loading } from "../components/ui.jsx";

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
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="chip-row">
          <button
            className={`chip${period === "week" ? " active" : ""}`}
            onClick={() => setPeriod("week")}
            type="button"
          >
            Semaine
          </button>
          <button
            className={`chip${period === "month" ? " active" : ""}`}
            onClick={() => setPeriod("month")}
            type="button"
          >
            Mois
          </button>
        </div>
      </div>

      {loading ? (
        <Loading label="Chargement du portefeuille..." />
      ) : error ? (
        <div className="card card-pad">
          <div style={{ color: "var(--danger)" }}>❌ {error}</div>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <Stat label="Solde actuel" value={formatXAF(stats?.balance)} small />
            <Stat label="Gains" value={formatXAF(stats?.totals?.payin)} small />
            <Stat label="Retraits" value={formatXAF(stats?.totals?.payout)} small />
            <Stat label="Net" value={formatXAF(stats?.totals?.net)} small />
          </div>

          <h2 className="section-title">Activite par jour</h2>
          <div className="card">
            {series.length === 0 ? (
              <Empty title="Aucun mouvement sur la periode" />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Jour</th>
                      <th className="right">Gains</th>
                      <th className="right">Retraits</th>
                      <th className="right">Net</th>
                      <th style={{ width: 160 }}>Repartition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {series.map((d) => (
                      <tr key={d.period}>
                        <td>{formatDayMonth(d.period)}</td>
                        <td className="right mono">{formatXAF(d.payin)}</td>
                        <td className="right mono">{formatXAF(d.payout)}</td>
                        <td
                          className="right mono"
                          style={{
                            fontWeight: 650,
                            color: d.net >= 0 ? "var(--done)" : "var(--danger)",
                          }}
                        >
                          {formatXAF(d.net)}
                        </td>
                        <td>
                          <div
                            style={{
                              height: 7,
                              borderRadius: 4,
                              background: "var(--surface-2)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(Math.abs(d.net) / maxNet) * 100}%`,
                                height: "100%",
                                background:
                                  d.net >= 0 ? "var(--done)" : "var(--danger)",
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
      )}

      <h2 className="section-title">Transactions</h2>
      <div className="card">
        {transactions.length === 0 ? (
          <Empty title="Aucune transaction" />
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
                    <td>{formatFullDate(t.createdAt)}</td>
                    <td>{t.name}</td>
                    <td className="dim">{t.payBy || "—"}</td>
                    <td
                      className="right mono"
                      style={{
                        fontWeight: 650,
                        color: t.type === "debit" ? "var(--danger)" : "var(--done)",
                      }}
                    >
                      {t.type === "debit" ? "−" : "+"}
                      {formatXAF(t.amount)}
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
