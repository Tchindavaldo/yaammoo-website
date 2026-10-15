// Donnees fictives du mode demo (VITE_DEMO=1). Aucune donnee reelle :
// boutiques, clients, numeros et montants sont inventes. Contexte Cameroun
// (FCFA, quartiers de Yaounde et Douala). Images servies depuis /demo/.

export const DEMO_EMAIL = "demo@yaammoo.cm";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_UID = "demo-user-001";
export const DEMO_SHOP_ID = "demo-shop-001";

export const DEMO_USER = {
  id: DEMO_UID,
  fastFoodId: DEMO_SHOP_ID,
  isAdmin: true,
  infos: { nom: "Mireille Ngono", email: DEMO_EMAIL, numero: "+237 6 90 00 00 00" },
};

const img = (f) => `/demo/menus/${f}.jpg`;
const shopImg = (f) => `/demo/shops/${f}.jpg`;

// Seed deterministe : memes donnees a chaque chargement.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const zones = (pairs) => pairs.map(([lieu, prix]) => ({ lieu, prix: String(prix) }));

export const SHOPS = [
  {
    id: DEMO_SHOP_ID, name: "Chez Mama Ngono", category: "Cuisine camerounaise",
    image: shopImg("maquis"), address: "Bastos, Yaounde", city: "Yaounde",
    number: "+237 6 90 00 00 00", momoNumber: "+237 6 70 00 00 00", whatsappNumber: "+237 6 90 00 00 00",
    openTime: "08:00", closeTime: "22:30", openDays: [true, true, true, true, true, true, false],
    orderLeadTime: 35, advanceDays: 3, pickupAllowed: true, monthlyGoal: 2500000,
    cities: ["Yaounde"], isOpen: true, orders: 1284,
    deliveryHours: [
      { hour: "11:30", express: true, periodic: true,
        expressZones: zones([["Bastos", 1000], ["Mvog-Mbi", 1500], ["Biyem-Assi", 1500]]),
        periodicZones: zones([["Bastos", 500], ["Mvog-Mbi", 800], ["Biyem-Assi", 800]]) },
      { hour: "13:00", express: true, periodic: true,
        expressZones: zones([["Bastos", 1000], ["Ngousso", 1200], ["Essos", 1200]]),
        periodicZones: zones([["Bastos", 500], ["Ngousso", 700], ["Essos", 700]]) },
      { hour: "19:00", express: true, periodic: true,
        expressZones: zones([["Bastos", 1000], ["Omnisport", 1500], ["Mvog-Mbi", 1500]]),
        periodicZones: zones([["Bastos", 500], ["Omnisport", 800], ["Mvog-Mbi", 800]]) },
      { hour: "20:30", express: false, periodic: true, expressZones: [],
        periodicZones: zones([["Bastos", 500], ["Ngousso", 700]]) },
    ],
  },
  { id: "demo-shop-002", name: "Le Braiseur d'Akwa", category: "Grillades", image: shopImg("grillades"), address: "Akwa, Douala", orders: 962, isOpen: true },
  { id: "demo-shop-003", name: "Snack La Rotonde", category: "Fast-food", image: shopImg("snack"), address: "Bonapriso, Douala", orders: 734, isOpen: true },
  { id: "demo-shop-004", name: "Cafe des Palmiers", category: "Cafe", image: shopImg("palmier"), address: "Bonanjo, Douala", orders: 411, isOpen: true },
  { id: "demo-shop-005", name: "Brasserie du Lac", category: "Brasserie", image: shopImg("brasserie"), address: "Etoa-Meki, Yaounde", orders: 588, isOpen: false, status: "closed" },
  { id: "demo-shop-006", name: "Terrasse Melen", category: "Restaurant", image: shopImg("terrasse"), address: "Melen, Yaounde", orders: 302, isOpen: true },
  { id: "demo-shop-007", name: "Lounge Santa Barbara", category: "Lounge", image: shopImg("lounge"), address: "Santa Barbara, Yaounde", orders: 219, isOpen: true },
  { id: "demo-shop-008", name: "Maison du Bois", category: "Cuisine maison", image: shopImg("bois"), address: "Logpom, Douala", orders: 167, isOpen: true },
  { id: "demo-shop-009", name: "Marche Mokolo Express", category: "Epicerie", image: shopImg("marche"), address: "Mokolo, Yaounde", orders: 95, isOpen: true },
  { id: "demo-shop-010", name: "Kawa Corner", category: "Cafe", image: shopImg("cafe"), address: "Bonamoussadi, Douala", orders: 143, isOpen: true },
];

