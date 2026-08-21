// Caisse (POS) — le marchand saisit une commande pour un client au comptoir,
// l'envoie au backend (POST /order, meme contrat que l'app client) et edite
// la facture / le bon de caisse.
import { useMemo, useState } from "react";
import { merchantService, formatXAF } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Empty, Field } from "../components/ui.jsx";
import InvoiceModal from "../features/pos/InvoiceModal.jsx";

const emptyClient = { nom: "", numero: "", address: "" };

export default function Pos() {
  const { menus, fastFoodId, refresh } = useMerchant();
  const { uid } = useAuth();

  const [lines, setLines] = useState([]);
  const [client, setClient] = useState(emptyClient);
  const [mode, setMode] = useState("surplace"); // surplace | express
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [invoiceOrders, setInvoiceOrders] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const visibleMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) =>
      (m.titre || m.name || "").toLowerCase().includes(q),
    );
  }, [menus, search]);

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

  const reset = () => {
    setLines([]);
    setClient(emptyClient);
    setMode("surplace");
    setDeliveryFee(0);
  };

  const submit = async () => {
    if (lines.length === 0) return;
    setBusy(true);
    setFeedback(null);
    try {
      // Une commande par ligne : le backend modelise une commande = un menu
      // (meme contrat que l'app client).
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
      reset();
      refresh(false);
    } catch (err) {
      setFeedback(err.message || "Creation impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 372px", gap: 16 }}>
        <div className="card">
          <div className="card-pad" style={{ borderBottom: "1px solid var(--border)" }}>
            <input
              className="input"
              placeholder="Rechercher un menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {visibleMenus.length === 0 ? (
            <Empty
              title="Aucun menu"
              hint="Ajoutez des menus depuis l'onglet Menus."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))",
                gap: 11,
                padding: 16,
              }}
            >
              {visibleMenus.map((m) => (
                <button
                  key={m.id}
                  className="card card-pad"
                  onClick={() => addLine(m)}
                  type="button"
                  style={{ textAlign: "left", cursor: "pointer" }}
                >
                  <div style={{ fontWeight: 650 }} className="truncate">
                    {m.titre || m.name}
                  </div>
                  <div className="small dim mono">{formatXAF(menuPrice(m))}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card card-pad" style={{ alignSelf: "start", position: "sticky", top: 76 }}>
          <h2 style={{ marginBottom: 13 }}>Ticket</h2>

          {lines.length === 0 ? (
            <div className="small dim" style={{ padding: "18px 0" }}>
              Cliquez sur un menu pour l'ajouter.
            </div>
          ) : (
            <table className="table" style={{ marginBottom: 13 }}>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.menu.id}>
                    <td style={{ padding: "8px 0" }}>
                      <div className="truncate" style={{ fontWeight: 600, maxWidth: 130 }}>
                        {l.menu.titre || l.menu.name}
                      </div>
                      <div className="small dim mono">{formatXAF(l.unitPrice)}</div>
                    </td>
                    <td style={{ padding: "8px 0", width: 92 }}>
                      <div className="row" style={{ gap: 5 }}>
                        <button
                          className="btn sm"
                          onClick={() => setQuantity(l.menu.id, l.quantity - 1)}
                          type="button"
                        >
                          −
                        </button>
                        <span className="mono" style={{ minWidth: 16, textAlign: "center" }}>
                          {l.quantity}
                        </span>
                        <button
                          className="btn sm"
                          onClick={() => setQuantity(l.menu.id, l.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="right mono" style={{ padding: "8px 0", fontWeight: 650 }}>
                      {formatXAF(l.unitPrice * l.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Field label="Nom du client">
            <input
              className="input"
              value={client.nom}
              onChange={(e) => setClient({ ...client, nom: e.target.value })}
              placeholder="Client comptoir"
            />
          </Field>
          <Field label="Telephone">
            <input
              className="input"
              value={client.numero}
              onChange={(e) => setClient({ ...client, numero: e.target.value })}
            />
          </Field>

          <div className="chip-row" style={{ marginBottom: 13 }}>
            <button
              className={`chip${mode === "surplace" ? " active" : ""}`}
              onClick={() => setMode("surplace")}
              type="button"
            >
              Sur place
            </button>
            <button
              className={`chip${mode === "express" ? " active" : ""}`}
              onClick={() => setMode("express")}
              type="button"
            >
              Livraison
            </button>
          </div>

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
                  className="input mono"
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                />
              </Field>
            </>
          )}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 11, marginTop: 4 }}>
            <div className="row-between small">
              <span className="muted">Sous-total</span>
              <span className="mono">{formatXAF(subtotal)}</span>
            </div>
            {fee > 0 && (
              <div className="row-between small">
                <span className="muted">Livraison</span>
                <span className="mono">{formatXAF(fee)}</span>
              </div>
            )}
            <div
              className="row-between"
              style={{ fontWeight: 750, fontSize: 17, marginTop: 7 }}
            >
              <span>Total</span>
              <span className="mono">{formatXAF(total)}</span>
            </div>
          </div>

          {feedback && (
            <div className="small" style={{ color: "var(--danger)", marginTop: 10 }}>
              ❌ {feedback}
            </div>
          )}

          <button
            className="btn primary block"
            style={{ marginTop: 13 }}
            disabled={busy || lines.length === 0}
            onClick={submit}
            type="button"
          >
            {busy ? "Enregistrement..." : "Valider et editer la facture"}
          </button>
          {lines.length > 0 && (
            <button
              className="btn ghost block"
              style={{ marginTop: 7 }}
              onClick={reset}
              type="button"
            >
              Vider le ticket
            </button>
          )}
        </div>
      </div>

      {invoiceOrders && (
        <InvoiceModal
          orders={invoiceOrders}
          onClose={() => setInvoiceOrders(null)}
        />
      )}
    </>
  );
}

/** Prix affiche d'un menu : premier prix renseigne. */
function menuPrice(menu) {
  return menu.prix1 || menu.prix2 || menu.prix3 || menu.prix || 0;
}
