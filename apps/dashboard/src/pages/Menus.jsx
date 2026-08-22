// Menus — catalogue en grille de cartes : le marchand reconnait ses plats
// a l'image et au prix, pas a une ligne de tableau.
import { useMemo, useState } from "react";
import { formatXAF } from "@yaammoo/shared";
import { useMerchant } from "../features/merchant/MerchantContext.jsx";
import { useToast } from "../components/Toast.jsx";
import {
  Alert,
  Btn,
  Empty,
  Field,
  Modal,
  Search,
  SkCards,
} from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";

const available = (m) => !(m.disponibilite === "false" || m.disponibilite === false);

export default function Menus() {
  const { menus, loading, addMenu } = useMerchant();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) => (m.titre || m.name || "").toLowerCase().includes(q));
  }, [menus, search]);

  const outOfStock = menus.filter((m) => !available(m)).length;

  return (
    <>
      <div className="toolbar">
        <Search value={search} onChange={setSearch} placeholder="Rechercher un menu..." />
        <span className="small dim">
          {menus.length} menu(s)
          {outOfStock > 0 && ` · ${outOfStock} en rupture`}
        </span>
        <div className="toolbar-end">
          <Btn variant="primary" icon="plus" onClick={() => setOpen(true)}>
            Ajouter un menu
          </Btn>
        </div>
      </div>

      {loading && menus.length === 0 ? (
        <SkCards />
      ) : visible.length === 0 ? (
        <div className="card">
          <Empty
            icon="menus"
            title={search ? "Aucun menu ne correspond" : "Catalogue vide"}
            hint={
              search
                ? "Essayez un autre terme de recherche."
                : "Ajoutez votre premier menu pour pouvoir encaisser au comptoir."
            }
            action={
              !search && (
                <Btn variant="primary" size="sm" icon="plus" onClick={() => setOpen(true)}>
                  Ajouter un menu
                </Btn>
              )
            }
          />
        </div>
      ) : (
        <div className="card-grid">
          {visible.map((m) => (
            <article className="menu-card" key={m.id}>
              <div
                className="menu-thumb"
                style={m.image ? { backgroundImage: `url(${m.image})` } : undefined}
              >
                {!m.image && <Icon name="image" size={22} />}
                <span className={available(m) ? "pill pill-done" : "pill pill-danger"}>
                  {available(m) ? "Disponible" : "Rupture"}
                </span>
              </div>
              <div className="menu-body">
                <h3 className="menu-name">{m.titre || m.name}</h3>
                <div className="menu-opts truncate">
                  {[m.optionPrix1, m.optionPrix2, m.optionPrix3]
                    .filter(Boolean)
                    .join(" · ") || "Une seule option"}
                </div>
                <div className="menu-foot">
                  <span className="menu-price">
                    {formatXAF(m.prix1 || m.prix2 || m.prix3 || 0)}
                  </span>
                  <span className="small dim num">
                    {typeof m.stock === "number" ? `Stock ${m.stock}` : ""}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && <AddMenuModal onClose={() => setOpen(false)} onSave={addMenu} />}
    </>
  );
}

function AddMenuModal({ onClose, onSave }) {
  const toast = useToast();
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
      toast.ok("Menu ajoute", form.titre);
      onClose();
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Nouveau menu"
      subtitle="Il sera disponible immediatement a la caisse et dans l'app client."
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={save} disabled={busy}>
            {busy ? "Enregistrement..." : "Enregistrer"}
          </Btn>
        </>
      }
    >
      <div className="modal-body stack">
        <Field label="Titre du menu">
          <input className="input" value={form.titre} onChange={set("titre")} autoFocus />
        </Field>
        <Field label="Prix (XAF)">
          <input
            className="input num"
            type="number"
            min="0"
            value={form.prix1}
            onChange={set("prix1")}
          />
        </Field>
        <Field
          label="Libelle de l'option"
          hint="Ce que le client choisit : Normal, Grand, Familial..."
        >
          <input
            className="input"
            value={form.optionPrix1}
            onChange={set("optionPrix1")}
            placeholder="Normal"
          />
        </Field>
        <Field label="Stock" hint="Laisser vide si le stock n'est pas suivi.">
          <input
            className="input num"
            type="number"
            min="0"
            value={form.stock}
            onChange={set("stock")}
          />
        </Field>
        <Field label="URL de l'image">
          <input
            className="input"
            value={form.image}
            onChange={set("image")}
            placeholder="https://..."
          />
        </Field>

        {error && <Alert>{error}</Alert>}
      </div>
    </Modal>
  );
}
