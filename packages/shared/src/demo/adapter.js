// Adaptateur axios du mode demo : repond aux routes du backend depuis les
// fixtures locales. Aucune requete reseau. Les ecritures (menus, commandes,
// boutique) restent dans le navigateur (localStorage, cle STORE_KEY).
import { SHOPS, DEMO_USER, DEMO_UID, buildMenus, buildOrders, buildTransactions } from "./fixtures.js";
import { analyticsResponse, DEMO_BANNERS } from "./analyticsFixtures.js";

const STORE_KEY = "yaammoo-demo-v1";
let store = null;

function load() {
  if (store) return store;
  try {
    store = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    store = null;
  }
  if (!store) store = { shops: {}, menus: {}, orders: {}, deleted: [] };
  return store;
}
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* stockage indisponible : la demo reste en memoire */
  }
}

/** Remet la demo a zero (donnees d'origine). */
export function resetDemo() {
  store = null;
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* rien */
  }
}

const seedOf = (id) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
const shop = (id) => load().shops[id] || SHOPS.find((s) => s.id === id) || null;
function menus(id) {
  const s = load();
  if (!s.menus[id]) s.menus[id] = buildMenus(id, seedOf(id));
  return s.menus[id];
}
function orders(id) {
  const s = load();
  if (!s.orders[id]) s.orders[id] = buildOrders(id, menus(id), id === SHOPS[0].id ? 64 : 24, seedOf(id));
  return s.orders[id];
}
const findMenu = (menuId) => {
  for (const id of Object.keys(load().menus)) {
    const m = store.menus[id].find((x) => x.id === menuId);
    if (m) return m;
  }
  return null;
};
const findOrder = (orderId) => {
  for (const id of Object.keys(load().orders)) {
    const o = store.orders[id].find((x) => x.id === orderId);
    if (o) return o;
  }
  return null;
};

const fileToDataUrl = (file) =>
  new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve("/demo/menus/plantains.jpg");
    r.readAsDataURL(file);
  });

const ok = (data) => ({ data: { data } });

async function route(method, url, body, params) {
  let m;
  if (method === "get" && (m = url.match(/^\/user\/(.+)$/))) return ok({ ...DEMO_USER, id: m[1] });
  if (method === "get" && url === "/fastfood/all") {
    const deleted = load().deleted;
    return ok({ fastfoods: SHOPS.filter((s) => !deleted.includes(s.id)).map((s) => shop(s.id)), banners: DEMO_BANNERS });
  }
  if (method === "get" && url === "/fastfood/admin/deleted")
    return ok(SHOPS.filter((s) => load().deleted.includes(s.id)).map((s) => ({ ...s, deletedAt: new Date().toISOString() })));
  if (method === "delete" && url === "/fastfood/admin") {
    load().deleted.push(...body.fastFoodIds);
    save();
    return ok({ deleted: body.fastFoodIds.map((id) => ({ id })), skipped: [], scopes: ["all"], retentionDays: 30 });
  }
  if (method === "post" && (m = url.match(/^\/fastfood\/admin\/(.+)\/restore$/))) {
    load().deleted = store.deleted.filter((id) => id !== m[1]);
    save();
    return ok({ id: m[1] });
  }
  if (method === "get" && (m = url.match(/^\/fastfood\/(.+)$/))) return ok(shop(m[1]));
  if (method === "post" && (m = url.match(/^\/fastfood\/(.+)$/))) {
    const updated = { ...shop(m[1]), ...body };
    load().shops[m[1]] = updated;
    save();
    return ok(updated);
  }
  if (method === "get" && (m = url.match(/^\/order\/all\/(.+)$/))) return ok(orders(m[1]));
  if (method === "put" && url === "/order") {
    const o = findOrder(body.id);
    if (o) Object.assign(o, body);
    save();
    return ok(o);
  }
  if (method === "post" && url === "/order") {
    const id = body.fastFoodId || SHOPS[0].id;
    const order = { ...body, id: `cmd-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), status: body.status || "pending" };
    orders(id).unshift(order);
    save();
    return ok(order);
  }
  if (method === "get" && (m = url.match(/^\/menu\/(.+)$/))) return ok(menus(m[1]));
  if (method === "post" && url === "/menu") {
    const menu = { ...body, id: `menu-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), ratingAvg: 0, ratingCount: 0 };
    menus(body.fastFoodId).unshift(menu);
    save();
    return ok(menu);
  }
  if (method === "put" && (m = url.match(/^\/menu\/(.+)$/))) {
    const menu = findMenu(m[1]);
    if (menu) Object.assign(menu, body);
    save();
    return ok(menu);
  }
  if (method === "delete" && (m = url.match(/^\/menu\/(.+)$/))) {
    for (const id of Object.keys(load().menus)) store.menus[id] = store.menus[id].filter((x) => x.id !== m[1]);
    save();
    return ok(true);
  }
  if (method === "get" && url.startsWith("/transaction/")) return ok(buildTransactions(orders(SHOPS[0].id)));
  if (method === "get" && url === "/wallet/stats") {
    const tx = buildTransactions(orders(SHOPS[0].id));
    return ok({ balance: 486500, totalIn: tx.reduce((a, t) => a + t.amount, 0), totalOut: 250000, series: [] });
  }
  if (method === "post" && url === "/image/upload") {
    const file = body instanceof FormData ? body.get("image") : null;
    return ok(file ? await fileToDataUrl(file) : "/demo/menus/plantains.jpg");
  }
  if (method === "get" && url.startsWith("/analytics")) return ok(analyticsResponse(url.slice("/analytics".length), params));
  return ok(null);
}

/** Adaptateur axios : remplace le transport HTTP en mode demo. */
export async function demoAdapter(config) {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").split("?")[0];
  let body = config.data;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      /* corps brut */
    }
  }
  // Petite latence pour garder les etats de chargement credibles.
  await new Promise((r) => setTimeout(r, 120));
  const res = await route(method, url, body || {}, config.params);
  return { ...res, status: 200, statusText: "OK", headers: {}, config, request: {} };
}

export { DEMO_UID };
