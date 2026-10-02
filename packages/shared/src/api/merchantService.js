// Service marchand — portage web de
// yaammoo/src/features/merchant/services/merchantService.ts
// Memes endpoints, memes contrats. Le token est pose par l'intercepteur http.
import { http } from "./http.js";

export const merchantService = {
  async getOrders(fastFoodId) {
    const res = await http.get(`/order/all/${fastFoodId}`);
    return res.data.data || [];
  },

  async updateOrderStatus(orderId, status) {
    await http.put("/order", { id: orderId, status });
  },

  /** Delegue une commande a un livreur (pose driverId, statut inchange). */
  async delegateOrder(orderId, driverId) {
    await http.put("/order", { id: orderId, driverId });
  },

  async getMenus(fastFoodId) {
    const res = await http.get(`/menu/${fastFoodId}`);
    return res.data.data || [];
  },

  async addMenu(fastFoodId, menu) {
    await http.post("/menu", { ...menu, fastFoodId });
  },

  /** Modification d'un menu — PUT /menu/:id, meme payload que la creation
      (voir handleSave dans MenuManagePanel.tsx cote app mobile). */
  async updateMenu(menuId, menu) {
    await http.put(`/menu/${menuId}`, menu);
  },

  async getTransactions(userId) {
    const res = await http.get(`/transaction/${userId}`);
    return res.data.data || [];
  },

  /** Stats portefeuille — le marchand est deduit du token. */
  async getWalletStats(period = "month") {
    const res = await http.get("/wallet/stats", {
      params: { groupBy: "day", period },
    });
    return res.data.data;
  },

  /** Cree une commande (caisse / POS). Meme endpoint que l'app client. */
  async createOrder(payload) {
    const res = await http.post("/order", payload);
    return res.data.data;
  },

  async getUser(uid) {
    const res = await http.get(`/user/${uid}`);
    return res.data.data;
  },

  async getFastFood(fastFoodId) {
    const res = await http.get(`/fastfood/${fastFoodId}`);
    return res.data.data;
  },

  /**
   * Televerse une image et renvoie son URL publique (Supabase storage).
   *
   * Contrat backend (R18) : POST /image/upload, multipart/form-data, champ
   * `image`, reponse { data: "<url>" }. C'est cette URL qu'on stocke ensuite
   * dans `fastfood.image`.
   */
  async uploadImage(file) {
    const form = new FormData();
    form.append("image", file);
    const res = await http.post("/image/upload", form);
    return res.data.data;
  },

  /** Modification d'une boutique — POST /fastfood/:fastFoodId (contrat backend real). */
  async updateFastFood(fastFoodId, payload) {
    const res = await http.post(`/fastfood/${fastFoodId}`, payload);
    return res.data.data;
  },
};