const EXTRAS = [["Plantain mur", 500], ["Miondo", 300], ["Baton de manioc", 300], ["Frites de plantain", 500], ["Piment maison", 0], ["Riz blanc", 500]];
const DRINKS = [["Top Ananas", 500], ["Djino Cocktail", 500], ["Jus de foleré", 700], ["Eau Supermont", 400], ["Jus de gingembre", 600]];
const pick = (list, idx) => idx.map((i) => ({ name: list[i][0], prix: String(list[i][1]), status: true }));

const MENU_DEFS = [
  ["Ndole crevettes", "ndole", [[3500, "Portion simple"], [5000, "Portion double"]], [0, 1], [0, 2]],
  ["Poulet DG", "poulet-dg", [[4500, "Demi-poulet"], [8000, "Poulet entier"]], [0], [0, 1]],
  ["Poisson braise", "poisson-braise", [[4000, "Bar moyen"], [6000, "Gros bar"]], [1, 4], [0, 3]],
  ["Soya de boeuf", "soya", [[1000, "Petit sachet"], [2000, "Grand sachet"]], [4], [1]],
  ["Brochettes mixtes", "brochettes", [[1500, "3 piques"], [2500, "6 piques"]], [3, 4], [0]],
  ["Poulet braise attieke", "poulet-braise-attieke", [[3000, "Quart"], [5000, "Demi"]], [4], [0, 1]],
  ["Riz saute au poulet", "riz-saute", [[2500, "Normal"], [3500, "Grand"]], [4], [3]],
  ["Jollof rice et poisson", "jollof-poisson", [[3000, "Normal"]], [0], [0]],
  ["Poulet roti et jollof", "poulet-roti-jollof", [[3500, "Quart"], [6000, "Demi"]], [0, 4], [1]],
  ["Boeuf sauce arachide", "boeuf-arachide", [[3000, "Portion"]], [1, 5], [2]],
  ["Beignets haricots bouillie", "beignets-haricots", [[800, "Formule matin"]], [], [4]],
  ["Beignets souffles", "beignets", [[500, "10 pieces"], [1000, "25 pieces"]], [], [4]],
  ["Plantains frits", "plantain-frit", [[700, "Assiette"]], [4], [0]],
  ["Plantains et haricots", "plantains", [[1200, "Assiette"]], [4], [3]],
  ["Shawarma poulet", "shawarma", [[2000, "Simple"], [2800, "Avec frites"]], [3], [1]],
  ["Burger maison", "burger", [[2500, "Simple"], [3500, "Double"]], [3], [1, 3]],
  ["Menu burger frites", "burger-frites", [[3500, "Menu"]], [], [0, 1]],
  ["Pizza camerounaise", "pizza", [[4500, "Moyenne"], [7000, "Grande"]], [], [1, 3]],
  ["Foleré glace", "folere", [[700, "50 cl"], [1200, "1 L"]], [], []],
  ["Jus d'ananas frais", "jus-ananas", [[800, "50 cl"]], [], []],
  ["Jus naturels (assortis)", "jus-naturels", [[1000, "50 cl"], [1800, "1 L"]], [], []],
];

