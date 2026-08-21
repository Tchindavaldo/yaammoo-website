// Primitives UI partagees par les ecrans du dashboard.
import { STATUS_LABELS, tabOf } from "@yaammoo/shared";

export function Stat({ label, value, hint, small }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={small ? "stat-value sm mono" : "stat-value mono"}>{value}</div>
      {hint ? <div className="stat-hint">{hint}</div> : null}
    </div>
  );
}

const PILL_CLASS = { pending: "pending", proccess: "process", finish: "done" };

export function StatusPill({ status }) {
  const cls = PILL_CLASS[tabOf(status)] || "";
  return <span className={`pill ${cls}`}>{STATUS_LABELS[status] || status}</span>;
}

export function Chip({ active, onClick, children, count }) {
  return (
    <button className={`chip${active ? " active" : ""}`} onClick={onClick} type="button">
      {children}
      {count !== undefined && <span className="badge">{count}</span>}
    </button>
  );
}

export function Empty({ title, hint }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {hint ? <div className="small">{hint}</div> : null}
    </div>
  );
}

export function Loading({ label = "Chargement..." }) {
  return (
    <div className="empty">
      <div className="spinner" />
      <div className="small">{label}</div>
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={wide ? "modal wide" : "modal"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="grow">
            <h2>{title}</h2>
            {subtitle ? <div className="small dim">{subtitle}</div> : null}
          </div>
          <button className="btn ghost sm" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        {children}
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
