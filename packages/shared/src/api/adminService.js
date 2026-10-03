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

  /**
   * Suppression admin d'une ou plusieurs boutiques — DELETE /fastfood/admin.
   *
   * Soft delete : la boutique reste restaurable pendant `retentionDays` jours
   * (`restoreFastFood`) avant la purge definitive.
   *
   * `scopes` est OBLIGATOIRE cote backend — pas de « tout » implicite. Valeurs
   * acceptees : menus, orders, notifications, bonus, drivers, support,
   * deliveries, ou la chaine "all". Les scopes financiers (withdrawals,
   * settlements, revenues, transactions) sont refuses par le backend.
   *
   * Reponse 207 possible : le lot est partiellement applique (ids inconnus
   * renvoyes dans `skipped`), d'ou le retour complet et non un simple booleen.
   *
   * @returns {Promise<{deleted: Object[], skipped: Object[], scopes: string[], retentionDays: number}>}
   */
  async deleteFastFoods(fastFoodIds, scopes) {
    const res = await http.delete("/fastfood/admin", {
      data: { fastFoodIds, scopes },
    });
    return res.data.data ?? res.data;
  },

  /** Annule une suppression avant la purge — POST /fastfood/admin/:id/restore. */
  async restoreFastFood(fastFoodId) {
    const res = await http.post(`/fastfood/admin/${fastFoodId}/restore`);
    return res.data.data ?? res.data;
  },

  /** Boutiques supprimees encore restaurables — GET /fastfood/admin/deleted. */
  async getDeletedFastFoods() {
    const res = await http.get("/fastfood/admin/deleted");
    return res.data.data || [];
  },
};
