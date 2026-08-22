// Caisse — le marchand compose une commande au comptoir et edite le bon.
// Structure en trois volets : rail de categories, tuiles de menus, ticket vif.
// L'envoi reste le contrat de l'app client (POST /order, une commande par ligne).
import { useMemo, useState } from "react";
import { merchantService, formatXAF } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Alert, Btn, Empty, Field, Search, Stepper } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import InvoiceModal from "../features/pos/InvoiceModal.jsx";

const emptyClient = { nom: "", numero: "", address: "" };

/** Prix affiche d'un menu : premier prix renseigne. */
function menuPrice(menu) {
  return menu.prix1 || menu.prix2 || menu.prix3 || menu.prix || 0;
}

function isAvailable(menu) {
  return !(menu.disponibilite === "false" || menu.disponibilite === false);
}

function menuCategory(menu) {
  return menu.categorie || menu.category || menu.type || "";
}

export default function Pos() {
  const { menus, fastFoodId, refresh } = useMerchant();
  const { uid } = useAuth();
  const toast = useToast();

  const [lines, setLines] = useState([]);
  const [client, setClient] = useState(emptyClient);
  const [mode, setMode] = useState("surplace"); // surplace | express
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [busy, setBusy] = useState(false);
  const [invoiceOrders, setInvoiceOrders] = useState(null);
  const [error, setError] = useState(null);

  // Le rail suit les categories du catalogue quand elles existent, sinon il
  // retombe sur la disponibilite — toujours quelque chose d'utile a filtrer.
  const rail = useMemo(() => {
    const cats = [...new Set(menus.map(menuCategory).filter(Boolean))].sort();
    const base = [{ key: "all", label: "Tout le catalogue", count: menus.length }];
    if (cats.length > 1) {
      return base.concat(
        cats.map((c) => ({
          key: `cat:${c}`,
          label: c,
          count: menus.filter((m) => menuCategory(m) === c).length,
        })),
      );
    }
    return base.concat([
      {
        key: "available",
        label: "Disponibles",
        count: menus.filter(isAvailable).length,
      },
      {
        key: "out",
        label: "En rupture",
        count: menus.filter((m) => !isAvailable(m)).length,
      },
    ]);
  }, [menus]);

  const visibleMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menus.filter((m) => {
      if (q && !(m.titre || m.name || "").toLowerCase().includes(q)) return false;
      if (category === "available") return isAvailable(m);
      if (category === "out") return !isAvailable(m);
      if (category.startsWith("cat:")) return menuCategory(m) === category.slice(4);
      return true;
    });
  }, [menus, search, category]);

  const qtyOf = (menuId) =>
    lines.find((l) => l.menu.id === menuId)?.quantity || 0;

  const addLine = (menu) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.menu.id === menu.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { menu, quantity: 1, unitPrice: menuPrice(menu) }];
    });
  };

  const setQuantity = (menuId, quantity) =>
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.menu.id !== menuId)
        : prev.map((l) => (l.menu.id === menuId ? { ...l, quantity } : l)),
    );

  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
  const fee = mode === "express" ? Number(deliveryFee) || 0 : 0;
  const total = subtotal + fee;
  const itemCount = lines.reduce((acc, l) => acc + l.quantity, 0);

  const reset = () => {
    setLines([]);
    setClient(emptyClient);
    setMode("surplace");
    setDeliveryFee(0);
  };

  const submit = async () => {
    if (lines.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      // Une commande par ligne : le backend modelise une commande = un menu.
      const created = [];
      for (const line of lines) {
        const payload = {
          userId: uid,
          fastFoodId,
          menu: line.menu,
          quantity: line.quantity,
          extra: [],
          drink: [],
          total: line.unitPrice * line.quantity,
          status: "pending",
          source: "pos",
          userData: {
            infos: {
              nom: client.nom || "Client comptoir",
              numero: client.numero || "",
            },
          },
          delivery: {
            status: mode === "express",
            type: mode === "express" ? "express" : "aucune",
            prix: mode === "express" ? fee : 0,
            address: client.address || "",
            phone: client.numero || "",
            date: new Date().toISOString().substring(0, 10),
          },
        };
        const order = await merchantService.createOrder(payload);
        created.push(order || { ...payload, id: `local-${Date.now()}` });
      }
      setInvoiceOrders(created);
      toast.ok("Commande enregistree", `${created.length} ligne(s) · ${formatXAF(total)}`);
      reset();
      refresh(false);
    } catch (err) {
      setError(err.message || "Creation impossible.");
      toast.err("Echec de l'enregistrement", err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="pos">
        <nav className="pos-rail">
          {rail.map((r) => (
            <button
              key={r.key}
              type="button"
              className={category === r.key ? "rail-item active" : "rail-item"}
              onClick={() => setCategory(r.key)}
            >
              <span className="truncate">{r.label}</span>
              <span className="badge">{r.count}</span>
            </button>
          ))}
        </nav>

        <div className="pos-main card">
          <div className="card-head">
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un menu..."
            />
          </div>

          <div className="pos-scroll">
            {visibleMenus.length === 0 ? (
              <Empty
                icon="menus"
                title="Aucun menu ici"
                hint="Changez de filtre, ou ajoutez des menus depuis l'ecran Menus."
              />
            ) : (
              <div className="pos-grid">
                {visibleMenus.map((m) => {
                  const qty = qtyOf(m.id);
                  const dispo = isAvailable(m);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={qty > 0 ? "tile tile-selected" : "tile"}
                      onClick={() => addLine(m)}
                      disabled={!dispo}
                      title={dispo ? m.titre || m.name : "Indisponible"}
                    >
                      {qty > 0 && <span className="badge badge-accent tile-qty">{qty}</span>}
                      <span
                        className="tile-thumb"
                        style={m.image ? { backgroundImage: `url(${m.image})` } : undefined}
                      >
                        {!m.image && <Icon name="image" size={18} />}
                      </span>
                      <span className="tile-name">{m.titre || m.name}</span>
                      <span className="tile-price">{formatXAF(menuPrice(m))}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="ticket-panel card">
          <div className="card-head">
            <div className="stacked">
              <h2>Ticket</h2>
              <span className="tiny dim">
                {itemCount === 0 ? "Vide" : `${itemCount} article(s)`}
              </span>
            </div>
            {lines.length > 0 && (
              <Btn variant="ghost" size="sm" icon="close" onClick={reset}>
                Vider
              </Btn>
            )}
          </div>

          <div className="ticket-lines">
            {lines.length === 0 ? (
              <Empty
                icon="receipt"
                title="Ticket vide"
                hint="Touchez un menu pour l'ajouter."
              />
            ) : (
              lines.map((l) => (
                <div className="ticket-line" key={l.menu.id}>
                  <span className="stacked grow">
                    <span className="small strong truncate">
                      {l.menu.titre || l.menu.name}
                    </span>
                    <span className="tiny dim num">{formatXAF(l.unitPrice)}</span>
                  </span>
                  <Stepper
                    value={l.quantity}
                    onChange={(q) => setQuantity(l.menu.id, q)}
                  />
                  <span className="small strong num ticket-line-total">
                    {formatXAF(l.unitPrice * l.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="ticket-form">
            <div className="mode-switch">
              <button
                type="button"
                className={mode === "surplace" ? "mode-opt active" : "mode-opt"}
                onClick={() => setMode("surplace")}
              >
                <Icon name="store" size={15} />
                Sur place
              </button>
              <button
                type="button"
                className={mode === "express" ? "mode-opt active" : "mode-opt"}
                onClick={() => setMode("express")}
              >
                <Icon name="bike" size={15} />
                Livraison
              </button>
            </div>

            <Field label="Client">
              <input
                className="input"
                value={client.nom}
                onChange={(e) => setClient({ ...client, nom: e.target.value })}
                placeholder="Client comptoir"
              />
            </Field>
            <Field label="Telephone">
              <input
                className="input num"
                value={client.numero}
                onChange={(e) => setClient({ ...client, numero: e.target.value })}
                placeholder="6XX XX XX XX"
              />
            </Field>

            {mode === "express" && (
              <>
                <Field label="Adresse de livraison">
                  <input
                    className="input"
                    value={client.address}
                    onChange={(e) => setClient({ ...client, address: e.target.value })}
                  />
                </Field>
                <Field label="Frais de livraison (XAF)">
                  <input
                    className="input num"
                    type="number"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                  />
                </Field>
              </>
            )}

            {error && <Alert>{error}</Alert>}
          </div>

          <div className="ticket-total">
            <div className="total-row">
              <span>Sous-total</span>
              <span className="num">{formatXAF(subtotal)}</span>
            </div>
            {fee > 0 && (
              <div className="total-row">
                <span>Livraison</span>
                <span className="num">{formatXAF(fee)}</span>
              </div>
            )}
            <div className="total-row grand">
              <span>Total</span>
              <span>{formatXAF(total)}</span>
            </div>

            <Btn
              variant="primary"
              size="lg"
              icon="printer"
              block
              disabled={busy || lines.length === 0}
              onClick={submit}
            >
              {busy ? "Enregistrement..." : "Valider et imprimer"}
            </Btn>
          </div>
        </aside>
      </div>

      {invoiceOrders && (
        <InvoiceModal orders={invoiceOrders} onClose={() => setInvoiceOrders(null)} />
      )}
    </>
  );
}
