// Carte-ticket : l'unite de travail du comptoir.
// Rang de service, client, contenu, temps d'attente, montant, action.
import {
  formatXAF,
  groupTotal,
  nextStatus,
  STATUS_LABELS,
  orderPeriodKey,
  tabOf,
} from "@yaammoo/shared";
import { Icon } from "../../components/icons.jsx";
import { Avatar, Tag, Timer } from "../../components/ui.jsx";

const TONE = { pending: "ticket-pending", proccess: "ticket-process", finish: "ticket-finish" };

export function periodLabel(key) {
  if (key === "surplace") return "Sur place";
  if (key === "express") return "Express";
  return key || "Creneau";
}

export function clientName(order) {
  return (
    order?.userData?.infos?.nom ||
    order?.userData?.nom ||
    order?.userData?.email ||
    "Client"
  );
}

export default function OrderTicket({ head, group, onOpen, onAdvance, busy }) {
  const target = nextStatus(head.status);
  const period = orderPeriodKey(head);
  const phone = head.delivery?.phone || head.userData?.infos?.numero || "";
  const place = head.delivery?.address || head.delivery?.zone || "";
  const shown = group.slice(0, 3);

  return (
    <article
      className={`ticket-card ${TONE[tabOf(head.status)] || ""}`}
      onClick={() => onOpen({ head, group })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen({ head, group })}
    >
      <div className="ticket-top">
        <span className={head.rank === 1 ? "rank rank-first" : "rank"}>
          {typeof head.rank === "number" ? head.rank : "—"}
        </span>
        <Avatar name={clientName(head)} />
        <span className="ticket-client grow">
          <span className="ticket-name">{clientName(head)}</span>
          {phone && <span className="ticket-phone">{phone}</span>}
        </span>
        <Timer since={head.createdAt} />
      </div>

      <div className="ticket-items">
        {shown.map((o) => (
          <div className="ticket-item" key={o.id}>
            <span className="ticket-item-qty">{o.quantity || 1}×</span>
            <span className="ticket-item-name">
              {o.menu?.titre || o.menu?.name || "Menu"}
            </span>
          </div>
        ))}
        {group.length > shown.length && (
          <div className="ticket-more">+ {group.length - shown.length} autre(s)</div>
        )}
      </div>

      <div className="ticket-tags">
        <Tag icon={period === "surplace" ? "store" : "bike"}>{periodLabel(period)}</Tag>
        {place && <Tag icon="pin">{place}</Tag>}
      </div>

      <div className="ticket-bottom">
        <span className="ticket-total">{formatXAF(groupTotal(group))}</span>
        {target && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              onAdvance(group);
            }}
          >
            {busy ? (
              <span className="spinner" />
            ) : (
              <>
                {STATUS_LABELS[target]}
                <Icon name="arrowRight" size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
