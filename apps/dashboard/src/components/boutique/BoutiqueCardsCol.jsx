/* ── Colonne des 4 cartes empilées ─────────────────────────────────── */
// Encaissements · Nouvelles demandes · Commandes en retard · Plats à mettre en avant.

const CARD = {
  background: "#ffffff",
  border: "1px solid #eceef2",
  borderRadius: 20,
  padding: "18px 20px",
};

export default function BoutiqueCardsCol({ cashin, requests, lateOrders, dishes, ImageSlot }) {
  return (
    <div
      className="shop-col-cards"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0,
        height: "100%",
        overflowY: "auto",
        scrollbarWidth: "none",
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

      {/* Plats à mettre en avant */}
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
  );
}
