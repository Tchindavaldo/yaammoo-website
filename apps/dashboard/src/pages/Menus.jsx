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
import { useToast } from "../components/Toast.jsx";
import { Alert, Btn, Empty, Field, Modal, SkCards } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";

const isAvailable = (m) => !(m.disponibilite === "false" || m.disponibilite === false);
const nameOf = (m) => m.titre || m.name || "Sans titre";

// Les paliers de prix sont stockes a plat (prix1..prix3) : on les remet en
// liste, comme `prices` dans le design.
// Les trois emplacements de prix du modele, remplis ou non.
const priceSlotsOf = (m) => [
  { price: Number(m.prix1) || 0, description: m.optionPrix1 },
  { price: Number(m.prix2) || 0, description: m.optionPrix2 },
  { price: Number(m.prix3) || 0, description: m.optionPrix3 },
];

// Seuls les paliers effectivement tarifes.
const pricesOf = (m) => priceSlotsOf(m).filter((p) => p.price > 0);

const listOf = (v) => {
  if (Array.isArray(v))
    return v.map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim());
  return [];
};

// Seules les chips qui filtrent reellement sont affichees.
const CHIPS = [
  { label: "Disponible", key: "available" },
  { label: "Indisponible", key: "unavailable" },
];

const SORTS = ["Plus recents", "Prix croissant", "Prix decroissant", "Stock"];

const Chevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function Menus() {
  const { menus, boutique, loading, addMenu } = useMerchant();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
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
      setGhosts(Math.max(0, fits - list.length));
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
            <Btn variant="primary" size="sm" icon="plus" onClick={() => setOpen(true)}>
              Ajouter un menu
            </Btn>
          }
        />
        {open && <AddMenuModal onClose={() => setOpen(false)} onSave={addMenu} />}
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
            <button type="button" className="menu-new" onClick={() => setOpen(true)}>
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
              return (
                <button
                  type="button"
                  key={m.id}
                  className={m.id === sel?.id ? "menu-row active" : "menu-row"}
                  onClick={() => setSelId(m.id)}
                >
                  <span
                    className="menu-row-thumb"
                    style={m.image ? { backgroundImage: `url(${m.image})` } : undefined}
                  >
                    {!m.image && <Icon name="image" size={18} />}
                  </span>
                  <span className="menu-row-body">
                    <span className="menu-row-top">
                      <span className="menu-row-ident">
                        <span className="menu-row-shop truncate">{shopName}</span>
                        <span className="menu-row-name truncate">{nameOf(m)}</span>
                        <span className="menu-row-meta truncate">
                          {prices.length} format{prices.length > 1 ? "s" : ""}
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
                <span className="menu-row-thumb" />
                <span className="menu-row-body">
                  <span className="menu-row-top">
                    <span className="menu-row-ident">
                      <span className="ghost-dash sm" />
                      <span className="ghost-dash lg" />
                      <span className="ghost-dash sm" />
                    </span>
                    <span className="menu-row-dot ghost-dot" />
                  </span>
                  <span className="menu-row-foot">
                    <span className="ghost-dash sm" />
                    <span className="ghost-dash md" />
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
          <ShopConfigRail boutique={boutique} onAdd={() => setOpen(true)} />
        </aside>
      </div>

      {open && <AddMenuModal onClose={() => setOpen(false)} onSave={addMenu} />}
    </>
  );
}

/* ── Fiche du plat ───────────────────────────────────────────────────── */

function MenuDetail({ menu, shopName, details, onToggleDetails }) {
  const prices = pricesOf(menu);
  const slots = priceSlotsOf(menu);
  const extras = listOf(menu.extras);
  const drinks = listOf(menu.boissons || menu.drinks);
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
          style={menu.image ? { backgroundImage: `url(${menu.image})` } : undefined}
        >
          {!menu.image && <Icon name="image" size={28} />}
          <span className="detail-photo-count">{menu.image ? "1 / 1" : "0 photo"}</span>
        </div>
        <div className="detail-thumbs">
          {[0, 1, 2].map((i) => (
            <div className="detail-thumb" key={i}>
              <Icon name="image" size={16} />
            </div>
          ))}
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
                {menu.description || "Aucune description renseignee pour ce plat."}
              </p>
              <button type="button" className="detail-more">
                {menu.description ? "Voir plus" : "Ajouter"}
              </button>
            </>
          )}
        </div>
        <div className="detail-panel-rule" />
        <div className="detail-panel">
          <div className="detail-panel-label">EXTRAS</div>
          <ul className="detail-bullets">
            {extras.length
              ? extras.map((e) => (
                  <li key={e}>
                    <span className="bullet accent" />
                    <span className="truncate">{e}</span>
                  </li>
                ))
              : [0, 1, 2].map((i) => (
                  <li className="detail-bullet-empty" key={i}>
                    <span className="detail-dash" />
                  </li>
                ))}
          </ul>
        </div>
        <div className="detail-panel-rule" />
        <div className="detail-panel">
          <div className="detail-panel-label">BOISSONS</div>
          <ul className="detail-bullets">
            {drinks.length
              ? drinks.map((d) => (
                  <li key={d}>
                    <span className="bullet info" />
                    <span className="truncate">{d}</span>
                  </li>
                ))
              : [0, 1, 2].map((i) => (
                  <li className="detail-bullet-empty" key={i}>
                    <span className="detail-dash" />
                  </li>
                ))}
          </ul>
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

