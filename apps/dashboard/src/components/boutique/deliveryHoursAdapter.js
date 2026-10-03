// ============================================================================
// deliveryHoursAdapter — Pont entre le contrat backend et le formulaire
// ----------------------------------------------------------------------------
// Le backend expose les créneaux dans `fastfood.deliveryHours` : une liste
// d'HEURES, chacune portant ses zones et leurs prix.
//
//   [{ hour: "08:00", express: true, periodic: true,
//      expressZones:  [{ lieu: "Bonapriso", prix: "1200" }],
//      periodicZones: [{ lieu: "Bonapriso", prix: "500" }] }]
//
// Le formulaire, lui, raisonne par ZONE : un onglet par lieu, contenant ses
// heures. C'est l'inverse. Ces deux fonctions font la bascule dans les deux
// sens, sans toucher au backend ni au rendu du formulaire.
//
// Contraintes du backend à respecter à l'écriture (`deliveryHoursSanitize.js`) :
// un créneau n'est conservé que s'il a au moins un mode (express|periodic)
// à la fois ACTIF et pourvu d'au moins une zone valide (`lieu` non vide et
// `prix` numérique > 0). Les prix partent en string, comme attendu.
//
// NOTE format legacy : si le client déclare une version < 1.0.1, le backend
// renvoie `deliveryHours` en simples strings ("10:00") — sans zone ni prix.
// `fromDeliveryHours` gère ce cas en retournant une liste vide de zones,
// faute de prix exploitable à afficher.
// ============================================================================

// Prix numérique exploitable (> 0), sinon null. Le backend envoie des strings.
const priceOf = (zone) => {
  const n = Number(zone?.prix);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Nom de zone normalisé pour le regroupement (insensible à la casse/espaces).
const lieuKeyOf = (lieu) => String(lieu || "").trim().toLowerCase();

/**
 * Backend → formulaire : regroupe `deliveryHours` par lieu.
 *
 * @param {unknown} deliveryHours Valeur brute de `fastfood.deliveryHours`.
 * @returns {Array<{lieu: string, hours: Array}>} Zones prêtes pour le formulaire,
 *   chaque heure portant `periodicPrix` / `expressPrix` (strings, ou undefined).
 */
export function fromDeliveryHours(deliveryHours) {
  if (!Array.isArray(deliveryHours)) return [];

  // Map lieuKey -> { lieu, hours: Map(hour -> slot) } pour préserver l'ordre
  // d'apparition des zones ET des heures telles que le backend les renvoie.
  const byLieu = new Map();

  const push = (zone, hour, mode) => {
    const prix = priceOf(zone);
    if (prix === null) return;
    const lieu = String(zone.lieu).trim();
    const key = lieuKeyOf(lieu);
    if (!key) return;

    if (!byLieu.has(key)) byLieu.set(key, { lieu, hours: new Map() });
    const group = byLieu.get(key);
    if (!group.hours.has(hour)) group.hours.set(hour, { hour });
    group.hours.get(hour)[mode] = String(prix);
  };

  for (const item of deliveryHours) {
    // Format legacy : string "HH:mm", aucune zone ni prix à afficher.
    if (typeof item === "string") continue;
    if (!item || typeof item !== "object") continue;
    const hour = typeof item.hour === "string" ? item.hour.trim() : "";
    if (!hour) continue;

    // Un mode désactivé est légitime : on n'affiche que les modes actifs.
    if (item.express === true) {
      for (const z of item.expressZones || []) push(z, hour, "expressPrix");
    }
    if (item.periodic === true) {
      for (const z of item.periodicZones || []) push(z, hour, "periodicPrix");
    }
  }

  return [...byLieu.values()].map((g) => ({
    lieu: g.lieu,
    hours: [...g.hours.values()],
  }));
}

/**
 * Formulaire → backend : ré-inverse les zones en liste d'heures.
 *
 * Les créneaux sans aucun prix valide sont omis : le backend les purgerait
 * de toute façon, autant ne pas les envoyer.
 *
 * @param {Array<{lieu: string, hours: Array}>} zones État du formulaire.
 * @returns {Array} `deliveryHours` au format attendu par POST /fastfood/:id.
 */
export function toDeliveryHours(zones) {
  if (!Array.isArray(zones)) return [];

  // Map hour -> { hour, expressZones[], periodicZones[] }
  const byHour = new Map();

  for (const zone of zones) {
    const lieu = String(zone?.lieu || "").trim();
    if (!lieu) continue;

    for (const slot of zone.hours || []) {
      const hour = typeof slot?.hour === "string" ? slot.hour.trim() : "";
      if (!hour) continue;

      const express = priceOf({ prix: slot.expressPrix });
      const periodic = priceOf({ prix: slot.periodicPrix });
      if (express === null && periodic === null) continue;

      if (!byHour.has(hour)) {
        byHour.set(hour, { hour, expressZones: [], periodicZones: [] });
      }
      const item = byHour.get(hour);
      if (express !== null) item.expressZones.push({ lieu, prix: String(express) });
      if (periodic !== null) item.periodicZones.push({ lieu, prix: String(periodic) });
    }
  }

  // `express` / `periodic` ne valent true que si le mode porte vraiment des
  // zones : c'est la condition exacte de conservation côté backend.
  return [...byHour.values()]
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .map((item) => ({
      ...item,
      express: item.expressZones.length > 0,
      periodic: item.periodicZones.length > 0,
    }));
}
