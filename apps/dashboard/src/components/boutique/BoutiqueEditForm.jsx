import { useState } from "react";
import { merchantService } from "@yaammoo/shared";
import { fromDeliveryHours, toDeliveryHours } from "./deliveryHoursAdapter.js";
import { buildZoneCards } from "./zoneCards.js";
import BoutiqueTab from "./BoutiqueTab.jsx";
import LivraisonTab from "./LivraisonTab.jsx";

/* ── Formulaire d'édition de la boutique ────────────────────────────── */
// Coque du panneau latéral « Modifier » : état, enregistrement et bascule
// entre les deux onglets, dont le rendu vit dans BoutiqueTab / LivraisonTab.
// Portage exact à 100% du HTML de référence Dashboard Boutique md screen.dc.html (R13).

// Zone vide servie quand la boutique n'a encore aucun créneau : le panneau
// garde sa mise en page sans inventer de prix.
const EMPTY_ZONE = { lieu: "—", hours: [] };

export default function BoutiqueEditForm({ boutique, onSave, onCancel }) {
  const [tab, setTab] = useState("boutique"); // "boutique" | "livraison"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ── Champs : onglet Boutique ──────────────────────────────────────────
  const [nom, setNom] = useState(boutique?.name || boutique?.nom || "");
  const [openTime, setOpenTime] = useState(boutique?.openTime || boutique?.heureOuverture || "08:30");
  const [closeTime, setCloseTime] = useState(boutique?.closeTime || boutique?.heureFermeture || "22:00");
  const [openDays, setOpenDays] = useState(() => {
    const raw = boutique?.openDays || boutique?.joursOuverture;
    if (Array.isArray(raw) && raw.length === 7) return raw;
    return [true, true, true, true, true, true, false];
  });
  // Le backend n'a qu'UN champ Mobile Money (`momoNumber`, OM ou MoMo
  // indifferemment) plus le telephone principal (`number`) — R18.
  const [image, setImage] = useState(boutique?.image || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [phone, setPhone] = useState(boutique?.number || "");
  const [momoPhone, setMomoPhone] = useState(boutique?.momoNumber || "");
  const [waPhone, setWaPhone] = useState(boutique?.whatsappNumber || "");
  const [deliveryDelay, setDeliveryDelay] = useState(boutique?.orderLeadTime ?? 30);
  const [bookingDays, setBookingDays] = useState(boutique?.advanceDays ?? 0);

  // ── Champs : onglet Livraison ──────────────────────────────────────────
  // Backend : `cities` est un simple tableau de noms de villes (R18). Le
  // formulaire manipule des objets {city, zone} ; `zone` reste local a l'UI,
  // le backend ne le stocke pas.
  const [locations, setLocations] = useState(() =>
    (boutique?.cities || []).map((c) =>
      typeof c === "string" ? { city: c, zone: "" } : c,
    ),
  );

  const [zoneIdx, setZoneIdx] = useState(0);
  const [zonePage, setZonePage] = useState(0);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [pickupEnabled, setPickupEnabled] = useState(boutique?.pickupAllowed ?? true);
  // Créneaux réels du backend (`deliveryHours`), regroupés par lieu.
  const [zones, setZones] = useState(() => fromDeliveryHours(boutique?.deliveryHours));

  const openDaysCount = openDays.filter(Boolean).length;
  const currentZone = zones[zoneIdx] || zones[0] || EMPTY_ZONE;

  // Changer de zone remet la grille en première page (comme le design).
  function selectZone(gi) {
    setZoneIdx(gi);
    setZonePage(0);
  }

  // Upload immediat : le backend renvoie l'URL Supabase, qu'on stocke dans
  // `image` et qui partira avec le reste du formulaire a l'enregistrement.
  async function handlePickImage(file) {
    if (!file.type?.startsWith("image/")) {
      setError("Ce fichier n'est pas une image.");
      return;
    }
    setUploadingImage(true);
    setError(null);
    try {
      const url = await merchantService.uploadImage(file);
      if (!url) throw new Error("Le serveur n'a pas renvoyé d'URL d'image.");
      setImage(url);
    } catch (e) {
      console.error("Echec upload image boutique:", e);
      setError(e?.message || "Impossible de téléverser l'image.");
    } finally {
      setUploadingImage(false);
    }
  }

  function toggleDay(i) {
    setOpenDays((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function addLocation() {
    setLocations((prev) => [...prev, { city: "", zone: "Zone secondaire" }]);
  }

  function removeLocation(i) {
    setLocations((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // Noms de champs imposes par le backend (R18) — verifies dans
      // BACKEND/architecture/merchants.md, le swagger de POST /fastfood/:id et
      // src/interface/fastfoodFields.js. Toute autre cle serait ignoree en
      // silence (200 OK, rien d'enregistre).
      await onSave({
        name: nom,
        image,
        openTime,
        closeTime,
        number: phone,
        momoNumber: momoPhone,
        whatsappNumber: waPhone,
        orderLeadTime: Number(deliveryDelay),
        advanceDays: Number(bookingDays),
        pickupAllowed: pickupEnabled,
        cities: locations.map((l) => l.city.trim()).filter(Boolean),
        deliveryHours: toDeliveryHours(zones),
      });
    } catch (e) {
      setError(e?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  // Grille de créneaux à hauteur fixe + pagination (portage du design).
  const { cards } = buildZoneCards(currentZone, zonePage, selectedSlotKey);

  return (
    <>
      {/* Tab switcher */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          gap: 6,
          background: "#e4e7ec",
          border: "1px solid #dce0e7",
          borderRadius: 999,
          padding: 4,
        }}
      >
        {[
          { id: "boutique", label: "Boutique" },
          { id: "livraison", label: "Livraison" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "#1b1f27" : "#6b7280",
              background: tab === t.id ? "#ffffff" : "transparent",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,.10)" : "none",
              transition: "all .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu scrollable */}
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          scrollbarWidth: "none",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {tab === "boutique" && (
          <BoutiqueTab
            nom={nom}
            setNom={setNom}
            image={image}
            onPickImage={handlePickImage}
            uploadingImage={uploadingImage}
            openTime={openTime}
            setOpenTime={setOpenTime}
            closeTime={closeTime}
            setCloseTime={setCloseTime}
            openDays={openDays}
            toggleDay={toggleDay}
            openDaysCount={openDaysCount}
            phone={phone}
            setPhone={setPhone}
            momoPhone={momoPhone}
            setMomoPhone={setMomoPhone}
            waPhone={waPhone}
            setWaPhone={setWaPhone}
            deliveryDelay={deliveryDelay}
            setDeliveryDelay={setDeliveryDelay}
            bookingDays={bookingDays}
            setBookingDays={setBookingDays}
          />
        )}

        {tab === "livraison" && (
          <LivraisonTab
            locations={locations}
            setLocations={setLocations}
            addLocation={addLocation}
            removeLocation={removeLocation}
            pickupEnabled={pickupEnabled}
            setPickupEnabled={setPickupEnabled}
            zones={zones}
            zoneIdx={zoneIdx}
            setZoneIdx={selectZone}
            setZones={setZones}
            currentZone={currentZone}
            selectedSlotKey={selectedSlotKey}
            setSelectedSlotKey={setSelectedSlotKey}
            cards={cards}
            setZonePage={setZonePage}
          />
        )}
      </div>

      {/* Pied : erreur + boutons */}
      {error && (
        <div style={{ fontSize: 12.5, color: "#d92d20", background: "#fef3f2", borderRadius: 10, padding: "8px 12px", marginTop: 8 }}>
          {error}
        </div>
      )}
      <div style={{ flex: "0 0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 12 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "10px 14px",
            border: "1px solid #eceef2",
            borderRadius: 12,
            background: "#f8fafc",
            color: "#4c5361",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingImage}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: 12,
            background: "#1b1f27",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: saving || uploadingImage ? "not-allowed" : "pointer",
            opacity: saving || uploadingImage ? 0.7 : 1,
          }}
        >
          {saving ? "Enregistrement…" : uploadingImage ? "Envoi de l'image…" : "Enregistrer"}
        </button>
      </div>
    </>
  );
}
