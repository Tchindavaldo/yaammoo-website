// Modale de confirmation maison — remplace window.confirm (R17).
//
// Les boites natives du navigateur ne sont pas stylables, bloquent le thread et
// n'ont rien a voir avec le design du dashboard. Toute demande de confirmation
// passe par ce composant.
//
// Usage : monter la modale quand l'action est en attente, la demonter ensuite.
//   {pending && <ConfirmDialog ... onConfirm={...} onCancel={...} />}

import { useEffect } from "react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "danger", // "danger" | "neutral"
  busy = false,
  onConfirm,
  onCancel,
}) {
  // Echap ferme la modale, comme un dialogue natif.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const accent = tone === "danger" ? "#d92d20" : "#1b1f27";

  return (
    <>
      {/* Voile : un clic hors de la carte annule. */}
      <div
        onClick={() => !busy && onCancel?.()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,.45)",
          backdropFilter: "blur(2px)",
          zIndex: 60,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 61,
          width: "min(420px, calc(100vw - 32px))",
          background: "#fff",
          border: "1px solid #e6e9ee",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 18px 48px rgba(15,23,42,.22)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</div>
        {message && (
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "#6b7280" }}>{message}</div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            paddingTop: 8,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: "10px 14px",
              border: "1px solid #eceef2",
              borderRadius: 12,
              background: "#f8fafc",
              color: "#4c5361",
              fontSize: 13,
              fontWeight: 500,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              padding: "10px 14px",
              border: "none",
              borderRadius: 12,
              background: accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
