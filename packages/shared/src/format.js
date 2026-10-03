// Formatage partage (montants XAF, dates FR).

export function formatXAF(amount) {
  const n = typeof amount === "number" ? amount : 0;
  return `${n.toLocaleString("fr-FR")} XAF`;
}

const MONTHS = [
  "janvier", "fevrier", "mars", "avril", "mai", "juin",
  "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
];

/** "2026-08-21" -> "21 aout" */
export function formatDayMonth(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "2026-08-21" -> "21 aout 2026" */
export function formatFullDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function todayISO() {
  return new Date().toISOString().substring(0, 10);
}

/** Numero de facture lisible a partir d'un id de commande. */
export function invoiceNumber(orderId, createdAt) {
  const d = createdAt ? new Date(createdAt) : new Date();
  const stamp = isNaN(d.getTime()) ? new Date() : d;
  const y = stamp.getFullYear();
  const m = String(stamp.getMonth() + 1).padStart(2, "0");
  const short = String(orderId || "").slice(-6).toUpperCase();
  return `YAM-${y}${m}-${short}`;
}
