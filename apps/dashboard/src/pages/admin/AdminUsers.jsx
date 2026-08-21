// Admin — utilisateurs de la plateforme.
// Le backend n'expose pas d'endpoint de listing global : on derive les comptes
// depuis les proprietaires de boutiques et les clients vus dans les commandes.
import { useEffect, useMemo, useState } from "react";
import { adminService, orderDateISO, orderTotal, formatXAF } from "@yaammoo/shared";
import { Stat, Empty, Loading } from "../../components/ui.jsx";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shops = await adminService.getFastFoods();
        if (cancelled) return;
        const orders = await adminService.getAllOrders(shops.map((s) => s.id));
        if (cancelled) return;

        const byKey = new Map();

        for (const s of shops) {
          const o = s.owner;
          if (!o) continue;
          const key = o.uid || o.id || o.infos?.email;
          if (!key) continue;
          byKey.set(key, {
            key,
            nom: o.infos?.nom || o.infos?.email || "—",
            email: o.infos?.email || "",
            numero: o.infos?.numero || "",
            role: "Marchand",
            shop: s.name || s.nom,
            orders: 0,
            volume: 0,
            lastSeen: "",
          });
        }

        for (const order of orders) {
          const key = order.userId || order.userData?.infos?.email;
          if (!key) continue;
          const existing = byKey.get(key);
          const date = orderDateISO(order);
          if (existing) {
            existing.orders += 1;
            existing.volume += orderTotal(order);
            if (date > existing.lastSeen) existing.lastSeen = date;
          } else {
            byKey.set(key, {
              key,
              nom:
                order.userData?.infos?.nom ||
                order.userData?.nom ||
                order.userData?.email ||
                "Client",
              email: order.userData?.infos?.email || order.userData?.email || "",
              numero: order.userData?.infos?.numero || order.delivery?.phone || "",
              role: "Client",
              shop: "",
              orders: 1,
              volume: orderTotal(order),
              lastSeen: date,
            });
          }
        }

        setRows([...byKey.values()].sort((a, b) => b.orders - a.orders));
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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.nom.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        String(r.numero).includes(q),
    );
  }, [rows, search]);

  const merchants = rows.filter((r) => r.role === "Marchand").length;

  if (loading) return <Loading label="Chargement des utilisateurs..." />;
  if (error)
    return (
      <div className="card card-pad" style={{ color: "var(--danger)" }}>
        ❌ {error}
      </div>
    );

  return (
    <>
      <div className="stat-grid">
        <Stat label="Comptes identifies" value={rows.length} />
        <Stat label="Marchands" value={merchants} />
        <Stat label="Clients" value={rows.length - merchants} />
      </div>

      <input
        className="input"
        style={{ maxWidth: 320, marginBottom: 13 }}
        placeholder="Rechercher un utilisateur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card">
        {visible.length === 0 ? (
          <Empty title="Aucun utilisateur" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th className="right">Commandes</th>
                  <th className="right">Volume</th>
                  <th>Derniere activite</th>
                </tr>
              </thead>
              <tbody>
                {visible.slice(0, 300).map((r) => (
                  <tr key={r.key}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.nom}</div>
                      {r.shop && <div className="small dim">{r.shop}</div>}
                    </td>
                    <td className="small">
                      <div>{r.email || "—"}</div>
                      <div className="dim">{r.numero || ""}</div>
                    </td>
                    <td>
                      <span className={`pill ${r.role === "Marchand" ? "process" : ""}`}>
                        {r.role}
                      </span>
                    </td>
                    <td className="right mono">{r.orders}</td>
                    <td className="right mono">{formatXAF(r.volume)}</td>
                    <td className="small dim">{r.lastSeen || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="small dim" style={{ marginTop: 11 }}>
        NOTE : liste derivee des boutiques et des commandes. Un endpoint backend
        de listing des comptes donnerait une vue exhaustive (utilisateurs sans
        commande compris).
      </div>
    </>
  );
}
