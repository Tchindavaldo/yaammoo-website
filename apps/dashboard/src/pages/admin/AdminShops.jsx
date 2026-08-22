// Admin — toutes les boutiques de la plateforme, en grille de cartes.
// "Piloter" bascule le contexte marchand sur la boutique choisie : Commandes,
// Menus et Caisse travaillent alors sur cette boutique.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@yaammoo/shared";
import { useMerchant } from "../../features/merchant/MerchantContext.jsx";
import {
  Alert,
  Avatar,
  Btn,
  Empty,
  Kpi,
  KpiBand,
  Search,
  SkCards,
} from "../../components/ui.jsx";

export default function AdminShops() {
  const { setOverrideFastFoodId, overrideFastFoodId } = useMerchant();
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
    return shops.filter((s) => (s.name || s.nom || "").toLowerCase().includes(q));
  }, [shops, search]);

  const pilot = (id) => {
    setOverrideFastFoodId(id);
    navigate("/commandes");
  };

  if (loading) return <SkCards count={6} />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <KpiBand>
        <Kpi lead icon="shops" label="Boutiques" value={shops.length} foot="Sur la plateforme" />
        <Kpi
          icon="menus"
          label="Menus cumules"
          value={shops.reduce((a, s) => a + (s.menu?.length || 0), 0)}
        />
        <Kpi
          icon="orders"
          label="Commandes cumulees"
          value={shops.reduce((a, s) => a + (s.orders?.length || 0), 0)}
        />
        <Kpi
          icon="pos"
          label="Boutique pilotee"
          value={overrideFastFoodId ? "1" : "—"}
        />
      </KpiBand>

      <div className="toolbar">
        <Search value={search} onChange={setSearch} placeholder="Rechercher une boutique..." />
        {overrideFastFoodId && (
          <div className="toolbar-end">
            <Btn size="sm" icon="swap" onClick={() => setOverrideFastFoodId(null)}>
              Revenir a ma boutique
            </Btn>
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <Empty icon="shops" title="Aucune boutique" hint="Aucun resultat pour cette recherche." />
        </div>
      ) : (
        <div className="card-grid">
          {visible.map((s) => {
            const name = s.name || s.nom || "Boutique";
            const active = overrideFastFoodId === s.id;
            return (
              <article className="card card-pad stack" key={s.id}>
                <div className="row">
                  <Avatar name={name} className="shop-avatar" />
                  <div className="stacked grow">
                    <span className="strong truncate">{name}</span>
                    <span className="tiny dim truncate">
                      {s.owner?.infos?.nom || s.owner?.infos?.email || "Proprietaire inconnu"}
                    </span>
                  </div>
                  {active && <span className="pill pill-accent">Pilotee</span>}
                </div>

                <div className="row" style={{ gap: 18 }}>
                  <span className="stacked">
                    <span className="tiny dim">Menus</span>
                    <span className="strong num">{s.menu?.length || 0}</span>
                  </span>
                  <span className="stacked">
                    <span className="tiny dim">Commandes</span>
                    <span className="strong num">{s.orders?.length || 0}</span>
                  </span>
                </div>

                <Btn
                  size="sm"
                  icon="arrowRight"
                  block
                  variant={active ? "ghost" : "default"}
                  onClick={() => pilot(s.id)}
                >
                  {active ? "Deja pilotee" : "Piloter cette boutique"}
                </Btn>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
