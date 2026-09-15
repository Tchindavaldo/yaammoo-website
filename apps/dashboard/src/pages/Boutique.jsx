// Ecran « Boutique » — portage fidele de « Dashboard Boutique.html »
// (section sc-if isOverview, celle qui s'affiche a l'ouverture du fichier).
// Comme Overview, la page porte son propre header et son propre defilement :
// la sidebar et la coque de DashboardLayout restent les seuls elements
// globaux. Les styles inline viennent tels quels du fichier de reference.
//
// Les chiffres proviennent de useMerchant() (memes services partages que le
// reste du dashboard) ; le design reste la maquette, les donnees sont reelles.
import { useEffect, useMemo, useState } from "react";
import { adminService, formatXAF, isUntreated, orderTotal, tabOf } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";

/* ---------------------------------------------------------------- donnees */

const TEAM = [
  { role: "Cuisine", name: "Louise Mbala", phone: "+237 6 71 22 04 11" },
  { role: "Livraison", name: "Haris Nkodo", phone: "+237 6 98 40 15 02" },
];

const TEAM_DOTS = ["#2f6fd0", "#7c3aed", "#0f766e", "#ec4913"];

// Couleurs d'avatar du design, reprises dans l'ordre.
const AVATAR_COLORS = ["#2f6fd0", "#7c3aed", "#0f766e", "#ec4913"];

// Pastilles de priorite des commandes en retard.
const LATE_LEVELS = [
  { tag: "Urgent", tagBg: "#fdeceb", tagColor: "#b3261e" },
  { tag: "Élevé", tagBg: "#fdf1e3", tagColor: "#8a4b00" },
  { tag: "Normal", tagBg: "#e8f5ec", tagColor: "#15803d" },
];

