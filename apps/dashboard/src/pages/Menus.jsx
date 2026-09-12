// Menus — reproduction de « Dashboard Menu md screen v3 ».
//
// La structure, les etats et les libelles sont ceux du design :
//   colonne gauche : chips de filtre, compteur + tri, liste scrollable
//   colonne centre : galerie (hero + 3 vignettes), titre, 4 faits, panneau
//                    Details/Extras/Boissons, carte prix + carte suivi
//   colonne droite : rail de configuration boutique
// Les donnees viennent de MerchantContext ; seules les valeurs absentes du
// modele (suivi mensuel, nombre de photos) sont neutralisees plutot
// qu'inventees.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatXAF } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Btn, Empty, SkCards } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import MenuForm from "../features/menus/MenuForm.jsx";

// L'API (/menu/:fastFoodId) renvoie `name`, `status`, `prices[]`, `extra[]`,
// `drink[]`, `images[]` et `coverImage`. Les champs a plat (titre, prix1..3,
// disponibilite) existent encore dans le schema mais arrivent toujours nuls :
// on lit donc la forme reelle d'abord, avec repli sur l'ancienne.
const isAvailable = (m) => {
  if (m.status) return m.status === "available";
  return !(m.disponibilite === "false" || m.disponibilite === false);
};
const nameOf = (m) => m.name || m.titre || "Sans titre";

// Image principale puis galerie.
const imagesOf = (m) => {
  const all = [m.coverImage, ...(Array.isArray(m.images) ? m.images : []), m.image];
  return [...new Set(all.filter(Boolean))];
};

// Les paliers de prix : `prices[]` cote API, sinon les champs a plat.
const pricesOf = (m) => {
  if (Array.isArray(m.prices) && m.prices.length)
    return m.prices
      .map((p) => ({ price: Number(p.price) || 0, description: p.description }))
      .filter((p) => p.price > 0);
  return [
    { price: Number(m.prix1) || 0, description: m.optionPrix1 },
    { price: Number(m.prix2) || 0, description: m.optionPrix2 },
    { price: Number(m.prix3) || 0, description: m.optionPrix3 },
  ].filter((p) => p.price > 0);
};

// Trois emplacements affiches dans la carte, remplis ou non.
const priceSlotsOf = (m) => {
  const filled = pricesOf(m);
  return [0, 1, 2].map((i) => filled[i] || { price: 0, description: null });
};

// `extra[]` / `drink[]` sont des objets { name, status } cote API.
const listOf = (v) => {
  if (Array.isArray(v))
    return v.map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim());
  return [];
};
const extrasOf = (m) => listOf(m.extra || m.extras);
const drinksOf = (m) => listOf(m.drink || m.drinks || m.boissons);

// Seules les chips qui filtrent reellement sont affichees.
const CHIPS = [
  { label: "Disponible", key: "available" },
  { label: "Indisponible", key: "unavailable" },
];

const SORTS = ["Plus recents", "Prix croissant", "Prix decroissant", "Stock"];

const Star = ({ filled = true }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#f5a524" : "#dce0e7"}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
  </svg>
);

/* Liste a puces bornee a 3 lignes. Au-dela, le troisieme element porte un
   +N qui dit combien d'autres existent — la liste ne s'allonge jamais. */
function BulletList({ items, tone }) {
  const shown = items.slice(0, 3);
  const rest = items.length - shown.length;
  // Les lignes manquantes sont comblees par des traits : le panneau garde
  // la meme hauteur qu'il y ait 0, 1 ou 3 elements.
  const fillers = 3 - shown.length;

  return (
    <ul className="detail-bullets">
      {shown.map((label, i) => {
        const last = i === shown.length - 1;
        return (
          <li key={label}>
            {last && rest > 0 && <span className="detail-more-count">+{rest}</span>}
            <span className={`bullet ${tone}`} />
            <span className="truncate">{label}</span>
          </li>
        );
      })}
      {Array.from({ length: fillers }).map((_, i) => (
        <li className="detail-bullet-empty" key={`f-${i}`}>
          <span className="detail-dash" />
        </li>
      ))}
    </ul>
  );
}

const Chevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function Menus() {
  const { menus, boutique, loading, addMenu } = useMerchant();
  const [params, setParams] = useSearchParams();
  // `editing` vaut null pour une creation, le menu a modifier sinon.
  const [editing, setEditing] = useState(null);
  const [selId, setSelId] = useState(null);
  const [details, setDetails] = useState(true);
  const [sort, setSort] = useState(SORTS[0]);
  const [sortOpen, setSortOpen] = useState(false);

  // La vue est pilotee par le sous-menu du rail, comme `st.view`.
  const view = params.get("vue") === "unavailable" ? "unavailable" : "available";
  const setView = (key) => {
    const next = new URLSearchParams(params);
    if (key === "available") next.delete("vue");
    else next.set("vue", key);
    setParams(next, { replace: true });
  };

  const shopName = boutique?.name || boutique?.nom || "Ma boutique";

  // Panneau de creation. Sa largeur est calculee en CSS (voir .mpanel) :
  // meme fraction que la colonne 3 de la grille.
  const [creating, setCreating] = useState(false);
  // Echap ferme le panneau.
  useEffect(() => {
    if (!creating) return;
    const onKey = (e) => e.key === "Escape" && setCreating(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creating]);

  const saveMenu = async (payload) => {
    await addMenu(payload);
    setEditing(null);
  };

  // `list` du design : disponibles ou indisponibles, puis tri.
  const list = useMemo(() => {
    const base = menus.filter((m) => (view === "unavailable" ? !isAvailable(m) : isAvailable(m)));
    const priceOf = (m) => pricesOf(m)[0]?.price || 0;
    const sorted = [...base];
    if (sort === "Prix croissant") sorted.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === "Prix decroissant") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    else if (sort === "Stock") sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    return sorted;
  }, [menus, view, sort]);

  // `sel` du design : l'element choisi, sinon le premier de la liste.
  useEffect(() => {
    if (!list.length) return setSelId(null);
    if (!list.some((m) => m.id === selId)) setSelId(list[0].id);
  }, [list, selId]);

  const sel = list.find((m) => m.id === selId) || list[0] || null;

  // Hauteur d'une ligne (86px de vignette + 2x12 de padding) + la gouttiere.
  const ROW_H = 110 + 12;
  const listRef = useRef(null);
  const [ghosts, setGhosts] = useState(0);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const fits = Math.floor((el.clientHeight + 12) / ROW_H);
      setGhosts(Math.max(0, fits + 1 - list.length));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [list.length, ROW_H]);

  if (loading && menus.length === 0) return <SkCards />;

  if (!menus.length) {
    return (
      <div className="card">
        <Empty
          icon="menus"
          title="Catalogue vide"
          hint="Ajoutez votre premier menu pour pouvoir encaisser au comptoir."
          action={
            <Btn
              variant="primary"
              size="sm"
              icon="plus"
              onClick={() => {
                setEditing(null);
              }}
            >
              Ajouter un menu
            </Btn>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="menus-screen">
        {/* ── Colonne gauche : chips + compteur + liste ─────────────── */}
        <section className="menus-list-pane">
          <div className="menus-chips">
            <div className="menus-chips-group">
              {CHIPS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={view === c.key ? "menu-chip active" : "menu-chip"}
                  onClick={() => setView(c.key)}
                >
                  <span>{c.label}</span>
                  <Chevron />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="menu-new"
              onClick={() => setCreating(true)}
            >
              <Icon name="plus" size={14} />
              <span>Nouveau menu</span>
            </button>
          </div>

          <div className="menus-count">
            <div className="menus-count-label">
              <span className="menus-count-num">{list.length}</span> plats{" "}
              {view === "unavailable" ? "indisponibles" : "disponibles"}
            </div>
            <div className="menus-sort">
              <button type="button" onClick={() => setSortOpen((v) => !v)}>
                <span>{sort}</span>
                <Chevron />
              </button>
              {sortOpen && (
                <div className="menus-sort-pop">
                  {SORTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={s === sort ? "active" : ""}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="menus-list" ref={listRef}>
            {list.map((m) => {
              const prices = pricesOf(m);
              const stock = Number(m.stock) || 0;
              const nExtras = extrasOf(m).length;
              const nDrinks = drinksOf(m).length;
              return (
                <button
                  type="button"
                  key={m.id}
                  className={m.id === sel?.id ? "menu-row active" : "menu-row"}
                  onClick={() => setSelId(m.id)}
                >
                  <span
                    className="menu-row-thumb"
                    style={
                      imagesOf(m)[0]
                        ? { backgroundImage: `url(${imagesOf(m)[0]})` }
                        : undefined
                    }
                  >
                    {!imagesOf(m)[0] && <Icon name="image" size={18} />}
                  </span>
                  <span className="menu-row-body">
                    <span className="menu-row-top">
                      <span className="menu-row-ident">
                        <span className="menu-row-rating">
                          <Star filled={(m.ratingCount || 0) > 0} />
                          {(m.ratingCount || 0) > 0 ? (
                            <>
                              <span className="menu-row-rating-note">
                                {Number(m.ratingAvg).toFixed(1)}
                              </span>
                              <span className="menu-row-rating-count">
                                ({m.ratingCount} avis)
                              </span>
                            </>
                          ) : (
                            <span className="menu-row-rating-count">Pas encore note</span>
                          )}
                        </span>
                        <span className="menu-row-name truncate">{nameOf(m)}</span>
                        <span className="menu-row-meta truncate">
                          {prices.length} format{prices.length > 1 ? "s" : ""}
                          {" \u00b7 "}
                          {nExtras} extra{nExtras > 1 ? "s" : ""}
                          {" \u00b7 "}
                          {nDrinks} boisson{nDrinks > 1 ? "s" : ""}
                        </span>
                      </span>
                      <span
                        className={isAvailable(m) ? "menu-row-dot on" : "menu-row-dot off"}
                        title={isAvailable(m) ? "Disponible" : "Indisponible"}
                      />
                    </span>
                    <span className="menu-row-foot">
                      <span className="menu-row-stock">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="1.8">
                          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
                          <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
                        </svg>
                        <span>{stock > 0 ? `${stock} en stock` : "Rupture"}</span>
                      </span>
                      <span className="menu-row-price">
                        {formatXAF(prices[0]?.price || 0)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}

            {Array.from({ length: ghosts }).map((_, i) => (
              <div className="menu-row ghost" key={`ghost-${i}`} aria-hidden="true">
                <span className="menu-row-thumb">
                  <Icon name="image" size={18} />
                </span>
                <span className="menu-row-body">
                  <span className="menu-row-top">
                    <span className="menu-row-ident">
                      <span className="menu-row-rating">
                        <Star filled={false} />
                        <span className="menu-row-rating-count">Non note</span>
                      </span>
                      <span className="menu-row-name truncate">Plat non defini</span>
                      <span className="menu-row-meta truncate">
                        0 format · 0 extra · 0 boisson
                      </span>
                    </span>
                    <span className="menu-row-dot ghost-dot" />
                  </span>
                  <span className="menu-row-foot">
                    <span className="menu-row-stock">Stock —</span>
                    <span className="menu-row-price">—</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="menus-rule" />

        {/* ── Colonne centre : fiche ────────────────────────────────── */}
        <section className="menus-detail">
          {sel && (
            <MenuDetail
              menu={sel}
              shopName={shopName}
              details={details}
              onToggleDetails={() => setDetails((d) => !d)}
            />
          )}
        </section>

        {/* ── Colonne droite : rail boutique ────────────────────────── */}
        <aside className="menus-rail">
          <ShopConfigRail menu={editing} onSave={saveMenu} onCancel={() => setEditing(null)} />
        </aside>
      </div>

      {creating && (
        <>
          <div className="mpanel-scrim" onClick={() => setCreating(false)} />
          <aside
            className="mpanel"
            role="dialog"
            aria-label="Nouveau menu"
          >
            <div className="mpanel-head">
              <span className="mpanel-title">Nouveau menu</span>
              <button
                type="button"
                className="mpanel-close"
                onClick={() => setCreating(false)}
                aria-label="Fermer"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <ShopConfigRail
              menu={null}
              onSave={async (payload) => {
                await saveMenu(payload);
                setCreating(false);
              }}
              onCancel={() => setCreating(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}

/* ── Fiche du plat ───────────────────────────────────────────────────── */

function MenuDetail({ menu, shopName, details, onToggleDetails }) {
  const prices = pricesOf(menu);
  const slots = priceSlotsOf(menu);
  const images = imagesOf(menu);
  // Index de la photo affichee en grand. Remis a zero quand on change de plat.
  const [shot, setShot] = useState(0);
  useEffect(() => setShot(0), [menu.id]);
  const heroIdx = Math.min(shot, Math.max(0, images.length - 1));
  // L'API porte le descriptif dans le premier palier de prix.
  const description = menu.description || prices[0]?.description || "";
  const extras = extrasOf(menu);
  const drinks = drinksOf(menu);
  const hasStock = menu.stock !== undefined && menu.stock !== null && menu.stock !== "";
  const stock = Number(menu.stock) || 0;
  // stockMax = 40, comme le design.
  const pct = Math.min(100, Math.round((stock / 40) * 100));

  const facts = [
    { label: "Formats", value: `${prices.length} tarif${prices.length > 1 ? "s" : ""}` },
    { label: "Stock", value: `${stock} plats` },
    { label: "Extras", value: `${extras.length} options` },
    { label: "Boissons", value: `${drinks.length} refs` },
  ];
  const factPaths = [
    ["M4 7a2 2 0 012-2h8l6 6-8 8-6-6z", "M9.5 9.5h.01"],
    ["M12 3l8 4.5v9L12 21l-8-4.5v-9z", "M4 7.5l8 4.5 8-4.5M12 12v9"],
    ["M12 5v14M5 12h14"],
    ["M6 4h12l-1.5 5.5A5 5 0 0112 21a5 5 0 01-4.5-11.5z", "M8 9h8"],
  ];

  return (
    <>
      {/* Galerie : hero + colonne de 3 vignettes, 132px comme le design. */}
      <div className="detail-gallery">
        <div
          className="detail-hero"
          style={
            images[heroIdx] ? { backgroundImage: `url(${images[heroIdx]})` } : undefined
          }
        >
          {!images[heroIdx] && <Icon name="image" size={28} />}
          <span className="detail-photo-count">
            {images.length ? `${heroIdx + 1} / ${images.length}` : "0 photo"}
          </span>
        </div>
        <div className="detail-thumbs">
          {[0, 1, 2].map((i) => {
            const src = images[i];
            if (!src)
              return (
                <div className="detail-thumb" key={i}>
                  <Icon name="image" size={16} />
                </div>
              );
            return (
              <button
                type="button"
                key={i}
                className={i === heroIdx ? "detail-thumb active" : "detail-thumb"}
                style={{ backgroundImage: `url(${src})` }}
                onClick={() => setShot(i)}
                aria-label={`Afficher la photo ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      <div className="detail-head">
        <div className="detail-title">
          <div className="detail-name">{nameOf(menu)}</div>
          <div className="detail-shop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="1.7">
              <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {shopName}
          </div>
        </div>
        <div className="detail-facts">
          {facts.map((f, i) => (
            <div className="detail-fact" key={f.label}>
              <span className="detail-fact-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.7">
                  {factPaths[i].map((d, j) => (
                    <path key={j} d={d} />
                  ))}
                </svg>
              </span>
              <span className="detail-fact-text">
                <span className="detail-fact-label">{f.label}</span>
                <span className="detail-fact-value">{f.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau Details / Extras / Boissons. */}
      <div className="detail-panels">
        <div className="detail-panel">
          <button type="button" className="detail-panel-toggle" onClick={onToggleDetails}>
            <span className="detail-panel-label">DETAILS DU PLAT</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a2aab6"
              strokeWidth="2"
              style={{
                transition: "transform .2s",
                transform: `rotate(${details ? 180 : 0}deg)`,
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {details && (
            <>
              <p className="detail-desc">
                {description || "Aucune description renseignee pour ce plat."}
              </p>
              <button type="button" className="detail-more">
                {description ? "Voir plus" : "Ajouter"}
              </button>
            </>
          )}
        </div>
        <div className="detail-panel-rule" />
        <div className="detail-panel">
          <div className="detail-panel-label">EXTRAS</div>
          <BulletList items={extras} tone="accent" />
        </div>
        <div className="detail-panel-rule" />
        <div className="detail-panel">
          <div className="detail-panel-label">BOISSONS</div>
          <BulletList items={drinks} tone="info" />
        </div>
      </div>

      {/* Carte prix + carte suivi. */}
      <div className="detail-cards">
        <div className="detail-price-card">
          <div className="detail-price-title">Prix par format</div>
          <div className="detail-price-sub">
            {prices.length ? (
              `A partir de ${formatXAF(prices[0].price)}`
            ) : (
              <>
                A partir de <span className="detail-dash price" />
              </>
            )}
          </div>
          <div className="detail-price-list">
            {slots.map((p, i) => (
              <div className="detail-price-row" key={i}>
                <span className="truncate">{p.description || `Format ${i + 1}`}</span>
                {p.price > 0 ? (
                  <span className="detail-price-value">{formatXAF(p.price)}</span>
                ) : (
                  <span className="detail-dash price" />
                )}
              </div>
            ))}
          </div>

          <div className="detail-stock-bar">
            {hasStock && (
              <>
                <span className="detail-stock-fill" style={{ width: `${pct}%` }} />
                <span className="detail-stock-knob" style={{ left: `${pct}%` }} />
              </>
            )}
          </div>
          <div className="detail-stock-foot">
            <span>
              {hasStock ? (
                <span className="detail-stock-num">{stock}</span>
              ) : (
                <span className="detail-dash price" />
              )}{" "}
              plats en stock
            </span>
            {hasStock ? <span>{pct}%</span> : <span className="detail-dash price" />}
          </div>
        </div>

        <div className="detail-track-card">
          <div className="detail-track-title">Suivi</div>
          <div className="detail-track-empty">
            Le suivi mensuel des ventes par plat n'est pas encore disponible.
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Rail de configuration boutique ─────────────────────────────────── */

function ShopConfigRail({ menu, onSave, onCancel }) {
  const [step, setStep] = useState("main");
  const tabs = [
    { id: "main", label: "Le plat" },
    { id: "items", label: "Extras & boissons" },
  ];

  return (
    <>
      <div className="rail-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={step === t.id ? "rail-tab active" : "rail-tab"}
            onClick={() => setStep(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <MenuForm menu={menu} onSave={onSave} onCancel={onCancel} step={step} />
    </>
  );
}
