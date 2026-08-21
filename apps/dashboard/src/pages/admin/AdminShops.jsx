// Admin — toutes les boutiques de la plateforme.
// "Piloter" bascule le contexte marchand sur la boutique choisie : les ecrans
// Commandes / Menus / Caisse travaillent alors sur cette boutique.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@yaammoo/shared";
import { useMerchant } from "../../features/merchant/MerchantContext.jsx";
import { Stat, Empty, Loading } from "../../components/ui.jsx";

export default function AdminShops() {
  const { setOverrideFastFoodId, fastFoodId } = useMerchant();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminService
      .getFastFoods()
      .then((data) => !cancelled && setShops(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((s) =>
      (s.name || s.nom || "").toLowerCase().includes(q),
    );
  }, [shops, search]);

  const pilot = (id) => {
    setOverrideFastFoodId(id);
    navigate("/commandes");
  };

  if (loading) return <Loading label="Chargement des boutiques..." />;
  if (error)
    return (
      <div className="card card-pad" style={{ color: "var(--danger)" }}>
        ❌ {error}
      </div>
    );

  return (
    <>
      <div className="stat-grid">
        <Stat label="Boutiques" value={shops.length} />
        <Stat
          label="Menus au total"
          value={shops.reduce((a, s) => a + (s.menu?.length || 0), 0)}
        />
      </div>

      <div className="row-between" style={{ marginBottom: 12 }}>
        <input
          className="input"
          style={{ maxWidth: 300 }}
          placeholder="Rechercher une boutique..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {fastFoodId && (
          <button
            className="btn sm"
            onClick={() => setOverrideFastFoodId(null)}
            type="button"
          >
            Revenir a ma boutique
          </button>
        )}
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <Empty title="Aucune boutique" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Proprietaire</th>
                  <th className="right">Menus</th>
                  <th className="right">Commandes</th>
                  <th style={{ width: 110 }} className="no-print"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name || s.nom}</div>
                      <div className="small dim mono">{s.id}</div>
                    </td>
                    <td className="small">
                      {s.owner?.infos?.nom || s.owner?.infos?.email || "—"}
                    </td>
                    <td className="right mono">{s.menu?.length || 0}</td>
                    <td className="right mono">{s.orders?.length || 0}</td>
                    <td className="no-print">
                      <button
                        className="btn sm"
                        onClick={() => pilot(s.id)}
                        type="button"
                      >
                        Piloter
                      </button>
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
