// Onglet « Boutique » du panneau d'édition : identité, horaires, jours
// d'ouverture, contacts & paiement, règles de commande.
// Extrait de BoutiqueEditForm.jsx (R4) — rendu inchangé.

import { fieldCard, inputStyle, labelStyle, sectionLabel } from "./editFormStyles.js";

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function BoutiqueTab({
  nom, setNom,
  image, onPickImage, uploadingImage,
  openTime, setOpenTime,
  closeTime, setCloseTime,
  openDays, toggleDay, openDaysCount,
  phone, setPhone,
  momoPhone, setMomoPhone,
  waPhone, setWaPhone,
  deliveryDelay, setDeliveryDelay,
  bookingDays, setBookingDays,
}) {
  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0, paddingTop: 12 }}>
        {/* IDENTITÉ & HORAIRES */}
        <div>
          <div style={sectionLabel}>IDENTITÉ &amp; HORAIRES</div>
        </div>

        {/* Photo + Nom — le clic sur l'avatar ouvre le selecteur de fichier. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label
            title="Changer la photo de la boutique"
            style={{
              position: "relative",
              flex: "0 0 50px",
              width: 50,
              height: 50,
              borderRadius: 27,
              background: image ? `url(${image}) center/cover no-repeat` : "#f8fafc",
              border: image ? "1px solid #e2e8f0" : "1px dashed #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: uploadingImage ? "wait" : "pointer",
              overflow: "hidden",
            }}
          >
            <input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                // On vide la valeur pour que re-choisir le MEME fichier
                // redeclenche bien l'evenement.
                e.target.value = "";
                if (file) onPickImage(file);
              }}
              style={{ display: "none" }}
            />
            {uploadingImage ? (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,.75)",
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: "#4c5361",
                }}
              >
                …
              </span>
            ) : (
              !image && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.7">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M4 18l5-5 4 4 3-3 4 4" />
                </svg>
              )
            )}
          </label>
          <div style={{ flex: 1, minWidth: 0, ...fieldCard }}>
            <div style={labelStyle}>Nom de la boutique</div>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Chez Mama Nyanga"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Ouverture / Fermeture */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
          <div style={fieldCard}>
            <div style={labelStyle}>Ouverture</div>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              style={{ ...inputStyle, fontSize: 15 }}
            />
          </div>
          <div style={fieldCard}>
            <div style={labelStyle}>Fermeture</div>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              style={{ ...inputStyle, fontSize: 15 }}
            />
          </div>
        </div>

        {/* Jours d'ouverture */}
        <div style={{ ...fieldCard, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div style={labelStyle}>Jours d'ouverture</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1b1f27" }}>{openDaysCount} / 7 jours</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {WEEK_DAYS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  border: openDays[i] ? "1px solid #ec4913" : "1px solid #e6e9ee",
                  background: openDays[i] ? "#ec4913" : "#f8fafc",
                  color: openDays[i] ? "#ffffff" : "#a2aab6",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* CONTACTS & PAIEMENT */}
        <div style={{ paddingTop: 16, borderTop: "1px solid #eceef2", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={sectionLabel}>CONTACTS &amp; PAIEMENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              // Le backend ne stocke qu'UN numero Mobile Money (`momoNumber`,
              // OM ou MoMo) en plus du telephone principal (`number`) — R18.
              { label: "Téléphone", value: phone, set: setPhone, placeholder: "+237 6 90 12 45 78", dot: "#6b7280" },
              { label: "Mobile Money", value: momoPhone, set: setMomoPhone, placeholder: "+237 6 77 08 33 21", dot: "#ec5c06" },
              { label: "WhatsApp", value: waPhone, set: setWaPhone, placeholder: "+237 6 55 41 90 06", dot: "#25d366" },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fff",
                  border: "1px solid #e6e9ee",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    flex: "0 0 28px",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: c.dot + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: c.dot }} />
                </div>
                <div style={{ flex: "1 1 0", minWidth: 0 }}>
                  <div style={labelStyle}>{c.label}</div>
                  <input
                    value={c.value}
                    onChange={(e) => c.set(e.target.value)}
                    placeholder={c.placeholder}
                    style={{ ...inputStyle, fontSize: 13.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RÈGLES DE COMMANDE */}
        <div style={{ paddingTop: 16, borderTop: "1px solid #eceef2", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={sectionLabel}>RÈGLES DE COMMANDE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={fieldCard}>
              <div style={{ fontSize: 12.5, color: "#6b7280" }}>Délai de livraison — limite avant créneau</div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 5 }}>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={deliveryDelay}
                  onChange={(e) => setDeliveryDelay(e.target.value)}
                  style={{ ...inputStyle, fontSize: 22, fontWeight: 700, width: 50 }}
                />
                <span style={{ fontSize: 12.5, color: "#6b7280" }}>min</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 11.5, color: "#8a919e" }}>
                Commande bloquée {deliveryDelay} min avant le créneau choisi.
              </div>
            </div>
            <div style={fieldCard}>
              <div style={{ fontSize: 12.5, color: "#6b7280" }}>Jours réservables en avance</div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 5 }}>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(e.target.value)}
                  style={{ ...inputStyle, fontSize: 22, fontWeight: 700, width: 40 }}
                />
                <span style={{ fontSize: 12.5, color: "#6b7280" }}>jours</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 11.5, color: "#8a919e" }}>
                {bookingDays <= 1
                  ? "Aujourd'hui seulement."
                  : bookingDays === 2
                  ? "Aujourd'hui et demain."
                  : `Aujourd'hui, demain et les ${Number(bookingDays) - 1} jours suivants.`}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
