// Facture / bon de caisse imprimable.
// styles/print.css masque la coque et ne laisse que ce bloc sur le papier.
import {
  formatXAF,
  formatFullDate,
  formatTime,
  invoiceNumber,
  orderTotal,
} from "@yaammoo/shared";
import { Btn, Modal } from "../../components/ui.jsx";
import { useMerchant } from "../merchant/MerchantContext.jsx";

export default function InvoiceModal({ orders, onClose }) {
  const { boutique } = useMerchant();
  const first = orders[0] || {};
  const number = invoiceNumber(first.id, first.createdAt);
  const issuedAt = first.createdAt || new Date().toISOString();

  const lines = orders.map((o) => ({
    label: o.menu?.titre || o.menu?.name || "Menu",
    quantity: o.quantity || 1,
    unit: (orderTotal(o) || 0) / (o.quantity || 1),
    total: orderTotal(o),
  }));

  const subtotal = lines.reduce((acc, l) => acc + l.total, 0);
  const fee = orders.reduce(
    (acc, o) => acc + (o.delivery?.status === true ? o.delivery?.prix || 0 : 0),
    0,
  );
  const client =
    first.userData?.infos?.nom || first.userData?.nom || "Client comptoir";
  const phone = first.userData?.infos?.numero || first.delivery?.phone || "";

  return (
    <Modal
      title="Bon de caisse"
      subtitle={number}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Fermer</Btn>
          <Btn variant="primary" icon="printer" onClick={() => window.print()}>
            Imprimer
          </Btn>
        </>
      }
    >
      <div className="modal-body">
        <div className="invoice">
          <div className="invoice-head">
            <div className="stacked">
              <span className="invoice-shop">
                {boutique?.name || boutique?.nom || "Yaammoo"}
              </span>
              <span className="small muted">Bon de caisse</span>
            </div>
            <div className="invoice-meta">
              <div className="strong">{number}</div>
              <div>{formatFullDate(issuedAt)}</div>
              <div>{formatTime(issuedAt)}</div>
            </div>
          </div>

          <table className="table table-plain invoice-client">
            <tbody>
              <tr>
                <td className="dim" style={{ width: 110 }}>
                  Client
                </td>
                <td className="strong">{client}</td>
              </tr>
              {phone && (
                <tr>
                  <td className="dim">Telephone</td>
                  <td className="num">{phone}</td>
                </tr>
              )}
              {first.delivery?.address && (
                <tr>
                  <td className="dim">Adresse</td>
                  <td>{first.delivery.address}</td>
                </tr>
              )}
            </tbody>
          </table>

          <table className="table">
            <thead>
              <tr>
                <th>Designation</th>
                <th className="right">Qte</th>
                <th className="right">P.U.</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td>{l.label}</td>
                  <td className="right num">{l.quantity}</td>
                  <td className="right num">{formatXAF(l.unit)}</td>
                  <td className="right num strong">{formatXAF(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-total">
            <div className="invoice-total-box">
              <div className="invoice-total-row">
                <span className="muted">Sous-total</span>
                <span>{formatXAF(subtotal)}</span>
              </div>
              {fee > 0 && (
                <div className="invoice-total-row">
                  <span className="muted">Livraison</span>
                  <span>{formatXAF(fee)}</span>
                </div>
              )}
              <div className="invoice-total-row grand">
                <span>Total</span>
                <span>{formatXAF(subtotal + fee)}</span>
              </div>
            </div>
          </div>

          <div className="invoice-foot">
            Paiement a la livraison — especes. Merci de votre confiance.
            <br />
            Yaammoo · yaammoo.rauval.com
          </div>
        </div>
      </div>
    </Modal>
  );
}
