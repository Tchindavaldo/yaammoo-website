// Onglet « Livraison » du panneau d'édition : localisations, retrait sur place
// et panneau « Vos créneaux de livraison » (créneaux réels du backend).
// Extrait de BoutiqueEditForm.jsx (R4) — rendu inchangé.

import { fieldCard, inputStyle, labelStyle, sectionLabel } from "./editFormStyles.js";

export default function LivraisonTab({
  locations, setLocations, addLocation, removeLocation,
  pickupEnabled, setPickupEnabled,
  zones, zoneIdx, setZoneIdx, setZones,
  currentZone,
  selectedSlotKey, setSelectedSlotKey,
  cards, setZonePage,
}) {
  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0, paddingTop: 12 }}>
        {/* 1. Bloc LOCALISATIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={sectionLabel}>LOCALISATIONS</div>
          {locations.map((loc, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "#fff",
                border: "1px solid #e6e9ee",
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ec4913"
                strokeWidth="1.8"
                style={{ marginTop: 2, flex: "0 0 15px" }}
              >
                <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  value={loc.city}
                  onChange={(e) =>
                    setLocations((prev) =>
                      prev.map((l, idx) => (idx === i ? { ...l, city: e.target.value } : l)),
                    )
                  }
                  placeholder="Ville"
                  style={{ ...inputStyle, fontSize: 13.5, fontWeight: 600 }}
                />
                <input
                  value={loc.zone}
                  onChange={(e) =>
                    setLocations((prev) =>
                      prev.map((l, idx) => (idx === i ? { ...l, zone: e.target.value } : l)),
                    )
                  }
                  placeholder="Zone principale"
                  style={{ ...inputStyle, fontSize: 12, fontWeight: 400, color: "#8a919e", marginTop: 3 }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeLocation(i)}
                style={{
                  flex: "0 0 24px",
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  border: "none",
                  background: "#fee2e2",
                  color: "#d92d20",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLocation}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "1px dashed #e2e8f0",
              borderRadius: 12,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a2aab6" strokeWidth="2.2" style={{ flex: "0 0 14px" }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8a919e" }}>
              Ajouter une localisation
            </span>
          </button>
        </div>

        {/* 2. Bloc VOS CRÉNEAUX DE LIVRAISON (Panneau zones + cartes express/créneaux + Retrait en boutique) */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eceef2",
            borderRadius: 18,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                Vos créneaux de livraison
              </div>
              <div style={{ marginTop: 2, fontSize: 11.5, fontWeight: 500, color: "#94a3b8" }}>
                Cliquez un créneau pour le modifier
              </div>
            </div>
          </div>

          {/* Bannières des zones (Bonapriso, Akwa, Bonanjo) */}
          <div style={{ display: "flex", gap: 6 }}>
            {zones.map((g, gi) => {
              const on = gi === zoneIdx;
              const hoursCount = g.hours?.length || 0;
              return (
                <div
                  key={g.lieu}
                  onClick={() => setZoneIdx(gi)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 12,
                    padding: "8px 10px",
                    cursor: "pointer",
                    border: "1px solid " + (on ? "#0f172a" : "#e2e8f0"),
                    background: on ? "#0f172a" : "#f8fafc",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: on ? "#ffffff" : "#0f172a",
                      }}
                    >
                      {g.lieu}
                    </div>
                    <div
                      style={{
                        marginTop: 1,
                        fontSize: 10.5,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: on ? "rgba(255,255,255,0.62)" : "#94a3b8",
                      }}
                    >
                      {hoursCount} horaire{hoursCount > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grille des cartes créneaux (3 colonnes, hauteur fixe) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gridAutoRows: "minmax(46px,1fr)",
              alignContent: "start",
              gap: 8,
              overflow: "hidden",
            }}
          >

            {cards.map((c, i) => {
              // Cartes « ‹ Retour » et « +N / Voir la suite ».
              if (c.kind === "nav") {
                return (
                  <div
                    key={`nav-${c.toPage}`}
                    onClick={() => setZonePage(c.toPage)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                      overflow: "hidden",
                      minWidth: 0,
                      borderRadius: 12,
                      padding: "6px 9px",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#475569", lineHeight: 1.1 }}>
                      {c.navLabel}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>{c.note}</div>
                  </div>
                );
              }

              const express = c.kind === "express";
              const empty = c.kind === "empty";
              const on = c.kind === "slot" && c.selected;
              return (
                <div
                  key={c.kind === "slot" ? c.key : `${c.kind}-${i}`}
                  onClick={
                    c.kind === "slot"
                      ? () => setSelectedSlotKey(on ? null : c.key)
                      : undefined
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: 1,
                    overflow: "hidden",
                    minWidth: 0,
                    borderRadius: 12,
                    padding: "6px 9px",
                    border:
                      "1px solid " +
                      (express ? "#fed7aa" : on ? "#ec4913" : "#e2e8f0"),
                    background: express || on ? "#fff7ed" : "#ffffff",
                    cursor: c.kind === "slot" ? "pointer" : "default",
                    // Les cartes de remplissage gardent la grille pleine sans
                    // se faire passer pour de vrais créneaux.
                    opacity: empty ? 0.45 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        flex: "0 0 6px",
                        background: express ? "#ec4913" : "#10b981",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: 1.1,
                        color: express ? "#ec4913" : "#047857",
                      }}
                    >
                      {c.tag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {c.price}
                  </div>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 500,
                      color: "#94a3b8",
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {c.note}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bloc Retrait en boutique */}
          <div
            onClick={() => setPickupEnabled((prev) => !prev)}
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: 10,
              borderRadius: 12,
              cursor: "pointer",
              border: "1px solid " + (pickupEnabled ? "#2f8f57" : "#ec4913"),
              background: pickupEnabled ? "#eef8f1" : "#fff6f2",
            }}
          >
            <span
              style={{
                flex: "0 0 16px",
                width: 16,
                height: 16,
                marginTop: 1,
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                background: pickupEnabled ? "#2f8f57" : "#ec4913",
                border: "1px solid " + (pickupEnabled ? "#2f8f57" : "#ec4913"),
              }}
            >
              ✓
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1b1f27" }}>
                  Retrait en boutique
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".3px",
                    padding: "2px 7px",
                    borderRadius: 999,
                    color: "#fff",
                    background: pickupEnabled ? "#2f8f57" : "#ec4913",
                  }}
                >
                  {pickupEnabled ? "activé" : "désactivé"}
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 11.5, color: "#8a919e" }}>
                Le client peut venir récupérer sa commande sur place.
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
