// ============================================================================
// zoneCards — Grille fixe des créneaux d'une zone (portage exact du design)
// ----------------------------------------------------------------------------
// Repris tel quel de `Dashboard Boutique md screen copy.dc.html`, méthode
// `zoneCardsData()` (R13). La grille compte TOUJOURS le même nombre de cartes :
//
//   - page 0 : carte « Express » en tête ; pages suivantes : carte « ‹ Retour »
//   - puis les créneaux de la page (triés par heure, prix periodic requis)
//   - complétés par des cartes vides « --:-- / 000 F » pour garder la grille
//     pleine quand il n'y a pas assez de créneaux
//   - carte « +N / Voir la suite » en dernier quand il en reste
//
// Capacité : 8 créneaux par page (`room`), ramenée à 7 quand une carte de
// navigation doit prendre la 8e place — d'où `take` ci-dessous.
// ============================================================================

// Nombre de créneaux tenant dans une page avant la carte de navigation.
const ROOM = 8;
// Total de cartes de la grille (9 moins la carte « voir la suite » si présente).
const GRID_SIZE = 9;

// Prix numérique > 0, sinon null. Les prix arrivent en string ("500", "1 200 F").
const num = (p) => {
  const n = Number(String(p || "").replace(/[^\d]/g, ""));
  return n > 0 ? n : null;
};

// "1200" -> "1 200 F" (espaces fines comme dans le design).
export const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";

/**
 * Découpe les créneaux d'une zone en pages de taille fixe.
 *
 * @param {Array} hours Heures de la zone courante.
 * @returns {{pages: Array<Array>, slots: Array}}
 */
function paginate(hours) {
  const slots = (hours || [])
    .filter((h) => num(h.periodicPrix) !== null)
    .slice()
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const pages = [];
  let i = 0;
  // Une page est toujours produite, même sans aucun créneau (grille vide).
  while (i < slots.length || pages.length === 0) {
    const take = slots.length - i > ROOM ? ROOM - 1 : ROOM;
    pages.push(slots.slice(i, i + take));
    i += take;
  }
  return { pages, slots };
}

/**
 * Construit les cartes de la grille pour la zone et la page courantes.
 *
 * @param {{lieu: string, hours: Array}} zone Zone affichée.
 * @param {number} pageIdx Page demandée (bornée aux pages existantes).
 * @param {string|null} selectedKey Clé du créneau sélectionné.
 * @returns {{cards: Array, page: number, pageCount: number}}
 */
export function buildZoneCards(zone, pageIdx, selectedKey) {
  const hours = zone?.hours || [];
  const { pages, slots } = paginate(hours);

  const page = Math.min(Math.max(pageIdx || 0, 0), pages.length - 1);
  const shown = pages[page] || [];
  const remaining =
    slots.length - pages.slice(0, page + 1).reduce((n, p) => n + p.length, 0);

  const express = hours.map((h) => num(h.expressPrix)).filter((n) => n !== null);
  const expressLo = express.length ? Math.min(...express) : null;

  const cards = [];

  // Tête de grille : Express sur la première page, retour ensuite.
  if (page === 0) {
    cards.push({
      kind: "express",
      tag: "Express",
      price: expressLo !== null ? fmt(expressLo) : "—",
      note:
        expressLo !== null
          ? `${express.length} heure${express.length > 1 ? "s" : ""}`
          : "Non desservi",
    });
  } else {
    cards.push({ kind: "nav", navLabel: "‹", note: "Retour", toPage: page - 1 });
  }

  for (const s of shown) {
    const key = `${zone.lieu} ${s.hour}`;
    cards.push({
      kind: "slot",
      key,
      selected: selectedKey === key,
      tag: s.hour,
      price: fmt(num(s.periodicPrix)),
      note: "Créneau",
    });
  }

  // Remplissage : la grille garde sa hauteur même à moitié vide.
  const target = GRID_SIZE - (remaining > 0 ? 1 : 0);
  while (cards.length < target) {
    cards.push({ kind: "empty", tag: "--:--", price: "000 F", note: "Créneau" });
  }

  if (remaining > 0) {
    cards.push({
      kind: "nav",
      navLabel: `+${remaining}`,
      note: "Voir la suite",
      toPage: page + 1,
    });
  }

  return { cards, page, pageCount: pages.length };
}