/** Une commande est en retard quand son creneau est deja passe. */
function isLate(order) {
  const iso = order.delivery?.date || order.createdAt;
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/* ------------------------------------------------------------ composants */

// Emplacement d'image du design (<image-slot>) : cadre gris + libelle.
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

const CARD = {
  background: "#ffffff",
  border: "1px solid #eceef2",
  borderRadius: 20,
  padding: "18px 20px",
};

/* ------------------------------------------------------------------ page */

export default function Boutique() {
  const { orders, menus, boutique, overrideFastFoodId, setOverrideFastFoodId, fastFoodId } = useMerchant();
  const { isAdmin } = useAuth();

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

  // Repartition par statut, avec les memes regroupements que l'app RN.
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

  // Encaissements : total encaisse, part livraison, impayes.
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

  // Barres hebdomadaires : sur place / livrees, normalisees sur le pic.
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

  // Commandes en retard : les non traitees dont le creneau est depasse.
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

  // Dernieres demandes clients : commandes portant une note.
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

  // Plats a mettre en avant : les menus du catalogue.
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

  // Objectif mensuel : part du CA realise.
  const goal = useMemo(() => {
    const target = Number(boutique?.monthlyGoal) || 0;
    if (!target) return null;
    const done = orders.reduce((acc, o) => acc + orderTotal(o), 0);
    return Math.min(100, Math.round((done / target) * 100));
  }, [orders, boutique]);

  return (
    <div
      style={{
        padding: "0 0 20px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minHeight: 0,
        height: "100%",
      }}
    >
      {/* Zone fixe : hauteur 100% sous le header, pas de scroll global */}
      <div
        style={{
          padding: "0 26px 4px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isAdmin
              ? "minmax(220px,260px) minmax(230px,1fr) minmax(0,1.9fr)"
              : "minmax(230px,1fr) minmax(0,1.9fr)",
            gap: 14,
            alignItems: "stretch",
            flex: 1,
            minHeight: 0,
            height: "100%",
          }}
        >
          {/* ──── Colonne gauche admin : liste des boutiques ──── */}
          {isAdmin && (
            <AdminShopRail
              activeFastFoodId={fastFoodId}
              onSelect={setOverrideFastFoodId}
            />
          )}
          {/* ------------------------------ colonne centre : fiche boutique */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eceef2",
              borderRadius: 20,
              overflow: "hidden",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              height: "100%",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: "1 1 140px",
                minHeight: 120,
                maxHeight: 260,
                flexShrink: 1,
              }}
            >
              {shopPhoto ? (
                <img
                  src={shopPhoto}
                  alt={shopName}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <ImageSlot
                  label="photo de la boutique"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                />
              )}
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                  background: "#ffffff",
                  color: "#1b1f27",
                  fontSize: 11.5,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 999,
                }}
              >
                {shopKind}
              </span>
            </div>

            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                borderBottom: "1px solid #f1f3f6",
                flex: "0 0 auto",
              }}
            >
              <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.3px", color: "#14161a" }}>
                {shopName}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b1f27" strokeWidth="1.7">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>

            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f3f6", flex: "0 0 auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(64px,1fr))",
                  gap: 10,
                }}
              >
                {stats.map((s) => (
                  <div key={s.label}>
                    <div
                      style={{
                        fontSize: 23,
                        fontWeight: 600,
                        letterSpacing: "-0.6px",
                        color: "#14161a",
                      }}
                    >
                      {s.value}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11.5, color: "#8a919e" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 18,
                  height: 10,
                  borderRadius: 999,
                  background: "#eceef2",
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div style={{ width: "74%", height: "100%", background: "#f5b301" }} />
                <div style={{ width: "13%", height: "100%", background: "#fbdc7a" }} />
              </div>
              <div style={{ marginTop: 9, fontSize: 12, color: "#8a919e" }}>
                {goal === null ? "Objectif mensuel non defini" : `Objectif atteint à ${goal}%`}
              </div>
            </div>

            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f3f6", flex: "0 0 auto" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px 12px",
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#14161a" }}>Commandes</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px 12px",
                    justifyContent: "flex-end",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8a919e" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: "#1b1f27" }} />
                    Sur place
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8a919e" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: "#fbdc7a" }} />
                    Livrées
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 16, height: 104, display: "flex", alignItems: "stretch", gap: 8 }}>
                {weekBars.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        gap: 3,
                      }}
                    >
                      <div
                        style={{
                          height: `${b.livree}%`,
                          background: "#fbdc7a",
                          borderRadius: "5px 5px 0 0",
                        }}
                      />
                      <div
                        style={{
                          height: `${b.place}%`,
                          background: "#1b1f27",
                          borderRadius: "0 0 5px 5px",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10.5, color: "#8a919e" }}>{b.label}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: "1px solid #f1f3f6",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(74px,1fr))",
                  gap: 10,
                }}
              >
                {orderStates.map((s) => (
                  <div key={s.label} style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: s.dot,
                          flex: "0 0 7px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          letterSpacing: "-0.5px",
                          color: "#14161a",
                        }}
                      >
                        {s.value}
                      </span>
                    </div>
                    <div style={{ marginTop: 3, fontSize: 11.5, color: "#8a919e" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, flex: "0 0 auto" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px 12px",
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#14161a" }}>Équipe en service</div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#4c5361",
                    background: "#f8fafc",
                    border: "1px solid #eceef2",
                    borderRadius: 999,
                    padding: "6px 13px",
                  }}
                >
                  Planning
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(115px,1fr))",
                  gap: 14,
                }}
              >
                {TEAM.map((t) => (
                  <div key={t.role} style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#14161a" }}>{t.role}</div>
                    <div style={{ marginTop: 6, fontSize: 12.5, color: "#4c5361" }}>{t.name}</div>
                    <div style={{ marginTop: 3, fontSize: 12.5, color: "#4c5361" }}>{t.phone}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 12px" }}>
                <div style={{ display: "flex" }}>
                  {TEAM_DOTS.map((c, i) => (
                    <div
                      key={c}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: c,
                        border: "2px solid #fff",
                        marginLeft: i ? -9 : 0,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: "#8a919e" }}>34 membres d'équipe</div>
              </div>
            </div>
          </div>

          {/* ------------------------------- colonne droite : blocs empiles */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minWidth: 0,
              height: "100%",
              overflowY: "auto",
            }}
          >
            {/* Encaissements */}
            <div style={CARD}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#14161a" }}>Encaissements</div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#8a919e",
                    border: "1px solid #eceef2",
                    borderRadius: 999,
                    padding: "5px 11px",
                  }}
                >
                  Ce mois
                </span>
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 14,
                }}
              >
                {cashin.map((c) => (
                  <div key={c.label}>
                    <div
                      style={{
                        fontSize: 21,
                        fontWeight: 600,
                        letterSpacing: "-0.5px",
                        color: c.accent ? "#ec4913" : "#14161a",
                      }}
                    >
                      {c.value}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#8a919e" }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nouvelles demandes */}
            <div style={CARD}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#14161a" }}>Nouvelles demandes</div>
              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: 14,
                }}
              >
                {requests.map((r) => (
                  <div
                    key={r.name}
                    style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          background: r.color,
                          flex: "0 0 30px",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#8a919e" }}>{r.order}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.45 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commandes en retard */}
            <div style={CARD}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#14161a" }}>Commandes en retard</div>
                <span style={{ fontSize: 12, color: "#8a919e" }}>
                  {lateOrders.length} à traiter
                </span>
              </div>

              <div style={{ marginTop: 6, display: "flex", flexDirection: "column" }}>
                {lateOrders.map((o, i) => (
                  <div
                    key={o.ref}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px 14px",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: i < lateOrders.length - 1 ? "1px solid #f1f3f6" : undefined,
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{o.ref}</div>
                    <div style={{ fontSize: 12.5, color: "#8a919e" }}>{o.kind}</div>
                    <div style={{ fontSize: 12.5, color: "#374151" }}>{o.dish}</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                        flex: "1 1 150px",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: o.color,
                          flex: "0 0 22px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {o.client}
                      </span>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: o.tagColor,
                          background: o.tagBg,
                          borderRadius: 999,
                          padding: "5px 11px",
                        }}
                      >
                        {o.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plats a mettre en avant */}
            <div style={CARD}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#14161a" }}>
                  Plats à mettre en avant
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#8a919e",
                    border: "1px solid #eceef2",
                    borderRadius: 999,
                    padding: "5px 11px",
                  }}
                >
                  2 prochaines semaines
                </span>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 12,
                }}
              >
                {dishes.map((d) => (
                  <div
                    key={d.name}
                    style={{
                      border: "1px solid #eceef2",
                      borderRadius: 16,
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 9,
                      minWidth: 0,
                    }}
                  >
                    {d.photo ? (
                      <img
                        src={d.photo}
                        alt={d.name}
                        style={{
                          width: "100%",
                          height: 104,
                          borderRadius: 12,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <ImageSlot
                        label="photo du plat"
                        style={{ width: "100%", height: 104, borderRadius: 12 }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: "#8a919e" }}>{d.price}</div>
                      <div style={{ fontSize: 11, color: "#8a919e" }}>{d.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Rail admin : liste de toutes les boutiques ─────────────────────── */
// Design identique a la colonne gauche de Menus (menus-list-pane + menu-row).
// Copie dediee (R16) — ne pas modifier Menus.jsx.

function AdminShopRail({ activeFastFoodId, onSelect }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminService
      .getFastFoods()
      .then((data) => { if (alive) setShops(data); })
      .catch((err) => console.error("AdminShopRail fetch error:", err))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((s) => {
      const name = (s.name || s.nom || "").toLowerCase();
      const cat = (s.category || s.type || "").toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [shops, query]);

  const Chevron = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <section className="menus-list-pane" style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* En-tete : chip + bouton quitter si override actif */}
      <div className="menus-chips">
        <div className="menus-chips-group">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 15px",
              border: "1px solid #e6e9ee",
              borderRadius: 999,
              background: "#fff",
              fontSize: 13,
              color: "#4c5361",
            }}
          >
            <span>Boutiques</span>
            <Chevron />
          </div>
        </div>
        {activeFastFoodId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flex: "0 0 auto",
              padding: "9px 14px",
              border: "1px solid #ec4913",
              borderRadius: 999,
              background: "#ec4913",
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Quitter
          </button>
        )}
      </div>

      {/* Compteur + barre de recherche */}
      <div className="menus-count">
        <div className="menus-count-label">
          <span className="menus-count-num">{filtered.length}</span> boutique
          {filtered.length > 1 ? "s" : ""}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            color: "#4c5361",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13.5,
              color: "#4c5361",
              background: "transparent",
              width: 90,
            }}
          />
        </div>
      </div>

      {/* Liste scrollable : meme structure que menus-list / menu-row */}
      <div className="menus-list">
        {loading && (
          <div style={{ fontSize: 12, color: "#8a919e", textAlign: "center", padding: "20px 0" }}>
            Chargement…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ fontSize: 12, color: "#8a919e", textAlign: "center", padding: "20px 0" }}>
            Aucune boutique
          </div>
        )}
        {filtered.map((shop) => {
          const id = shop._id || shop.id;
          const name = shop.name || shop.nom || "Boutique";
          const cat = shop.category || shop.type || "";
          const photo = shop.image || shop.photo || shop.logo || null;
          const open = shop.isOpen !== false && shop.status !== "closed";
          const active = id === activeFastFoodId;
          return (
            <button
              key={id}
              type="button"
              className={active ? "menu-row active" : "menu-row"}
              onClick={() => onSelect(id)}
            >
              {/* Miniature boutique — meme taille que menu-row-thumb */}
              <span
                className="menu-row-thumb"
                style={
                  photo
                    ? { backgroundImage: `url(${photo})`, background: `url(${photo}) center/cover no-repeat` }
                    : undefined
                }
              >
                {!photo && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c6cbd3" strokeWidth="1.6">
                    <path d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                )}
              </span>

              {/* Corps */}
              <span className="menu-row-body">
                <span className="menu-row-top">
                  <span className="menu-row-ident">
                    {cat && (
                      <span className="menu-row-rating">
                        <span className="menu-row-rating-count">{cat}</span>
                      </span>
                    )}
                    <span className="menu-row-name truncate">{name}</span>
                    <span className="menu-row-meta truncate">
                      {shop.address || shop.adresse || "Adresse non renseignee"}
                    </span>
                  </span>
                  <span
                    className={open ? "menu-row-dot on" : "menu-row-dot off"}
                    title={open ? "Ouverte" : "Fermee"}
                  />
                </span>
                <span className="menu-row-foot">
                  <span className="menu-row-stock">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    <span>{open ? "Ouverte" : "Fermee"}</span>
                  </span>
                  <span className="menu-row-price">
                    {shop.orders || "—"}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
