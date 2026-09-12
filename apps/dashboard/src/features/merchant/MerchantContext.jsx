// Contexte marchand — portage web de
// yaammoo/src/features/merchant/context/MerchantContext.tsx
// Memes donnees (commandes, menus, transactions), memes upserts socket.
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { merchantService, socketService, ORDER_EVENTS } from "@yaammoo/shared";
import { useAuth } from "../auth/AuthContext.jsx";

const MerchantContext = createContext(undefined);

export function MerchantProvider({ children }) {
  const { fastFoodId: authFastFoodId, uid, isAdmin } = useAuth();
  // L'admin peut piloter une autre boutique que la sienne.
  const [overrideFastFoodId, setOverrideFastFoodId] = useState(null);
  const fastFoodId = overrideFastFoodId || authFastFoodId;

  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!fastFoodId) return;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const [orderData, menuData, shop] = await Promise.all([
          merchantService.getOrders(fastFoodId),
          merchantService.getMenus(fastFoodId),
          merchantService.getFastFood(fastFoodId).catch(() => null),
        ]);
        setOrders(orderData);
        setMenus(menuData);
        setBoutique(shop);
        if (uid) {
          const tx = await merchantService.getTransactions(uid).catch(() => []);
          setTransactions(tx);
        }
      } catch (err) {
        console.error("Merchant fetch error:", err);
        setError("Erreur lors du chargement des donnees marchand");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [fastFoodId, uid],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Upserts socket : injection directe, sans refetch (comme l'app RN) ──
  const upsertOrder = useCallback((order) => {
    if (!order?.id) return;
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...order };
        return next;
      }
      return [order, ...prev];
    });
  }, []);

  const upsertOrders = useCallback((incoming) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    setOrders((prev) => {
      const byId = new Map(prev.map((o) => [o.id, o]));
      for (const order of incoming) {
        if (!order?.id) continue;
        const existing = byId.get(order.id);
        byId.set(order.id, existing ? { ...existing, ...order } : order);
      }
      return Array.from(byId.values());
    });
  }, []);

  const upsertMenu = useCallback((menu) => {
    if (!menu?.id) return;
    setMenus((prev) => {
      const idx = prev.findIndex((m) => m.id === menu.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...menu };
        return next;
      }
      return [menu, ...prev];
    });
  }, []);

  const removeMenu = useCallback((menuId) => {
    if (!menuId) return;
    setMenus((prev) => prev.filter((m) => m.id !== menuId));
  }, []);

  // Abonnement socket a la room de la boutique.
  useEffect(() => {
    if (!fastFoodId) return;
    const room = `fastfood:${fastFoodId}`;
    socketService.joinRoom(room);

    const offs = [
      socketService.on(ORDER_EVENTS.newOrder, upsertOrder),
      socketService.on(ORDER_EVENTS.orderUpdated, upsertOrder),
      socketService.on(ORDER_EVENTS.newOrders, upsertOrders),
      socketService.on(ORDER_EVENTS.ordersUpdated, upsertOrders),
      socketService.on(ORDER_EVENTS.ranksUpdated, upsertOrders),
      socketService.on(ORDER_EVENTS.menuCreated, upsertMenu),
      socketService.on(ORDER_EVENTS.menuUpdated, upsertMenu),
      socketService.on(ORDER_EVENTS.menuDeleted, (payload) =>
        removeMenu(payload?.id || payload),
      ),
    ];

    return () => {
      offs.forEach((off) => off());
      socketService.leaveRoom(room);
    };
  }, [fastFoodId, upsertOrder, upsertOrders, upsertMenu, removeMenu]);

  const updateStatus = useCallback(async (orderId, status) => {
    try {
      await merchantService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
      return true;
    } catch (err) {
      console.error("Failed to update status:", err);
      return false;
    }
  }, []);

  const delegateOrder = useCallback(async (orderId, driverId) => {
    try {
      await merchantService.delegateOrder(orderId, driverId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, driverId } : o)),
      );
      return true;
    } catch (err) {
      console.error("Failed to delegate order:", err);
      return false;
    }
  }, []);

  const addMenu = useCallback(
    async (menu) => {
      if (!fastFoodId) return;
      await merchantService.addMenu(fastFoodId, menu);
      await fetchData(false);
    },
    [fastFoodId, fetchData],
  );

  const updateMenu = useCallback(
    async (menuId, menu) => {
      await merchantService.updateMenu(menuId, menu);
      await fetchData(false);
    },
    [fetchData],
  );

  const stats = useMemo(
    () => ({
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      completedOrders: orders.filter(
        (o) => o.status === "completed" || o.status === "finished",
      ).length,
      totalRevenue: orders
        .filter((o) => o.status === "completed" || o.status === "finished")
        .reduce((acc, o) => acc + (o.total || 0), 0),
    }),
    [orders],
  );

  const value = {
    orders,
    menus,
    transactions,
    boutique,
    loading,
    error,
    fastFoodId,
    isAdmin,
    overrideFastFoodId,
    setOverrideFastFoodId,
    refresh: fetchData,
    updateStatus,
    delegateOrder,
    addMenu,
    updateMenu,
    stats,
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be used within a MerchantProvider");
  return ctx;
}
