// Formats d'affichage des statistiques (durees, pourcentages, dates relatives).

/** Duree lisible a partir de millisecondes : 45 s, 3 min 20, 1 h 05. */
export function formatDuration(ms) {
  const s = Math.round(Number(ms) / 1000);
  if (!Number.isFinite(s) || s <= 0) return "—";
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, "0")}`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

/** Part en pourcentage, sans decimale au-dela de 10 %. */
export function pct(part, total) {
  if (!total) return "—";
  const v = (100 * part) / total;
  return `${v >= 10 ? Math.round(v) : v.toFixed(1)} %`;
}

/** « il y a 5 min », « hier 14:02 », ou la date. */
export function formatAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "a l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const num = (v) => Number(v || 0).toLocaleString("fr-FR");

/** Nom affichable d'un utilisateur enrichi par le backend. */
export const userLabel = (row) =>
  row?.user?.name || row?.user?.email || row?.user?.phone || `#${String(row?.userId || "").slice(0, 8)}`;

/** Deux initiales pour la vignette d'un utilisateur. */
export const initialsOf = (name) =>
  String(name || "?")
    .replace(/^#/, "")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// Palette des pastilles d'identite (memes teintes que Boutique).
const AVATAR_COLORS = ["#2f6fd0", "#7c3aed", "#0f766e", "#ec4913", "#1b1f27"];

/** Couleur stable par utilisateur. */
export const avatarColor = (id) => {
  let h = 0;
  for (const c of String(id || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

/** Periodes proposees : cle -> nombre de jours. */
export const PERIODS = [
  { key: "1", label: "24 dernieres heures" },
  { key: "7", label: "7 derniers jours" },
  { key: "30", label: "30 derniers jours" },
  { key: "90", label: "90 derniers jours" },
];

export const rangeOf = (days) => ({
  from: new Date(Date.now() - Number(days) * 86400000).toISOString(),
  to: new Date().toISOString(),
});