function ShopConfigRail({ boutique, onAdd }) {
  const [tab, setTab] = useState("config");
  const tabs = [
    { id: "config", label: "Boutique" },
    { id: "livraison", label: "Livraison" },
  ];

  return (
    <>
      <div className="rail-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "rail-tab active" : "rail-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rail-panel">
        {tab === "config" ? (
          <>
            <div className="rail-label">IDENTITE &amp; HORAIRES</div>
            <div className="rail-field">
              <span className="rail-field-label">Nom de la boutique</span>
              <span className="rail-field-value truncate">
                {boutique?.name || boutique?.nom || "Ma boutique"}
              </span>
            </div>
            <div className="rail-grid-2">
              <div className="rail-field">
                <span className="rail-field-label">Ouverture</span>
                <span className="rail-field-value">{boutique?.heureOuverture || "—"}</span>
              </div>
              <div className="rail-field">
                <span className="rail-field-label">Fermeture</span>
                <span className="rail-field-value">{boutique?.heureFermeture || "—"}</span>
              </div>
            </div>

            <div className="rail-label rail-label-sep">CONTACTS &amp; PAIEMENT</div>
            <div className="rail-field">
              <span className="rail-field-label">Telephone</span>
              <span className="rail-field-value">{boutique?.telephone || "—"}</span>
            </div>
            <div className="rail-field">
              <span className="rail-field-label">Localisation</span>
              <span className="rail-field-value truncate">
                {boutique?.localisation || boutique?.ville || "—"}
              </span>
            </div>

            <Btn variant="primary" icon="plus" onClick={onAdd}>
              Ajouter un menu
            </Btn>
          </>
        ) : (
          <>
            <div className="rail-label">LOCALISATIONS</div>
            <div className="rail-field rail-field-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ec4913" strokeWidth="1.8">
                <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              <span className="stacked">
                <span className="rail-field-value">
                  {boutique?.localisation || boutique?.ville || "Non renseignee"}
                </span>
                <span className="rail-field-label">Zone principale</span>
              </span>
            </div>
            <div className="rail-note">
              La configuration des creneaux de livraison se fait depuis
              l'application marchand.
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ── Modale d'ajout ──────────────────────────────────────────────────── */

function AddMenuModal({ onClose, onSave }) {
  const toast = useToast();
  const [form, setForm] = useState({
    titre: "",
    prix1: "",
    optionPrix1: "",
    image: "",
    stock: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.titre || !form.prix1) {
      setError("Titre et prix sont obligatoires.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        titre: form.titre,
        prix1: Number(form.prix1),
        optionPrix1: form.optionPrix1 || "Normal",
        image: form.image,
        stock: form.stock ? Number(form.stock) : undefined,
        disponibilite: "true",
      });
      toast.ok("Menu ajoute", form.titre);
      onClose();
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Nouveau menu"
      subtitle="Il sera disponible immediatement a la caisse et dans l'app client."
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={save} disabled={busy}>
            {busy ? "Enregistrement..." : "Enregistrer"}
          </Btn>
        </>
      }
    >
      <div className="modal-body stack">
        <Field label="Titre du menu">
          <input className="input" value={form.titre} onChange={set("titre")} autoFocus />
        </Field>
        <Field label="Prix (XAF)">
          <input
            className="input num"
            type="number"
            min="0"
            value={form.prix1}
            onChange={set("prix1")}
          />
        </Field>
        <Field
          label="Libelle de l'option"
          hint="Ce que le client choisit : Normal, Grand, Familial..."
        >
          <input
            className="input"
            value={form.optionPrix1}
            onChange={set("optionPrix1")}
            placeholder="Normal"
          />
        </Field>
        <Field label="Stock" hint="Laisser vide si le stock n'est pas suivi.">
          <input
            className="input num"
            type="number"
            min="0"
            value={form.stock}
            onChange={set("stock")}
          />
        </Field>
        <Field label="URL de l'image">
          <input
            className="input"
            value={form.image}
            onChange={set("image")}
            placeholder="https://..."
          />
        </Field>

        {error && <Alert>{error}</Alert>}
      </div>
    </Modal>
  );
}
