// Primitives UI du dashboard.
// Chaque composant porte une classe du design system : aucun style inline.
import { useEffect, useState } from "react";
import { STATUS_LABELS, tabOf } from "@yaammoo/shared";
import { Icon } from "./icons.jsx";

/* ── Boutons ──────────────────────────────────────────────────────────── */

export function Btn({
  variant = "default",
  size,
  icon,
  block,
  children,
  className = "",
  ...rest
}) {
  const cls = [
    "btn",
    variant !== "default" ? `btn-${variant}` : "",
    size ? `btn-${size}` : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

export function IconBtn({ icon, label, size = "md", className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`icon-btn${size === "sm" ? " sm" : ""} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? 15 : 18} />
    </button>
  );
}

/* ── Indicateurs ──────────────────────────────────────────────────────── */

/** Bandeau de tetes de chapitre : le premier KPI domine, les autres appuient. */
export function KpiBand({ children }) {
  return <div className="kpi-band">{children}</div>;
}

export function Kpi({ label, icon, value, foot, lead, children }) {
  return (
    <div className={lead ? "kpi kpi-lead" : "kpi"}>
      <div className="kpi-label">
        {icon && <Icon name={icon} size={14} />}
        {label}
      </div>
      <div className="kpi-value">{value}</div>
      {children}
      {foot && <div className="kpi-foot">{foot}</div>}
    </div>
  );
}

const PILL_CLASS = {
  pending: "pill-pending",
  proccess: "pill-process",
  finish: "pill-done",
};

export function StatusPill({ status }) {
  return (
    <span className={`pill ${PILL_CLASS[tabOf(status)] || ""}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function Tag({ icon, tone, children }) {
  return (
    <span className={tone ? `pill pill-plain pill-${tone}` : "pill pill-plain"}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/** Initiales — evite un avatar vide quand aucune photo n'est disponible. */
export function Avatar({ name, className = "avatar" }) {
  const initials = String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return <span className={className}>{initials || "?"}</span>;
}

/* ── Chrono d'attente ─────────────────────────────────────────────────── */

/** Re-rend le composant toutes les `ms` — pour les durees qui defilent. */
export function useTicker(ms = 30000) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/** Temps ecoule depuis la prise de commande : le signal le plus utile
    au comptoir. Vire a l'orange puis au rouge au-dela des seuils. */
export function Timer({ since, warnAt = 15, lateAt = 30 }) {
  useTicker(30000);
  if (!since) return null;

  const start = new Date(since).getTime();
  if (Number.isNaN(start)) return null;

  const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000));
  const tone = minutes >= lateAt ? "timer-late" : minutes >= warnAt ? "timer-warn" : "";
  const label =
    minutes < 60
      ? `${minutes} min`
      : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;

  return (
    <span className={`timer ${tone}`}>
      <Icon name="clock" size={12} />
      {label}
    </span>
  );
}

/* ── Controles ────────────────────────────────────────────────────────── */

export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          className={value === o.key ? "segment active" : "segment"}
          onClick={() => onChange(o.key)}
        >
          {o.label}
          {o.count !== undefined && <span className="badge">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, onClick, count, children }) {
  return (
    <button
      type="button"
      className={active ? "chip active" : "chip"}
      onClick={onClick}
    >
      {children}
      {count !== undefined && <span className="badge">{count}</span>}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

export function Search({ value, onChange, placeholder = "Rechercher..." }) {
  return (
    <div className="search">
      <Icon name="search" size={15} />
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function Stepper({ value, onChange }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Retirer un">
        <Icon name="minus" size={13} />
      </button>
      <span className="stepper-value">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Ajouter un">
        <Icon name="plus" size={13} />
      </button>
    </div>
  );
}

/* ── Etats ────────────────────────────────────────────────────────────── */

export function Empty({ icon = "inbox", title, hint, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {action}
    </div>
  );
}

export function Alert({ tone = "danger", children }) {
  return (
    <div className={`alert alert-${tone}`}>
      <Icon name={tone === "danger" ? "alert" : "checkCircle"} size={16} />
      <span>{children}</span>
    </div>
  );
}

/** Squelettes : on montre la forme du contenu attendu, pas un sablier. */
export function Sk({ w, h = 12, r }) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r }} />;
}

export function SkBoard({ columns = 3, cards = 3 }) {
  return (
    <div className="board">
      {Array.from({ length: columns }, (_, c) => (
        <div className="column" key={c}>
          <div className="column-head">
            <Sk w={100} h={13} />
          </div>
          <div className="column-body">
            {Array.from({ length: cards }, (_, i) => (
              <div className="ticket-card" key={i}>
                <div className="ticket-top">
                  <Sk w={26} h={26} r="var(--r-xs)" />
                  <Sk w={110} h={13} />
                </div>
                <div className="ticket-items">
                  <Sk w="80%" h={11} />
                  <Sk w="55%" h={11} />
                </div>
                <Sk w={90} h={15} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkCards({ count = 8 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="menu-card" key={i}>
          <div className="menu-thumb" />
          <div className="menu-body">
            <Sk w="75%" h={14} />
            <Sk w="45%" h={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkTable({ rows = 6, cols = 5 }) {
  return (
    <div className="card">
      <table className="table">
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <Sk w={c === 0 ? "70%" : "50%"} h={12} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Fenetre modale ───────────────────────────────────────────────────── */

export function Modal({ title, subtitle, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={wide ? "modal modal-wide" : "modal"}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="grow stacked">
            <h2 className="truncate">{title}</h2>
            {subtitle && <span className="small dim truncate">{subtitle}</span>}
          </div>
          <IconBtn icon="close" label="Fermer" onClick={onClose} className="no-print" />
        </div>
        {children}
        {footer && <div className="modal-foot no-print">{footer}</div>}
      </div>
    </div>
  );
}
