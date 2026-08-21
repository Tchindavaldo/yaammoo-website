// Service admin plateforme — vue transverse sur toutes les boutiques.
// S'appuie sur les endpoints publics deja consommes par l'app RN
// (/fastfood/all) et agrege cote client les commandes par boutique.
import { http } from "./http.js";

export const adminService = {
  /** Toutes les boutiques de la plateforme. */
  async getFastFoods() {
    const res = await http.get("/fastfood/all");
    const payload = res.data.data;
    // /fastfood/all renvoie soit un tableau, soit { fastfoods, banners }.
    if (Array.isArray(payload)) return payload;
    return payload?.fastfoods || payload?.data || [];
  },

  /** Bannieres du carrousel home (memes donnees que l'app). */
  async getBanners() {
    const res = await http.get("/fastfood/all");
    const payload = res.data.data;
    return Array.isArray(payload) ? [] : payload?.banners || [];
  },

  /** Commandes d'une boutique donnee (reutilise l'endpoint marchand). */
  async getOrdersOf(fastFoodId) {
    const res = await http.get(`/order/all/${fastFoodId}`);
    return res.data.data || [];
  },

  /**
   * Agrege les commandes de toutes les boutiques.
   * Le backend n'expose pas d'endpoint global : on parallelise par boutique.
   */
  async getAllOrders(fastFoodIds) {
    const results = await Promise.allSettled(
      fastFoodIds.map((id) => adminService.getOrdersOf(id)),
    );
    return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  },
};
