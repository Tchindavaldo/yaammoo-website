// Admin — utilisateurs de la plateforme.
// Le backend n'expose pas d'endpoint de listing global : la liste est derivee
// des proprietaires de boutiques et des clients vus dans les commandes.
import { useEffect, useMemo, useState } from "react";
import { adminService, orderDateISO, orderTotal, formatXAF } from "@yaammoo/shared";
import {
  Alert,
  Avatar,
  Empty,
  Kpi,
  KpiBand,
  Search,
  SkTable,
} from "../../components/ui.jsx";

const LIMIT = 300;

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
  const volume = rows.reduce((a, r) => a + r.volume, 0);

  if (loading) return <SkTable rows={8} cols={6} />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <KpiBand>
        <Kpi
          lead
          icon="users"
          label="Comptes identifies"
          value={rows.length}
          foot="Derives des boutiques et des commandes"
        />
        <Kpi icon="shops" label="Marchands" value={merchants} />
        <Kpi icon="user" label="Clients" value={rows.length - merchants} />
        <Kpi icon="wallet" label="Volume genere" value={formatXAF(volume)} />
      </KpiBand>

      <div className="toolbar">
        <Search value={search} onChange={setSearch} placeholder="Nom, email ou telephone..." />
        <span className="small dim">{visible.length} resultat(s)</span>
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <Empty icon="users" title="Aucun utilisateur" hint="Aucun compte ne correspond." />
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
                {visible.slice(0, LIMIT).map((r) => (
                  <tr key={r.key}>
                    <td>
                      <span className="client-cell">
                        <Avatar name={r.nom} />
                        <span className="stacked">
                          <span className="client-name truncate">{r.nom}</span>
                          {r.shop && <span className="tiny dim truncate">{r.shop}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="small">
                      <span className="stacked">
                        <span>{r.email || "—"}</span>
                        <span className="dim num">{r.numero || ""}</span>
                      </span>
                    </td>
                    <td>
                      <span className={r.role === "Marchand" ? "pill pill-process" : "pill"}>
                        {r.role}
                      </span>
                    </td>
                    <td className="right num strong">{r.orders}</td>
                    <td className="right num">{formatXAF(r.volume)}</td>
                    <td className="small dim nowrap">{r.lastSeen || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="small dim" style={{ marginTop: 12 }}>
        NOTE : liste derivee des boutiques et des commandes. Un endpoint backend
        de listing des comptes donnerait une vue exhaustive, utilisateurs sans
        commande compris.
      </p>
    </>
  );
}
