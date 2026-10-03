/* ── Colonne Fiche Boutique ────────────────────────────────────────── */
// Image, nom, stats, barres hebdo, états commandes, équipe en service, boutons d'action.

export default function BoutiqueDetailCol({
  shopName,
  shopKind,
  shopPhoto,
  stats,
  goal,
  weekBars,
  orderStates,
  TEAM,
  ImageSlot,
  onEditShop,
  onDeleteShop,
}) {
  return (
    <div
      className="shop-col-detail"
      style={{
        background: "#ffffff",
        border: "1px solid #eceef2",
        borderRadius: 20,
        overflow: "hidden",
        overflowY: "auto",
        scrollbarWidth: "none",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
      }}
    >
      {/* Banner / Image */}
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

      {/* Titre */}
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

      {/* Stats principales & Objectif */}
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
          {goal === null ? "Objectif mensuel non défini" : `Objectif atteint à ${goal}%`}
        </div>
      </div>

      {/* Barres hebdomadaires & États */}
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

      {/* Équipe en service */}
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

        {/* Boutons d'action : Modifier & Supprimer */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 6,
          }}
        >
          <button
            type="button"
            onClick={onEditShop}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "9px 14px",
              background: "#1b1f27",
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              transition: "opacity .15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
          <button
            type="button"
            onClick={onDeleteShop}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "9px 14px",
              background: "#fef3f2",
              color: "#d92d20",
              border: "1px solid #fee4e2",
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background .15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
