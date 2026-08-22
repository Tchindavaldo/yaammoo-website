// Detail d'une commande — portage web de MerchantOrderBottomSheet.
// Bandeau de synthese permanent, puis 3 onglets : Commande / Livraison / Montant.
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
import { Avatar, Btn, IconBtn, Modal, StatusPill, Tag, Timer } from "../../components/ui.jsx";
import InvoiceModal from "../pos/InvoiceModal.jsx";
import { clientName, periodLabel } from "./OrderTicket.jsx";

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

  return (
    <>
      <Modal
        title={clientName(order)}
        subtitle={formatFullDate(order.delivery?.date || order.createdAt)}
        onClose={onClose}
        wide
        footer={
          <>
            <Btn icon="printer" onClick={() => setInvoice(true)}>
              Facture
            </Btn>
            {group.length > 1 && (
              <div className="row" style={{ gap: 4, marginRight: "auto" }}>
                <IconBtn
                  icon="chevronLeft"
                  label="Commande precedente"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => i - 1)}
                />
                <span className="small dim num">
                  {index + 1} / {group.length}
                </span>
                <IconBtn
                  icon="chevronRight"
                  label="Commande suivante"
                  disabled={index >= group.length - 1}
                  onClick={() => setIndex((i) => i + 1)}
                />
              </div>
            )}
            {target && (
              <Btn variant="primary" icon="check" disabled={busy} onClick={validateOne}>
                {busy ? "..." : `Passer a ${STATUS_LABELS[target]}`}
              </Btn>
            )}
          </>
        }
      >
        <div className="card-head" style={{ borderBottom: "none", paddingTop: 4 }}>
          <Avatar name={clientName(order)} />
          <div className="stacked grow">
            <span className="strong">{clientName(order)}</span>
            <span className="small dim">
              {order.delivery?.phone || order.userData?.infos?.numero || "Sans telephone"}
            </span>
          </div>
          <Timer since={order.createdAt} />
          <StatusPill status={order.status} />
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? "tab active" : "tab"}
              onClick={() => setTab(t)}
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

      {invoice && <InvoiceModal orders={group} onClose={() => setInvoice(false)} />}
    </>
  );
}

function CommandeTab({ order }) {
  const extras = Array.isArray(order.extra) ? order.extra : [];
  const drinks = Array.isArray(order.drink) ? order.drink : [];

  return (
    <div className="stack">
      <div className="row-between">
        <div className="stacked">
          <span className="strong" style={{ fontSize: 15 }}>
            {order.menu?.titre || order.menu?.name || "Menu"}
          </span>
          <span className="small dim">Quantite : {order.quantity || 1}</span>
        </div>
        <span className="ticket-total">{formatXAF(orderTotal(order))}</span>
      </div>

      {extras.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 6 }}>Extras</h3>
          <table className="table table-plain">
            <tbody>
              {extras.map((e, i) => (
                <tr key={i}>
                  <td>{e.name || e.type}</td>
                  <td className="right num">{formatXAF(e.prix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drinks.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 6 }}>Boissons</h3>
          <table className="table table-plain">
            <tbody>
              {drinks.map((d, i) => (
                <tr key={i}>
                  <td>
                    {d.name || d.type}
                    {d.quantite > 1 ? ` ×${d.quantite}` : ""}
                  </td>
                  <td className="right num">{formatXAF(d.prix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LivraisonTab({ order }) {
  const d = order.delivery || {};
  const period = orderPeriodKey(order);
  const rows = [
    ["Type", periodLabel(period)],
    ["Date", formatFullDate(d.date || order.createdAt)],
    ["Creneau", d.time || d.hour || "—"],
    ["Zone", d.zone || d.location || "—"],
    ["Adresse", d.address || "—"],
    ["Telephone", d.phone || order.userData?.infos?.numero || "—"],
    ["Note", d.note || "—"],
    ["Frais de livraison", d.status === true ? formatXAF(d.prix) : "Sur place"],
  ];

  return (
    <>
      <div className="ticket-tags" style={{ marginBottom: 12 }}>
        <Tag icon={period === "surplace" ? "store" : "bike"}>{periodLabel(period)}</Tag>
        {d.address && <Tag icon="pin">{d.address}</Tag>}
      </div>
      <table className="table table-plain">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="dim" style={{ width: 170 }}>
                {k}
              </td>
              <td className="strong">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function MontantTab({ group }) {
  return (
    <>
      <table className="table table-plain">
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
              <td className="right num">{formatXAF(orderTotal(o))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-row grand">
        <span>Total du groupe</span>
        <span>{formatXAF(groupTotal(group))}</span>
      </div>
    </>
  );
}
