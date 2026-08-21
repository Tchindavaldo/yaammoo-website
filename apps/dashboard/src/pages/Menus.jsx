// Menus — catalogue de la boutique + ajout (portage de MenuManagePanel).
import { useState } from "react";
import { formatXAF } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { Empty, Loading, Modal, Field } from "../components/ui.jsx";

export default function Menus() {
  const { menus, loading, addMenu } = useMerchant();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="small dim">{menus.length} menu(s) au catalogue</div>
        <button className="btn primary" onClick={() => setOpen(true)} type="button">
          Ajouter un menu
        </button>
      </div>

      <div className="card">
        {loading && menus.length === 0 ? (
          <Loading />
        ) : menus.length === 0 ? (
          <Empty title="Aucun menu" hint="Ajoutez votre premier menu." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Menu</th>
                  <th>Options</th>
                  <th className="right">Prix</th>
                  <th className="right">Stock</th>
                  <th>Disponibilite</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.titre || m.name}</td>
                    <td className="small dim">
                      {[m.optionPrix1, m.optionPrix2, m.optionPrix3]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="right mono">
                      {formatXAF(m.prix1 || m.prix2 || m.prix3 || 0)}
                    </td>
                    <td className="right mono">
                      {typeof m.stock === "number" ? m.stock : "—"}
                    </td>
                    <td>
                      <span
                        className={`pill ${m.disponibilite === "false" || m.disponibilite === false ? "danger" : "done"}`}
                      >
                        {m.disponibilite === "false" || m.disponibilite === false
                          ? "Indisponible"
                          : "Disponible"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <AddMenuModal onClose={() => setOpen(false)} onSave={addMenu} />}
    </>
  );
}

function AddMenuModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    titre: "",
    prix1: "",
    optionPrix1: "",
    image: "",
    stock: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (!form.titre || !form.prix1) {
      setError("Titre et prix sont obligatoires.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        titre: form.titre,
        prix1: Number(form.prix1),
        optionPrix1: form.optionPrix1 || "Normal",
        image: form.image,
        stock: form.stock ? Number(form.stock) : undefined,
        disponibilite: "true",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Nouveau menu"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose} type="button">
            Annuler
          </button>
          <button className="btn primary" onClick={save} disabled={busy} type="button">
            {busy ? "..." : "Enregistrer"}
          </button>
        </>
      }
    >
      <div className="modal-body">
        <Field label="Titre du menu">
          <input className="input" value={form.titre} onChange={set("titre")} />
        </Field>
        <Field label="Prix (XAF)">
          <input
            className="input mono"
            type="number"
            min="0"
            value={form.prix1}
            onChange={set("prix1")}
          />
        </Field>
        <Field label="Libelle de l'option (ex. Normal, Grand)">
          <input
            className="input"
            value={form.optionPrix1}
            onChange={set("optionPrix1")}
            placeholder="Normal"
          />
        </Field>
        <Field label="Stock (optionnel)">
          <input
            className="input mono"
            type="number"
            min="0"
            value={form.stock}
            onChange={set("stock")}
          />
        </Field>
        <Field label="URL de l'image (optionnel)">
          <input className="input" value={form.image} onChange={set("image")} />
        </Field>

        {error && (
          <div className="small" style={{ color: "var(--danger)" }}>
            ❌ {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
