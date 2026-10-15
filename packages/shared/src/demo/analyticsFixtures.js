// Statistiques d'usage fictives du mode demo (routes /analytics/*).
import { SHOPS } from "./fixtures.js";

const USERS = [
  ["Arnaud Mbarga", "android"], ["Christelle Fouda", "ios"], ["Brice Tchoumi", "android"],
  ["Larissa Eyenga", "android"], ["Junior Kamga", "ios"], ["Sandrine Biya", "android"],
  ["Herve Nkodo", "android"], ["Carine Ndzana", "ios"], ["Patrick Essomba", "android"],
  ["Vanessa Atangana", "android"], ["Franck Djoumessi", "ios"], ["Nadege Mballa", "android"],
].map(([name, platform], i) => ({
  userId: `client-${i}`,
  platform,
  user: { name, email: `${name.split(" ")[0].toLowerCase()}@exemple.cm`, phone: `+237 6 9${i} 00 00 0${i}` },
}));

const wave = (i, base, amp) => Math.round(base + amp * (0.6 + 0.4 * Math.sin(i / 2.3)) + (i % 3) * amp * 0.1);
const daysOf = (range) => {
  const to = range?.to ? new Date(range.to) : new Date();
  const from = range?.from ? new Date(range.from) : new Date(to.getTime() - 29 * 86400000);
  const n = Math.max(1, Math.min(90, Math.round((to - from) / 86400000) + 1));
  return Array.from({ length: n }, (_, i) => new Date(from.getTime() + i * 86400000).toISOString().slice(0, 10));
};

export function analyticsResponse(path, params = {}) {
  const now = Date.now();
  const ago = (h) => new Date(now - h * 3600000).toISOString();
  if (path === "/daily")
    return daysOf(params).map((day, i) => {
      const activeUsers = wave(i, 140, 90);
      return {
        day, activeUsers, sessions: Math.round(activeUsers * 2.4), totalMs: activeUsers * 410000,
        connections: Math.round(activeUsers * 3.1), homePages: Math.round(activeUsers * 4.2),
        impressions: Math.round(activeUsers * 18), shopOpens: Math.round(activeUsers * 1.6),
        addToCart: Math.round(activeUsers * 0.55), checkouts: Math.round(activeUsers * 0.3),
        paymentsSuccess: Math.round(activeUsers * 0.24), searches: Math.round(activeUsers * 0.8),
      };
    });
  if (path === "/connections/stats")
    return USERS.map((u, i) => ({
      ...u, connectionCount: 60 - i * 4, firstConnectedAt: ago(24 * 40), lastConnectedAt: ago(i * 3),
      totalConnectedS: (60 - i * 4) * 380, online: i < 4,
    }));
  if (path === "/sessions/stats")
    return USERS.map((u, i) => ({ ...u, sessions: 42 - i * 3, totalMs: (42 - i * 3) * 300000, avgMs: 300000 - i * 9000, lastSessionAt: ago(i * 3) }));
  if (path === "/home-scroll")
    return USERS.map((u, i) => ({ ...u, pagesLoaded: 80 - i * 5, maxPage: 9 - (i % 5), shopsSeen: 35 - i * 2, avgMsBeforeNextPage: 6200 + i * 300 }));
  if (path === "/shops")
    return SHOPS.map((s, i) => ({
      fastfoodId: s.id, impressions: 9400 - i * 780, viewers: 1800 - i * 140, avgVisibleMs: 2400 - i * 90,
      opens: 1650 - i * 150, menuOpens: 1200 - i * 110, addToCart: 520 - i * 45,
    }));
  if (path === "/funnel")
    return [
      ["shop_open", 1840, 5200], ["menu_open", 1320, 3900], ["add_to_cart", 690, 1450],
      ["checkout_start", 410, 620], ["payment_success", 352, 498], ["payment_failed", 41, 63],
    ].map(([step, users, events]) => ({ step, users, events }));
  if (path === "/searches")
    return [
      ["ndole", 214, 160, 0], ["poulet dg", 188, 141, 0], ["soya", 132, 98, 0], ["poisson braise", 120, 95, 0],
      ["shawarma", 96, 80, 0], ["eru", 41, 37, 12], ["koki", 28, 25, 9],
    ].map(([query, searches, users, zeroResults]) => ({ query, searches, users, zeroResults }));
  if (path === "/banners")
    return [["demo-banner-1", 5400, 620], ["demo-banner-2", 3900, 310], ["demo-banner-3", 2100, 140]].map(
      ([bannerId, views, clicks]) => ({ bannerId, views, clicks, viewers: Math.round(views * 0.6), clickers: Math.round(clicks * 0.9) }),
    );
  if (path === "/online")
    return { count: 4, users: USERS.slice(0, 4).map((u, i) => ({ ...u, since: ago(i * 0.3), devices: 1, appVersion: "1.0.3" })) };
  if (path.startsWith("/users/")) {
    const u = USERS.find((x) => path.endsWith(x.userId)) || USERS[0];
    return {
      user: u.user,
      homeScroll: { pagesLoaded: 64, maxPage: 8, shopsSeen: 31 },
      connections: [0, 1, 2].map((k) => ({ id: `c${k}`, startedAt: ago(k * 26), durationMs: 1500000, platform: u.platform, appVersion: "1.0.3", osVersion: "14", deviceModel: "Tecno Camon 20" })),
      sessions: [0, 1, 2].map((k) => ({ id: `s${k}`, startedAt: ago(k * 26), durationMs: 420000, platform: u.platform, appVersion: "1.0.3" })),
      events: [],
    };
  }
  return [];
}

export const DEMO_BANNERS = [
  { id: "demo-banner-1", title: "Week-end grillades -20%", image: "/demo/shops/grillades.jpg" },
  { id: "demo-banner-2", title: "Livraison offerte a Bastos", image: "/demo/shops/terrasse.jpg" },
  { id: "demo-banner-3", title: "Nouveau : Kawa Corner", image: "/demo/shops/cafe.jpg" },
];
