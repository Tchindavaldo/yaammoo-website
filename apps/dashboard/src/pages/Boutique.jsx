// Écran « Boutique » — portage fidèle de « Dashboard Boutique.html »
// Coque et défilement : la sidebar et le header de DashboardLayout restent les seuls éléments globaux.
// Découpé en sous-composants modulaires conformément à architecture/boutique.md.

import { useMemo, useState } from "react";
import { adminService, formatXAF, isUntreated, orderTotal, tabOf } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

import AdminShopRail from "../components/boutique/AdminShopRail.jsx";
import BoutiqueCardsCol from "../components/boutique/BoutiqueCardsCol.jsx";
import BoutiqueDetailCol from "../components/boutique/BoutiqueDetailCol.jsx";
import BoutiqueEditForm from "../components/boutique/BoutiqueEditForm.jsx";

/* ---------------------------------------------------------------- données */

const TEAM = [
  { role: "Cuisine", name: "Louise Mbala", phone: "+237 6 71 22 04 11" },
  { role: "Livraison", name: "Haris Nkodo", phone: "+237 6 98 40 15 02" },
];

const AVATAR_COLORS = ["#2f6fd0", "#7c3aed", "#0f766e", "#ec4913"];

const LATE_LEVELS = [
  { tag: "Urgent", tagBg: "#fdeceb", tagColor: "#b3261e" },
  { tag: "Élevé", tagBg: "#fdf1e3", tagColor: "#8a4b00" },
  { tag: "Normal", tagBg: "#e8f5ec", tagColor: "#15803d" },
];

