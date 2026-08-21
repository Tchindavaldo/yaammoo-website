// Detail d'une commande — portage web de MerchantOrderBottomSheet.
// Memes 3 onglets : Commande / Livraison / Montant, meme navigation multi-cmd
// quand la ligne est groupee.
import { useState } from "react";
import {
  formatXAF,
  formatFullDate,
  nextStatus,
  STATUS_LABELS,
  orderPeriodKey,
  orderTotal,
  groupTotal,
} from "@yaammoo/shared";
import { Modal, StatusPill } from "../../components/ui.jsx";
import InvoiceModal from "../pos/InvoiceModal.jsx";

const TABS = ["Commande", "Livraison", "Montant"];

export default function OrderDetailModal({ head, group, onClose, onUpdateStatus }) {
  const [tab, setTab] = useState("Commande");
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [invoice, setInvoice] = useState(false);

  const order = group[index] || head;
  const target = nextStatus(order.status);

  const validateOne = async () => {
    if (!target) return;
    setBusy(true);
    await onUpdateStatus(order.id, target);
    setBusy(false);
  };

  const client =
    order.userData?.infos?.nom || order.userData?.nom || order.userData?.email || "Client";

  return (
    <>
      <Modal
        title={`Commande ${client}`}
        subtitle={`${group.length > 1 ? `${index + 1} / ${group.length} · ` : ""}${formatFullDate(order.delivery?.date || order.createdAt)}`}
        onClose={onClose}
        wide
        footer={
          <>
            <button className="btn" onClick={() => setInvoice(true)} type="button">
              Facture
            </button>
            {group.length > 1 && (
              <>
                <button
                  className="btn"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => i - 1)}
                  type="button"
                >
                  Precedente
                </button>
                <button
                  className="btn"
                  disabled={index >= group.length - 1}
                  onClick={() => setIndex((i) => i + 1)}
                  type="button"
                >
                  Suivante
                </button>
              </>
            )}
            {target && (
              <button
                className="btn primary"
                disabled={busy}
                onClick={validateOne}
                type="button"
              >
                {busy ? "..." : `Passer a ${STATUS_LABELS[target]}`}
              </button>
            )}
          </>
        }
      >
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === "Commande" && <CommandeTab order={order} />}
          {tab === "Livraison" && <LivraisonTab order={order} />}
          {tab === "Montant" && <MontantTab group={group} />}
        </div>
      </Modal>

      {invoice && (
        <InvoiceModal orders={group} onClose={() => setInvoice(false)} />
      )}
    </>
  );
}

function CommandeTab({ order }) {
  const extras = Array.isArray(order.extra) ? order.extra : [];
  const drinks = Array.isArray(order.drink) ? order.drink : [];

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <div style={{ fontWeight: 650, fontSize: 15 }}>
            {order.menu?.titre || order.menu?.name || "Menu"}
          </div>
          <div className="small dim">Quantite : {order.quantity || 1}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      {extras.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 7 }}>Extras</h3>
          <table className="table">
            <tbody>
              {extras.map((e, i) => (
                <tr key={i}>
                  <td>{e.name || e.type}</td>
                  <td className="right mono">{formatXAF(e.prix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drinks.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 7 }}>Boissons</h3>
          <table className="table">
            <tbody>
              {drinks.map((d, i) => (
                <tr key={i}>
                  <td>
                    {d.name || d.type}
                    {d.quantite > 1 ? ` x${d.quantite}` : ""}
                  </td>
                  <td className="right mono">{formatXAF(d.prix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row-between" style={{ paddingTop: 8, fontWeight: 700 }}>
        <span>Total commande</span>
        <span className="mono">{formatXAF(orderTotal(order))}</span>
      </div>
    </div>
  );
}

function LivraisonTab({ order }) {
  const d = order.delivery || {};
  const rows = [
    ["Type", labelPeriod(orderPeriodKey(order))],
    ["Date", formatFullDate(d.date || order.createdAt)],
    ["Creneau", d.time || d.hour || "—"],
    ["Zone", d.zone || d.location || "—"],
    ["Adresse", d.address || "—"],
    ["Telephone", d.phone || order.userData?.infos?.numero || "—"],
    ["Note", d.note || "—"],
    ["Frais de livraison", d.status === true ? formatXAF(d.prix) : "Sur place"],
  ];

  return (
    <table className="table">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td className="dim" style={{ width: 170 }}>
              {k}
            </td>
            <td style={{ fontWeight: 550 }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MontantTab({ group }) {
  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>Commande</th>
            <th>Statut</th>
            <th className="right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {group.map((o) => (
            <tr key={o.id}>
              <td>{o.menu?.titre || o.menu?.name || "Menu"}</td>
              <td>
                <StatusPill status={o.status} />
              </td>
              <td className="right mono">{formatXAF(orderTotal(o))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row-between" style={{ paddingTop: 13, fontWeight: 700, fontSize: 16 }}>
        <span>Total du groupe</span>
        <span className="mono">{formatXAF(groupTotal(group))}</span>
      </div>
    </>
  );
}

function labelPeriod(key) {
  if (key === "surplace") return "Sur place";
  if (key === "express") return "Livraison express";
  return `Livraison programmee (${key})`;
}
