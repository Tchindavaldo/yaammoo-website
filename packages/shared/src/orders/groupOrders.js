// Groupage des commandes en lignes affichables — portage de la logique
// `groupBySlot` de OrderManagePanel (app RN).
//
// Chaque groupe donne UNE ligne, qui affiche la commande la mieux classee
// (rank le plus petit) et prend sa position au classement.
// Ex. rangs 1, 4, 5 a 11h -> une ligne au rang 1.
import { orderGroupKey, orderDateISO, orderPeriodKey } from "./orderGroupKey.js";
import { STATUS_MAP, isUntreated } from "./orderStatus.js";

const rankOf = (o) => (typeof o.rank === "number" ? o.rank : Infinity);

/** Trie par rank ASC ; les commandes sans rank passent en dernier. */
export function sortByRank(orders) {
  return [...orders].sort((a, b) => rankOf(a) - rankOf(b));
}

/**
 * Regroupe les commandes et renvoie [{ head, group }] trie par rank.
 * `head` = commande representative, `group` = toutes celles du groupe.
 */
export function groupBySlot(orders) {
  const buckets = new Map();
  for (const order of orders) {
    const key = orderGroupKey(order);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(order);
  }

  const rows = [];
  for (const group of buckets.values()) {
    const sorted = sortByRank(group);
    rows.push({ head: sorted[0], group: sorted });
  }
  return rows.sort((a, b) => rankOf(a.head) - rankOf(b.head));
}

/** Filtre par onglet de statut, date et periodes cochees (vide = toutes). */
export function filterOrders(orders, { statusKey, date, periods = [] }) {
  const allowed = STATUS_MAP[statusKey] || [];
  return orders.filter((o) => {
    if (!allowed.includes(o.status)) return false;
    if (date && orderDateISO(o) !== date) return false;
    if (periods.length > 0 && !periods.includes(orderPeriodKey(o))) return false;
    return true;
  });
}

/** Dates distinctes presentes dans un lot de commandes, triees. */
export function availableDates(orders) {
  return [...new Set(orders.map(orderDateISO))].sort();
}

/**
 * Compteurs globaux de commandes non traitees sur les AUTRES dates.
 * Portage d'`untreatedCounts` / OtherDatesNotice : independant de l'onglet
 * de statut et de la date filtree ; seule la date affichee est exclue.
 */
export function untreatedCounts(orders, currentDate) {
  const today = new Date().toISOString().substring(0, 10);
  let past = 0;
  let future = 0;
  for (const o of orders) {
    if (!isUntreated(o)) continue;
    const d = orderDateISO(o);
    if (d === currentDate) continue;
    if (d < today) past += 1;
    else if (d > today) future += 1;
  }
  return { past, future };
}

/** Total d'une commande, robuste aux payloads partiels. */
export function orderTotal(order) {
  return typeof order.total === "number" ? order.total : 0;
}

/** Somme d'un groupe de commandes (onglet Montant). */
export function groupTotal(group) {
  return group.reduce((acc, o) => acc + orderTotal(o), 0);
}