/** Une commande est en retard quand son créneau est déjà passé. */
function isLate(order) {
  const iso = order.delivery?.date || order.createdAt;
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

// Emplacement d'image (<image-slot>) : cadre gris + libellé.
function ImageSlot({ label, style }) {
  return (
    <div
      style={{
        background: "#f1f3f6",
        border: "1px solid #eceef2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#a2aab6",
        ...style,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c6cbd3" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="2" />
        <path d="M4 18l5-5 4 4 3-3 4 4" />
      </svg>
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function Boutique() {
  const { orders, menus, boutique, setOverrideFastFoodId, fastFoodId, updateBoutique } =
    useMerchant();
  const toast = useToast();
  const { isAdmin } = useAuth();

  // Suppression admin : soft delete restaurable, reserve aux admins (R14).
  // `scopes: "all"` = toutes les donnees supprimables cote backend ; les scopes
  // financiers ne sont jamais purges (le backend les refuse).
  function handleDeleteShop() {
    if (!isAdmin) {
      toast.err("Action réservée aux admins");
      return;
    }
    if (!fastFoodId) return;
    setConfirmDelete(true);
  }

  async function confirmDeleteShop() {
    setDeleting(true);
    try {
      const res = await adminService.deleteFastFoods([fastFoodId], "all");
      if (res?.skipped?.length && !res?.deleted?.length) {
        toast.err("Suppression ignorée", "Boutique introuvable côté serveur.");
        return;
      }
      toast.ok(
        "Boutique supprimée",
        res?.retentionDays ? `Restaurable pendant ${res.retentionDays} jours.` : undefined,
      );
      setOverrideFastFoodId(null);
      setConfirmDelete(false);
    } catch (e) {
      console.error("Echec suppression boutique:", e);
      toast.err("Suppression impossible", e?.message);
    } finally {
      setDeleting(false);
    }
  }

  const shopName = boutique?.name || boutique?.nom || "Ma boutique";
  const shopKind = boutique?.category || boutique?.type || "Restaurant";
  const shopPhoto = boutique?.image || boutique?.photo || boutique?.logo || null;

  // Chiffres de la fiche boutique : clients distincts, commandes, plats.
  const stats = useMemo(() => {
    const clients = new Set();
    for (const o of orders) {
      const key = o.userId || o.userData?.email;
      if (key) clients.add(key);
    }
    const upcoming = orders.filter(isUntreated).length;
    return [
      { value: clients.size.toLocaleString("fr-FR"), label: "Clients" },
      { value: orders.length.toLocaleString("fr-FR"), label: "Commandes" },
      { value: String(menus?.length || 0), label: "Plats" },
      { value: String(upcoming), label: "À venir" },
    ];
  }, [orders, menus]);

  // Répartition par statut, avec les mêmes regroupements que l'app RN.
  const orderStates = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let done = 0;
    for (const o of orders) {
      const tab = tabOf(o.status);
      if (tab === "pending") pending += 1;
      else if (tab === "proccess") processing += 1;
      else done += 1;
    }
    const late = orders.filter((o) => isUntreated(o) && isLate(o)).length;
    return [
      { dot: "#2f6fd0", value: String(pending), label: "Nouvelles" },
      { dot: "#1b1f27", value: String(done), label: "Ouvertes" },
      { dot: "#f5b301", value: String(processing), label: "En cours" },
      { dot: "#ec4913", value: String(late), label: "En retard" },
    ];
  }, [orders]);

  // Encaissements : total encaissé, part livraison, impayés.
  const cashin = useMemo(() => {
    let total = 0;
    let delivery = 0;
    let unpaid = 0;
    for (const o of orders) {
      const amount = orderTotal(o);
      total += amount;
      if (o.delivery?.fee) delivery += Number(o.delivery.fee) || 0;
      if (o.paid === false || o.paymentStatus === "unpaid") unpaid += amount;
    }
    return [
      { value: formatXAF(total), label: "Ventes · FCFA", accent: false },
      { value: formatXAF(delivery), label: "Livraisons", accent: false },
      { value: formatXAF(0), label: "Pourboires", accent: false },
      { value: formatXAF(unpaid), label: "Impayés", accent: true },
    ];
  }, [orders]);

  // Barres hebdomadaires : sur place / livrées, normalisées sur le pic.
  const weekBars = useMemo(() => {
    const labels = ["L", "M", "M", "J", "V", "S", "D"];
    const buckets = labels.map(() => ({ place: 0, livree: 0 }));
    for (const o of orders) {
      const iso = o.delivery?.date || o.createdAt;
      if (!iso) continue;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) continue;
      const idx = (d.getDay() + 6) % 7; // lundi = 0
      if (o.delivery?.type === "delivery" || o.deliveryType === "delivery") {
        buckets[idx].livree += 1;
      } else {
        buckets[idx].place += 1;
      }
    }
    const peak = Math.max(1, ...buckets.map((b) => b.place + b.livree));
    return labels.map((label, i) => ({
      label,
      place: Math.round((buckets[i].place / peak) * 100),
      livree: Math.round((buckets[i].livree / peak) * 100),
    }));
  }, [orders]);

  // Commandes en retard : les non traitées dont le créneau est dépassé.
  const lateOrders = useMemo(
    () =>
      orders
        .filter((o) => isUntreated(o) && isLate(o))
        .slice(0, 3)
        .map((o, i) => {
          const level = LATE_LEVELS[Math.min(i, LATE_LEVELS.length - 1)];
          return {
            ref: o.reference || o.id?.slice(0, 6).toUpperCase() || "—",
            kind: o.delivery?.type === "delivery" ? "Livraison" : "À emporter",
            dish: o.items?.[0]?.name || `${o.items?.length || 0} article(s)`,
            client: o.userData?.nom || o.userData?.email || "Client",
            color: AVATAR_COLORS[i % AVATAR_COLORS.length],
            ...level,
          };
        }),
    [orders],
  );

  // Dernières demandes clients : commandes portant une note.
  const requests = useMemo(
    () =>
      orders
        .filter((o) => o.note || o.comment)
        .slice(0, 3)
        .map((o, i) => ({
          name: o.userData?.nom || o.userData?.email || "Client",
          order: `Commande ${o.reference || o.id?.slice(0, 4) || ""}`.trim(),
          color: AVATAR_COLORS[i % AVATAR_COLORS.length],
          text: o.note || o.comment,
        })),
    [orders],
  );

  // Plats à mettre en avant : les menus du catalogue.
  const dishes = useMemo(
    () =>
      (menus || []).slice(0, 4).map((m) => ({
        name: m.name || m.nom || "Plat",
        price: formatXAF(m.price || m.prix || 0),
        date: m.updatedAt ? new Date(m.updatedAt).toLocaleDateString("fr-FR") : "",
        photo: m.image || m.photo || null,
      })),
    [menus],
  );

  const [editingShop, setEditingShop] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Objectif mensuel : tiré du champ boutique si disponible.
  const goal = boutique?.monthlyGoal != null ? Math.min(100, Math.round((orders.length / boutique.monthlyGoal) * 100)) : null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isAdmin
            ? "minmax(220px,260px) minmax(0,1.9fr) minmax(230px,1fr)"
            : "minmax(0,1.9fr) minmax(230px,1fr)",
          gap: 14,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0,
          height: "100%",
        }}
      >
        {/* ──── Colonne 1 admin : liste des boutiques ──── */}
        {isAdmin && (
          <AdminShopRail
            activeFastFoodId={fastFoodId}
            onSelect={setOverrideFastFoodId}
            onRestored={() => toast.ok("Boutique restaurée")}
          />
        )}

        {/* ──── Colonne 2 : Cartes empilées (Col 2 d'origine) ──── */}
        <BoutiqueCardsCol
          cashin={cashin}
          requests={requests}
          lateOrders={lateOrders}
          dishes={dishes}
          ImageSlot={ImageSlot}
        />

        {/* ──── Colonne 3 : Fiche boutique (Col 3 d'origine) ──── */}
        <BoutiqueDetailCol
          shopName={shopName}
          shopKind={shopKind}
          shopPhoto={shopPhoto}
          stats={stats}
          goal={goal}
          weekBars={weekBars}
          orderStates={orderStates}
          TEAM={TEAM}
          ImageSlot={ImageSlot}
          onEditShop={() => setEditingShop(true)}
          onDeleteShop={handleDeleteShop}
        />
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette boutique ?"
          message={`${shopName} sera retirée de la plateforme. Elle reste restaurable quelques jours depuis l'onglet « Boutiques supprimées ».`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDeleteShop}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Tiroir latéral de modification avec arrière-plan flouté (blur) */}
      {editingShop && (
        <>
          <div className="mpanel-scrim" onClick={() => setEditingShop(false)} />
          <aside className="mpanel" role="dialog" aria-label="Modifier la boutique">
            <div className="mpanel-head">
              <span className="mpanel-title">Modifier la boutique</span>
              <button
                type="button"
                className="mpanel-close"
                onClick={() => setEditingShop(false)}
                aria-label="Fermer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BoutiqueEditForm
              boutique={boutique}
              onSave={async (payload) => {
                try {
                  await updateBoutique(payload);
                  setEditingShop(false);
                  toast.ok("Boutique enregistrée");
                } catch (e) {
                  console.error("Echec mise a jour boutique:", e);
                  toast.err("Enregistrement impossible", e?.message);
                  throw e;
                }
              }}
              onCancel={() => setEditingShop(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
