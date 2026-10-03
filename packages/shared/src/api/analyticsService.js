// Service statistiques d'usage — routes /analytics/* du backend (admin seul).
// Toutes les lectures prennent la periode { from, to } en ISO 8601 ; le
// backend renvoie les lignes en camelCase, avec `user { name, email, phone }`
// des qu'elles portent un `userId`.
import { http } from "./http.js";

const get = async (path, params) => {
  const res = await http.get(`/analytics${path}`, { params });
  return res.data.data;
};

export const analyticsService = {
  /** { count, users[{ userId, user, since, devices, appVersion, platform }] } */
  getOnline: () => get("/online"),
  /** Par user : connectionCount, firstConnectedAt, lastConnectedAt, totalConnectedS, online. */
  getConnectionStats: (range) => get("/connections/stats", range),
  /** Par user : sessions, totalMs, avgMs, lastSessionAt. */
  getSessionStats: (range) => get("/sessions/stats", range),
  /** Par user : pagesLoaded, maxPage, shopsSeen, avgMsBeforeNextPage. */
  getHomeScroll: (range) => get("/home-scroll", range),
  /** Par boutique : impressions, viewers, avgVisibleMs, opens, menuOpens, addToCart. */
  getShops: (range) => get("/shops", range),
  /** [{ step, users, events }] de shop_open a payment_success / payment_failed. */
  getFunnel: (range) => get("/funnel", range),
  /** [{ query, searches, users, zeroResults }] */
  getSearches: (range) => get("/searches", { ...range, limit: 20 }),
  /** Serie par jour : activeUsers, sessions, totalMs, connections, homePages,
   *  impressions, shopOpens, addToCart, checkouts, paymentsSuccess, searches. */
  getDaily: (range) => get("/daily", range),
  /** [{ bannerId, views, clicks, viewers, clickers }] */
  getBanners: (range) => get("/banners", range),
  /** Fiche d'un utilisateur : connexions, sessions, scroll du home, evenements. */
  getUser: (userId, range) => get(`/users/${encodeURIComponent(userId)}`, { ...range, limit: 50 }),
};