export function buildMenus(shopId, seed = 7) {
  const r = rng(seed);
  const base = Date.parse("2026-10-14T10:00:00Z");
  return MENU_DEFS.map(([name, file, prices, ex, dr], i) => ({
    id: `${shopId}-menu-${i + 1}`,
    fastFoodId: shopId,
    name,
    status: i === 7 || i === 17 ? "unavailable" : "available",
    prices: prices.map(([price, description]) => ({ price, description })),
    extra: pick(EXTRAS, ex),
    drink: pick(DRINKS, dr),
    images: [img(file)],
    coverImage: img(file),
    stock: Math.round(8 + r() * 60),
    ratingAvg: Math.round((3.8 + r() * 1.2) * 10) / 10,
    ratingCount: Math.round(12 + r() * 240),
    createdAt: new Date(base - i * 86400000 * 2).toISOString(),
  }));
}

const CLIENTS = [
  "Arnaud Mbarga", "Christelle Fouda", "Brice Tchoumi", "Larissa Eyenga", "Junior Kamga",
  "Sandrine Biya", "Herve Nkodo", "Carine Ndzana", "Patrick Essomba", "Vanessa Atangana",
  "Franck Djoumessi", "Nadege Mballa", "Yannick Owona", "Prisca Ekambi", "Steve Nana",
];
const NOTES = [
  "Pas trop pimente svp, c'est pour les enfants.",
  "Appelez-moi en arrivant au portail bleu, derriere la pharmacie.",
  "Mettre le piment a part, merci.",
];
const STATUSES = ["pending", "pending", "processing", "active", "finished", "finished", "finished", "delivered"];
const ZONES = ["Bastos", "Mvog-Mbi", "Biyem-Assi", "Ngousso", "Essos", "Omnisport"];
const TIMES = ["11:30", "13:00", "19:00", "20:30"];

export function buildOrders(shopId, menus, count = 64, seed = 11) {
  const r = rng(seed);
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const menu = menus[Math.floor(r() * menus.length)];
    const qty = 1 + Math.floor(r() * 3);
    const unit = menu.prices[0].price;
    const mode = r();
    const deliver = mode > 0.35;
    const type = mode > 0.75 ? "express" : "periodic";
    const fee = deliver ? (type === "express" ? 1000 : 500) : 0;
    const status = i < 6 ? (i < 3 ? "pending" : "processing") : STATUSES[Math.floor(r() * STATUSES.length)];
    const offsetH = i < 6 ? -(i + 1) * 0.8 : r() * 24 * 9;
    const date = new Date(now - offsetH * 3600000).toISOString();
    const c = Math.floor(r() * CLIENTS.length);
    return {
      id: `cmd${(1048 + i).toString(36)}${shopId.slice(-3)}`,
      reference: `YM-${2400 + count - i}`,
      fastFoodId: shopId,
      userId: `client-${c}`,
      userData: { nom: CLIENTS[c], email: `${CLIENTS[c].split(" ")[0].toLowerCase()}@exemple.cm` },
      status,
      items: [{ name: menu.name, quantity: qty, price: unit }],
      total: unit * qty + fee,
      paid: !(i % 13 === 5),
      createdAt: date,
      rank: i + 1,
      note: i === 1 || i === 4 || i === 9 ? NOTES[i % 3] : undefined,
      delivery: deliver
        ? { status: true, type: type === "express" ? "express" : "delivery", time: TIMES[i % 4], zone: ZONES[c % ZONES.length], date, fee }
        : { status: false },
    };
  });
}

export function buildTransactions(orders) {
  return orders
    .filter((o) => o.paid && o.status !== "pending")
    .slice(0, 30)
    .map((o, i) => ({
      id: `tx-${o.id}`,
      type: "payment",
      amount: o.total,
      method: i % 3 === 0 ? "Orange Money" : "MTN MoMo",
      status: "success",
      orderId: o.id,
      createdAt: o.createdAt,
    }));
}
