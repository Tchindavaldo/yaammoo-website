// Portage a l'identique de
// yaammoo/src/features/merchant/utils/orderGroupKey.ts
//
// Regle unique de groupage, partagee par la liste marchand et l'onglet Montant.
// Deux commandes se groupent si elles partagent le meme client, la meme DATE et :
//   - programmee : meme creneau (delivery.time) + meme zone
//   - express    : meme zone
//   - sur place  : rien de plus
//
// La date fait partie de la cle : sans elle, un meme client verrait ses
// commandes de jours differents fusionner.

export function orderGroupKey(order) {
  const d = order.delivery;
  const userKey = order.userId || order.userData?.email || order.id;
  const date = orderDateISO(order);
  const zone = d?.zone || d?.location || "";

  if (d?.status === true && d?.type !== "express" && d?.time) {
    return `${userKey}__${date}__slot__${d.time}__${zone}`;
  }
  if (d?.status === true && d?.type === "express") {
    return `${userKey}__${date}__express__${zone}`;
  }
  return `${userKey}__${date}__surplace`;
}

/** Date de rattachement d'une commande (YYYY-MM-DD) : livraison, sinon creation. */
export function orderDateISO(order) {
  const dateStr = order.delivery?.date || order.createdAt || "";
  if (!dateStr) return new Date().toISOString().substring(0, 10);
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().substring(0, 10);
    return d.toISOString().substring(0, 10);
  } catch {
    return new Date().toISOString().substring(0, 10);
  }
}

/** Periode d'une commande : "surplace" | "express" | creneau horaire. */
export function orderPeriodKey(order) {
  const d = order.delivery;
  if (d?.status !== true) return "surplace";
  if (d?.type === "express") return "express";
  return d?.time || "";
}
